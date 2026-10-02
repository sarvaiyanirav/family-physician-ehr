import React, { useState } from 'react';
import {
  Lock,
  User,
  Key,
  X,
  CheckCircle2,
  AlertCircle,
  Shield,
  Stethoscope,
  Pill,
  TestTube,
  Sparkles,
} from 'lucide-react';
import { UserAccount, UserRole, ROLE_DEFINITIONS } from '../types/auth';
import { userService } from '../services/userService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const authenticatedUser = userService.authenticate(username, password);
    if (authenticatedUser) {
      onLoginSuccess(authenticatedUser);
      onClose();
    } else {
      setErrorMessage('Invalid username or password. Please verify credentials or use one-tap demo login.');
    }
  };

  const handleQuickLogin = (uname: string, pword: string) => {
    setErrorMessage(null);
    const authenticatedUser = userService.authenticate(uname, pword);
    if (authenticatedUser) {
      onLoginSuccess(authenticatedUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Clinic Staff Sign In & Role Authorization
              </h2>
              <p className="text-xs text-gray-500">
                Currently active: <strong className="text-gray-800">{currentUser.displayName}</strong> ({currentUser.role})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick-Switch Demo Role Accounts */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-700 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>One-Tap Role Authorization Login</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Select a staff role below to instantly authenticate and evaluate permissions:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              {/* Super Admin */}
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-700 text-white flex items-center justify-center shrink-0">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-purple-900 leading-tight">Super User (Admin)</div>
                    <div className="text-[10px] text-purple-700 font-mono">admin / admin</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                  Full user management & all clinical rights
                </div>
              </button>

              {/* Doctor */}
              <button
                type="button"
                onClick={() => handleQuickLogin('dr_sarah', 'doctor123')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-700 text-white flex items-center justify-center shrink-0">
                    <Stethoscope className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-blue-900 leading-tight">Doctor (Physician)</div>
                    <div className="text-[10px] text-blue-700 font-mono">dr_sarah / doctor123</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                  SOAP notes, Rx & encounter signing
                </div>
              </button>

              {/* Compounder */}
              <button
                type="button"
                onClick={() => handleQuickLogin('compounder_raj', 'comp123')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <Pill className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-900 leading-tight">Compounder</div>
                    <div className="text-[10px] text-amber-700 font-mono">compounder_raj / comp123</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                  Vitals, dispensing & queue triage
                </div>
              </button>

              {/* Lab Technician */}
              <button
                type="button"
                onClick={() => handleQuickLogin('lab_elena', 'lab123')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <TestTube className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-900 leading-tight">Lab Technician</div>
                    <div className="text-[10px] text-emerald-700 font-mono">lab_elena / lab123</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                  Laboratory test entries & critical flags
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-[11px] font-mono text-gray-400 uppercase">Or Log In With Credentials</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Staff Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or dr_sarah"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="Enter account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
              >
                Sign In to Clinic Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
