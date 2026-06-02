/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SchoolCategory = 'Pre-school' | 'Primary' | 'JHS';

export type StudentClass = 
  | 'Nursery' | 'KG1' | 'KG2' // Pre-school
  | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' // Primary
  | 'B7' | 'B8' | 'B9'; // JHS

export interface Student {
  id: string;
  name: string;
  class: StudentClass;
  category: SchoolCategory;
  rollNumber: string;
  active: boolean;
  guardianPhone?: string;
  photoUrl?: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: StudentClass;
  category: SchoolCategory;
  amount: number; // always GHC 5.00
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  collectedBy: string; // Teacher name / ID
  verified: boolean;
  notes?: string;
}

export type UserRole = 'Administrator' | 'Teacher' | 'Accountant';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedClass?: StudentClass; // For teachers
  mfaEnabled: boolean;
  mfaSecret?: string; // QR code / setup value
  active?: boolean;
}

export interface Term {
  id: string;
  name: string; // e.g. 'Term 1 - 2026'
  startDate: string; // YYYY-MM-DD
  daysCount: number; // Allocated school days
  schoolDays: string[]; // Mon-Fri dates generated from startDate
  active: boolean;
}

export interface DailyReportSummary {
  date: string;
  totalCollected: number;
  totalExpected: number;
  paidCount: number;
  pendingCount: number;
  nurseryCollected: number;
  kg1Collected: number;
  kg2Collected: number;
  b1Collected: number;
  b2Collected: number;
  b3Collected: number;
  b4Collected: number;
  b5Collected: number;
  b6Collected: number;
  b7Collected: number;
  b8Collected: number;
  b9Collected: number;
}
