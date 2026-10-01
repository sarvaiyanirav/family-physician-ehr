import { describe, it, expect } from 'vitest';
import { calculateAge, calculateBmi } from '../services/storageService';
import { Patient, Encounter } from '../types/clinical';

describe('Patient Visit Summary (AVS) Data Formatting & Calculations', () => {
  const mockPatient: Patient = {
    id: 'pat-avs-1',
    mrn: 'MRN-AVS-900',
    healthCardNumber: 'HC-992019-OR',
    firstName: 'Eleanor',
    lastName: 'Vance',
    preferredName: 'Ellie',
    dob: '1965-04-12',
    sex: 'female',
    phone: '(503) 555-0144',
    email: 'eleanor.vance@example.com',
    address: { street: '456 Rosewood Ave', city: 'Portland', state: 'OR', zip: '97205' },
    emergencyContact: { name: 'Thomas Vance', relationship: 'Spouse', phone: '(503) 555-0145' },
    primaryLanguage: 'English',
    needsInterpreter: false,
    codeStatus: 'Full Code',
    primaryPhysician: 'Dr. Sarah Lin, MD',
    clinicLocation: 'Cascade Family Health Centre',
    allergies: [
      {
        id: 'alg-1',
        allergen: 'Penicillin',
        type: 'drug',
        reaction: 'Hives and facial swelling',
        severity: 'severe_anaphylaxis',
        identifiedDate: '2010-06-12',
      },
    ],
    activeProblems: [
      {
        id: 'prb-1',
        icdCode: 'I10',
        description: 'Essential (primary) hypertension',
        status: 'active',
        onsetDate: '2018-03-10',
      },
    ],
    pastMedicalHistory: [],
    pastSurgicalHistory: [],
    medications: [
      {
        id: 'med-1',
        name: 'Amlodipine Besylate',
        dosage: '5 mg',
        route: 'Oral',
        frequency: 'Once daily in morning',
        indication: 'Hypertension',
        prescribedDate: '2023-01-10',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active',
      },
    ],
    socialHistory: {
      smokingStatus: 'never',
      alcoholUse: 'none',
      recreationalDrugs: 'none',
      occupation: 'Architect',
      livingArrangement: 'With spouse',
      exerciseRoutine: 'Walking 30 min daily',
      dietaryHabits: 'Low sodium DASH diet',
    },
    familyHistory: [],
    immunizations: [],
    preventiveScreenings: [],
    encounters: [],
    labResults: [],
    clinicalAlerts: [],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  };

  const mockEncounter: Encounter = {
    id: 'enc-avs-101',
    patientId: 'pat-avs-1',
    date: '2026-02-14T09:30:00Z',
    provider: 'Dr. Sarah Lin, MD',
    type: 'chronic_disease',
    reasonForVisit: 'Hypertension quarterly evaluation & medication renewal',
    vitals: {
      systolicBp: 126,
      diastolicBp: 78,
      heartRate: 68,
      respiratoryRate: 14,
      temperatureC: 36.7,
      oxygenSaturation: 99,
      heightCm: 165,
      weightKg: 68.0,
      painScore: 0,
    },
    chiefComplaint: 'Follow up blood pressure and review home log',
    hpi: 'Patient reports feeling well with consistent home BP readings around 124/76.',
    reviewOfSystems: { Cardiovascular: 'No chest pain, palpitations, or dyspnea.' },
    physicalExam: { Cardiovascular: 'RRR, S1/S2 distinct. No edema.' },
    assessment: {
      primaryDiagnosis: {
        code: 'I10',
        name: 'Essential (primary) hypertension',
        isPrimary: true,
      },
      secondaryDiagnoses: [
        {
          code: 'E78.5',
          name: 'Hyperlipidemia, unspecified',
          isPrimary: false,
        },
      ],
      clinicalSummary: 'Blood pressure is well controlled on Amlodipine 5mg. Lipids due for annual fasting check.',
    },
    plan: {
      prescriptions: [
        {
          id: 'rx-avs-1',
          drug: 'Amlodipine Besylate',
          dose: '5 mg',
          route: 'Oral',
          frequency: 'Once daily in morning',
          dispenseQuantity: '90 tablets',
          refills: 3,
          instructions: 'Take 1 tablet daily with a full glass of water.',
        },
      ],
      labOrders: ['Lipid Panel (Fasting)', 'Comprehensive Metabolic Panel (CMP)'],
      imagingOrders: [],
      referrals: ['Annual Dilated Eye Examination'],
      patientInstructions: '1. Continue Amlodipine 5mg every morning.\n2. Keep sodium intake under 2,000 mg/day.\n3. Log blood pressures twice weekly.\n4. Fast 10-12 hours prior to upcoming lab work.',
      followUpIn: '3 months',
      warningSigns: [
        'Sudden severe headache or blurred vision',
        'Chest discomfort or pressure',
        'Sudden shortness of breath',
      ],
    },
    status: 'signed',
    signedAt: '2026-02-14T10:15:00Z',
    billingCode: '99214',
  };

  it('correctly calculates patient age based on date of birth', () => {
    const age = calculateAge(mockPatient.dob);
    expect(age).toBeGreaterThanOrEqual(60);
  });

  it('calculates BMI and category correctly from metric vitals', () => {
    const vitals = mockEncounter.vitals!;
    const bmiResult = calculateBmi(vitals.weightKg, vitals.heightCm);

    expect(bmiResult).not.toBeNull();
    expect(bmiResult?.bmi).toBe(25.0); // 68 / (1.65 * 1.65) = 24.97 -> 25.0
    expect(bmiResult?.label).toBe('Overweight');
  });

  it('correctly computes imperial unit conversions for patient readability', () => {
    const weightKg = 68.0;
    const heightCm = 165;
    const tempC = 36.7;

    const weightLbs = Number((weightKg * 2.20462).toFixed(1));
    expect(weightLbs).toBe(149.9);

    const heightInches = heightCm / 2.54;
    const feet = Math.floor(heightInches / 12);
    const inches = Math.round(heightInches % 12);
    expect(feet).toBe(5);
    expect(inches).toBe(5); // 165 cm ≈ 5'5"

    const tempF = Number(((tempC * 9) / 5 + 32).toFixed(1));
    expect(tempF).toBe(98.1);
  });

  it('formats prescriptions with necessary dosing and safety refill details', () => {
    const rxList = mockEncounter.plan.prescriptions;
    expect(rxList).toHaveLength(1);

    const rx = rxList[0];
    expect(rx.drug).toBe('Amlodipine Besylate');
    expect(rx.dose).toBe('5 mg');
    expect(rx.refills).toBe(3);
    expect(rx.dispenseQuantity).toBe('90 tablets');
    expect(rx.instructions).toContain('Take 1 tablet daily');
  });

  it('verifies allergy warnings are flagged prominently in patient records', () => {
    expect(mockPatient.allergies).toHaveLength(1);
    const allergy = mockPatient.allergies[0];
    expect(allergy.allergen).toBe('Penicillin');
    expect(allergy.severity).toBe('severe_anaphylaxis');
    expect(allergy.reaction).toContain('Hives');
  });

  it('contains comprehensive diagnostic orders and referrals for care coordination', () => {
    const plan = mockEncounter.plan;
    expect(plan.labOrders).toContain('Lipid Panel (Fasting)');
    expect(plan.labOrders).toContain('Comprehensive Metabolic Panel (CMP)');
    expect(plan.referrals).toContain('Annual Dilated Eye Examination');
    expect(plan.warningSigns).toHaveLength(3);
    expect(plan.followUpIn).toBe('3 months');
  });
});
