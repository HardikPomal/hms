export interface BrainInsight {
  severity: string;
  title: string;
  detail: string;
  recommendedAction?: string;
}

export interface BrainInsightsResult {
  insights: BrainInsight[];
}
