// ─── Database Types ─────────────────────────────────────────────────────────

export type ReportStatus = "high" | "low" | "normal" | "unknown";

// ─── Medical Report & Templates ──────────────────────────────────────────────

export type ReportFormat = "numeric" | "narrative";

export interface BaseReportTemplate {
  id: string;
  name: string; // e.g., "Complete Blood Count (CBC)"
  nameGu?: string;
  format: ReportFormat;
}

export interface NumericReportTemplate extends BaseReportTemplate {
  format: "numeric";
  standardParameters: string[]; // Array of ParameterDef IDs
  optionalParameters: string[]; // Array of ParameterDef IDs
}

export interface NarrativeReportTemplate extends BaseReportTemplate {
  format: "narrative";
  sections: string[]; // e.g., ["Findings", "Impression", "Diagnosis", "Notes"]
}

export type ReportTemplate = NumericReportTemplate | NarrativeReportTemplate;

export interface NumericField {
  parameterId: string; // Links to global library
  value: number | string; // keeping string as fallback
  unit: string;
  refMin?: number | string;
  refMax?: number | string;
  status: ReportStatus;
  customNotes?: string;
}

export interface NarrativeSection {
  sectionName: string;
  content: string;
}

export interface MedicalReport {
  id: string;
  templateId: string;
  format: ReportFormat;
  reportDate: string; // ISO date string
  hospitalName: string;
  doctorName: string;
  
  // Numeric Data
  numericFields?: NumericField[];
  
  // Narrative Data
  narrativeSections?: NarrativeSection[];
  
  fileData?: string; // base64 encoded file
  fileName?: string;
  fileType?: string; // "pdf" | "image"
  generalNotes: string;
  
  createdAt: string;
  updatedAt: string;
}

// ─── Chemo & Medicines ───────────────────────────────────────────────────────

export interface ChemoMedicine {
  id: string;
  name: string;
  dosage: string;
  duration: string;
  purpose: string;
  sideEffects: string;
  notes: string;
  startTime?: string;
  endTime?: string;
}

export type ChemoSessionStatus = 
  | "scheduled" 
  | "blood_test_pending"
  | "doctor_consult" 
  | "approval_pending" 
  | "treatment_active" 
  | "discharge" 
  | "completed" 
  | "delayed";

export interface ChemoSession {
  id: string;
  cycleNumber: number;
  sessionDate: string;
  hospital: string;
  doctorName: string;
  
  // State Machine
  status: ChemoSessionStatus;
  
  // Blood Test
  cbcReportId?: string;
  
  // Doctor Consult
  doctorDecision?: "full" | "half" | "delay";
  consultNotes?: string;
  
  // Treatment
  medicines: ChemoMedicine[];
  sideEffectsExperienced: string;
  notes: string;
  
  // Discharge
  homeMedicinesPrescribed: boolean;
  nextAppointmentDate?: string;
  nextAppointmentNotes?: string;
  followUpTests?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type MedicineScheduleTime = "morning" | "afternoon" | "evening" | "night";
export type MedicineRelation = "before" | "after" | "with" | "any";

export interface MedicineSchedule {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
  foodRelation: MedicineRelation;
}

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  strength: string;
  dosageForm: string;       // tablet, syrup, injection, etc.
  dosageAmount: string;
  purpose: string;
  schedule: MedicineSchedule;
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  isActive: boolean;
  sideEffects?: string;
  precautions?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type MedicineLogStatus = "taken" | "skipped" | "pending";

export interface MedicineLog {
  id: string;
  medicineId: string;
  medicineName: string;
  scheduledDate: string;    // ISO date
  scheduledTime: MedicineScheduleTime;
  status: MedicineLogStatus;
  takenAt?: string;
  notes?: string;
  createdAt: string;
}

// ─── Parameters & Knowledge Base ─────────────────────────────────────────────

export type KnowledgeStatus = "unknown" | "basic" | "advanced";

export interface ParameterDef {
  id: string; // e.g., "param_hemoglobin"
  name: string;
  alternativeNames: string[]; // e.g., ["Hb", "Hgb"]
  category: string; // e.g., "Hematology"
  
  // Default bounds and units (can be overridden in specific reports)
  defaultUnit?: string;
  defaultRefMin?: number | string;
  defaultRefMax?: number | string;
  
  knowledgeStatus: KnowledgeStatus; 
  
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeEntry {
  id: string; // e.g., "kb_hemoglobin"
  parameterId?: string; // Links to ParameterDef (optional, if knowledge is general)
  
  // Core Info (Basic Knowledge)
  simpleMeaning: string;
  whyImportant: string;
  normalRangeText: string;
  
  // Advanced Knowledge
  detailedDescription: string;
  source: string;
  doctorNotes: string;
  personalNotes: string;
  references: string[];
  
  // HYBRID RELATIONSHIP CACHE (Array of IDs for fast UI rendering)
  // The 'relationships' store remains the single source of truth.
  relatedSymptomsCache?: string[]; 
  relatedFoodsCache?: string[];
  relatedMedicinesCache?: string[];
  relatedReportsCache?: string[];
  
  tags: string[];
  versionHistory: Array<{ date: string; changes: string }>;
  
  createdAt: string;
  updatedAt: string;
}

// ─── Relationships (Graph Model) ─────────────────────────────────────────────

export type EntityType = "parameter" | "knowledge" | "medicine" | "symptom" | "food" | "report_template" | "chemo_session" | "general";
export type RelationType = "causes" | "treats" | "worsens" | "improves" | "measured_by" | "related_to" | "side_effect_of";

export interface EntityRelationship {
  id: string;             // Unique edge ID (e.g., "rel_12345")
  sourceId: string;       
  sourceType: EntityType; 
  targetId: string;       
  targetType: EntityType; 
  relationType: RelationType;
  
  notes?: string;
  createdAt: string;
}

// ─── App Settings ────────────────────────────────────────────────────────────

export interface AppSettings {
  language: "en" | "gu";
  theme: "light" | "dark" | "system";
  textSize: "normal" | "large" | "xlarge";
  highContrast: boolean;
  patientName?: string;
  patientAge?: string;
  cancerType?: string;
  doctorName?: string;
  hospitalName?: string;
  emergencyContact?: string;
}

// ─── UI / Component Types ────────────────────────────────────────────────────

export interface NavItem {
  href: string;
  icon: string;
  label: string;
  labelGu: string;
}

export interface ReportField {
  id: string;
  name: string;
  nameGu?: string;
  value: string;
  unit?: string;
  refMin?: string;
  refMax?: string;
  status: ReportStatus;
  notes?: string;
}

export interface TrendData {
  date: string;
  value: number;
}

export interface FieldTrend {
  fieldName: string;
  data: TrendData[];
  direction: "up" | "down" | "stable";
  isImproving: boolean;
}
