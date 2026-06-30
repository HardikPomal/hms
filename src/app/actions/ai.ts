"use server";

import { GoogleGenAI } from "@google/genai";

export type AIResponse = 
  | { type: "success"; refMin?: string; refMax?: string; unit?: string }
  | { type: "clarification_needed"; message: string };

export async function processMedicalKnowledge(
  title: string,
  content: string,
  chatHistory: { role: "user" | "model"; text: string }[] = []
): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please add it to .env.local");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a medical data extraction assistant. 
Your task is to analyze user-provided research notes about a medical term (like '${title}') and extract reference ranges to power an automated report analyzer.
If the notes contain clear minimum, maximum ranges, and a unit, return them in JSON format.
If the notes are ambiguous, contradictory, or missing critical units/ranges but seem like they *should* have them, return a clarifying question.
If the user's notes are purely informational and clearly don't need a numeric range (like general cancer info), just return success without ranges.

Output format MUST be strictly JSON matching this schema:
{
  "status": "success" | "clarification_needed",
  "data": {
    "refMin": "string (e.g. '11.5')",
    "refMax": "string (e.g. '16.5')",
    "unit": "string (e.g. 'g/dL')"
  },
  "question": "string (only if status is clarification_needed)"
}
Do not include markdown backticks around the JSON. Return only the raw JSON string.`;

  let prompt = `Title: ${title}\nUser Notes: ${content}\n\n`;
  if (chatHistory.length > 0) {
    prompt += "Chat History for Clarification:\n";
    chatHistory.forEach((msg) => {
      prompt += `${msg.role === "user" ? "User" : "You"}: ${msg.text}\n`;
    });
    prompt += "Please provide the final JSON output based on this clarified context.\n";
  }

  let response;
  let retries = 3;
  let delay = 1000;

  while (true) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });
      break;
    } catch (error: any) {
      const isRetryable =
        error?.status === 503 ||
        error?.status === 429 ||
        error?.message?.includes("503") ||
        error?.message?.includes("429") ||
        error?.message?.includes("UNAVAILABLE");

      if (isRetryable && retries > 0) {
        retries--;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }

  try {
    const resText = response.text || "{}";
    const parsed = JSON.parse(resText);

    if (parsed.status === "success") {
      return {
        type: "success",
        refMin: parsed.data?.refMin,
        refMax: parsed.data?.refMax,
        unit: parsed.data?.unit,
      };
    } else {
      return {
        type: "clarification_needed",
        message: parsed.question || "I need more clarification on the exact normal ranges.",
      };
    }
  } catch (e) {
    return {
      type: "clarification_needed",
      message: "I couldn't parse the ranges from your notes. Could you explicitly state the minimum, maximum, and unit?",
    };
  }
}

export async function extractReportValuesFromImage(
  base64DataUrl: string,
  expectedFields: string[]
): Promise<Record<string, string>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please add it to .env.local");
  }

  const ai = new GoogleGenAI({ apiKey });

  const match = base64DataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid base64 image data URL");
  }
  const mimeType = match[1];
  const base64Data = match[2];

  const systemInstruction = `You are a medical data extraction assistant.
You will be given an image of a medical report.
Your task is to extract the test values for the following fields: ${expectedFields.join(", ")}.
Return the extracted values as a flat JSON object where keys are the exact field names provided and values are the extracted test results (numbers only) as strings.
If a field is not found in the image, set its value to an empty string "".
Do not include any extra text or markdown, just the raw JSON object.`;

  let response;
  let retries = 3;
  let delay = 1000;

  while (true) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          "Extract the requested fields from this report image.",
        ],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });
      break;
    } catch (error: any) {
      const isRetryable =
        error?.status === 503 ||
        error?.status === 429 ||
        error?.message?.includes("503") ||
        error?.message?.includes("429") ||
        error?.message?.includes("UNAVAILABLE");

      if (isRetryable && retries > 0) {
        retries--;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }

  try {
    const resText = response.text || "{}";
    const parsed = JSON.parse(resText);
    return parsed;
  } catch (e) {
    console.error("Failed to parse extracted values", e);
    return {};
  }
}

export interface AutoFillKnowledgeResponse {
  simpleMeaning: string;
  detailedDescription: string;
  whyImportant: string;
  normalRange: string;
  tags: string;
  relatedSymptoms: string;
  relatedMedicines: string;
  relatedFoods: string;
}

export async function autoFillKnowledgeEntry(
  title: string,
  category: string
): Promise<AutoFillKnowledgeResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are a medical knowledge base generator.
The user wants to document a medical entity named '${title}' which belongs to the category '${category}'.
Your task is to generate concise, accurate, and easy-to-understand medical information for a patient-facing app.
Do not provide medical advice, just factual medical definitions.

Generate the output in strictly this JSON format:
{
  "simpleMeaning": "A one sentence simple explanation.",
  "detailedDescription": "A 2-3 paragraph detailed explanation of what this is and how it works.",
  "whyImportant": "1-2 sentences on why this is monitored or important.",
  "normalRange": "Standard reference range with units if applicable (e.g. '11.5–16.5 g/dL'). Leave empty if not applicable.",
  "tags": "comma-separated tags e.g., 'blood, anemia'",
  "relatedSymptoms": "comma-separated list of symptoms caused or treated by this",
  "relatedMedicines": "comma-separated list of associated medicines",
  "relatedFoods": "comma-separated list of associated foods or dietary factors"
}

If the category implies certain fields are irrelevant (e.g. normalRange for a Medicine), leave them as empty strings. Do not include markdown formatting like \`\`\`json around the response. Return raw JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate knowledge for: ${title} (Category: ${category})`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const resText = response.text || "{}";
    return JSON.parse(resText);
  } catch (e) {
    console.error("AI AutoFill Error", e);
    return null;
  }
}

