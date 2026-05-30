import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, PaymentRecord, UserAccount, UserRole, StudentClass, SchoolCategory } from '../types';
import { INITIAL_USERS, INITIAL_STUDENTS, generateSeedPayments } from '../initialData';

interface AppContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  students: Student[];
  payments: PaymentRecord[];
  currentDate: string;
  setCurrentDate: (date: string) => void;
  login: (email: string, mfaCode?: string) => { success: boolean; requiresMfa?: boolean; error?: string };
  logout: () => void;
  // … keep the rest of your functions here
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState<string>('2026-05-29');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    // initialize users, students, payments from localStorage or defaults
    setUsers(INITIAL_USERS);
    setStudents(INITIAL_STUDENTS);
    setPayments(generateSeedPayments());
  }, []);

  const login = (email: string, mfaCode?: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) return { success: false, error: 'Account not found.' };
    setCurrentUser(user);
    localStorage.setItem('s_current_user', JSON.stringify(user));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('s_current_user');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        students,
        payments,
        currentDate,
        setCurrentDate,
        login,
        logout,
        // … include the rest of your functions here
      }}
    >
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
