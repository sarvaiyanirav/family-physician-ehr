export type UserRole = 'admin' | 'doctor' | 'compounder' | 'lab_technician';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  displayName: string;
  role: UserRole;
  email: string;
  department: string;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export interface RolePermissions {
  canManageUsers: boolean;
  canWriteSOAP: boolean;
  canSignEncounters: boolean;
  canPrescribeMeds: boolean;
  canDispenseMeds: boolean;
  canRecordVitals: boolean;
  canManageQueue: boolean;
  canEditLabs: boolean;
  canViewCharts: boolean;
  canAccessCalculators: boolean;
}

export const ROLE_DEFINITIONS: Record<
  UserRole,
  {
    label: string;
    description: string;
    badgeColor: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  admin: {
    label: 'Super Admin',
    description: 'Complete administrative control over users, clinical charts, and system settings',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  doctor: {
    label: 'Physician / Doctor',
    description: 'Full clinical authority: SOAP notes, diagnoses, prescriptions, and encounter sign-off',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  compounder: {
    label: 'Compounder / Assistant',
    description: 'Clinical support: vitals triage, medication dispensing, queue management, and patient care assistance',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  lab_technician: {
    label: 'Lab Technician',
    description: 'Diagnostic authority: laboratory test entry, specimen results, and critical value flagging',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
};
