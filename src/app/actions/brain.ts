"use server";

// ─── The Brain: AI Synthesis Layer ───────────────────────────────────────────
// Step 3 of the "Brain" pipeline.
//
// Steps 1 & 2 already did the actual analysis (data aggregation + graph/rule
// based reasoning), entirely deterministically. This step's ONLY job is to
// turn that structured, already-correct output into a short, warm,
// plain-language summary a stressed caregiver can read in ten seconds. The
// model is explicitly instructed to work only from the facts it's given —
// it is a phrasing layer, not a diagnosis layer.

import { GoogleGenAI } from "@google/genai";
import type { SituationSnapshot } from "@/lib/brain/snapshot";
import type { BrainInsightsResult } from "@/lib/brain/reasoning";

export interface BrainSynthesis {
  headline: string;
  situationSummary: string;
  watchFor: string[];
  nextSteps: string[];
}

export type BrainSynthesisResponse =
  | { type: "success"; data: BrainSynthesis }
  | { type: "error"; message: string };

function buildGroundedContext(snapshot: SituationSnapshot, insights: BrainInsightsResult): string {
  const lines: string[] = [];

  lines.push(`Patient: ${snapshot.patient.name ?? "Unknown"}, cancer type: ${snapshot.patient.cancerType ?? "not specified"}.`);

  if (snapshot.chemo.activeSession) {
    lines.push(
      `Chemo: cycle ${snapshot.chemo.cycleNumber ?? "?"}, current stage "${snapshot.chemo.stage}", ${snapshot.chemo.daysSinceLastSession ?? "?"} days since last session.`
    );
  } else {
    lines.push("Chemo: no active session right now.");
  }
  if (snapshot.chemo.nextAppointment) {
    lines.push(`Next appointment in ${snapshot.chemo.daysUntilNextAppointment ?? "?"} day(s).`);
  }

  if (snapshot.labs.latestReport) {
    lines.push(`Latest labs from ${snapshot.labs.latestReport.reportDate} (${snapshot.labs.latestReportAgeDays} days ago).`);
    if (snapshot.labs.abnormalFields.length > 0) {
      lines.push(
        "Abnormal values: " +
          snapshot.labs.abnormalFields
            .map((f) => `${f.parameterId} = ${f.value}${f.unit ?? ""} (${f.status}${f.trend !== "single" ? ", " + f.trend : ""})`)
            .join("; ")
      );
    } else {
      lines.push("All lab values are within normal range.");
    }
  } else {
    lines.push("No lab reports on file yet.");
  }

  lines.push(
    `Medicines: ${snapshot.medicines.active.length} active. Today's adherence: ${snapshot.medicines.todayAdherence.taken}/${snapshot.medicines.todayAdherence.total} taken. Missed doses (last 3 days): ${snapshot.medicines.missedDoses.length}.`
  );

  lines.push("\nAlready-identified insights (from deterministic analysis, in priority order):");
  insights.insights.forEach((ins, i) => {
    lines.push(`${i + 1}. [${ins.severity}] ${ins.title} — ${ins.detail}${ins.recommendedAction ? ` Suggested action: ${ins.recommendedAction}` : ""}`);
  });

  return lines.join("\n");
}

export async function generateBrainSynthesis(
  snapshot: SituationSnapshot,
  insights: BrainInsightsResult,
  language: "en" | "gu" = "en"
): Promise<BrainSynthesisResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { type: "error", message: "GEMINI_API_KEY is not set. Please add it to .env.local" };
  }

  const ai = new GoogleGenAI({ apiKey });
  const context = buildGroundedContext(snapshot, insights);

  const systemInstruction = `You are the writing layer for a cancer-care companion app. All the actual medical analysis has ALREADY been done by a deterministic rules engine — the facts and insights given to you are final and correct. Your ONLY job is to phrase them clearly, warmly, and concisely for a patient or family caregiver in ${language === "gu" ? "Gujarati" : "English"}.

STRICT RULES:
- Do NOT invent, guess, or add any medical fact, number, or recommendation that isn't in the provided context.
- Do NOT diagnose. Do NOT contradict or soften an "urgent" item.
- If the insights list contains an "urgent" item, the headline and situationSummary MUST make that clearly visible, not buried.
- Keep it short: situationSummary is 2-4 sentences. watchFor and nextSteps are short bullet phrases, not paragraphs.
- Tone: calm, plain-language, respectful — never alarmist, never dismissive.

Output STRICTLY this JSON schema, no markdown backticks, no extra text:
{
  "headline": "string, max 10 words, the single most important thing right now",
  "situationSummary": "string, 2-4 sentences synthesizing labs + chemo + medicines together",
  "watchFor": ["short phrase", "..."],
  "nextSteps": ["short actionable phrase", "..."]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: context,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const resText = response.text || "{}";
    const parsed = JSON.parse(resText);

    if (!parsed.headline || !parsed.situationSummary) {
      return { type: "error", message: "AI response was incomplete. Please try again." };
    }

    return {
      type: "success",
      data: {
        headline: parsed.headline,
        situationSummary: parsed.situationSummary,
        watchFor: Array.isArray(parsed.watchFor) ? parsed.watchFor : [],
        nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
      },
    };
  } catch (e) {
    console.error("Brain synthesis error", e);
    return { type: "error", message: "Could not reach the AI service. The situation snapshot below is still fully accurate." };
  }
}