/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginMFA } from './components/LoginMFA';
import { ClassRegister } from './components/ClassRegister';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { ReportPanel } from './components/ReportPanel';
import { SchoolLogo } from './components/SchoolLogo';
import { 
  Fingerprint, 
  LayoutDashboard, 
  FolderEdit, 
  Receipt, 
  LogOut, 
  Settings, 
  Menu, 
  X, 
  ShieldCheck, 
  GraduationCap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function NavigationWrapper() {
  const { currentUser, logout, currentDate, resetData } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'admin' | 'reports'>('register');

  // If nobody is logged in, show login page
  if (!currentUser) {
    return <LoginPage />;
  }

  // Define tab security accessibility by role
  const canAccessTab = (tab: string) => {
    const role = currentUser.role;
    if (role === 'Administrator') return true;
    if (role === 'Accountant') {
      return ['dashboard', 'register', 'reports'].includes(tab);
    }
    if (role === 'Teacher') {
      return ['register'].includes(tab);
    }
    return false;
  };

  // Adjust default tab based on security access on load
  const tabs = [
    { id: 'register', label: 'Check-In GHC 5', icon: Receipt },
    { id: 'dashboard', label: 'Cash Flow Trends & Stats', icon: LayoutDashboard },
    { id: 'reports', label: 'Audits & Exports', icon: FolderEdit },
    { id: 'admin', label: 'Pupil Enrollment Core', icon: Settings },
  ];

  const visibleTabs = tabs.filter(t => canAccessTab(t.id));

  // Determine standard page contents
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'register':
        return <ClassRegister />;
      case 'admin':
        return <AdminPanel />;
      case 'reports':
        return <ReportPanel />;
      default:
        return <ClassRegister />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Dynamic Top Workspace Ribbon */}
      <header className="bg-neutral-900 shrink-0 border-b-4 border-neutral-800">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SchoolLogo size={44} className="border-2 border-neutral-850" />
            <div className="bg-amber-400 text-black font-black p-1 text-xl px-3 leading-none tracking-tighter">
              FEETRACK
            </div>
            <span className="hidden sm:inline text-neutral-500 font-bold uppercase text-[10px] tracking-widest pt-0.5">
              SAAKO HOLY CHILD ACADEMY Daily Portal
            </span>
          </div>

          {/* Desktop Right items */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                System Secure
              </span>
            </div>

            <div className="h-8 w-[1px] bg-neutral-800" />

            <div className="text-right">
              <p className="text-xs font-black uppercase tracking-tight text-white">{currentUser.name}</p>
              <span className="text-[9px] text-amber-400 uppercase font-black tracking-widest block">
                {currentUser.role} Session Active
              </span>
            </div>

            <div className="h-8 w-[1px] bg-neutral-800" />

            <div className="flex gap-2">
              <button 
                onClick={logout}
                className="bg-neutral-800 hover:bg-amber-400 hover:text-black text-neutral-400 p-2 border border-neutral-700 hover:border-amber-400 transition-colors"
                title="Log out securely"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Mobile responsive toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/85 hover:text-white hover:bg-white/5 border border-neutral-800 transition-all"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Main workspace layout */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="hidden md:flex w-64 bg-neutral-900 border-r-4 border-neutral-800 p-6 flex-col justify-between shrink-0">
          <div className="space-y-8">
            <div>
              <h3 className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-4">
                Main Menu
              </h3>
              <nav className="space-y-2">
                {visibleTabs.map(tab => {
                  const active = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full text-left font-black text-lg tracking-tight transition-all block py-1 select-none border-l-4 ${
                        active
                          ? 'text-amber-400 border-amber-400 pl-3'
                          : 'text-neutral-500 hover:text-white border-transparent pl-3'
                      }`}
                    >
                      <span className="uppercase">{tab.id === 'register' ? 'Daily Check-In' : tab.id === 'dashboard' ? 'Cash Flow Feed' : tab.id === 'reports' ? 'Audits & Exports' : 'Pupil Enrollment'}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="bg-neutral-800/60 p-4 border-l-4 border-amber-400 space-y-3">
              <p className="text-[11px] font-black text-neutral-300 leading-tight uppercase tracking-wide">
                Daily Fee Baseline
              </p>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-bold">
                Every pupil must register exactly <strong className="text-white font-mono font-black border-b border-light/10">GHC 5.00</strong> daily on entry.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-neutral-800/80">
            <button
              onClick={() => {
                if (confirm('Rebuild system to factory seeds? Immediate purge of current cache.')) {
                  resetData();
                  window.location.reload();
                }
              }}
              className="w-full bg-white hover:bg-amber-400 text-black font-black text-[10px] py-2 uppercase tracking-widest transition-colors cursor-pointer"
            >
              Reset App Ledger
            </button>
          </div>
        </aside>

        {/* Mobile menu panel sliding display */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden w-full bg-neutral-900 border-b-4 border-neutral-800 px-6 py-5 space-y-4 text-white shrink-0 z-20 absolute top-0 left-0 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
                <div>
                  <p className="text-xs font-black uppercase text-white">{currentUser.name}</p>
                  <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">{currentUser.role} Session</p>
                </div>
                <button 
                  onClick={logout}
                  className="bg-neutral-850 hover:bg-amber-400 hover:text-black border border-neutral-700 text-white px-3 py-1.5 font-black text-xs transition-all uppercase tracking-widest"
                >
                  Log Out
                </button>
              </div>

              <nav className="space-y-3 py-2">
                {visibleTabs.map(tab => {
                  const active = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left font-black text-base tracking-tight transition-all block py-1.5 border-l-4 ${
                        active
                          ? 'text-amber-400 border-amber-400 pl-3'
                          : 'text-neutral-500 hover:text-neutral-200 border-transparent pl-3'
                      }`}
                    >
                      <span>{tab.id === 'register' ? 'DAILY CHECK-IN' : tab.id === 'dashboard' ? 'CASH FLOW FEED' : tab.id === 'reports' ? 'AUDITS & EXPORTS' : 'PUPIL ENROLLMENT'}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-2 border-t border-neutral-800">
                <button
                  onClick={() => {
                    if (confirm('Rebuild system to factory seeds? Immediate purge of current cache.')) {
                      resetData();
                      window.location.reload();
                    }
                  }}
                  className="w-full text-center text-[10px] bg-neutral-800 border border-neutral-700 hover:bg-amber-400 hover:text-black hover:border-amber-400 py-2.5 font-black tracking-widest uppercase"
                >
                  Reset Ledger Data
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic content sandbox workspace */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>

      {/* FOOTER ACTION BAR */}
      <footer className="h-12 bg-neutral-950 border-t-2 border-neutral-800/80 flex items-center px-8 justify-between text-[10px] text-neutral-500 font-bold shrink-0">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-400"></span>
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">MFA Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-neutral-600"></span>
            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Ver 2.6.0-Pro</span>
          </div>
        </div>
        <div className="text-[9px] font-black text-neutral-600 uppercase tracking-wider hidden sm:block">
          &copy; {new Date().getFullYear()} SAAKO HOLY CHILD ACADEMY • Ghana Education Ledger Authority
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationWrapper />
    </AppProvider>
  );
}
