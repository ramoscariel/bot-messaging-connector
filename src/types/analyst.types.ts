export interface AnalysisRequest {
  prompt: string;
  exclude_tables?: string[] | null;
  generate_charts?: boolean | null;
}

export interface ChartResponse {
  type: string;
  title: string;
  image_base64: string;
}

export interface AnalysisResponse {
  explanation: string;
  sql_query: string;
  charts: ChartResponse[];
}

export interface AnalysisErrorResponse {
  detail: string;
}
