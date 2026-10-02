import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  Key,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  X,
  Check,
  Stethoscope,
  Pill,
  TestTube,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { UserAccount, UserRole, ROLE_DEFINITIONS } from '../types/auth';
import { userService } from '../services/userService';

interface UserManagementProps {
  currentUser: UserAccount;
  onSwitchUser: (user: UserAccount) => void;
  onUserListChange?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  currentUser,
  onSwitchUser,
  onUserListChange,
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => userService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for Add User
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('doctor');
  const [formEmail, setFormEmail] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshUsers = () => {
    const list = userService.getUsers();
    setUsers(list);
    if (onUserListChange) onUserListChange();
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (q) {
        return (
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, searchQuery, roleFilter]);

  // Metric counts
  const metrics = useMemo(() => {
    const total = users.length;
    const doctors = users.filter((u) => u.role === 'doctor').length;
    const compounders = users.filter((u) => u.role === 'compounder').length;
    const labTechs = users.filter((u) => u.role === 'lab_technician').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    return { total, doctors, compounders, labTechs, admins };
  }, [users]);

  // Handle Add New User
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formUsername.trim() || !formPassword.trim() || !formDisplayName.trim()) {
      setFormError('Please fill in username, password, and display name.');
      return;
    }

    try {
      const created = userService.createUser({
        username: formUsername,
        password: formPassword,
        displayName: formDisplayName,
        role: formRole,
        email: formEmail || `${formUsername}@cascade-ehr.internal`,
        department: formDepartment || 'General Practice',
      });

      refreshUsers();
      setIsAddUserModalOpen(false);
      setFormUsername('');
      setFormPassword('');
      setFormDisplayName('');
      setFormRole('doctor');
      setFormEmail('');
      setFormDepartment('');
      showToast(`User ${created.displayName} (${created.role}) created successfully.`);
    } catch (err: any) {
      setFormError(err.message || 'Error creating user.');
    }
  };

  // Handle Edit User
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      userService.updateUser(editingUser.id, {
        displayName: editingUser.displayName,
        role: editingUser.role,
        department: editingUser.department,
        email: editingUser.email,
        status: editingUser.status,
      });

      refreshUsers();
      setEditingUser(null);
      showToast(`User ${editingUser.displayName} updated.`);
    } catch (err: any) {
      alert(err.message || 'Error updating user.');
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = (user: UserAccount) => {
    if (user.username === 'admin') {
      alert('The primary super admin account cannot be suspended.');
      return;
    }

    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    userService.updateUser(user.id, { status: newStatus });
    refreshUsers();
    showToast(`User ${user.displayName} is now ${newStatus}.`);
  };

  // Handle Delete
  const handleDeleteUser = (user: UserAccount) => {
    if (user.username === 'admin') {
      alert('The super user (admin) cannot be deleted.');
      return;
    }

    if (confirm(`Are you sure you want to delete user account "${user.displayName}" (${user.username})?`)) {
      userService.deleteUser(user.id);
      refreshUsers();
      showToast(`User ${user.displayName} removed.`);
    }
  };

  // Handle Reset Password
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser || !newPasswordInput.trim()) return;

    userService.resetPassword(resetPasswordUser.id, newPasswordInput.trim());
    refreshUsers();
    setResetPasswordUser(null);
    setNewPasswordInput('');
    showToast(`Password updated for ${resetPasswordUser.displayName}.`);
  };

  // Access check: only admin can access this view
  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Access Restricted: Super User Authority Required</h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          You are currently signed in as <strong>{currentUser.displayName}</strong> ({currentUser.role}). User management, role provisioning, and credential governance require <strong>Super User (admin)</strong> authorization.
        </p>
        <button
          onClick={() => {
            const admin = userService.getUsers().find((u) => u.username === 'admin');
            if (admin) onSwitchUser(admin);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Switch to Super User (admin)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-gray-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                User Management & Access Control
              </h1>
              <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded border border-purple-200 uppercase">
                Super User Zone
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Provision clinic accounts, configure role permissions (Doctor, Compounder, Lab Technician), and manage passwords
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Staff User</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doctors Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-gray-500 font-semibold">
              Attending Doctors
            </div>
            <div className="text-2xl font-bold text-blue-700 mt-1">
              {metrics.doctors}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              SOAP notes & encounter signing
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        {/* Compounders Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-gray-500 font-semibold">
              Compounders / Assistants
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-1">
              {metrics.compounders}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Vitals, dispensing & queue triage
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Pill className="w-5 h-5" />
          </div>
        </div>

        {/* Lab Techs Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-gray-500 font-semibold">
              Lab Technicians
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">
              {metrics.labTechs}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Laboratory & diagnostic entries
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <TestTube className="w-5 h-5" />
          </div>
        </div>

        {/* Super Admins Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-gray-500 font-semibold">
              Super Users (Admin)
            </div>
            <div className="text-2xl font-bold text-purple-700 mt-1">
              {metrics.admins}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Full system & user governance
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
            <Key className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Role Definitions & Matrix Legend */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="text-xs font-bold text-gray-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Role Permissions Matrix & Scope</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((roleKey) => {
            const def = ROLE_DEFINITIONS[roleKey];
            return (
              <div
                key={roleKey}
                className={`p-3 rounded-lg border ${def.bgColor} ${def.borderColor} space-y-1.5`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${def.textColor}`}>{def.label}</span>
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border ${def.badgeColor}`}>
                    {roleKey}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {def.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by display name, username, email, department..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-gray-400 text-[11px] font-mono">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-purple-600"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="admin">Super Admin ({metrics.admins})</option>
            <option value="doctor">Doctor ({metrics.doctors})</option>
            <option value="compounder">Compounder ({metrics.compounders})</option>
            <option value="lab_technician">Lab Technician ({metrics.labTechs})</option>
          </select>
        </div>
      </div>

      {/* Users Master Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between text-xs">
          <span className="font-bold text-gray-900">
            Registered Application Staff ({filteredUsers.length})
          </span>
          <span className="text-[11px] text-gray-500 font-mono">
            Default super user: <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800 font-bold">admin / admin</code>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Staff Member & Username</th>
                <th className="py-2.5 px-4">Authorization Role</th>
                <th className="py-2.5 px-4">Department / Clinic</th>
                <th className="py-2.5 px-4">Contact Email</th>
                <th className="py-2.5 px-4">Account Status</th>
                <th className="py-2.5 px-4">Last Activity</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const roleDef = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS.doctor;
                const isCurrent = currentUser.id === user.id;

                return (
                  <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Name & Username */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                            user.role === 'admin'
                              ? 'bg-purple-700 text-white'
                              : user.role === 'doctor'
                              ? 'bg-blue-700 text-white'
                              : user.role === 'compounder'
                              ? 'bg-amber-600 text-white'
                              : 'bg-emerald-700 text-white'
                          }`}
                        >
                          {user.displayName?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <span>{user.displayName}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono bg-green-100 text-green-800 px-1.5 py-0.2 rounded font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold border ${roleDef.badgeColor}`}>
                        {roleDef.label}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-gray-800 font-medium">
                      {user.department}
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                      {user.email}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {user.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Suspended</span>
                        </span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : 'Never logged in'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Switch To this user for instant testing */}
                        <button
                          onClick={() => onSwitchUser(user)}
                          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          title={`Switch active session to ${user.displayName}`}
                        >
                          Switch
                        </button>

                        {/* Reset Password */}
                        <button
                          onClick={() => {
                            setResetPasswordUser(user);
                            setNewPasswordInput('');
                          }}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                          title="Reset Password"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit User */}
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                          title="Edit User Details & Role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Status */}
                        {user.username !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="p-1.5 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                            title={user.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete User */}
                        {user.username !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-gray-400 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add New Staff Member */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-700" />
                <h3 className="text-sm font-bold text-gray-900">Add New Staff Account</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Full Legal / Professional Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jordan Hayes, MD"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. jhayes"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Temporary password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Authorization Role *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-purple-600"
                >
                  <option value="doctor">Doctor (Physician - full clinical SOAP & sign-off)</option>
                  <option value="compounder">Compounder (Clinical Assistant - vitals, dispensing, queue)</option>
                  <option value="lab_technician">Lab Technician (Diagnostics & test entries)</option>
                  <option value="admin">Super Admin (Full administration & user management)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Department / Unit
                </label>
                <input
                  type="text"
                  placeholder="e.g. Family Practice, Triage, Diagnostics"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="staff@cascade-ehr.internal"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-purple-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Edit Staff User: @{editingUser.username}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.displayName}
                  onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Role Authorization
                </label>
                <select
                  disabled={editingUser.username === 'admin'}
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-purple-600 disabled:bg-gray-100"
                >
                  <option value="doctor">Doctor</option>
                  <option value="compounder">Compounder</option>
                  <option value="lab_technician">Lab Technician</option>
                  <option value="admin">Super Admin</option>
                </select>
                {editingUser.username === 'admin' && (
                  <p className="text-[10px] text-gray-400 mt-1">Super User (admin) role is locked.</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  disabled={editingUser.username === 'admin'}
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-purple-600 disabled:bg-gray-100"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Reset Password */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-700" />
                <h3 className="text-sm font-bold text-gray-900">
                  Reset Password: @{resetPasswordUser.username}
                </h3>
              </div>
              <button
                onClick={() => setResetPasswordUser(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 text-xs">
              <p className="text-gray-600">
                Enter the new password for <strong>{resetPasswordUser.displayName}</strong>:
              </p>
              <div>
                <input
                  type="text"
                  required
                  placeholder="New password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setResetPasswordUser(null)}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
