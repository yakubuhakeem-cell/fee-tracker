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
  currentDate: string;
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
  collectionRate: number;
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
  const [currentDate, setCurrentDate] = useState<string>('2026-05-29');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    try {
      const localUsers = localStorage.getItem('s_users');
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

    try {
      const localStudents = localStorage.getItem('s_students');
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

    try {
      const localPayments = localStorage.getItem('s_payments');
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

    try {
      const localUser = localStorage.getItem('s_current_user');
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
    if (user.mfaEnabled) {
      if (!mfaCode) return { success: true, requiresMfa: true };
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

  // ... (rest of your functions: toggleMfaForUser, registerStaff, addStudent, updateStudent, deleteStudent, recordPayment, bulkRecordPayments, verifyPayment, deletePayment, getDailyStats, getTeacherMetrics, getCashFlowTrend, getPendingAlerts, sendMonthlyEmailDraft, resetData) remain unchanged from your original file, since they were not part of the conflict markers.

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
