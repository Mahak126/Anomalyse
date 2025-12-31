import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { Transaction } from '../types';
import { AlertTriangle, Mail, CheckCircle, Search, Filter, X, Download } from 'lucide-react';

const FraudTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Notification Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [sending, setSending] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchFraudTransactions();
  }, []);

  const fetchFraudTransactions = async () => {
    try {
      const allTxns = await transactionService.getTransactions();
      // Filter strictly for fraud/suspicious
      const fraudOnly = allTxns.filter(t => t.status === 'Suspicious' || t.status === 'Fake/Suspicious');
      setTransactions(fraudOnly);
    } catch (err) {
      console.error('Failed to load fraud transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyClick = (txn: Transaction) => {
    setSelectedTxn(txn);
    // Dynamic recipient email based on user_id
    setEmailTo(`user${txn.user_id}@anomalyse.bank`);
    setNotificationSuccess(null);
    setIsModalOpen(true);
  };

  const sendNotification = async () => {
    if (!selectedTxn) return;
    setSending(true);
    try {
      await transactionService.notifyTransaction(selectedTxn.id, emailTo);
      setNotificationSuccess(`Email successfully sent to ${emailTo}`);

      // Update local state to show 'Sent' status
      setTransactions(prev => prev.map(t =>
        t.id === selectedTxn.id ? { ...t, notification_sent: true } : t
      ));

      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedTxn(null);
      }, 1500);
    } catch (err) {
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  // Filter logic
  const filteredTransactions = transactions.filter(t =>
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newFraudCount = transactions.filter(t => !t.notification_sent).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            Fraud Detection Center
          </h1>
          <p className="text-gray-500 mt-1">
            Review and take action on {transactions.length} detected anomalies.
          </p>
        </div>

        {newFraudCount > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-medium">{newFraudCount} New Cases Require Attention</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Transaction ID, User ID, or City..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>
        <button
          onClick={() => transactionService.downloadFraudReport()}
          className="flex items-center gap-2 px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 text-blue-700 bg-blue-50"
          title="Download all fraudulent transactions as PDF"
        >
          <Download className="h-5 w-5" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Transaction ID</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Date & Time</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">User</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-right">Amount</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Primary Flag</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">Loading fraud data...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    {searchTerm ? 'No matching records found.' : 'No fraudulent transactions detected yet.'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono text-gray-600 truncate max-w-[140px]" title={txn.id}>
                      {txn.id.length > 12 ? `${txn.id.slice(0, 6)}...${txn.id.slice(-4)}` : txn.id}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {new Date(txn.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {txn.user_id}
                      <div className="text-xs text-gray-400">{txn.city}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 text-right font-medium">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        {txn.flag_type || 'Unknown Anomaly'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {txn.notification_sent ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle className="h-3 w-3" /> Notified
                        </span>
                      ) : (
                        <span className="text-xs text-orange-600 font-medium">Pending Review</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleNotifyClick(txn)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${txn.notification_sent
                          ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                          }`}
                      >
                        <Mail className="h-3 w-3" />
                        {txn.notification_sent ? 'Resend' : 'Notify'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Modal */}
      {isModalOpen && selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">Notify Security Team</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {notificationSuccess ? (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <p className="text-green-800 font-medium">Notification Sent Successfully!</p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100">
                    <p><strong>Transaction ID:</strong> {selectedTxn.id}</p>
                    <p><strong>Detected Anomaly:</strong> {selectedTxn.flag_type}</p>
                    <p><strong>Risk Score:</strong> {selectedTxn.riskScore || 'High'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="text-xs text-gray-500">
                    This will send an automated fraud alert containing all transaction details and the detected anomaly reason.
                  </div>
                </>
              )}
            </div>

            {!notificationSuccess && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendNotification}
                  disabled={sending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {sending ? 'Sending...' : (
                    <>
                      <Mail className="h-4 w-4" /> Send Alert
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FraudTransactionsPage;
