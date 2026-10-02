import { UserAccount, UserRole, RolePermissions } from '../types/auth';
import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';

const STORAGE_USERS_KEY = 'cascade_ehr_users_v2';
const STORAGE_CURRENT_USER_KEY = 'cascade_ehr_active_session_v2';

let inMemoryStorage: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Fallback to in-memory
  }
  return inMemoryStorage[key] || null;
}

function safeSetItem(key: string, val: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch {
    // Fallback to in-memory
  }
  inMemoryStorage[key] = val;
}

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-admin-01',
    username: 'admin',
    password: 'admin',
    displayName: 'Administrator (Super User)',
    role: 'admin',
    email: 'admin@cascade-ehr.internal',
    department: 'Executive Administration',
    status: 'active',
    createdAt: '2026-01-01T08:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'user-doc-01',
    username: 'dr_sarah',
    password: 'doctor123',
    displayName: 'Dr. Sarah Lin, MD',
    role: 'doctor',
    email: 'slin@cascade-ehr.internal',
    department: 'Family Medicine & Primary Care',
    status: 'active',
    createdAt: '2026-01-10T08:00:00.000Z',
    lastLogin: '2026-10-01T09:30:00.000Z',
  },
  {
    id: 'user-comp-01',
    username: 'compounder_raj',
    password: 'comp123',
    displayName: 'Rajesh Kumar (Compounder)',
    role: 'compounder',
    email: 'rkumar@cascade-ehr.internal',
    department: 'Pharmacy & Clinical Triage',
    status: 'active',
    createdAt: '2026-02-01T08:00:00.000Z',
    lastLogin: '2026-10-01T08:15:00.000Z',
  },
  {
    id: 'user-lab-01',
    username: 'lab_elena',
    password: 'lab123',
    displayName: 'Elena Rostova, MLS (Lab Tech)',
    role: 'lab_technician',
    email: 'erostova@cascade-ehr.internal',
    department: 'Pathology & Diagnostic Laboratory',
    status: 'active',
    createdAt: '2026-02-15T08:00:00.000Z',
    lastLogin: '2026-10-01T07:45:00.000Z',
  },
];

