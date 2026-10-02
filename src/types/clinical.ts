export type AllergySeverity = 'mild' | 'moderate' | 'severe_anaphylaxis';
export type AllergyType = 'drug' | 'food' | 'environmental';

export interface Allergy {
  id: string;
  allergen: string;
  type: AllergyType;
  reaction: string;
  severity: AllergySeverity;
  identifiedDate: string;
}

export interface Problem {
  id: string;
  icdCode: string;
  description: string;
  status: 'active' | 'resolved' | 'inactive';
  onsetDate: string;
  notes?: string;
}

export interface MedicalHistoryItem {
  id: string;
  condition: string;
  diagnosedYear: string;
  notes?: string;
}

export interface SurgicalHistoryItem {
  id: string;
  procedure: string;
  year: string;
  hospitalOrSurgeon?: string;
  notes?: string;
}

export interface HospitalizationRecord {
  id: string;
  admissionDate: string; // YYYY-MM-DD
  dischargeDate?: string; // YYYY-MM-DD
  facility: string;
  admittingDiagnosis: string;
  dischargeSummary?: string;
  attendingPhysician?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  route: string; // Oral, Inhalation, Topical, Subcutaneous, etc.
  frequency: string; // Once daily, BID, TID, PRN, etc.
  indication: string;
  prescribedDate: string;
  prescribedBy: string;
  status: 'active' | 'discontinued' | 'on_hold';
  adherenceNotes?: string;
}

export interface SocialHistory {
  smokingStatus: 'never' | 'former' | 'current';
  smokingPacksPerDay?: number;
  smokingYears?: number;
  alcoholUse: 'none' | 'occasional' | 'moderate' | 'heavy';
  alcoholDrinksPerWeek?: number;
  recreationalDrugs: string;
  occupation: string;
  livingArrangement: string; // e.g. "Lives with spouse", "Lives alone in independent apartment"
  exerciseRoutine: string;
  dietaryHabits: string;
}

export interface FamilyHistoryItem {
  id: string;
  relation: string; // e.g. "Father", "Mother", "Maternal Grandmother"
  conditions: string[];
  ageAtOnsetOrDeath?: string;
  notes?: string;
}

export interface Immunization {
  id: string;
  vaccineName: string;
  dateAdministered: string;
  doseNumber?: string;
  status: 'completed' | 'due' | 'overdue' | 'declined';
  administeredBy?: string;
  lotNumber?: string;
}

export interface PreventiveScreening {
  id: string;
  screeningType: 'Colorectal Cancer' | 'Mammogram' | 'Cervical Pap Smear' | 'Bone Density (DEXA)' | 'Lipid Panel' | 'Diabetic Eye Exam' | 'Diabetic Foot Exam';
  lastCompletedDate?: string;
  dueDate: string;
  status: 'up_to_date' | 'due_soon' | 'overdue' | 'not_applicable';
  resultSummary?: string;
}

export interface Vitals {
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperatureC?: number;
  oxygenSaturation?: number; // SpO2 %
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  painScore?: number; // 0-10
  takenAt?: string;
}

export interface PrescriptionOrder {
  id: string;
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  dispenseQuantity: string;
  refills: number;
  instructions: string;
}

export interface EncounterPlan {
  prescriptions: PrescriptionOrder[];
  labOrders: string[];
  imagingOrders: string[];
  referrals: string[];
  patientInstructions: string;
  followUpIn: string; // e.g. "2 weeks", "3 months", "PRN"
  warningSigns: string[];
}

export interface DiagnosisEntry {
  code: string;
  name: string;
  isPrimary?: boolean;
}

export interface Encounter {
  id: string;
  patientId: string;
  date: string; // ISO
  provider: string;
  type: 'routine_annual' | 'follow_up' | 'acute_illness' | 'chronic_disease' | 'medication_review' | 'well_child' | 'mental_health';
  reasonForVisit: string;
  vitals: Vitals;
  chiefComplaint: string;
  hpi: string; // History of Present Illness
  reviewOfSystems?: Record<string, string>;
  physicalExam: Record<string, string>;
  assessment: {
    primaryDiagnosis: DiagnosisEntry;
    secondaryDiagnoses: DiagnosisEntry[];
    clinicalSummary: string;
  };
  plan: EncounterPlan;
  status: 'draft' | 'signed';
  signedAt?: string;
  billingCode?: string; // e.g., "99214"
}

export interface LabResult {
  id: string;
  testName: string;
  category: 'Biochemistry' | 'Hematology' | 'Lipids' | 'Endocrine' | 'Renal / Urinalysis' | 'Microbiology' | 'Immunology' | 'General' | string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'high' | 'low' | 'critical';
  collectedDate: string;
}

export type TriagePriority = 'routine' | 'urgent' | 'emergency';

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  photoUrl?: string; // Captured webcam photo, preset placeholder avatar, or uploaded image
  avatarType?: 'webcam' | 'preset' | 'upload' | 'initials';
  dob: string; // YYYY-MM-DD
  sex: 'male' | 'female' | 'intersex';
  genderIdentity?: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  healthCardNumber: string;
  primaryLanguage: string;
  needsInterpreter: boolean;
  codeStatus: 'Full Code' | 'DNR' | 'DNI' | 'Limited Intervention';
  primaryPhysician: string;
  clinicLocation: string;
  allergies: Allergy[];
  activeProblems: Problem[];
  pastMedicalHistory: MedicalHistoryItem[];
  pastSurgicalHistory: SurgicalHistoryItem[];
  medications: Medication[];
  socialHistory: SocialHistory;
  familyHistory: FamilyHistoryItem[];
  immunizations: Immunization[];
  preventiveScreenings: PreventiveScreening[];
  encounters: Encounter[];
  labResults: LabResult[];
  hospitalizations?: HospitalizationRecord[];
  clinicalAlerts: string[];
  visitStatus?: 'scheduled_today' | 'in_exam' | 'waiting' | 'completed' | 'not_scheduled';
  scheduledTime?: string;
  triagePriority?: TriagePriority;
  triageNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalTemplate {
  id: string;
  name: string;
  category: string;
  encounterType: Encounter['type'];
  defaultReason: string;
  defaultHpi: string;
  defaultRos: Record<string, string>;
  defaultPhysicalExam: Record<string, string>;
  defaultDiagnoses: DiagnosisEntry[];
  defaultPrescriptions: Omit<PrescriptionOrder, 'id'>[];
  defaultLabOrders: string[];
  defaultInstructions: string;
  defaultFollowUp: string;
}
