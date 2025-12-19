import React, { useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';
import { Transaction } from '../types';
import { AlertCircle, CheckCircle, Search } from 'lucide-react';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await transactionService.getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const getStatusBadge = (status: string, score: number) => {
    if (score > 70) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          <AlertCircle className="w-3 h-3" />
          Fake / Suspicious
        </span>
      );
    } else if (score > 40) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          Review Required
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        <CheckCircle className="w-3 h-3" />
        Safe
      </span>
    );
  };

  const filteredData = transactions.filter(t => 
    t.id.toLowerCase().includes(filter.toLowerCase()) || 
    t.merchant.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaction Monitor</h1>
          <p className="text-slate-500">Live feed of processed transactions and risk scores.</p>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search ID or Merchant..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
          />
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading transaction feed...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Merchant / Location</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredData.map((txn) => (
                  <tr key={txn.id} className={txn.riskScore > 70 ? 'bg-red-50/50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{txn.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{txn.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      <div className="font-medium">{txn.merchant}</div>
                      <div className="text-xs text-slate-500">{txn.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-slate-900">
                      ${txn.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-slate-200 rounded-full h-2 mr-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full ${txn.riskScore > 70 ? 'bg-red-600' : txn.riskScore > 40 ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${txn.riskScore}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-bold ${txn.riskScore > 70 ? 'text-red-700' : 'text-slate-600'}`}>
                          {txn.riskScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(txn.status, txn.riskScore)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;