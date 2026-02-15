/**
 * HyperTask API Service
 * Centralized API communication with the backend AI agents
 */

import { logger } from '@/utils/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hypertask.onrender.com';

export interface TaskRequest {
  prompt: string;
  context?: {
    brand_voice?: string;
    design_style?: string;
    colors?: string[];
    [key: string]: any;
  };
}

export interface AgentInfo {
  name: string;
  cost: number;
  specialty: string;
  status: string;
}

export interface Deliverable {
  id: string;
  type: 'image' | 'text' | 'file';
  name: string;
  content: string;
}

export interface TransactionBreakdown {
  agent: string;
  amount: number;
}

export interface ExecutionResult {
  analysis: {
    [key: string]: any;
  };
  deliverables: Deliverable[];
  transaction: {
    total: number;
    breakdown: TransactionBreakdown[];
    burn_fee: number;
  };
  status: string;
}

class HyperTaskAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if API is healthy and accessible
   */
  async checkHealth(): Promise<boolean> {
    try {
      logger.debug('API', 'Checking health endpoint');
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const isOk = response.ok;
      if (isOk) {
        logger.success('API', 'Health check passed');
      } else {
        logger.warn('API', 'Health check failed', { status: response.status });
      }
      return isOk;
    } catch (error) {
      logger.error('API', 'Health check failed', error);
      return false;
    }
  }

  /**
   * Get all available agents and their status
   */
  async getAgents(): Promise<AgentInfo[]> {
    try {
      logger.debug('API', 'Fetching agents list');
      const response = await fetch(`${this.baseUrl}/agents`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        logger.warn('API', 'Agents endpoint returned non-ok status', { status: response.status });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.success('API', 'Agents fetched successfully', { count: data.length });
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        return data;
      }
      
      // If it's an object with agents property, extract it
      if (data.agents && Array.isArray(data.agents)) {
        return data.agents;
      }

      // Fallback to empty array
      logger.warn('API', 'Unexpected agents response format');
      return [];
    } catch (error) {
      logger.error('API', 'Failed to fetch agents', error);
      return [];
    }
  }

  /**
   * Analyze a user request without executing
   */
  async analyzeRequest(prompt: string, context?: TaskRequest['context']): Promise<any> {
    try {
      logger.debug('API', 'Analyzing request', { prompt });
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });

      if (!response.ok) {
        logger.warn('API', 'Analyze endpoint returned error', { status: response.status });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.success('API', 'Analysis completed', { analysis: data });
      return data;
    } catch (error) {
      logger.error('API', 'Analysis request failed', error);
      throw error;
    }
  }

  /**
   * Execute a complete project with AI agents
   */
  async executeProject(request: TaskRequest): Promise<ExecutionResult> {
    try {
      logger.info('API', 'Executing project', { prompt: request.prompt });
      const response = await fetch(`${this.baseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        logger.warn('API', 'Execute endpoint returned error', { status: response.status });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate expected fields
      if (!data.deliverables || !data.transaction) {
        logger.error('API', 'Invalid response format from backend', { data });
        throw new Error('Invalid response format from backend');
      }

      logger.success('API', 'Project execution successful', { 
        deliverables: data.deliverables.length,
        cost: data.transaction.total
      });
      return data as ExecutionResult;
    } catch (error) {
      logger.error('API', 'Project execution failed', error);
      throw error;
    }
  }

  /**
   * Generate a slogan using CopyBot
   */
  async generateSlogan(brand_name: string, context?: any): Promise<{ slogan: string }> {
    try {
      logger.debug('API', 'Generating slogan', { brand_name });
      const response = await fetch(`${this.baseUrl}/agents/copybot/slogan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_name, context }),
      });

      if (!response.ok) {
        logger.warn('API', 'Slogan generation endpoint returned error', { status: response.status });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.success('API', 'Slogan generated', { slogan: data.slogan });
      return data;
    } catch (error) {
      logger.error('API', 'Slogan generation failed', error);
      throw error;
    }
  }

  /**
   * Generate a logo using DesignBot
   */
  async generateLogo(
    brand_name: string,
    style?: string,
    context?: any
  ): Promise<{ image_base64: string; size: any }> {
    try {
      logger.debug('API', 'Generating logo', { brand_name, style });
      const response = await fetch(`${this.baseUrl}/agents/designbot/logo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_name, style, context }),
      });

      if (!response.ok) {
        logger.warn('API', 'Logo generation endpoint returned error', { status: response.status });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.success('API', 'Logo generated', { size: data.size });
      return data;
    } catch (error) {
      logger.error('API', 'Logo generation failed', error);
      throw error;
    }
  }

  /**
   * Get root API information
   */
  async getApiInfo(): Promise<any> {
    try {
      logger.debug('API', 'Fetching API info');
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        logger.warn('API', 'API info endpoint returned error', { status: response.status });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.success('API', 'API info retrieved', { version: data.version });
      return data;
    } catch (error) {
      logger.error('API', 'Failed to fetch API info', error);
      throw error;
    }
  }
}

// Export singleton instance
export const hypertaskAPI = new HyperTaskAPI();
export default hypertaskAPI;
