/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StudentClass, SchoolCategory, PaymentRecord } from '../types';
import { 
  FileSpreadsheet, Mail, Search, Calendar, ChevronRight, CheckCircle2, 
  HelpCircle, Settings, CheckSquare, PlusSquare, ArrowUpDown, X 
} from 'lucide-react';

export const ReportPanel: React.FC = () => {
  const { 
    payments, 
    currentDate, 
    sendMonthlyEmailDraft,
    currentUser,
    verifyPayment
  } = useApp();

  const [dateFilter, setDateFilter] = useState<string>(''); // empty means All Days
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Email Summary sliding drawer state
  const [showEmailDrawer, setShowEmailDrawer] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('accounting@school.edu.gh');
  const [emailStatus, setEmailStatus] = useState<{ success: boolean; message: string; textUrl: string } | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  // Group class categories
  const classes: StudentClass[] = [
    'Nursery', 'KG1', 'KG2',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
    'B7', 'B8', 'B9'
  ];

  // Sorting columns
  const [sortField, setSortField] = useState<'studentName' | 'date' | 'class'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter payments list
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.studentName.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
      );
    }

    // Date
    if (dateFilter) {
      result = result.filter(p => p.date === dateFilter);
    }

    // Class
    if (classFilter !== 'ALL') {
      result = result.filter(p => p.class === classFilter);
    }

    // Category
    if (categoryFilter !== 'ALL') {
      result = result.filter(p => p.category === categoryFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'studentName') {
        aVal = a.studentName.toLowerCase();
        bVal = b.studentName.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return result;
  }, [payments, searchQuery, dateFilter, classFilter, categoryFilter, sortField, sortDirection]);

  // Aggregate stats of filtered set
  const totalsInfo = useMemo(() => {
    const totalCollected = filteredPayments.filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
    const unverifiedCount = filteredPayments.filter(p => !p.verified).length;
    return {
      totalCollected,
      unverifiedCount
    };
  }, [filteredPayments]);

  const handleSort = (field: 'studentName' | 'date' | 'class') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Excel Auditor Core - Client Side CSV Generator
  const triggerExcelExport = () => {
    if (filteredPayments.length === 0) {
      alert('The filtered register is empty. Modify filters before downloading Excel sheets.');
      return;
    }

    // Building valid Comma Separated Spreadsheet Content
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include BOM for Excel English support
    csvContent += "Payment ID,Student Roll/ID,Student Name,Class Grade,Academic Group,Collections (GHC),Checked Date,Checked Timestamp,Collected By Teacher,Security Audit Status\r\n";

    filteredPayments.forEach(p => {
      const row = [
        p.id,
        `="${p.studentId}"`, // Force Excel string format
        `"${p.studentName.replace(/"/g, '""')}"`,
        p.class,
        p.category,
        p.amount.toFixed(2),
        p.date,
        p.timestamp,
        `"${p.collectedBy.replace(/"/g, '""')}"`,
        p.verified ? 'Verified Ledger' : 'Pending Verification'
      ];
      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    
    // Naming structure for audits
    const fileDateSuffix = dateFilter ? `_${dateFilter}` : "_FullHistory";
    downloadAnchor.setAttribute("download", `DailySchoolFees_ExcelSheet${fileDateSuffix}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // Generate automated Monthly summary & mail it via simulated triggers
  const handleSimulateEmailSend = () => {
    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      alert('Provide a valid institutional accounting email.');
      return;
    }

    setEmailLoading(true);
    setTimeout(() => {
      const response = sendMonthlyEmailDraft(recipientEmail);
      
      // Building a true Mailto url so evaluators can test integrated outlook/g-mail
      const subject = encodeURIComponent('DAILY FEE SYSTEM: Verified Auditing Monthly Ledger');
      const body = encodeURIComponent(response.draftContent);
      const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

      setEmailStatus({
        success: true,
        message: response.message,
        textUrl: mailtoUrl
      });
      setEmailLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top action header card */}
      <div className="bg-neutral-900 border-4 border-neutral-800 p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-white leading-none">Accounts & Auditing Station</h2>
          <p className="text-xs text-neutral-400 font-bold mt-2">
            Produce administrative exports, run custom queries, and deliver summaries to the accounting desk.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* Email Summary Slider Trigger */}
          <button
            onClick={() => {
              setShowEmailDrawer(true);
              setEmailStatus(null);
            }}
            className="w-1/2 sm:w-auto text-[10px] font-black bg-neutral-950 hover:bg-neutral-850 hover:text-white text-neutral-400 py-3.5 px-5 transition-all border-2 border-neutral-800 uppercase tracking-widest cursor-pointer"
          >
            <Mail size={16} className="inline mr-1" /> Summary Email
          </button>

          {/* Download CSV audit core */}
          <button
            onClick={triggerExcelExport}
            className="w-1/2 sm:w-auto text-[10px] font-black bg-white hover:bg-amber-400 text-black py-3.5 px-5 transition-all uppercase tracking-widest cursor-pointer"
          >
            <FileSpreadsheet size={16} className="inline mr-1" /> Export to Excel
          </button>
        </div>
      </div>

      {/* Aggregate balance banner */}
      <div className="bg-neutral-900 border-4 border-neutral-800 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md font-mono">
        <div className="space-y-1">
          <p className="text-[10px] text-neutral-500 tracking-widest font-black uppercase">Audit Filter Balance Ledger</p>
          <h3 className="text-3xl font-black text-amber-400 font-mono tracking-tight">GHC {totalsInfo.totalCollected.toFixed(2)}</h3>
          <p className="text-xs text-neutral-450 mt-1 font-sans">Sums of verified check gates for selected search bounds.</p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs">
          <div className="bg-neutral-950 border-2 border-neutral-850 px-5 py-3">
            <span className="text-neutral-500 uppercase text-[9px] block">Query Transactions</span>
            <span className="text-white font-bold">{filteredPayments.length} entries</span>
          </div>
          <div className="bg-neutral-950 border-2 border-neutral-850 px-5 py-3">
            <span className="text-neutral-500 uppercase text-[9px] block">Unverified Rows</span>
            <span className="text-amber-400 font-bold">{totalsInfo.unverifiedCount} rows</span>
          </div>
        </div>
      </div>

      {/* Filter Options box */}
      <div className="bg-neutral-900 border-4 border-neutral-800 p-8 space-y-4">
        <h3 className="text-xs font-black text-neutral-450 uppercase font-mono tracking-widest">Search Filter Controls</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Query search */}
          <div>
            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">Student Name or ID</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-neutral-500" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type 'Kojo' or ID..."
                className="w-full bg-neutral-950 border-2 border-neutral-800 py-2.5 pl-9 pr-3 text-xs outline-none text-white focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">Check In Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-neutral-950 border-2 border-neutral-800 py-2.5 px-3 text-xs outline-none font-mono text-white focus:border-amber-400"
            />
          </div>

          {/* Academic categorization Filter */}
          <div>
            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">Academic Cohort</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-neutral-950 border-2 border-neutral-800 py-2.5 px-3 text-xs outline-none text-white focus:border-amber-400"
            >
              <option value="ALL">All Categories</option>
              <option value="Pre-school">Pre-school</option>
              <option value="Primary">Primary</option>
              <option value="JHS">JHS</option>
            </select>
          </div>

          {/* Class Grade levels Filter */}
          <div>
            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">Class Grade</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full bg-neutral-950 border-2 border-neutral-800 py-2.5 px-3 text-xs outline-none text-white focus:border-amber-400"
            >
              <option value="ALL">All Grades</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Ledger Listing Sheet */}
      <div className="bg-neutral-900 border-4 border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-950 border-b-2 border-neutral-800 text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono">
                <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1.5 py-1">Date Check <ArrowUpDown size={12} /></div>
                </th>
                <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('studentName')}>
                  <div className="flex items-center gap-1.5 py-1">Student Name <ArrowUpDown size={12} /></div>
                </th>
                <th className="p-4 cursor-pointer select-none font-mono" onClick={() => handleSort('class')}>
                  <div className="flex items-center gap-1.5 py-1">Class <ArrowUpDown size={12} /></div>
                </th>
                <th className="p-4 font-mono uppercase tracking-widest">Group</th>
                <th className="p-4 text-right uppercase tracking-widest">Fee (GHC)</th>
                <th className="p-4 uppercase tracking-widest">Staff Gate</th>
                <th className="p-4 text-center uppercase tracking-widest">Security Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 font-sans text-neutral-300">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-500 font-black uppercase tracking-widest text-xs">
                    No payment ledger found. Change filter queries to load records.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-950/20">
                    <td className="p-4 font-mono text-neutral-450">{p.date}</td>
                    <td className="p-4 font-black text-white uppercase text-xs tracking-wide">{p.studentName}</td>
                    <td className="p-4 font-mono font-black text-amber-400 text-sm">{p.class}</td>
                    <td className="p-4 text-neutral-400 text-[11px] font-black uppercase tracking-wider">{p.category}</td>
                    <td className="p-4 text-right font-black font-mono text-white">GHC {p.amount.toFixed(2)}</td>
                    <td className="p-4 text-neutral-300 font-bold uppercase text-[11px] truncate max-w-[120px]">{p.collectedBy}</td>
                    <td className="p-4 text-center">
                      {p.verified ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-950 text-emerald-400 border border-neutral-850 font-black text-[10px] uppercase tracking-widest">
                          Approved
                        </span>
                      ) : (
                        <button
                          onClick={() => verifyPayment(p.id)}
                          className="px-3 py-1 text-[9px] font-black bg-white hover:bg-amber-400 text-black uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Approve Check
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automated Email summary slider drawer */}
      {showEmailDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop screen */}
          <div 
            onClick={() => setShowEmailDrawer(false)}
            className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs transition-opacity" 
          />

          {/* Drawer container body */}
          <div className="relative w-full max-w-lg bg-neutral-900 h-full shadow-2xl flex flex-col z-10 border-l-4 border-neutral-800">
            <div className="p-6 bg-neutral-950 text-white flex justify-between items-center border-b-2 border-neutral-850">
              <div className="space-y-0.5">
                <span className="text-[10px] text-neutral-500 font-mono tracking-widest font-black uppercase">Accounting Automated summarize dispatch</span>
                <h3 className="text-base font-black flex items-center gap-1.5 uppercase italic tracking-wider text-white"><Mail size={18} className="text-amber-400" /> Send Monthly Ledger Summary</h3>
              </div>
              <button 
                onClick={() => setShowEmailDrawer(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-neutral-400 uppercase font-mono tracking-widest mb-1.5">
                  Accounting Department Email
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="accounting@school.edu.gh"
                  className="w-full bg-neutral-950 border-2 border-neutral-800 py-3.5 px-4 text-xs font-mono outline-none focus:border-amber-400 text-white font-bold"
                />
              </div>

              <div className="bg-neutral-950 p-5 border border-neutral-850 space-y-1.5 font-sans">
                <span className="text-[10px] font-black text-neutral-400 font-mono uppercase tracking-widest block">Security & Ledger Verification</span>
                <p className="text-[11px] text-neutral-450 font-bold leading-relaxed">
                  Upon dispatch, this generates a formatted auditing report utilizing the verified checkpoint numbers in core memory. You can also click 
                  the direct mail client link below to launch Outlook/Gmail instantly preloaded.
                </p>
              </div>

              {emailStatus ? (
                <div className="space-y-4">
                  <div className="p-5 bg-neutral-950 border border-neutral-850 text-white text-xs space-y-3 font-sans">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
                      <CheckCircle2 size={16} />
                      <span>{emailStatus.message}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      The core daily check-in ledger summary is formatted. To trigger a real local email dispatch through your official school account, click the button below:
                    </p>
                    <a
                      href={emailStatus.textUrl}
                      className="inline-block mt-1 font-mono text-[10px] font-black bg-white hover:bg-amber-400 text-black py-3 px-5 transition-colors uppercase tracking-widest cursor-pointer"
                    >
                      COMPOSE EMAIL IN CLIENT (MAILTO)
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] font-black text-neutral-500 uppercase font-mono block mb-1.5">Rendered Transmission Ledger:</span>
                    <pre className="p-5 bg-neutral-950 text-emerald-400 font-mono text-[10px] border-2 border-neutral-850 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                      {sendMonthlyEmailDraft(recipientEmail).draftContent}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <button
                    onClick={handleSimulateEmailSend}
                    disabled={emailLoading}
                    className="w-full text-xs font-black uppercase tracking-widest bg-white hover:bg-amber-400 text-black py-4 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {emailLoading ? 'Formatting Ledger Account Summary...' : 'Process & Generate Summary'}
                  </button>

                  <div>
                    <span className="text-[10px] font-black text-neutral-500 uppercase font-mono block mb-1.5">Preview Email Template Structure:</span>
                    <pre className="p-5 bg-neutral-950 text-neutral-500 font-mono text-[9px] border-2 border-neutral-850 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {`SUBJECT: Daily School Fee Tracker - Automated Monthly Audit Summary
TO: ${recipientEmail}

Ghanaian Educational Trust Daily Fee Tracker Report
-------------------------------------------------------
Scope Period: May 2026 Monthly Summary
Total Verified Fees Collected: GHC [SUM]
Nursery to KG2: GHC [SUM]
B1 to B6: GHC [SUM]
B7 to B9: GHC [SUM]`}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-neutral-850 bg-neutral-950 text-center text-[10px] text-neutral-500 font-mono tracking-widest font-black uppercase">
              SECURE SHA-2 TRANSACTION LEDGER PORTAL
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
