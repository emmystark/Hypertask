/**
 * Custom React Hook for HyperTask API
 * Provides easy access to API methods with built-in error handling
 */

import { useState, useCallback, useEffect } from 'react';
import { hypertaskAPI, type ExecutionResult, type AgentInfo } from '@/services/api';

export interface UseHyperTaskAPIState {
  loading: boolean;
  error: string | null;
  data: any;
}

/**
 * Hook to execute a project with the AI agents
 */
export function useExecuteProject() {
  const [state, setState] = useState<UseHyperTaskAPIState>({
    loading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(
    async (prompt: string, context?: any) => {
      setState({ loading: true, error: null, data: null });
      try {
        const result = await hypertaskAPI.executeProject({
          prompt,
          context,
        });
        setState({ loading: false, error: null, data: result });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setState({ loading: false, error: errorMessage, data: null });
        throw err;
      }
    },
    []
  );

  return { ...state, execute };
}

/**
 * Hook to fetch agents list
 */
export function useAgents() {
  const [state, setState] = useState<UseHyperTaskAPIState>({
    loading: true,
    error: null,
    data: [] as AgentInfo[],
  });

  useEffect(() => {
    const fetchAgents = async () => {
      setState({ loading: true, error: null, data: [] });
      try {
        const agents = await hypertaskAPI.getAgents();
        setState({ loading: false, error: null, data: agents });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setState({ loading: false, error: errorMessage, data: [] });
      }
    };

    fetchAgents();
  }, []);

  return state;
}

/**
 * Hook to check API health
 */
export function useAPIHealth() {
  const [isHealthy, setIsHealthy] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthy = await hypertaskAPI.checkHealth();
        setIsHealthy(healthy);
      } catch (err) {
        setIsHealthy(false);
      } finally {
        setChecked(true);
      }
    };

    checkHealth();
  }, []);

  return { isHealthy, checked };
}

/**
 * Hook to generate a slogan
 */
export function useGenerateSlogan() {
  const [state, setState] = useState<UseHyperTaskAPIState>({
    loading: false,
    error: null,
    data: null,
  });

  const generate = useCallback(async (brandName: string, context?: any) => {
    setState({ loading: true, error: null, data: null });
    try {
      const result = await hypertaskAPI.generateSlogan(brandName, context);
      setState({ loading: false, error: null, data: result });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setState({ loading: false, error: errorMessage, data: null });
      throw err;
    }
  }, []);

  return { ...state, generate };
}

/**
 * Hook to generate a logo
 */
export function useGenerateLogo() {
  const [state, setState] = useState<UseHyperTaskAPIState>({
    loading: false,
    error: null,
    data: null,
  });

  const generate = useCallback(
    async (brandName: string, style?: string, context?: any) => {
      setState({ loading: true, error: null, data: null });
      try {
        const result = await hypertaskAPI.generateLogo(brandName, style, context);
        setState({ loading: false, error: null, data: result });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setState({ loading: false, error: errorMessage, data: null });
        throw err;
      }
    },
    []
  );

  return { ...state, generate };
}
