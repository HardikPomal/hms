export interface SituationSnapshot {
  patient: {
    name?: string;
    cancerType?: string;
  };
  chemo: {
    activeSession: boolean;
    cycleNumber?: number;
    stage: string;
    daysSinceLastSession?: number;
    nextAppointment?: boolean;
    daysUntilNextAppointment?: number;
  };
  labs: {
    latestReport?: {
      reportDate: string;
    };
    latestReportAgeDays?: number;
    abnormalFields: Array<{
      parameterId: string;
      value: string | number;
      unit?: string;
      status: string;
      trend: string;
    }>;
  };
  medicines: {
    active: any[];
    todayAdherence: {
      taken: number;
      total: number;
    };
    missedDoses: any[];
  };
}
