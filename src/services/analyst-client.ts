import axios, { AxiosError } from 'axios';
import { config } from '../config/config';
import { AnalysisRequest, AnalysisResponse, AnalysisErrorResponse } from '../types/analyst.types';

export class AnalystServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public detail?: string
  ) {
    super(message);
    this.name = 'AnalystServiceError';
  }
}

export class AnalystClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = config.analystServiceUrl, timeout: number = config.requestTimeout) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  async analyzePrompt(prompt: string): Promise<AnalysisResponse> {
    const requestBody: AnalysisRequest = {
      prompt,
      exclude_tables: null,
      generate_charts: null,
    };

    try {
      console.log(`Sending analysis request to ${this.baseUrl}/api/v1/analysis`);
      console.log(`Prompt: ${prompt}`);

      const response = await axios.post<AnalysisResponse>(
        `${this.baseUrl}/api/v1/analysis`,
        requestBody,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Analysis completed successfully');
      console.log(`- Explanation length: ${response.data.explanation.length} chars`);
      console.log(`- Charts returned: ${response.data.charts.length}`);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return this.handleAxiosError(error);
      }

      console.error('Unexpected error during analysis:', error);
      throw new AnalystServiceError('Ocurrió un error inesperado. Por favor, intenta más tarde.');
    }
  }

  private handleAxiosError(error: AxiosError): never {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('Analyst service unavailable:', error.message);
      throw new AnalystServiceError(
        'Lo siento, el servicio de análisis no está disponible. Por favor, intenta más tarde.',
        503
      );
    }

    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data as AnalysisErrorResponse;
      const detail = errorData?.detail || 'Error desconocido';

      console.error(`Analyst service error (${status}):`, detail);

      switch (status) {
        case 400:
          throw new AnalystServiceError(
            'No pude procesar tu consulta. Por favor, reformula tu pregunta.',
            400,
            detail
          );
        case 500:
          throw new AnalystServiceError(
            'Ocurrió un error al analizar tu consulta. Por favor, intenta nuevamente.',
            500,
            detail
          );
        case 502:
          throw new AnalystServiceError(
            'El servicio de inteligencia artificial no está disponible. Intenta más tarde.',
            502,
            detail
          );
        case 503:
          throw new AnalystServiceError(
            'No se pudo conectar a la base de datos. Por favor, intenta más tarde.',
            503,
            detail
          );
        default:
          throw new AnalystServiceError(
            'Ocurrió un error inesperado. Por favor, intenta más tarde.',
            status,
            detail
          );
      }
    }

    console.error('Network error:', error.message);
    throw new AnalystServiceError(
      'Lo siento, el servicio de análisis no está disponible. Por favor, intenta más tarde.'
    );
  }
}

export const analystClient = new AnalystClient();
