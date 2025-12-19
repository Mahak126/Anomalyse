import { FraudMetrics } from '../types';

// Future Backend API Contracts:
// GET /api/v1/dashboard/metrics

const MOCK_METRICS: FraudMetrics = {
  totalTransactions: 12450,
  flaggedTransactions: 342,
  overallRiskScore: 4.2, // Percentage of total volume
  fraudTrend: [
    { date: '2023-10-01', fraudCount: 12, safeCount: 400 },
    { date: '2023-10-02', fraudCount: 18, safeCount: 420 },
    { date: '2023-10-03', fraudCount: 8, safeCount: 380 },
    { date: '2023-10-04', fraudCount: 25, safeCount: 450 }, // Spike
    { date: '2023-10-05', fraudCount: 15, safeCount: 410 },
    { date: '2023-10-06', fraudCount: 20, safeCount: 430 },
    { date: '2023-10-07', fraudCount: 10, safeCount: 390 },
  ],
  riskDistribution: [
    { name: 'Safe', value: 12108 },
    { name: 'Suspicious', value: 342 },
  ]
};

export const dashboardService = {
  getFraudMetrics: async (): Promise<FraudMetrics> => {
    // Simulate Network Latency
    await new Promise((resolve) => setTimeout(resolve, 600));
    return MOCK_METRICS;
  }
};