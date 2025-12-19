import { Transaction } from '../types';

// Future Backend API Contracts:
// GET /api/v1/transactions

const generateMockTransactions = (): Transaction[] => {
  return [
    { id: 'TXN-9982', timestamp: '2023-10-07 10:23:01', amount: 2500.00, merchant: 'Apple Store', location: 'New York, USA', riskScore: 12, status: 'Safe' },
    { id: 'TXN-9983', timestamp: '2023-10-07 10:24:15', amount: 15.50, merchant: 'Uber Eats', location: 'New York, USA', riskScore: 5, status: 'Safe' },
    { id: 'TXN-9984', timestamp: '2023-10-07 11:05:00', amount: 9800.00, merchant: 'Luxury Watches Intl', location: 'Lagos, NG', riskScore: 88, status: 'Suspicious' },
    { id: 'TXN-9985', timestamp: '2023-10-07 11:15:30', amount: 120.00, merchant: 'Amazon', location: 'New York, USA', riskScore: 10, status: 'Safe' },
    { id: 'TXN-9986', timestamp: '2023-10-07 12:00:01', amount: 4500.00, merchant: 'Unknown Crypto Exch', location: 'Moscow, RU', riskScore: 92, status: 'Suspicious' },
    { id: 'TXN-9987', timestamp: '2023-10-07 12:05:12', amount: 50.00, merchant: 'Starbucks', location: 'New York, USA', riskScore: 2, status: 'Safe' },
    { id: 'TXN-9988', timestamp: '2023-10-07 12:10:45', amount: 12500.00, merchant: 'Offshore Transfer', location: 'Cayman Islands', riskScore: 75, status: 'Suspicious' },
    { id: 'TXN-9989', timestamp: '2023-10-07 12:15:00', amount: 200.00, merchant: 'Best Buy', location: 'New Jersey, USA', riskScore: 20, status: 'Safe' },
    { id: 'TXN-9990', timestamp: '2023-10-07 13:00:00', amount: 99.99, merchant: 'Netflix', location: 'New York, USA', riskScore: 1, status: 'Safe' },
    { id: 'TXN-9991', timestamp: '2023-10-07 13:30:22', amount: 3000.00, merchant: 'Elec Store', location: 'London, UK', riskScore: 65, status: 'Review Required' },
  ];
};

export const transactionService = {
  getTransactions: async (): Promise<Transaction[]> => {
    // Simulate Network Latency
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateMockTransactions();
  }
};