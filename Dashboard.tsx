/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SchoolCategory, StudentClass } from '../types';
import { 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  Coins, 
  RefreshCw, 
  Calendar, 
  PhoneCall, 
  Check, 
  ExternalLink,
  LayoutGrid,
  ListFilter,
  Users,
  Search,
  Activity,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { 
    currentDate,
    setCurrentDate,
    payments, 
    getDailyStats, 
    getTeacherMetrics, 
    getCashFlowTrend, 
    getPendingAlerts,
    currentUser
  } = useApp();

  // Active Layout perspective state
  const [activeLayout, setActiveLayout] = useState<'bento' | 'class-perf' | 'alerts-desk'>('bento');

  // Chart toggle metric state
  const [chartMetric, setChartMetric] = useState<'revenue' | 'volume'>('revenue');

  // Target audit date
  const [dateFilter, setDateFilter] = useState<string>(currentDate);

  // Search inside filters for sub-views
  const [alertSearch, setAlertSearch] = useState('');
  const [classPerfSearch, setClassPerfSearch] = useState('');

  const stats = useMemo(() => getDailyStats(dateFilter), [getDailyStats, dateFilter]);
  const teacherMetrics = useMemo(() => getTeacherMetrics(dateFilter), [getTeacherMetrics, dateFilter]);
  const trends = useMemo(() => getCashFlowTrend(), [getCashFlowTrend]);
  const pendingAlerts = useMemo(() => getPendingAlerts(dateFilter), [getPendingAlerts, dateFilter]);

  // Handle manual date changing to explore other days
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      setDateFilter(val);
      setCurrentDate(val);
    }
  };

  // Find maximum trend amount for scaling SVG chart
  const maxTrendAmount = useMemo(() => {
    const vals = trends.map(t => chartMetric === 'revenue' ? t.amount : t.transactions);
    return Math.max(...vals, 1); // avoid division by zero
  }, [trends, chartMetric]);

  const [notifiedStudents, setNotifiedStudents] = useState<Record<string, boolean>>({});

  const handleDialGuardian = (studentId: string, phone: string) => {
    setNotifiedStudents(prev => ({ ...prev, [studentId]: true }));
    // Simulate dialing visually for 3 seconds
    setTimeout(() => {
      setNotifiedStudents(prev => ({ ...prev, [studentId]: false }));
    }, 3000);
  };

  // Filtered lists for specialized tabs
  const filteredAlerts = useMemo(() => {
    if (!alertSearch.trim()) return pendingAlerts;
    const lower = alertSearch.toLowerCase();
    return pendingAlerts.filter(s => 
      s.studentName.toLowerCase().includes(lower) || 
      s.class.toLowerCase().includes(lower)
    );
  }, [pendingAlerts, alertSearch]);

  const filteredTeacherMetrics = useMemo(() => {
    if (!classPerfSearch.trim()) return teacherMetrics;
    const lower = classPerfSearch.toLowerCase();
    return teacherMetrics.filter(m => 
      m.className.toLowerCase().includes(lower) || 
      m.teacherName.toLowerCase().includes(lower)
    );
  }, [teacherMetrics, classPerfSearch]);

  return (
    <div className="space-y-6 font-sans">
      {/* Date & Layout Control Header */}
      <div className="bg-neutral-900 border-4 border-neutral-800 p-6 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-6">
        
        {/* Date Selector controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-amber-400 shrink-0" size={18} />
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Target Audit Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={handleDateChange}
              className="bg-neutral-950 border-2 border-neutral-800 text-[11px] font-black text-white px-3 py-1.5 focus:border-amber-400 outline-none uppercase tracking-wider font-mono cursor-pointer"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-none animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400 font-mono">Real-Time Core Analytics Live</span>
          </div>
        </div>

        {/* Layout Switcher tabs */}
        <div className="flex flex-wrap bg-neutral-950 p-1.5 border-2 border-neutral-850 gap-1.5">
          <button
            onClick={() => setActiveLayout('bento')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
              activeLayout === 'bento' 
                ? 'bg-white text-black font-black' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
            }`}
          >
            <LayoutGrid size={14} /> Sleek Bento Grid
          </button>
          <button
            onClick={() => setActiveLayout('class-perf')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
              activeLayout === 'class-perf' 
                ? 'bg-white text-black font-black' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
            }`}
          >
            <Activity size={14} /> Classrooms Tracker
          </button>
          <button
            onClick={() => setActiveLayout('alerts-desk')}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
              activeLayout === 'alerts-desk' 
                ? 'bg-white text-black font-black' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40'
            }`}
          >
            <AlertTriangle size={14} className={pendingAlerts.length > 0 ? 'text-amber-450 animate-bounce' : ''} /> Alerts Deck ({pendingAlerts.length})
          </button>
        </div>
      </div>

      {/* 4 Interactive KPI Cards - Heightened Design with Side Accent borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Total Collected */}
        <div className="bg-neutral-900 border-4 border-neutral-800 border-l-amber-400 p-6 flex flex-col justify-between min-h-[145px] hover:border-r-neutral-700 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-mono">Collections Total</span>
            <Coins size={16} className="text-amber-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black font-mono text-white tracking-tight leading-none">GHC {stats.totalCollected.toFixed(2)}</h3>
            <p className="text-[9px] text-emerald-400 uppercase font-black tracking-widest mt-2 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-400" /> Verified gates
            </p>
          </div>
        </div>

        {/* Metric 2: Expected vs Actual Collection Rate */}
        <div className="bg-neutral-900 border-4 border-neutral-800 border-l-white p-6 flex flex-col justify-between min-h-[145px] hover:border-r-neutral-700 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-mono">Collection Rate</span>
            <TrendingUp size={16} className="text-white" />
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black font-mono text-white tracking-tight leading-none">{stats.collectionRate.toFixed(1)}%</h3>
            <div className="w-full bg-neutral-950 h-1.5 mt-2.5 border border-neutral-850">
              <div 
                className="bg-amber-400 h-full transition-all duration-500" 
                style={{ width: `${Math.min(stats.collectionRate, 100)}%` }}
              />
            </div>
            <p className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest mt-1.5">
              Goal GHC {stats.totalExpected.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Metric 3: Total Paid Count */}
        <div className="bg-neutral-900 border-4 border-neutral-800 border-l-neutral-400 p-6 flex flex-col justify-between min-h-[145px] hover:border-r-neutral-700 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-mono">Paid Cohort</span>
            <Users size={16} className="text-neutral-400" />
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black font-mono text-white tracking-tight leading-none">{stats.paidCount} PUPILS</h3>
            <p className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest mt-2 block">
              Entered classrooms cleared
            </p>
          </div>
        </div>

        {/* Metric 4: Pending Alerts */}
        <div className="bg-neutral-900 border-4 border-neutral-800 border-l-red-500 p-6 flex flex-col justify-between min-h-[145px] hover:border-r-neutral-700 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-mono">Pending Gate Checks</span>
            <AlertTriangle size={16} className="text-red-500 animate-pulse" />
          </div>
          <div className="mt-3">
            <h3 className="text-3xl font-black font-mono text-red-500 tracking-tight leading-none">{stats.pendingCount} PENDING</h3>
            <p className="text-[9px] text-red-400 uppercase font-black tracking-widest mt-2 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-red-500 animate-ping" /> Alert state active
            </p>
          </div>
        </div>
      </div>

      {/* Main Dynamic Workspace Presentation based on tab selection */}
      <AnimatePresence mode="wait">
        {activeLayout === 'bento' && (
          <motion.div
            key="bento-layout"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top row: Trend Graphics & Category split Bento block */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Cash Flow Trends Graph Block */}
              <div className="bg-neutral-900 border-4 border-neutral-800 p-8 col-span-1 lg:col-span-2 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black uppercase italic text-white tracking-tight">Ledger Cash Flow Analytics</h3>
                    <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1">Weekly financial status logs</p>
                  </div>
                  
                  {/* Interactive toggle between Revenue GHC values and transaction count volumes */}
                  <div className="flex bg-neutral-950 p-1 border border-neutral-800 max-w-fit self-start sm:self-auto">
                    <button
                      onClick={() => setChartMetric('revenue')}
                      className={`px-3 py-1.5 text-[9px] font-black font-mono uppercase tracking-widest transition-colors cursor-pointer ${
                        chartMetric === 'revenue' ? 'bg-amber-400 text-black font-extrabold' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Revenue (GHC)
                    </button>
                    <button
                      onClick={() => setChartMetric('volume')}
                      className={`px-3 py-1.5 text-[9px] font-black font-mono uppercase tracking-widest transition-colors cursor-pointer ${
                        chartMetric === 'volume' ? 'bg-amber-400 text-black font-extrabold' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Tx Volume
                    </button>
                  </div>
                </div>

                {/* Plot Area */}
                <div className="h-68 w-full relative pt-6 bg-neutral-950 border-2 border-neutral-850 p-4">
                  {trends.length > 0 ? (
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      {/* Grid Horizontal Guide Lines */}
                      <line x1="0" y1="180" x2="100%" y2="180" stroke="#1c1c1c" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="120" x2="100%" y2="120" stroke="#1c1c1c" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="60" x2="100%" y2="60" stroke="#1c1c1c" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="5" x2="100%" y2="5" stroke="#262626" strokeWidth="1.5" />

                      {/* Render line path nodes */}
                      {trends.map((t, idx) => {
                        const xPercent = trends.length > 1 ? (idx / (trends.length - 1)) * 100 : 50;
                        const targetVal = chartMetric === 'revenue' ? t.amount : t.transactions;
                        const normalizedY = 195 - (targetVal / maxTrendAmount) * 165; 

                        return (
                          <g key={t.date} className="group cursor-pointer">
                            {/* Vertical Hover Guides */}
                            <line 
                              x1={`${xPercent}%`} 
                              y1="5" 
                              x2={`${xPercent}%`} 
                              y2="200" 
                              stroke="#1f1f1f" 
                              strokeWidth="1.5" 
                              className="group-hover:stroke-neutral-850 transition-colors"
                            />
                            
                            {/* Visual Highlight column trigger bars */}
                            <rect
                              x={`calc(${xPercent}% - 14px)`}
                              y={normalizedY}
                              width="28"
                              height={200 - normalizedY}
                              fill={chartMetric === 'revenue' ? '#fbbf24' : '#ffffff'}
                              className="opacity-[0.03] hover:opacity-100 group-hover:opacity-[0.15] transition-opacity"
                            />

                            {/* Node points */}
                            <circle 
                              cx={`${xPercent}%`} 
                              cy={normalizedY} 
                              r="7" 
                              fill={chartMetric === 'revenue' ? '#fbbf24' : '#ffffff'} 
                              className="stroke-neutral-900 stroke-2 group-hover:scale-125 transition-transform"
                            />

                            {/* Dynamic Text value tags */}
                            <text
                              x={`${xPercent}%`}
                              y={normalizedY - 14}
                              textAnchor="middle"
                              className="text-[10px] font-black font-semi font-mono fill-white tracking-tighter"
                            >
                              {chartMetric === 'revenue' ? `GHC ${t.amount}` : `${t.transactions} tx`}
                            </text>

                            {/* Horizontal timeline labels */}
                            <text
                              x={`${xPercent}%`}
                              y="218"
                              textAnchor="middle"
                              className="text-[9px] font-black font-mono fill-neutral-500 uppercase tracking-widest"
                            >
                              {t.formattedDate}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  ) : (
                    <div className="h-full flex items-center justify-center text-neutral-600 text-xs font-bold uppercase tracking-widest">
                      Ledger data is empty.
                    </div>
                  )}
                </div>
              </div>

              {/* Category Collections split bento card */}
              <div className="bg-neutral-900 border-4 border-neutral-800 p-8 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-xl font-black uppercase italic text-white tracking-tight">Balanced Cohort Ratios</h3>
                  <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1 font-bold">Aggregate payment shares</p>
                </div>

                <div className="space-y-4 py-2">
                  {(['Pre-school', 'Primary', 'JHS'] as SchoolCategory[]).map(cat => {
                    const amount = stats.byCategory[cat] || 0;
                    const percent = stats.totalCollected > 0 ? (amount / stats.totalCollected) * 100 : 0;

                    return (
                      <div key={cat} className="space-y-2 bg-neutral-950 border-2 border-neutral-850 p-4">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 ${cat === 'Pre-school' ? 'bg-amber-400' : cat === 'Primary' ? 'bg-white' : 'bg-neutral-500'}`} /> {cat}
                          </span>
                          <span className="font-mono text-amber-400 font-extrabold text-[12px]">GHC {amount.toFixed(2)}</span>
                        </div>
                        
                        <div className="w-full bg-neutral-900 h-2 border border-neutral-850">
                          <div 
                            className={`h-full ${cat === 'Pre-school' ? 'bg-amber-400' : cat === 'Primary' ? 'bg-white' : 'bg-neutral-500'} transition-all duration-500`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-neutral-500 font-mono uppercase mt-1">
                          <span>Verified weight quota</span>
                          <span className="font-black text-neutral-400">{percent.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-neutral-950 p-4 border border-neutral-850 text-center">
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest font-mono">
                    Total: GHC {stats.totalCollected.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Checkpoints preview and alert priorities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Class Performance Tracker table overview */}
              <div className="bg-neutral-900 border-4 border-neutral-800 p-8 col-span-1 lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center pb-2 border-b-2 border-neutral-850">
                  <div>
                    <h3 className="text-xl font-black uppercase italic text-white tracking-tight">Teacher Performance Dockets</h3>
                    <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1">Active class checking rates</p>
                  </div>
                  <button 
                    onClick={() => setActiveLayout('class-perf')}
                    className="text-[9px] font-black font-mono uppercase tracking-wider text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    Manage Classrooms <ArrowRightLeft size={10} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b-2 border-neutral-800 text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono">
                        <th className="py-2.5">Class level</th>
                        <th className="py-2.5">Staff In-Charge</th>
                        <th className="py-2.5">Cleared Pupils</th>
                        <th className="py-2.5 text-right">Sum (GHC)</th>
                        <th className="py-2.5 text-right">Coverage Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-850">
                      {teacherMetrics.slice(0, 5).map((met) => (
                        <tr key={met.className} className="hover:bg-neutral-950/20">
                          <td className="py-3.5 font-black font-mono text-white text-sm">{met.className}</td>
                          <td className="py-3.5 font-sans font-black text-neutral-300 uppercase tracking-wide text-xs">{met.teacherName}</td>
                          <td className="py-3.5 font-mono text-neutral-400 font-bold">
                            {met.paidCount} / {met.studentsCount}
                          </td>
                          <td className="py-3.5 text-right font-black font-mono text-white">
                            {met.collected.toFixed(2)}
                          </td>
                          <td className="py-3.5 text-right">
                            <span className={`inline-block px-2.5 py-1 text-[10px] font-black font-mono tracking-widest uppercase ${
                              met.rate > 85 ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' :
                              met.rate > 50 ? 'bg-amber-950 border border-amber-800 text-amber-450' : 'bg-red-950 border border-red-800 text-red-450'
                            }`}>
                              {met.rate.toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alert Center preview list */}
              <div className="bg-neutral-900 border-4 border-neutral-800 p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-1 pb-2 border-b-2 border-neutral-850">
                  <h3 className="text-xl font-black uppercase italic text-white tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-500 shrink-0" /> Critical Warnings
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest font-bold">Pupils lacking daily clear keys</p>
                </div>

                {pendingAlerts.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 space-y-2 flex-1 flex flex-col justify-center items-center">
                    <Check className="text-amber-400" size={28} />
                    <p className="text-sm font-black uppercase tracking-wider text-white">No active errors</p>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">100% daily compliance</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[290px] overflow-y-auto flex-1 py-1 pr-1">
                    {pendingAlerts.slice(0, 4).map((st) => (
                      <div key={st.studentId} className="flex justify-between items-center bg-neutral-950 border-2 border-neutral-855 p-3.5">
                        <div className="space-y-1 overflow-hidden">
                          <p className="text-xs font-black text-white uppercase tracking-tight truncate max-w-[140px]">{st.studentName}</p>
                          <div className="flex gap-2 items-center text-[9px] text-neutral-500 font-mono font-black uppercase tracking-wide">
                            <span className="text-amber-400">{st.class}</span>
                            <span>•</span>
                            <span className="truncate">GDN: {st.guardianPhone}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDialGuardian(st.studentId, st.guardianPhone)}
                          disabled={notifiedStudents[st.studentId]}
                          className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border-2 transition-all cursor-pointer ${
                            notifiedStudents[st.studentId] 
                              ? 'bg-amber-400 border-amber-400 text-black' 
                              : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600 text-neutral-300 animate-pulse'
                          }`}
                        >
                          {notifiedStudents[st.studentId] ? 'DIALING...' : 'DIAL GDN'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setActiveLayout('alerts-desk')}
                  className="w-full text-center bg-neutral-950 border-2 border-neutral-800 text-stone-300 hover:text-white hover:border-neutral-600 text-[10px] py-2.5 uppercase font-black tracking-widest"
                >
                  View All Alerts Desk
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Perspective Tab 2: Full classroom list performance tracker with customizable search */}
        {activeLayout === 'class-perf' && (
          <motion.div
            key="class-perf-layout"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-neutral-900 border-4 border-neutral-800 p-8 space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-neutral-800">
              <div>
                <h3 className="text-2xl font-black uppercase italic text-white tracking-tight">Active Classroom Gates Tracker</h3>
                <p className="text-xs text-neutral-400 font-bold mt-1">Search or analyze response rates across schools</p>
              </div>

              {/* Incremental search search input bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3.5 text-neutral-500" size={14} />
                <input
                  type="text"
                  placeholder="Query class level or staff name..."
                  value={classPerfSearch}
                  onChange={(e) => setClassPerfSearch(e.target.value)}
                  className="w-full bg-neutral-950 border-2 border-neutral-800 py-3 pl-10 pr-4 text-xs font-mono outline-none text-white focus:border-amber-400 placeholder:text-neutral-700 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTeacherMetrics.length === 0 ? (
                <div className="col-span-full py-16 text-center text-neutral-600 font-black uppercase tracking-widest text-xs">
                  No classroom records match query.
                </div>
              ) : (
                filteredTeacherMetrics.map((met) => {
                  const rateColor = met.rate > 85 
                    ? 'text-emerald-400 border-emerald-950 bg-emerald-950/25' 
                    : met.rate > 50 
                      ? 'text-amber-400 border-amber-950 bg-amber-950/25' 
                      : 'text-red-500 border-red-950 bg-red-950/25';
                  
                  return (
                    <div key={met.className} className="bg-neutral-950 border-2 border-neutral-850 p-6 flex flex-col justify-between gap-5 hover:border-neutral-700 transition">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-neutral-900 border border-neutral-800 px-2 py-0.5 font-mono">
                            {met.category} LEVEL
                          </span>
                          <h4 className="text-2xl font-black text-white font-mono leading-none pt-2">{met.className} Checkpoint</h4>
                        </div>
                        <span className={`text-lg font-black font-mono border px-3 py-1.5 ${rateColor}`}>
                          {met.rate.toFixed(0)}%
                        </span>
                      </div>

                      <div className="space-y-3.5 py-1 border-t border-b border-neutral-850">
                        <div className="flex justify-between text-xs font-bold font-mono">
                          <span className="text-neutral-500 uppercase tracking-wider">Gate Teacher:</span>
                          <span className="text-white uppercase tracking-wide">{met.teacherName}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold font-mono">
                          <span className="text-neutral-500 uppercase tracking-wider">Payments Cleared:</span>
                          <span className="text-white">{met.paidCount} pupils of {met.studentsCount}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold font-mono">
                          <span className="text-neutral-500 uppercase tracking-wider">Total Fund sum:</span>
                          <span className="text-white font-black">GHC {met.collected.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-neutral-500 font-mono uppercase tracking-wider">
                          <span>Progress Gauge</span>
                          <span>{met.rate.toFixed(1)}% Completed</span>
                        </div>
                        <div className="w-full bg-neutral-900 h-2 border border-neutral-850">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              met.rate > 85 ? 'bg-emerald-400' : met.rate > 50 ? 'bg-amber-400' : 'bg-red-500'
                            }`}
                            style={{ width: `${met.rate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* Perspective Tab 3: Detailed Alerts desk for high-priority uncollected payments */}
        {activeLayout === 'alerts-desk' && (
          <motion.div
            key="alerts-desk-layout"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-neutral-900 border-4 border-neutral-800 p-8 space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-neutral-800">
              <div>
                <h3 className="text-2xl font-black uppercase italic text-white tracking-tight flex items-center gap-3">
                  <span className="w-3 h-3 bg-red-500 animate-ping" /> Guardian Alerts Dispatcher Console
                </h3>
                <p className="text-xs text-neutral-400 font-bold mt-1">Manage, notify, or dial parents of unverified pupil entries</p>
              </div>

              {/* Incremental alert list search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3.5 text-neutral-500" size={14} />
                <input
                  type="text"
                  placeholder="Query pupil name or grade level..."
                  value={alertSearch}
                  onChange={(e) => setAlertSearch(e.target.value)}
                  className="w-full bg-neutral-950 border-2 border-neutral-800 py-3 pl-10 pr-4 text-xs font-mono outline-none text-white focus:border-amber-400 placeholder:text-neutral-700 font-bold"
                />
              </div>
            </div>

            {filteredAlerts.length === 0 ? (
              <div className="py-20 text-center bg-neutral-950 border-2 border-neutral-850 space-y-3">
                <Check className="mx-auto text-amber-400" size={36} />
                <h4 className="text-lg font-black uppercase tracking-wider text-white">Workspace Cleared</h4>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">No unverified pupils lack ledger keys today.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlerts.map((st) => (
                  <div key={st.studentId} className="bg-neutral-950 border-2 border-neutral-850 p-6 flex flex-col justify-between gap-5 hover:border-neutral-700 transition">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black bg-red-950 border border-red-800 text-red-400 px-2 py-0.5 uppercase tracking-widest font-mono">
                          {st.class} Checkpoint
                        </span>
                        <h4 className="text-lg font-black text-white uppercase tracking-tight leading-none pt-2">{st.studentName}</h4>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase font-mono">#{st.studentId.substring(4, 9)}</span>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-850 p-3.5 space-y-2 text-xs font-mono">
                      <div className="flex justify-between font-bold">
                        <span className="text-neutral-500 uppercase">Primary Category:</span>
                        <span className="text-white uppercase font-bold">{st.category}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="text-neutral-500 uppercase">Registered Contact:</span>
                        <span className="text-amber-400 select-all font-mono font-black">{st.guardianPhone}</span>
                      </div>
                      <div className="flex justify-between font-bold text-red-405">
                        <span className="text-red-500 uppercase">Alert reason:</span>
                        <span className="text-red-450 uppercase font-bold">Unpaid daily lock (GHC 5.00)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDialGuardian(st.studentId, st.guardianPhone)}
                      disabled={notifiedStudents[st.studentId]}
                      className={`w-full text-center text-xs font-black uppercase tracking-widest py-3.5 border-2 transition-all cursor-pointer ${
                        notifiedStudents[st.studentId]
                          ? 'bg-amber-400 border-amber-400 text-black font-black'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/50 text-white'
                      }`}
                    >
                      {notifiedStudents[st.studentId] ? (
                        <span className="flex items-center justify-center gap-1.5">
                          Dialing secure link... Dial OK
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5">
                          <PhoneCall size={12} /> Contact Parent Guardian
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
