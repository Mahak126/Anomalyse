import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle, TrendingUp, Activity, Users, CreditCard, DollarSign } from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { FraudMetrics } from '../types';

const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<FraudMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setError(null);
      const data = await dashboardService.getFraudMetrics();
      setMetrics(data);
      setLastUpdated(new Date().toLocaleString());
    } catch (err: any) {
      console.error("Failed to load dashboard metrics", err);
      setError("Failed to load metrics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-100 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchMetrics(); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const RISK_COLORS = ['#10b981', '#f59e0b', '#ef4444']; 

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time fraud detection and transaction analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Updated</p>
            <p className="text-sm font-medium text-slate-700">{lastUpdated}</p>
          </div>
          <button
            onClick={() => { setLoading(true); fetchMetrics(); }}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
            title="Refresh Data"
          >
            <Activity className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Transactions"
          value={metrics.totalTransactions.toLocaleString()}
          icon={<CreditCard className="w-6 h-6 text-indigo-600" />}
          trend="Total volume processed"
          color="bg-indigo-50"
        />
        <KpiCard
          title="Fraud Detected"
          value={metrics.flaggedTransactions.toLocaleString()}
          valueColor="text-red-600"
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          trend={`${(metrics.fraudPercent ?? 0).toFixed(2)}% of total volume`}
          color="bg-red-50"
        />
        <KpiCard
          title="Avg Transaction"
          value={`₹${(metrics.averageAmount ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
          trend="Across all categories"
          color="bg-emerald-50"
        />
        <KpiCard
          title="Overall Risk Score"
          value={`${(metrics.overallRiskScore ?? 0).toFixed(2)}%`}
          icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
          trend="System-wide threat level"
          color="bg-amber-50"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Fraud Trend - Takes up 2 columns */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Transaction Volume & Fraud Trend</h2>
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Suspicious</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Genuine</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.fraudTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="safeCount" 
                  name="Genuine" 
                  stroke="#cbd5e1" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fraudCount" 
                  name="Suspicious" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution - Takes up 1 column */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <h2 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Risk Distribution</h2>
          <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {metrics.riskDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <div className="text-center">
                <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">Total</p>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">{metrics.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Most Frequent Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Most Frequent Users
          </h2>
          <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart 
                data={metrics.topUsers || []} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
               >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="user_id" 
                    type="category" 
                    width={100} 
                    tick={{fontSize: 12, fill: '#64748b'}} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" name="Transactions" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={24} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Fraud Type Analysis */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
             <Activity className="w-5 h-5 text-pink-500" />
             Fraud Type Analysis
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Fast Location', value: metrics.fraudTypeCounts?.['Fast Location'] ?? 0, fill: '#8b5cf6' },
                { name: 'Velocity', value: metrics.fraudTypeCounts?.['Velocity'] ?? 0, fill: '#ec4899' },
                { name: 'High Value', value: metrics.fraudTypeCounts?.['High Value'] ?? 0, fill: '#f59e0b' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="value" name="Detected Cases" radius={[6, 6, 0, 0]} barSize={40}>
                   <Cell fill="#8b5cf6" />
                   <Cell fill="#ec4899" />
                   <Cell fill="#f59e0b" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for KPI Cards
const KpiCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
  valueColor?: string;
}> = ({ title, value, icon, trend, color, valueColor = "text-slate-900" }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-1 group-hover:text-indigo-600 transition-colors">{title}</p>
        <h3 className={`text-2xl font-bold ${valueColor} tracking-tight`}>{value}</h3>
        {trend && <p className="text-xs text-slate-400 mt-2 font-medium">{trend}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
  </div>
);

export default DashboardPage;
