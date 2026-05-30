/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StudentClass, Student, SchoolCategory, UserRole } from '../types';
import { Plus, UserPlus, Trash2, Edit2, ShieldAlert, Check, X, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { getClassCategory } from '../initialData';

export const AdminPanel: React.FC = () => {
  const { 
    students, 
    users, 
    addStudent, 
    updateStudent, 
    deleteStudent, 
    toggleMfaForUser,
    registerStaff,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'mfa'>('students');

  // Add student form state
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState<StudentClass>('B1');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [editStudentObj, setEditStudentObj] = useState<Student | null>(null);
  
  // Success indicator
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add staff form state
  const [adminRegName, setAdminRegName] = useState('');
  const [adminRegEmail, setAdminRegEmail] = useState('');
  const [adminRegRole, setAdminRegRole] = useState<UserRole>('Teacher');
  const [adminRegClass, setAdminRegClass] = useState<StudentClass>('B1');
  const [adminRegMfa, setAdminRegMfa] = useState(false);

  const handleAdminRegisterStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminRegName.trim() || !adminRegEmail.trim()) return;

    const result = registerStaff(
      adminRegName.trim(),
      adminRegEmail.trim(),
      adminRegRole,
      adminRegRole === 'Teacher' ? adminRegClass : undefined,
      adminRegMfa
    );

    if (result.success) {
      setAdminRegName('');
      setAdminRegEmail('');
      setAdminRegMfa(false);
      showToast('Staff register updated with new entry.');
    } else {
      showToast(result.error || 'Check administrator database permissions & connection.');
    }
  };

  const classes: StudentClass[] = [
    'Nursery', 'KG1', 'KG2',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
    'B7', 'B8', 'B9'
  ];

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    addStudent(newStudentName.trim(), newStudentClass, newStudentPhone.trim() || undefined);
    setNewStudentName('');
    setNewStudentPhone('');
    showToast('Student successfully registered to the daily ledger catalog.');
  };

  const handleStartEdit = (student: Student) => {
    setEditStudentObj({ ...student });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudentObj || !editStudentObj.name.trim()) return;

    // Recalculate category based on selected class
    const category = getClassCategory(editStudentObj.class);
    updateStudent({
      ...editStudentObj,
      category
    });
    setEditStudentObj(null);
    showToast('Catalog record updated.');
  };

  const handleToggleStudentActive = (student: Student) => {
    updateStudent({
      ...student,
      active: !student.active
    });
    showToast(`Status toggled for ${student.name}.`);
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Alert Header */}
      {successMsg && (
        <div className="bg-amber-400 text-black border-4 border-neutral-800 p-4 text-xs font-black flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] font-mono uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Check size={16} className="bg-black/10 p-0.5" />
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {/* Admin header with controls */}
      <div className="bg-neutral-900 border-4 border-neutral-800 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-white leading-none">Authorized Administration Core</h2>
          <p className="text-xs text-neutral-400 mt-2 font-bold max-w-xl">
            Configure pupil registers, categories, and secure Multi-Factor authorization profiles. Action triggers require verified session levels.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2 p-1.5 bg-neutral-950 border-2 border-neutral-850 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('students')}
            className={`w-1/2 md:w-auto px-5 py-2.5 font-black text-[11px] uppercase tracking-widest transition-all ${
              activeTab === 'students'
                ? 'bg-amber-400 text-black'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            Pupil Logs
          </button>
          <button
            onClick={() => setActiveTab('mfa')}
            className={`w-1/2 md:w-auto px-5 py-2.5 font-black text-[11px] uppercase tracking-widest transition-all ${
              activeTab === 'mfa'
                ? 'bg-amber-400 text-black'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            RBAC & MFA Hub
          </button>
        </div>
      </div>

      {activeTab === 'students' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add / Edit student card */}
          <div className="bg-neutral-900 border-4 border-neutral-800 p-8 h-fit space-y-6">
            {!editStudentObj ? (
              <form onSubmit={handleAddStudentSubmit} className="space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-800">
                  <UserPlus size={18} className="text-amber-400" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Register New Student</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                      Pupil Full Name (English Ledger)
                    </label>
                    <input
                      type="text"
                      required
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="e.g. Priscilla Owusu"
                      className="w-full bg-neutral-950 border-2 border-neutral-800 py-3 px-4 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400 placeholder:text-neutral-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                        Target Class
                      </label>
                      <select
                        value={newStudentClass}
                        onChange={(e) => setNewStudentClass(e.target.value as StudentClass)}
                        className="w-full bg-neutral-950 border-2 border-neutral-800 py-3 px-4 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                      >
                        {classes.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                        Calculated Category
                      </label>
                      <div className="bg-neutral-950 border-2 border-neutral-850 py-3 px-4 text-xs text-amber-400 font-black font-mono uppercase tracking-wider">
                        {getClassCategory(newStudentClass)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                      Guardian Phone Number
                    </label>
                    <input
                      type="text"
                      value={newStudentPhone}
                      onChange={(e) => setNewStudentPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 0541234567"
                      className="w-full bg-neutral-950 border-2 border-neutral-800 py-3 px-4 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400 placeholder:text-neutral-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full text-xs font-black uppercase tracking-widest bg-white hover:bg-amber-400 text-black py-3.5 transition-colors cursor-pointer"
                >
                  Confirm Pupil Enrollment
                </button>
              </form>
            ) : (
              <form onSubmit={handleSaveEdit} className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-800">
                  <div className="flex items-center gap-3">
                    <Edit2 size={18} className="text-amber-400" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Modify Pupil File</h3>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setEditStudentObj(null)}
                    className="text-xs font-black text-neutral-500 hover:text-white uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                      Pupil Full Name (English Ledger)
                    </label>
                    <input
                      type="text"
                      required
                      value={editStudentObj.name}
                      onChange={(e) => setEditStudentObj({ ...editStudentObj, name: e.target.value })}
                      className="w-full bg-neutral-950 border-2 border-neutral-800 py-3 px-4 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                        Target Class
                      </label>
                      <select
                        value={editStudentObj.class}
                        onChange={(e) => setEditStudentObj({ ...editStudentObj, class: e.target.value as StudentClass })}
                        className="w-full bg-neutral-950 border-2 border-neutral-800 py-3 px-4 text-xs font-mono font-bold text-white focus:outline-none"
                      >
                        {classes.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                        Roll ID (Constant)
                      </label>
                      <div className="bg-neutral-950 border-2 border-neutral-850 py-3 px-4 text-xs text-neutral-400 font-extrabold font-mono uppercase tracking-wider">
                        {editStudentObj.rollNumber}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                      Guardian Phone Number
                    </label>
                    <input
                      type="text"
                      value={editStudentObj.guardianPhone || ''}
                      onChange={(e) => setEditStudentObj({ ...editStudentObj, guardianPhone: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-neutral-950 border-2 border-neutral-800 py-3 px-4 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditStudentObj(null)}
                    className="w-1/3 text-xs bg-neutral-950 border-2 border-neutral-800 hover:border-neutral-700 text-neutral-400 py-3 font-black uppercase tracking-widest transition-colors"
                  >
                    Quit
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 text-xs bg-white hover:bg-amber-400 text-black py-3 font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Directory Listings */}
          <div className="bg-neutral-900 border-4 border-neutral-800 col-span-1 lg:col-span-2 overflow-hidden flex flex-col justify-between">
            <div className="p-6 bg-neutral-950 border-b-2 border-neutral-850 flex justify-between items-center">
              <span className="text-[10px] font-black text-neutral-400 font-mono uppercase tracking-widest">Active Catalog Directory ({students.length})</span>
            </div>

            <div className="divide-y-2 divide-neutral-850 overflow-y-auto max-h-[480px]">
              {students.map(st => (
                <div key={st.id} className="p-6 flex justify-between items-center hover:bg-neutral-800/10">
                  <div className="space-y-1.5">
                    <p className={`text-base font-black text-white uppercase tracking-tight ${!st.active ? 'line-through text-neutral-500' : ''}`}>{st.name}</p>
                    <div className="flex gap-2.5 items-center text-[10px] text-neutral-400 font-mono font-bold uppercase tracking-wider">
                      <span className="bg-neutral-950 border border-neutral-800 px-2.5 py-0.5 text-amber-400 font-black">{st.class}</span>
                      <span>•</span>
                      <span>Category: {st.category}</span>
                      <span>•</span>
                      <span>ID: {st.rollNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Active toggle */}
                    <button
                      onClick={() => handleToggleStudentActive(st)}
                      title={st.active ? 'Deactivate from checkout register' : 'Reactivate into register'}
                      className={`p-2 border-2 transition-colors cursor-pointer ${
                        st.active 
                          ? 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 bg-neutral-950' 
                          : 'border-red-800 text-red-500 bg-red-950/20'
                      }`}
                    >
                      {st.active ? <Check size={14} className="stroke-[3]" /> : <X size={14} className="stroke-[3]" />}
                    </button>

                    {/* Edit trigger */}
                    <button
                      onClick={() => handleStartEdit(st)}
                      className="p-2 border-2 border-neutral-800 hover:border-neutral-600 bg-neutral-950 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit2 size={13} />
                    </button>

                    {/* Delete trigger */}
                    <button
                      onClick={() => {
                        if (confirm(`Do you wish to delete student ${st.name} from ledger? Historical payment trails will vanish.`)) {
                          deleteStudent(st.id);
                          showToast('Pupil record purged.');
                        }
                      }}
                      className="p-2 border-2 border-red-900 bg-neutral-950 text-red-500 hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Staff Registration Card on Left */}
          <div className="bg-neutral-900 border-4 border-neutral-800 p-8 h-fit space-y-5">
            <form onSubmit={handleAdminRegisterStaff} className="space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-neutral-800">
                <UserPlus size={18} className="text-amber-400" />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Register Staff Profile</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                    Staff Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={adminRegName}
                    onChange={(e) => setAdminRegName(e.target.value)}
                    placeholder="e.g. Mrs. Rebecca Hanson"
                    className="w-full bg-neutral-950 border-2 border-neutral-800 py-3 px-4 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400 placeholder:text-neutral-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                    Professional Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={adminRegEmail}
                    onChange={(e) => setAdminRegEmail(e.target.value)}
                    placeholder="e.g. rebecca.hanson@school.edu"
                    className="w-full bg-neutral-950 border-2 border-neutral-800 py-3 px-4 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400 placeholder:text-neutral-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                      Administrative Role
                    </label>
                    <select
                      value={adminRegRole}
                      onChange={(e) => setAdminRegRole(e.target.value as UserRole)}
                      className="w-full bg-neutral-950 border-2 border-neutral-800 py-3 px-4 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="Teacher">Teacher</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>

                  {adminRegRole === 'Teacher' ? (
                    <div>
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                        Assigned Class
                      </label>
                      <select
                        value={adminRegClass}
                        onChange={(e) => setAdminRegClass(e.target.value as StudentClass)}
                        className="w-full bg-neutral-950 border-2 border-neutral-800 py-3 px-4 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {classes.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-black text-neutral-555 uppercase tracking-widest mb-1.5 font-mono">
                        Scope Level
                      </label>
                      <div className="bg-neutral-950 border-2 border-neutral-850 py-3 px-4 text-xs text-neutral-500 font-extrabold font-mono uppercase tracking-wider">
                        {adminRegRole === 'Administrator' ? 'All Areas' : 'Accounting Desk'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="admin-reg-mfa-checkbox"
                    checked={adminRegMfa}
                    onChange={(e) => setAdminRegMfa(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 cursor-pointer"
                  />
                  <label htmlFor="admin-reg-mfa-checkbox" className="text-xs text-neutral-300 font-mono uppercase tracking-wider cursor-pointer select-none">
                    Enforce Secure MFA Locks
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-xs font-black uppercase tracking-widest bg-white hover:bg-amber-400 text-black py-3.5 transition-colors cursor-pointer"
              >
                Register Staff Profile
              </button>
            </form>
          </div>

          {/* MFA / RBAC Hub list on Right (col-span-2) */}
          <div className="bg-neutral-900 border-4 border-neutral-800 p-8 space-y-6 col-span-1 lg:col-span-2 h-fit">
            <div className="space-y-2 pb-3 border-b-2 border-neutral-800">
              <h3 className="text-xl font-black uppercase italic text-white tracking-tight flex items-center gap-3">
                <ShieldAlert size={20} className="text-amber-400" /> Multi-Factor Authentication (MFA Hub)
              </h3>
              <p className="text-xs text-neutral-400 font-bold leading-relaxed">
                Enforce high-security cryptographic checks. Users with enabled protection must supply 6-digit session codes on login.
              </p>
            </div>

            <div className="divide-y-2 divide-neutral-850 border-2 border-neutral-80 w-full overflow-hidden bg-neutral-950">
              {users.map(u => {
                const matchesCurrentUser = currentUser?.id === u.id;
                
                return (
                  <div key={u.id} className="p-6 flex flex-col xl:flex-row justify-between xl:items-center gap-4 hover:bg-neutral-900/10 transition-colors">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="text-base font-black text-white uppercase tracking-tight">{u.name}</p>
                        <span className="text-[10px] font-black text-amber-400 bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 tracking-widest uppercase font-mono">
                          {u.role} {u.assignedClass ? `(${u.assignedClass})` : '[All Core]'}
                        </span>
                        {matchesCurrentUser && (
                          <span className="text-[10px] bg-white text-black font-mono font-black px-2.5 py-0.5 uppercase tracking-widest">YOU</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 font-mono font-bold">{u.email}</p>
                      {u.mfaEnabled && u.mfaSecret && (
                        <div className="inline-flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 font-mono tracking-wider w-full sm:w-auto">
                          <span>TOTP SECURE SECRET-KEY: <strong className="font-extrabold text-amber-400 select-all font-mono">{u.mfaSecret}</strong></span>
                          <span className="hidden sm:inline text-neutral-600">|</span>
                          <span className="text-emerald-450 uppercase font-black">(SIMULATED VALIDATION OTP: <strong className="font-extrabold text-white select-all">123456</strong>)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-black uppercase tracking-widest font-mono ${u.mfaEnabled ? 'text-amber-400' : 'text-neutral-500'}`}>
                        {u.mfaEnabled ? 'MFA ACTIVE' : 'MFA DISABLED'}
                      </span>
                      <button
                        onClick={() => {
                          toggleMfaForUser(u.id);
                          showToast(`Security settings toggled for ${u.name}.`);
                        }}
                        className="cursor-pointer"
                      >
                        {u.mfaEnabled ? (
                          <ToggleRight size={44} className="text-amber-400 stroke-[1.5]" />
                        ) : (
                          <ToggleLeft size={44} className="text-neutral-700 stroke-[1.5]" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