export type AnalyzeDischargeResponse = 
  | {
      type: "success";
      data: {
        medicines: {
          name: string;
          dosage: string;
          duration: string;
          purpose: string;
          notes: string;
        }[];
        notes: string;
        nextAppointmentDate?: string;
        nextAppointmentNotes?: string;
        followUpTests?: string;
      }
    }
  | { type: "clarification_needed"; message: string };

export async function analyzeDischargeDocument(
  content: string,
  chatHistory: { role: "user" | "model"; text: string }[] = []
): Promise<AnalyzeDischargeResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No Gemini API Key");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are a medical data extraction assistant.
A patient has provided text from a Chemo Discharge Document.
Extract the relevant details for their tracking session.
If you encounter a medicine/drug in the document and you do not know what its purpose is, return a clarification question asking the user to research and provide the purpose.
If everything is clear or the user has already provided the needed clarifications, return success.

Output format MUST be strictly JSON matching this schema:
{
  "status": "success" | "clarification_needed",
  "data": {
    "medicines": [
      { "name": "string", "dosage": "string", "duration": "string", "purpose": "string", "notes": "string" }
    ],
    "notes": "string (Summary of the chemo process or general doctor notes)",
    "nextAppointmentDate": "string (YYYY-MM-DD if explicitly mentioned, else null)",
    "nextAppointmentNotes": "string (if any instructions for next time)",
    "followUpTests": "string (comma separated tests if any)"
  },
  "question": "string (only if status is clarification_needed)"
}
Do not include markdown backticks.`;

  let prompt = `Discharge Document Text: ${content}\n\n`;
  if (chatHistory.length > 0) {
    prompt += "Chat History for Clarification:\n";
    chatHistory.forEach((msg) => {
      prompt += `${msg.role === "user" ? "User" : "You"}: ${msg.text}\n`;
    });
    prompt += "Please provide the final JSON output based on this clarified context.\n";
  }

  let response;
  let retries = 3;
  let delay = 1000;

  while (true) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });
      break;
    } catch (error: any) {
      if (retries > 0) {
        retries--;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        console.error("AI Processing Error", error);
        return null;
      }
    }
  }

  try {
    const resText = response.text || "{}";
    const parsed = JSON.parse(resText);
    
    if (parsed.status === "success") {
      return { type: "success", data: parsed.data };
    } else {
      return { type: "clarification_needed", message: parsed.question || "Can you clarify the purpose of the drugs mentioned?" };
    }
  } catch (e) {
    console.error("AI Processing Error", e);
    return null;
  }
}

export interface AnalyzeNotesResponse {
  simpleMeaning: string;
  whyImportant: string;
  normalRange: string;
  tags: string;
  relatedSymptoms: string;
  relatedMedicines: string;
  relatedFoods: string;
}

export async function analyzeUserKnowledgeNotes(
  title: string,
  category: string,
  notes: string
): Promise<AnalyzeNotesResponse | { error: string } | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set.");
      return { error: "GEMINI_API_KEY is not configured on the server. Please add it to your environment variables." };
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a medical knowledge extraction assistant.
The user has provided their own detailed medical notes for the entity '${title}' (Category: '${category}').
Your task is to read their notes and extract structured metadata from it.
Do NOT generate a detailed description, as we will save their exact notes.
You just need to extract the short structured data to build the Knowledge Graph.

Generate the output in strictly this JSON format:
{
  "simpleMeaning": "A one sentence simple explanation based on their notes.",
  "whyImportant": "1-2 sentences on why this is important (extracted).",
  "normalRange": "Standard reference range if mentioned (e.g. '11.5–16.5 g/dL'). Empty if not.",
  "tags": "comma-separated tags based on the content",
  "relatedSymptoms": "comma-separated list of symptoms mentioned",
  "relatedMedicines": "comma-separated list of medicines mentioned",
  "relatedFoods": "comma-separated list of foods mentioned"
}

If their notes don't explicitly state something (like related medicines), you can optionally supplement it based on general medical knowledge, or leave it empty.
Return raw JSON only. Do not wrap in markdown \`\`\`.`;

    let response;
    let retries = 3;
    let delay = 2000;

    while (true) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Title: ${title}\nCategory: ${category}\n\nUser Notes:\n${notes}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });
        break;
      } catch (error: any) {
        const isRetryable =
          error?.status === 503 ||
          error?.status === 429 ||
          error?.message?.includes("503") ||
          error?.message?.includes("429") ||
          error?.message?.includes("UNAVAILABLE") ||
          error?.message?.includes("Quota");

        if (isRetryable && retries > 0) {
          console.warn(`AI Analyze Notes rate limit hit, retrying in ${delay}ms...`);
          retries--;
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw error;
        }
      }
    }

    const resText = response.text || "{}";
    return JSON.parse(resText);
  } catch (e) {
    console.error("AI Analyze Notes Error", e);
    return { error: "Failed to communicate with AI model. Please try again later." };
  }
}
