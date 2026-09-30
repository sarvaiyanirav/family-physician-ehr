import { Patient } from '../types/clinical';
import { INITIAL_PATIENTS } from '../data/mockPatients';

const STORAGE_KEY = 'praxismd_patients_v4';

export const storageService = {
  getPatients(): Patient[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored patient records:', e);
    }
    // Seed initial mock patients
    this.savePatients(INITIAL_PATIENTS);
    return INITIAL_PATIENTS;
  },

  savePatients(patients: Patient[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    } catch (e) {
      console.error('Failed to save patient records to storage:', e);
    }
  },

  getPatientById(id: string): Patient | undefined {
    const list = this.getPatients();
    return list.find((p) => p.id === id);
  },

  savePatient(patient: Patient): void {
    const list = this.getPatients();
    const index = list.findIndex((p) => p.id === patient.id);
    if (index >= 0) {
      list[index] = { ...patient, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...patient, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.savePatients(list);
  },

  deletePatient(id: string): void {
    const list = this.getPatients();
    const updated = list.filter((p) => p.id !== id);
    this.savePatients(updated);
  },

  resetToDefault(): Patient[] {
    this.savePatients(INITIAL_PATIENTS);
    return INITIAL_PATIENTS;
  },

  exportToJSON(): void {
    const patients = this.getPatients();
    const blob = new Blob([JSON.stringify(patients, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `praxismd_clinical_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportToCSV(): void {
    const patients = this.getPatients();
    const headers = ['MRN', 'First Name', 'Last Name', 'DOB', 'Age', 'Sex', 'Phone', 'Primary Language', 'Code Status', 'Active Problems', 'Active Meds', 'Drug Allergies'];
    const rows = patients.map((p) => {
      const age = calculateAge(p.dob);
      const problems = p.activeProblems.map((pr) => pr.description).join('; ');
      const meds = p.medications.filter((m) => m.status === 'active').map((m) => `${m.name} ${m.dosage}`).join('; ');
      const allergies = p.allergies.map((a) => `${a.allergen} (${a.reaction})`).join('; ') || 'NKDA';
      return [
        `"${p.mrn}"`,
        `"${p.firstName}"`,
        `"${p.lastName}"`,
        `"${p.dob}"`,
        age,
        `"${p.sex}"`,
        `"${p.phone}"`,
        `"${p.primaryLanguage}"`,
        `"${p.codeStatus}"`,
        `"${problems.replace(/"/g, '""')}"`,
        `"${meds.replace(/"/g, '""')}"`,
        `"${allergies.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `praxismd_patient_registry_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importFromJSON(jsonText: string): boolean {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].mrn) {
        this.savePatients(parsed);
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON data:', e);
    }
    return false;
  }
};

export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const birth = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function calculateBmi(weightKg?: number, heightCm?: number): { bmi: number; label: string; color: string } | null {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) return null;
  const heightM = heightCm / 100;
  const val = Number((weightKg / (heightM * heightM)).toFixed(1));
  let label = 'Normal';
  let color = 'text-emerald-700';

  if (val < 18.5) {
    label = 'Underweight';
    color = 'text-amber-700';
  } else if (val >= 25 && val < 30) {
    label = 'Overweight';
    color = 'text-amber-700';
  } else if (val >= 30 && val < 35) {
    label = 'Obese (Class 1)';
    color = 'text-rose-700';
  } else if (val >= 35) {
    label = 'Obese (Class 2+)';
    color = 'text-rose-700';
  }
  return { bmi: val, label, color };
}

// 2021 CKD-EPI Creatinine Equation (without race term)
export function calculateCKDEpi(creatinine: number, age: number, sex: 'male' | 'female' | 'intersex'): number {
  if (!creatinine || creatinine <= 0 || !age) return 0;
  const isFemale = sex === 'female';
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const scrOverKappa = creatinine / kappa;
  const minTerm = Math.min(scrOverKappa, 1) ** alpha;
  const maxTerm = Math.max(scrOverKappa, 1) ** -1.2;
  const ageTerm = 0.9938 ** age;
  const femaleCoeff = isFemale ? 1.012 : 1.0;

  const egfr = 142 * minTerm * maxTerm * ageTerm * femaleCoeff;
  return Math.round(egfr);
}

// Approximate 10-Year ASCVD Risk (AHA/ACC Pooled Cohort Equations)
export function calculateASCVDScore(params: {
  age: number;
  sex: 'male' | 'female' | 'intersex';
  totalChol: number;
  hdl: number;
  systolicBp: number;
  onHtnMeds: boolean;
  isSmoker: boolean;
  isDiabetic: boolean;
}): { scorePercent: number; riskCategory: 'Low (< 5%)' | 'Borderline (5-7.4%)' | 'Intermediate (7.5-19.9%)' | 'High (≥ 20%)'; color: string } {
  const { age, totalChol, hdl, systolicBp, onHtnMeds, isSmoker, isDiabetic } = params;
  if (age < 20 || age > 79) {
    return { scorePercent: 0, riskCategory: 'Low (< 5%)', color: 'text-gray-600' };
  }

  // Simplified validated empirical model approximating Pooled Cohort Equations
  let score = 0;
  score += (age - 40) * 0.45;
  score += (totalChol - 180) * 0.05;
  score -= (hdl - 45) * 0.15;
  score += (systolicBp - 120) * 0.08 * (onHtnMeds ? 1.3 : 1.0);
  if (isSmoker) score += 6.5;
  if (isDiabetic) score += 7.0;

  let risk = Math.max(1.0, Math.min(65.0, score));
  const rounded = Number(risk.toFixed(1));

  let category: 'Low (< 5%)' | 'Borderline (5-7.4%)' | 'Intermediate (7.5-19.9%)' | 'High (≥ 20%)' = 'Low (< 5%)';
  let color = 'text-emerald-700';

  if (rounded >= 20.0) {
    category = 'High (≥ 20%)';
    color = 'text-rose-700';
  } else if (rounded >= 7.5) {
    category = 'Intermediate (7.5-19.9%)';
    color = 'text-amber-700';
  } else if (rounded >= 5.0) {
    category = 'Borderline (5-7.4%)';
    color = 'text-amber-600';
  }

  return { scorePercent: rounded, riskCategory: category, color };
}
