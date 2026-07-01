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

// ─── Parameters & Knowledge Base (v4 Graph Model) ────────────────────────────

export type KnowledgeStatus = "unknown" | "basic" | "advanced" | "needs_analysis";

export type EntityType = 
  | "parameter" 
  | "finding"      // e.g., "Hemoglobin Low"
  | "condition"    // e.g., "Iron Deficiency Anemia"
  | "food" 
  | "diet"
  | "supplement" 
  | "medication" 
  | "symptom" 
  | "report_template"
  | "chemo_session"
  | "general";

// Strongly-typed Metadata Interfaces
export interface ParameterMetadata {
  unit?: string;
  refMin?: number | string;
  refMax?: number | string;
  criticalMin?: number;
  criticalMax?: number;
  isAgeSpecific?: boolean;
}

export interface FoodMetadata {
  calories?: number;
  preparationMethods?: string;
  storage?: string;
  nutritionFacts?: Record<string, string>;
}

export interface ConditionMetadata {
  severity?: "mild" | "moderate" | "severe";
  isChronic?: boolean;
}

// Unified Graph Node with Discriminated Unions (Type-safe metadata)
export interface BaseEntity {
  id: string; // e.g., "ent_12345" or "param_hemoglobin" for legacy compat
  type: EntityType;
  name: string;
  nameGu?: string; // Gujarati Name
  
  // Previously from KnowledgeEntry:
  simpleMeaning?: string;
  detailedDescription?: string;
  whyImportant?: string;
  normalRangeText?: string;
  
  tags: string[];
  alternativeNames?: string[]; // Kept for legacy parameter compatibility
  category?: string; // Kept for legacy grouping ("Hematology")
  knowledgeStatus?: KnowledgeStatus; 

  source?: string;
  versionHistory?: Array<{ date: string; changes: string }>;

  createdAt: string;
  updatedAt: string;
}

export interface ParameterEntity extends BaseEntity {
  type: "parameter";
  metadata?: ParameterMetadata;
}

export interface FindingEntity extends BaseEntity {
  type: "finding";
  metadata?: {
    parameterId: string; // Links back to the base parameter
    state: "high" | "low" | "critical" | "abnormal";
  };
}

export interface ConditionEntity extends BaseEntity {
  type: "condition";
  metadata?: ConditionMetadata;
}

export interface FoodEntity extends BaseEntity {
  type: "food";
  metadata?: FoodMetadata;
}

export type MedicalEntity = 
  | ParameterEntity 
  | FindingEntity 
  | ConditionEntity 
  | FoodEntity 
  | (BaseEntity & { type: Exclude<EntityType, "parameter" | "finding" | "condition" | "food">; metadata?: any });

// ─── Relationships (Graph Model) ─────────────────────────────────────────────

export type RelationType = 
  | "associated_with" // e.g. Finding -> Condition
  | "recommended_for" // e.g. Diet -> Condition
  | "improves"        // e.g. Food -> Condition
  | "treats"
  | "worsens"
  | "causes"          // e.g. Medication -> Symptom
  | "related_to"      
  | "contains"        // e.g. Diet -> Food
  | "indicates"       // e.g. Finding -> Condition (stronger than associated_with)
  | "contraindicated_for" // e.g. Medication/Food -> Condition
  | "measured_by"
  | "side_effect_of";

export interface EntityRelationship {
  id: string;             // Unique edge ID (e.g., "rel_12345")
  sourceId: string;       
  sourceType: EntityType; 
  targetId: string;       
  targetType: EntityType; 
  relationType: RelationType;
  
  strength?: number; // 0-100 Confidence score for diagnostic reasoning
  evidence?: string; // e.g., "Standard clinical protocol", "User note"
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

// ─── Legacy Type Aliases (For backward compatibility with older components) ───
export type ParameterDef = any;
export type KnowledgeEntry = any;
