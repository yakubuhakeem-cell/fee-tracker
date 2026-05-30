/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp, PendingAlert } from '../context/AppContext';
import { StudentClass, Student, SchoolCategory } from '../types';
import { Check, X, Search, Landmark, BellRing, ChevronRight, CheckSquare, Users, MessageSquareCode } from 'lucide-react';
import { motion } from 'motion/react';

export const ClassRegister: React.FC = () => {
  const {
    students,
    payments,
    currentDate,
    recordPayment,
    bulkRecordPayments,
    currentUser,
    deletePayment
  } = useApp();

  // Pick initial class based on teacher assignment or default B1
  const initialClass = useMemo(() => {
    if (currentUser?.role === 'Teacher' && currentUser.assignedClass) {
      return currentUser.assignedClass;
    }
    return 'B1' as StudentClass;
  }, [currentUser]);

  const [selectedClass, setSelectedClass] = useState<StudentClass>(initialClass);
  const [searchQuery, setSearchQuery] = useState('');
  const [guardianSmsStudent, setGuardianSmsStudent] = useState<Student | null>(null);
  const [successSms, setSuccessSms] = useState(false);

  // Grouped classes lists for selection
  const preSchoolClasses: StudentClass[] = ['Nursery', 'KG1', 'KG2'];
  const primaryClasses: StudentClass[] = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'];
  const jhsClasses: StudentClass[] = ['B7', 'B8', 'B9'];

  // All active students in selected class
  const classStudents = useMemo(() => {
    return students.filter(s => s.class === selectedClass && s.active);
  }, [students, selectedClass]);

  // Today's paid student ids in this class
  const paidStudentMap = useMemo(() => {
    const paidList = payments.filter(p => p.class === selectedClass && p.date === currentDate);
    const map = new Map<string, { paymentId: string; verified: boolean; collectedBy: string }>();
    paidList.forEach(p => {
      map.set(p.studentId, { paymentId: p.id, verified: p.verified, collectedBy: p.collectedBy });
    });
    return map;
  }, [payments, selectedClass, currentDate]);

  // Filter students by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return classStudents;
    return classStudents.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [classStudents, searchQuery]);

  // Summaries
  const paidCount = useMemo(() => {
    return classStudents.filter(s => paidStudentMap.has(s.id)).length;
  }, [classStudents, paidStudentMap]);

  const outstandingCount = classStudents.length - paidCount;
  const collectionTotal = paidCount * 5.00;

  const handleTogglePayment = (studentId: string) => {
    const paidInfo = paidStudentMap.get(studentId);
    if (paidInfo) {
      // Remove payment if clicked on a paid one
      deletePayment(paidInfo.paymentId);
    } else {
      // Create payment
      recordPayment(studentId, true);
    }
  };

  const handleMarkAllPaid = () => {
    const unpaidIds = classStudents
      .filter(s => !paidStudentMap.has(s.id))
      .map(s => s.id);
    if (unpaidIds.length > 0) {
      bulkRecordPayments(unpaidIds, true);
    }
  };

  const triggerSmsAlert = (student: Student) => {
    setGuardianSmsStudent(student);
    setSuccessSms(false);
  };

  const sendSimulatedSms = () => {
    setSuccessSms(true);
    setTimeout(() => {
      setGuardianSmsStudent(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Overview stats header */}
      <div className="bg-neutral-900 border-4 border-neutral-800 p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <p className="text-xs font-black text-amber-400 uppercase tracking-[0.2em] font-mono">
            Date Location Tracker: {currentDate}
          </p>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">
              Daily Check-In GHC 5.00 Register
            </h2>
          </div>
          <p className="text-xs text-neutral-400 font-bold">
            All pupils must present clearance prior to classroom ingress. Authorization: <span className="font-extrabold text-amber-400 font-mono tracking-wider">{currentUser?.role}</span>
          </p>
        </div>

        {/* Quick totals of active class */}
        <div className="flex flex-col sm:flex-row gap-4 p-2 bg-neutral-950 border-2 border-neutral-850 w-full lg:w-auto">
          <div className="px-5 py-2.5 text-left">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-mono">Paid Today</p>
            <p className="text-[22px] font-black text-white tracking-tight font-mono">{paidCount} / {classStudents.length}</p>
          </div>
          <div className="hidden sm:block border-r border-neutral-800" />
          <div className="px-5 py-2.5 text-left">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-mono">Outstanding</p>
            <p className="text-[22px] font-black text-red-500 tracking-tight font-mono">{outstandingCount}</p>
          </div>
          <div className="hidden sm:block border-r border-neutral-800" />
          <div className="px-5 py-2.5 text-left">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-mono">Total Collected</p>
            <p className="text-[22px] font-black text-emerald-400 tracking-tight font-mono">GHC {collectionTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Class Selector Grid */}
      <div className="bg-neutral-900 border-4 border-neutral-800 p-8 space-y-5">
        <div>
          <h3 className="text-xs font-black text-neutral-400 uppercase tracking-[0.25em] font-mono mb-4">
            Grouped Class Directory
          </h3>
          <div className="space-y-4">
            {/* Pre-School classes */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-mono w-28">Pre-school</span>
              <div className="flex flex-wrap gap-2">
                {preSchoolClasses.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-4 py-2 font-black text-[11px] tracking-widest uppercase transition-all border-2 ${selectedClass === cls
                      ? 'bg-amber-400 text-black border-amber-400'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-850'
                      }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Classes */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border-t border-neutral-800 pt-4">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-mono w-28">Primary</span>
              <div className="flex flex-wrap gap-2">
                {primaryClasses.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-4 py-2 font-black text-[11px] tracking-widest uppercase transition-all border-2 ${selectedClass === cls
                      ? 'bg-amber-400 text-black border-amber-400'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-850'
                      }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* JHS Classes */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border-t border-neutral-800 pt-4">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-mono w-28">JHS</span>
              <div className="flex flex-wrap gap-2">
                {jhsClasses.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-4 py-2 font-black text-[11px] tracking-widest uppercase transition-all border-2 ${selectedClass === cls
                      ? 'bg-amber-400 text-black border-amber-400'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-850'
                      }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Student Check-In Section */}
      <div className="bg-neutral-900 border-4 border-neutral-800 overflow-hidden">
        {/* Table Header Filter tools */}
        <div className="p-6 bg-neutral-950 border-b-2 border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-4 top-3.5 text-neutral-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH STUDENT NAME OR ROLL..."
              className="w-full bg-neutral-900 border-2 border-neutral-800 py-3 pl-11 pr-4 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400 placeholder:text-neutral-600 tracking-wide"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleMarkAllPaid}
              disabled={outstandingCount === 0}
              className="w-full sm:w-auto text-[10px] font-black bg-white hover:bg-amber-400 text-black py-3 px-5 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <CheckSquare size={14} /> BULK MARK PAID (GHC 5.00)
            </button>
          </div>
        </div>

        {/* Entries */}
        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 space-y-3">
            <Users size={36} className="mx-auto text-neutral-600" />
            <p className="text-sm font-black uppercase tracking-wider">No Student Found in Register</p>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Enroll additional pupils from the enrollment directory.</p>
          </div>
        ) : (
          <div className="divide-y-2 divide-neutral-800/80">
            {filteredStudents.map(student => {
              const paidInfo = paidStudentMap.get(student.id);
              const isPaid = !!paidInfo;

              return (
                <div
                  key={student.id}
                  className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 transition-colors ${isPaid ? 'bg-amber-400/[0.02]' : 'hover:bg-neutral-800/10'
                    }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-white uppercase tracking-tight">{student.name}</span>
                      <span className="text-[10px] font-black px-2.5 py-0.5 bg-neutral-950 border border-neutral-800 text-amber-400 font-mono tracking-wider">
                        {student.rollNumber}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-neutral-400">
                      <span>GUARDIAN: <strong className="text-neutral-300 font-mono">{student.guardianPhone}</strong></span>
                      <span className="hidden sm:inline w-1 h-1 bg-neutral-700" />
                      <span>CATEGORY: <strong className="text-neutral-300 uppercase tracking-wider">{student.category}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                    {/* SMS Alert */}
                    <button
                      onClick={() => triggerSmsAlert(student)}
                      title="Send Guardian Receipt"
                      className="p-2.5 text-neutral-400 hover:text-amber-400 border-2 border-neutral-800 hover:border-amber-400 bg-neutral-950 transition-colors cursor-pointer"
                    >
                      <BellRing size={16} />
                    </button>

                    {/* Pay trigger */}
                    <button
                      onClick={() => handleTogglePayment(student.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all w-full sm:w-40 justify-center border-2 cursor-pointer ${isPaid
                        ? 'bg-amber-400 text-black border-amber-400 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]'
                        : 'bg-neutral-950 text-neutral-450 border-neutral-800 hover:border-neutral-600 hover:text-white'
                        }`}
                    >
                      {isPaid ? (
                        <>
                          <Check size={14} className="stroke-[3]" /> PAID GHC 5.00
                        </>
                      ) : (
                        <>
                          <span className="text-amber-400 font-black">•</span> COLLECT GHC 5
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SMS Guardian Notification Modal Overlay */}
      {guardianSmsStudent && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border-4 border-neutral-800 max-w-md w-full p-8 shadow-[8px_8px_0px_0px_#fbbf24] space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-800">
              <MessageSquareCode size={20} className="text-amber-400" />
              <h3 className="text-sm font-black uppercase tracking-widest text-white">Guardian SMS Ingress Receipt</h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-neutral-400 font-bold leading-relaxed">
                Send a real-time ledger dispatch token receipt directly to the guardian core of <span className="font-extrabold text-white">{guardianSmsStudent.name}</span>:
              </p>

              <div className="bg-neutral-950 text-emerald-400 font-mono text-[11px] p-5 border-2 border-neutral-850 leading-relaxed shadow-inner space-y-2">
                <p className="text-neutral-500 font-bold uppercase tracking-wider">Sender Mask: DailyFeeGhana</p>
                <p className="text-neutral-500 font-bold">Guardian: {guardianSmsStudent.guardianPhone}</p>
                <p className="border-t border-neutral-800/80 my-2 pt-2" />
                <p>Hello! Daily school check-in fee of GHC 5.00 for {guardianSmsStudent.name} is processed on {currentDate}. Verified check gate auditor: {currentUser?.name || "School Office"}. Clearance code: SEC-APPROVED. Thank you!</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setGuardianSmsStudent(null)}
                className="w-1/3 text-xs bg-neutral-950 border-2 border-neutral-800 hover:border-neutral-600 text-neutral-400 py-3 font-black transition-colors uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={sendSimulatedSms}
                className="w-2/3 text-xs bg-white hover:bg-amber-400 text-black py-3 font-black flex items-center justify-center gap-2 uppercase tracking-widest transition-colors cursor-pointer"
              >
                {successSms ? (
                  <>
                    <Check size={14} className="text-emerald-500 stroke-[3]" /> LEDGER DISPATCHED
                  </>
                ) : (
                  'DISPATCH SECURE SMS'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
