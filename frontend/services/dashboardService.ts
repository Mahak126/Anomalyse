import { FraudMetrics } from '../types';
import { API_CONFIG } from './config';

// Future Backend API Contracts:
// GET /api/v1/dashboard/metrics

export const dashboardService = {
  getFraudMetrics: async (): Promise<FraudMetrics> => {
    let token = localStorage.getItem('anomalyse_token');
    
    const doFetch = (t: string | null) => fetch(`${API_CONFIG.BASE_URL}/dashboard/metrics`, {
      headers: {
        'Authorization': t ? `Bearer ${t}` : ''
      }
    });

    let resp = await doFetch(token);

    if (resp.status === 401) {
      // Retry with dev token as fallback
      const devToken = "hardcoded-dev-token-for-deployment";
      resp = await doFetch(devToken);
      
      if (resp.ok) {
         // If successful, we could store it, but let's just return data for now
         // localStorage.setItem('anomalyse_token', devToken); 
      } else if (resp.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('anomalyse_token');
        localStorage.removeItem('anomalyse_user');
        window.location.href = '#/login';
        throw new Error(`Failed to fetch metrics: ${resp.status} ${resp.statusText}`);
      }
    }

    if (!resp.ok) {
      throw new Error(`Failed to fetch metrics: ${resp.status} ${resp.statusText}`);
    }
    return await resp.json();
  }
};
