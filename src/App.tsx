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
import { db } from './lib/firebase';
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
  const { 
    currentUser, 
    logout, 
    currentDate, 
    resetData, 
    firebaseConnected,
    storageMode,
    setStorageMode,
    seedFirebaseFromLocal
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'admin' | 'reports'>('register');
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncErrorMessage, setSyncErrorMessage] = useState('');

  // If nobody is logged in, show login page
  if (!currentUser || !currentUser.role) {
    return <LoginMFA />;
  }

  // Define tab security accessibility by role
  const canAccessTab = (tab: string) => {
    const role = currentUser.role;
    if (role === 'Administrator' || role === 'Headmaster') return true;
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
              {firebaseConnected ? (
                <>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-990/80 bg-emerald-950/40 px-2 py-0.5" title="Firebase Firestore Connected">
                    Firebase Live
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-amber-400"></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 border border-amber-990/80 bg-amber-950/40 px-2 py-0.5" title="Offline mode using local browser storage">
                    Local Ledger
                  </span>
                </>
              )}
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

      {/* Sync Link Warning banner */}
      {db.isActive() && storageMode === 'local' && (
        <div className="bg-amber-500 text-black px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold border-b-4 border-amber-600 animate-fade-in shrink-0 transition-all duration-350">
          {!showSyncConfirm ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm">⚠️</span>
                <span className="leading-relaxed">
                  <strong>Offline Mode Detected:</strong> Any pupil registers or check-ins (such as class <strong>B5</strong> pupil registers) logged on this device are saved only inside this browser. Enable Cloud Sync to synchronize your phone and laptop!
                </span>
              </div>
              <button
                onClick={() => {
                  setShowSyncConfirm(true);
                  setSyncStatus('idle');
                }}
                className="shrink-0 bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 text-amber-400 hover:text-amber-300 font-mono tracking-wider uppercase text-[10px] font-black px-4 py-2.5 shadow transition-all cursor-pointer"
              >
                Switch & Sync Cloud
              </button>
            </>
          ) : (
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
              {syncStatus === 'idle' && (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-sm flex-shrink-0">❓</span>
                    <span className="leading-relaxed">
                      <strong>Are you sure you want to switch to Cloud and Synchronize?</strong> This will bundle your local pupil records & payments and merge them with live Firestore so your phone & laptop match.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={async () => {
                        try {
                          setSyncStatus('syncing');
                          const response = await seedFirebaseFromLocal();
                          if (response.success) {
                            setSyncStatus('success');
                            // Delay actual cloud switch of view slightly so user sees the nice green success state
                            setTimeout(() => {
                              setStorageMode('cloud');
                              setShowSyncConfirm(false);
                              setSyncStatus('idle');
                            }, 2000);
                          } else {
                            setSyncStatus('error');
                            setSyncErrorMessage(response.message);
                          }
                        } catch (err) {
                          setSyncStatus('error');
                          setSyncErrorMessage(err instanceof Error ? err.message : String(err));
                        }
                      }}
                      className="bg-neutral-950 hover:bg-neutral-900 text-emerald-400 font-mono tracking-wider uppercase text-[10px] font-black px-3.5 py-2 cursor-pointer shadow border border-neutral-900"
                    >
                      ✓ Yes, Merge & Sync
                    </button>
                    <button
                      onClick={() => setShowSyncConfirm(false)}
                      className="bg-transparent hover:bg-black/10 text-neutral-900 hover:text-black font-mono tracking-wider uppercase text-[10px] font-black px-3 py-2 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {syncStatus === 'syncing' && (
                <div className="flex items-center gap-3 py-1">
                  <span className="animate-spin text-sm flex-shrink-0 pb-0.5">⌛</span>
                  <span>Synchronizing internal ledger records with live Firestore Cloud database... Please stay on this page.</span>
                </div>
              )}

              {syncStatus === 'success' && (
                <div className="flex items-center gap-3 py-1 text-neutral-950">
                  <span className="text-sm flex-shrink-0">🎉</span>
                  <span className="font-extrabold uppercase tracking-wide">Handshake successfully verified! Switch completes instantly...</span>
                </div>
              )}

              {syncStatus === 'error' && (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-sm flex-shrink-0">❌</span>
                    <span className="leading-relaxed">
                      <strong>Handshake Failed:</strong> {syncErrorMessage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSyncStatus('idle');
                      }}
                      className="bg-neutral-950 hover:bg-neutral-900 text-amber-500 font-mono tracking-wider uppercase text-[10px] font-black px-3.5 py-2 cursor-pointer"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        setShowSyncConfirm(false);
                        setSyncStatus('idle');
                      }}
                      className="bg-transparent text-neutral-900 font-mono tracking-wider uppercase text-[10px] px-2 py-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

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
                      <span className="uppercase">{tab.id === 'register' ? 'Daily Check-In' : tab.id === 'dashboard' ? 'Cash Flow Feed' : tab.id === 'reports' ? 'Audits & Exports' : 'Staff & Pupils'}</span>
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
                      <span>{tab.id === 'register' ? 'DAILY CHECK-IN' : tab.id === 'dashboard' ? 'CASH FLOW FEED' : tab.id === 'reports' ? 'AUDITS & EXPORTS' : 'STAFF & PUPIL REGISTRY'}</span>
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
