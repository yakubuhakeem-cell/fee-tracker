/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, PaymentRecord, UserAccount, UserRole, StudentClass, SchoolCategory } from '../types';
import { INITIAL_USERS, INITIAL_STUDENTS, generateSeedPayments, getClassCategory } from '../initialData';

interface AppContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  students: Student[];
  payments: PaymentRecord[];
  currentDate: string; // YYYY-MM-DD format
  setCurrentDate: (date: string) => void;
  login: (email: string, mfaCode?: string) => { success: boolean; requiresMfa?: boolean; error?: string };
  logout: () => void;
  toggleMfaForUser: (userId: string) => void;
  addStudent: (name: string, className: StudentClass, guardianPhone?: string) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  recordPayment: (studentId: string, verified?: boolean) => void;
  bulkRecordPayments: (studentIds: string[], verified?: boolean) => void;
  verifyPayment: (paymentId: string) => void;
  deletePayment: (paymentId: string) => void;
  registerStaff: (name: string, email: string, role: UserRole, assignedClass?: StudentClass, mfaEnabled?: boolean) => { success: boolean; error?: string };
  getDailyStats: (date: string) => DailyStats;
  getTeacherMetrics: (date: string) => TeacherMetric[];
  getCashFlowTrend: () => CashFlowTrendPoint[];
  getPendingAlerts: (date: string) => PendingAlert[];
  sendMonthlyEmailDraft: (email: string) => { success: boolean; message: string; draftContent: string };
  resetData: () => void;
}

export interface DailyStats {
  totalCollected: number;
  totalExpected: number;
  paidCount: number;
  pendingCount: number;
  collectionRate: number; // percentage
  byCategory: Record<SchoolCategory, number>;
  byClass: Record<StudentClass, number>;
}

export interface TeacherMetric {
  teacherName: string;
  className: StudentClass;
  category: SchoolCategory;
  studentsCount: number;
  paidCount: number;
  collected: number;
  rate: number;
}

export interface CashFlowTrendPoint {
  date: string;
  formattedDate: string;
  amount: number;
  transactions: number;
}

