export interface AnalysisRequest {
  prompt: string;
  exclude_tables?: string[] | null;
}

export interface QueryResult {
  query_id: string;
  purpose: string;
  sql_query: string;
  data: Record<string, unknown>[];
  row_count: number;
  error?: string;
}

export interface AnalysisMetadata {
  total_queries: number;
  successful_queries: number;
  total_rows: number;
  execution_time_ms: number;
}

export interface AnalysisResponse {
  analysis: string;
  queries: QueryResult[];
  metadata: AnalysisMetadata;
}

export interface AnalysisErrorResponse {
  detail: string;
}