export const userService = {
  // Clear storage for testing
  resetStorage(): void {
    inMemoryStorage = {};
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_USERS_KEY);
        window.localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    } catch {
      // Ignore
    }
  },

  // Retrieve all configured users from cache
  getUsers(): UserAccount[] {
    try {
      const raw = safeGetItem(STORAGE_USERS_KEY);
      if (!raw) {
        safeSetItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      const parsed = JSON.parse(raw);
      // Ensure super user 'admin' with password 'admin' is always present
      const hasAdmin = parsed.some((u: UserAccount) => u.username === 'admin');
      if (!hasAdmin) {
        const merged = [INITIAL_USERS[0], ...parsed];
        safeSetItem(STORAGE_USERS_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return INITIAL_USERS;
    }
  },

  // Save users to cache and async sync to Firestore if available
  saveUsers(users: UserAccount[]): void {
    try {
      safeSetItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Could not save users to storage', e);
    }
  },

  // Authenticate staff member
  authenticate(username: string, password: string): UserAccount | null {
    const users = this.getUsers();
    const cleanUsername = username.trim().toLowerCase();
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername &&
        u.password === password &&
        u.status === 'active'
    );

    if (user) {
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      this.updateUser(user.id, { lastLogin: updatedUser.lastLogin });
      this.setCurrentUser(updatedUser);
      return updatedUser;
    }
    return null;
  },

  // Get active session user (defaults to Super User admin on initial boot)
  getCurrentUser(): UserAccount {
    try {
      const raw = safeGetItem(STORAGE_CURRENT_USER_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }
    // Default to admin super user
    const adminUser = this.getUsers().find((u) => u.username === 'admin') || INITIAL_USERS[0];
    this.setCurrentUser(adminUser);
    return adminUser;
  },

  // Set active session user
  setCurrentUser(user: UserAccount): void {
    try {
      safeSetItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Could not save current user session', e);
    }
  },

  // Create new staff user account
  createUser(newUserData: {
    username: string;
    password: string;
    displayName: string;
    role: UserRole;
    email: string;
    department: string;
  }): UserAccount {
    const users = this.getUsers();
    const cleanUsername = newUserData.username.trim().toLowerCase();

    // Check for collision
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      throw new Error(`Username "${newUserData.username}" is already taken.`);
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      username: cleanUsername,
      password: newUserData.password,
      displayName: newUserData.displayName.trim(),
      role: newUserData.role,
      email: newUserData.email.trim(),
      department: newUserData.department.trim() || 'General Clinic',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const updatedList = [...users, newUser];
    this.saveUsers(updatedList);

    // Sync to Firestore
    try {
      const userDocRef = doc(db, 'users', newUser.id);
      const { password, ...firestoreData } = newUser;
      setDoc(userDocRef, firestoreData).catch(console.warn);
    } catch (err) {
      console.warn('Firestore user creation sync notice:', err);
    }

    return newUser;
  },

  // Update existing user details
  updateUser(id: string, updates: Partial<UserAccount>): UserAccount {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with ID ${id} not found.`);
    }

    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    this.saveUsers(users);

    // If updating currently logged in user, refresh session
    const current = this.getCurrentUser();
    if (current.id === id) {
      this.setCurrentUser(updatedUser);
    }

    // Sync to Firestore
    try {
      const userDocRef = doc(db, 'users', id);
      const { password, ...firestoreData } = updatedUser;
      updateDoc(userDocRef, firestoreData).catch(console.warn);
    } catch (err) {
      console.warn('Firestore user update sync notice:', err);
    }

    return updatedUser;
  },

  // Delete user account (cannot delete the super admin user)
  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return false;

    if (target.username === 'admin') {
      throw new Error('The primary super user (admin) cannot be deleted.');
    }

    const filtered = users.filter((u) => u.id !== id);
    this.saveUsers(filtered);

    // Sync to Firestore
    try {
      const userDocRef = doc(db, 'users', id);
      deleteDoc(userDocRef).catch(console.warn);
    } catch (err) {
      console.warn('Firestore user delete sync notice:', err);
    }

    return true;
  },

  // Reset user password
  resetPassword(id: string, newPass: string): boolean {
    this.updateUser(id, { password: newPass });
    return true;
  },

  // Role permissions matrix
  getRolePermissions(role: UserRole): RolePermissions {
    switch (role) {
      case 'admin':
        return {
          canManageUsers: true,
          canWriteSOAP: true,
          canSignEncounters: true,
          canPrescribeMeds: true,
          canDispenseMeds: true,
          canRecordVitals: true,
          canManageQueue: true,
          canEditLabs: true,
          canViewCharts: true,
          canAccessCalculators: true,
        };
      case 'doctor':
        return {
          canManageUsers: false,
          canWriteSOAP: true,
          canSignEncounters: true,
          canPrescribeMeds: true,
          canDispenseMeds: true,
          canRecordVitals: true,
          canManageQueue: true,
          canEditLabs: true,
          canViewCharts: true,
          canAccessCalculators: true,
        };
      case 'compounder':
        return {
          canManageUsers: false,
          canWriteSOAP: false,
          canSignEncounters: false,
          canPrescribeMeds: false,
          canDispenseMeds: true,
          canRecordVitals: true,
          canManageQueue: true,
          canEditLabs: false,
          canViewCharts: true,
          canAccessCalculators: false,
        };
      case 'lab_technician':
        return {
          canManageUsers: false,
          canWriteSOAP: false,
          canSignEncounters: false,
          canPrescribeMeds: false,
          canDispenseMeds: false,
          canRecordVitals: false,
          canManageQueue: false,
          canEditLabs: true,
          canViewCharts: true,
          canAccessCalculators: false,
        };
      default:
        return {
          canManageUsers: false,
          canWriteSOAP: false,
          canSignEncounters: false,
          canPrescribeMeds: false,
          canDispenseMeds: false,
          canRecordVitals: false,
          canManageQueue: false,
          canEditLabs: false,
          canViewCharts: true,
          canAccessCalculators: false,
        };
    }
  },
};