export interface PendingAlert {
  studentId: string;
  studentName: string;
  class: StudentClass;
  category: SchoolCategory;
  guardianPhone: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use current date as '2026-05-30' by default to align with seeds
  const [currentDate, setCurrentDate] = useState<string>('2026-05-29'); // Defaults to last weekday (Friday)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Load state from localStorage on init
  useEffect(() => {
    const localUsers = localStorage.getItem('s_users');
    const localStudents = localStorage.getItem('s_students');
    const localPayments = localStorage.getItem('s_payments');
    const localUser = localStorage.getItem('s_current_user');

    // 1. Users list healing load
    try {
      if (localUsers) {
        setUsers(JSON.parse(localUsers));
      } else {
        setUsers(INITIAL_USERS);
        localStorage.setItem('s_users', JSON.stringify(INITIAL_USERS));
      }
    } catch (e) {
      console.warn('Recovered s_users from state corruption:', e);
      setUsers(INITIAL_USERS);
      localStorage.setItem('s_users', JSON.stringify(INITIAL_USERS));
    }

    // 2. Students list healing load
    try {
      if (localStudents) {
        setStudents(JSON.parse(localStudents));
      } else {
        setStudents(INITIAL_STUDENTS);
        localStorage.setItem('s_students', JSON.stringify(INITIAL_STUDENTS));
      }
    } catch (e) {
      console.warn('Recovered s_students from state corruption:', e);
      setStudents(INITIAL_STUDENTS);
      localStorage.setItem('s_students', JSON.stringify(INITIAL_STUDENTS));
    }

    // 3. Daily Payments ledger healing load
    try {
      if (localPayments) {
        setPayments(JSON.parse(localPayments));
      } else {
        const seeds = generateSeedPayments();
        setPayments(seeds);
        localStorage.setItem('s_payments', JSON.stringify(seeds));
      }
    } catch (e) {
      console.warn('Recovered s_payments from state corruption:', e);
      const seeds = generateSeedPayments();
      setPayments(seeds);
      localStorage.setItem('s_payments', JSON.stringify(seeds));
    }

    // 4. Session authentication state validation loading
    try {
      if (localUser) {
        const parsed = JSON.parse(localUser);
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.role) {
          setCurrentUser(parsed);
        } else {
          setCurrentUser(null);
          localStorage.removeItem('s_current_user');
        }
      }
    } catch (e) {
      console.warn('Recovered s_current_user authentication state corruption:', e);
      setCurrentUser(null);
      localStorage.removeItem('s_current_user');
    }
  }, []);

  // Sync helpers to localStorage
  const saveState = (newUsers: UserAccount[], newStudents: Student[], newPayments: PaymentRecord[]) => {
    localStorage.setItem('s_users', JSON.stringify(newUsers));
    localStorage.setItem('s_students', JSON.stringify(newStudents));
    localStorage.setItem('s_payments', JSON.stringify(newPayments));
  };

  const login = (email: string, mfaCode?: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return { success: false, error: 'Account with this email does not exist.' };
    }

    // Secure MFA Simulation: If user has MFA enabled, require code verify
    if (user.mfaEnabled) {
      if (!mfaCode) {
        return { success: true, requiresMfa: true };
      }
      // Demo MFA verification checks for a 6-digit number or specific override code
      // We will allow '123456' as the universal demo MFA token, or standard 6-digit entries
      if (mfaCode.trim().length !== 6 || isNaN(Number(mfaCode))) {
        return { success: false, error: 'Invalid 6-digit authentication token.' };
      }
      if (mfaCode.trim() !== '123456' && mfaCode.trim() !== '555555') {
        return { success: false, error: 'Incorrect Multi-Factor authentication code.' };
      }
    }

    setCurrentUser(user);
    localStorage.setItem('s_current_user', JSON.stringify(user));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('s_current_user');
  };

  const toggleMfaForUser = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const nextState = !u.mfaEnabled;
        return {
          ...u,
          mfaEnabled: nextState,
          mfaSecret: nextState ? u.mfaSecret || 'SHA-' + Math.random().toString(36).substring(2, 10).toUpperCase() : undefined
        };
      }
      return u;
    });
    setUsers(updated);
    if (currentUser && currentUser.id === userId) {
      const updatedMe = updated.find(u => u.id === userId)!;
      setCurrentUser(updatedMe);
      localStorage.setItem('s_current_user', JSON.stringify(updatedMe));
    }
    saveState(updated, students, payments);
  };

  const registerStaff = (name: string, email: string, role: UserRole, assignedClass?: StudentClass, mfaEnabled = false) => {
    const trimmedEmail = email.toLowerCase().trim();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'A staff member with this email is already registered.' };
    }

    const newUser: UserAccount = {
      id: 'staff_' + Date.now(),
      name,
      email: trimmedEmail,
      role,
      assignedClass: role === 'Teacher' ? assignedClass : undefined,
      mfaEnabled,
      mfaSecret: mfaEnabled ? 'SHA-' + Math.random().toString(36).substring(2, 10).toUpperCase() : undefined
    };

    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    saveState(nextUsers, students, payments);
    return { success: true };
  };

  const addStudent = (name: string, className: StudentClass, guardianPhone?: string) => {
    const category = getClassCategory(className);
    const prefix = className.startsWith('KG') ? className : className.startsWith('Nursery') ? 'NS' : className;
    const year = new Date().getFullYear();
    const count = students.filter(s => s.class === className).length + 1;
    const rollNumber = `${prefix}-${year}-${String(count).padStart(3, '0')}`;

    const newStudent: Student = {
      id: 'student_' + Date.now(),
      name,
      class: className,
      category,
      rollNumber,
      active: true,
      guardianPhone: guardianPhone || '0500000000'
    };

    const nextStudents = [...students, newStudent];
    setStudents(nextStudents);
    saveState(users, nextStudents, payments);
  };

  const updateStudent = (updatedStudent: Student) => {
    const nextStudents = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudents(nextStudents);
    saveState(users, nextStudents, payments);
  };

  const deleteStudent = (studentId: string) => {
    const nextStudents = students.filter(s => s.id !== studentId);
    // Remove future payments or today's if deleted
    const nextPayments = payments.filter(p => p.studentId !== studentId);
    setStudents(nextStudents);
    setPayments(nextPayments);
    saveState(users, nextStudents, nextPayments);
  };

  const recordPayment = (studentId: string, verified = true) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Check if payment already exists for this student on this day
    const existingIndex = payments.findIndex(p => p.studentId === studentId && p.date === currentDate);
    let nextPayments = [...payments];

    if (existingIndex > -1) {
      // Toggle / update instead of duplicate
      nextPayments[existingIndex] = {
        ...nextPayments[existingIndex],
        verified,
        timestamp: new Date().toISOString()
      };
    } else {
      // Create new GHC 5.00 payment
      const newPayment: PaymentRecord = {
        id: `p_${studentId}_${currentDate}`,
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        category: student.category,
        amount: 5.00,
        date: currentDate,
        timestamp: new Date().toISOString(),
        collectedBy: currentUser ? currentUser.name : 'System Host',
        verified
      };
      nextPayments.push(newPayment);
    }

    setPayments(nextPayments);
    saveState(users, students, nextPayments);
  };

  const bulkRecordPayments = (studentIds: string[], verified = true) => {
    let nextPayments = [...payments];
    studentIds.forEach(id => {
      const student = students.find(s => s.id === id);
      if (!student) return;

      const idx = nextPayments.findIndex(p => p.studentId === id && p.date === currentDate);
      if (idx > -1) {
        nextPayments[idx] = {
          ...nextPayments[idx],
          verified,
          timestamp: new Date().toISOString()
        };
      } else {
        nextPayments.push({
          id: `p_${id}_${currentDate}`,
          studentId: id,
          studentName: student.name,
          class: student.class,
          category: student.category,
          amount: 5.00,
          date: currentDate,
          timestamp: new Date().toISOString(),
          collectedBy: currentUser ? currentUser.name : 'System Host',
          verified
        });
      }
    });

    setPayments(nextPayments);
    saveState(users, students, nextPayments);
  };

  const verifyPayment = (paymentId: string) => {
    const nextPayments = payments.map(p => {
      if (p.id === paymentId) {
        return { ...p, verified: true };
      }
      return p;
    });
    setPayments(nextPayments);
    saveState(users, students, nextPayments);
  };

  const deletePayment = (paymentId: string) => {
    const nextPayments = payments.filter(p => p.id !== paymentId);
    setPayments(nextPayments);
    saveState(users, students, nextPayments);
  };

  const getDailyStats = (dateStr: string): DailyStats => {
    const targetDatePayments = payments.filter(p => p.date === dateStr);
    const activeStudents = students.filter(s => s.active);

    const paidCount = targetDatePayments.length;
    const pendingCount = Math.max(0, activeStudents.length - paidCount);

    const totalCollected = targetDatePayments.reduce((acc, p) => acc + (p.verified ? p.amount : 0), 0);
    const totalExpected = activeStudents.length * 5.00;

    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    const byCategory: Record<SchoolCategory, number> = {
      'Pre-school': 0,
      'Primary': 0,
      'JHS': 0
    };

    const byClass: Record<StudentClass, number> = {
      Nursery: 0, KG1: 0, KG2: 0,
      B1: 0, B2: 0, B3: 0, B4: 0, B5: 0, B6: 0,
      B7: 0, B8: 0, B9: 0
    };

    targetDatePayments.forEach(p => {
      if (p.verified) {
        byCategory[p.category] = (byCategory[p.category] || 0) + p.amount;
        byClass[p.class] = (byClass[p.class] || 0) + p.amount;
      }
    });

    return {
      totalCollected,
      totalExpected,
      paidCount,
      pendingCount,
      collectionRate,
      byCategory,
      byClass
    };
  };

  const getTeacherMetrics = (dateStr: string): TeacherMetric[] => {
    // We compute metrics per class based on active students
    const classes: StudentClass[] = [
      'Nursery', 'KG1', 'KG2',
      'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
      'B7', 'B8', 'B9'
    ];

    return classes.map(cls => {
      const clsStudents = students.filter(s => s.class === cls && s.active);
      const paidCls = payments.filter(p => p.class === cls && p.date === dateStr);
      const verifiedPaid = paidCls.filter(p => p.verified);

      // Link to known seeded teachers where applicable
      let teacherName = 'Madam Mary Appiah';
      if (cls === 'Nursery') teacherName = 'Mrs. Abigail Mensah';
      else if (cls === 'B1') teacherName = 'Mr. Emmanuel Gyamfi';
      else if (cls === 'KG1') teacherName = 'Mrs. Grace Annan';
      else if (cls === 'KG2') teacherName = 'Mrs. Beatrice Boateng';
      else if (cls === 'B2') teacherName = 'Mr. Samuel Osei';
      else if (cls === 'B3') teacherName = 'Mr. Kofi Boateng';
      else if (cls === 'B4') teacherName = 'Mrs. Rita Owusu';
      else if (cls === 'B5') teacherName = 'Mr. Desmond Taylor';
      else if (cls === 'B6') teacherName = 'Mrs. Joyce Arthur';
      else if (cls === 'B7') teacherName = 'Mr. Richard Boadu';
      else if (cls === 'B8') teacherName = 'Madam Faustina Asare';
      else if (cls === 'B9') teacherName = 'Mr. Philip Ansah';

      const collected = verifiedPaid.reduce((acc, p) => acc + p.amount, 0);
      const rate = clsStudents.length > 0 ? (verifiedPaid.length / clsStudents.length) * 100 : 0;

      return {
        teacherName,
        className: cls,
        category: getClassCategory(cls),
        studentsCount: clsStudents.length,
        paidCount: verifiedPaid.length,
        collected,
        rate
      };
    });
  };

  const getCashFlowTrend = (): CashFlowTrendPoint[] => {
    // Generate payments aggregated for the last 5 days
    const datesList: string[] = payments.map(p => p.date);
    const uniqueDates: string[] = Array.from(new Set(datesList)).sort();

    // Fallback if empty
    if (uniqueDates.length === 0) {
      return [{ date: currentDate, formattedDate: 'Today', amount: 0, transactions: 0 }];
    }

    return uniqueDates.map((dateStr: string) => {
      const datePayments = payments.filter(p => p.date === dateStr && p.verified);
      const parts = dateStr.split('-');
      const formattedDate = parts[2] ? `${parts[2]}/${parts[1]}` : dateStr;
      const totalAmount = datePayments.reduce((acc, p) => acc + p.amount, 0);

      return {
        date: dateStr,
        formattedDate,
        amount: totalAmount,
        transactions: datePayments.length
      };
    });
  };

  const getPendingAlerts = (dateStr: string): PendingAlert[] => {
    const activeStudents = students.filter(s => s.active);
    const paidStudentIds = new Set(payments.filter(p => p.date === dateStr).map(p => p.studentId));

    const pending: PendingAlert[] = [];
    activeStudents.forEach(student => {
      if (!paidStudentIds.has(student.id)) {
        pending.push({
          studentId: student.id,
          studentName: student.name,
          class: student.class,
          category: student.category,
          guardianPhone: student.guardianPhone || 'No Contacts'
        });
      }
    });

    return pending;
  };

  const sendMonthlyEmailDraft = (email: string) => {
    // Assemble structured HTML report draft for accounting department
    const totalPaymentsCount = payments.length;
    const totalGhcCollected = payments.filter(p => p.verified).reduce((sum, p) => sum + p.amount, 0);
    const activeStudentsCount = students.filter(s => s.active).length;

    // Categorization sums
    const preSchoolTot = payments.filter(p => p.verified && p.category === 'Pre-school').reduce((s, p) => s + p.amount, 0);
    const primaryTot = payments.filter(p => p.verified && p.category === 'Primary').reduce((s, p) => s + p.amount, 0);
    const jhsTot = payments.filter(p => p.verified && p.category === 'JHS').reduce((s, p) => s + p.amount, 0);

    const draftContent = `
=== SECURE TRANSMISSION ===
DATE: May 30, 2026
TO: ${email}
CC: school-finance-dept@school.edu.gh
SUBJECT: Daily School Fee Tracker - Automated Monthly Audit Summary

Ghanaian Educational Trust Daily Fee Tracker Report
-------------------------------------------------------
Scope Period: May 2026 Monthly Summary
Report Date: ${new Date().toLocaleDateString('en-GB')}
Authorized Signatory: ${currentUser?.name || 'Administrator'}

SUMMARY METRICS:
* Total Verified Fees Collected: GHC ${totalGhcCollected.toFixed(2)}
* Total Registrations Audited: ${totalPaymentsCount} Daily Payments
* Active Enrollment Audited: ${activeStudentsCount} Students

CATEGORIZED ACCOUNTING BREAKDOWN:
* Pre-school Collections: GHC ${preSchoolTot.toFixed(2)} [Nursery, KG1, KG2]
* Primary School Collections: GHC ${primaryTot.toFixed(2)} [B1 to B6]
* JHS School Collections: GHC ${jhsTot.toFixed(2)} [B7 to B9]

This ledger balance has been marked and verified by authorized teachers at daily school check points. Please verify the exported Excel audit logs attached within the report panel.

-------------------------------------------------------
School Administration Financial Audit System (MFA Secure)
    `;

    return {
      success: true,
      message: `Ledger draft prepared and securely simulated to ${email}.`,
      draftContent
    };
  };

  const resetData = () => {
    localStorage.removeItem('s_users');
    localStorage.removeItem('s_students');
    localStorage.removeItem('s_payments');
    setUsers(INITIAL_USERS);
    setStudents(INITIAL_STUDENTS);
    setPayments(generateSeedPayments());
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      students,
      payments,
      currentDate,
      setCurrentDate,
      login,
      logout,
      toggleMfaForUser,
      addStudent,
      updateStudent,
      deleteStudent,
      recordPayment,
      bulkRecordPayments,
      verifyPayment,
      deletePayment,
      registerStaff,
      getDailyStats,
      getTeacherMetrics,
      getCashFlowTrend,
      getPendingAlerts,
      sendMonthlyEmailDraft,
      resetData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
