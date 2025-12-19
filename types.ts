// Shared Data Models

export interface User {
  id: string;
  username: string;
  role: 'analyst' | 'admin';
  token: string;
}

export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  merchant: string;
  location: string;
  riskScore: number; // 0 to 100
  status: 'Safe' | 'Suspicious' | 'Review Required';
}

export interface FraudMetrics {
  totalTransactions: number;
  flaggedTransactions: number;
  overallRiskScore: number;
  fraudTrend: Array<{ date: string; fraudCount: number; safeCount: number }>;
  riskDistribution: Array<{ name: string; value: number }>;
}
