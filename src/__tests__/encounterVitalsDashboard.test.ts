import { describe, it, expect } from 'vitest';
import {
  extractVitalsTrend,
  calculateTrendDeltas,
  extractRecentDiagnoses,
  VitalsTrendPoint,
} from '../services/encounterAnalytics';
import { Patient, Encounter } from '../types/clinical';

describe('Encounter Vitals Dashboard & Longitudinal Analytics', () => {
  const mockPatient: Patient = {
    id: 'pat-test',
    mrn: 'MRN-TEST-100',
    healthCardNumber: 'HC-100',
    firstName: 'John',
    lastName: 'Doe',
    dob: '1970-01-01',
    sex: 'male',
    phone: '555-1234',
    email: 'john@example.com',
    address: { street: '123 Main St', city: 'Town', state: 'ST', zip: '12345' },
    emergencyContact: { name: 'Jane', relationship: 'Spouse', phone: '555-4321' },
    primaryLanguage: 'English',
    needsInterpreter: false,
    codeStatus: 'Full Code',
    primaryPhysician: 'Dr. Sarah Lin, MD',
    clinicLocation: 'Cascade Family Practice',
    allergies: [],
    activeProblems: [
      {
        id: 'prb-1',
        icdCode: 'I10',
        description: 'Essential (primary) hypertension',
        status: 'active',
        onsetDate: '2020-01-01',
      },
      {
        id: 'prb-2',
        icdCode: 'E11.9',
        description: 'Type 2 diabetes mellitus without complications',
        status: 'active',
        onsetDate: '2021-06-15',
      },
      {
        id: 'prb-3',
        icdCode: 'M17.11',
        description: 'Unilateral primary osteoarthritis, right knee',
        status: 'active',
        onsetDate: '2022-03-10',
      },
    ],
    pastMedicalHistory: [],
    pastSurgicalHistory: [],
    medications: [],
    socialHistory: {
      smokingStatus: 'never',
      alcoholUse: 'none',
      recreationalDrugs: 'none',
      occupation: 'Teacher',
      livingArrangement: 'Family',
      exerciseRoutine: 'Moderate',
      dietaryHabits: 'Balanced',
    },
    familyHistory: [],
    immunizations: [],
    preventiveScreenings: [],
    encounters: [
      {
        id: 'enc-1',
        patientId: 'pat-test',
        date: '2025-05-10T10:00:00Z',
        provider: 'Dr. Sarah Lin, MD',
        type: 'routine_annual',
        reasonForVisit: 'Annual checkup',
        vitals: {
          systolicBp: 140,
          diastolicBp: 90,
          heartRate: 80,
          weightKg: 90.0,
          heightCm: 175,
          bmi: 29.4,
        },
        chiefComplaint: 'Annual checkup',
        hpi: 'Stable',
        physicalExam: {},
        assessment: {
          primaryDiagnosis: { code: 'I10', name: 'Essential (primary) hypertension', isPrimary: true },
          secondaryDiagnoses: [],
          clinicalSummary: 'BP elevated',
        },
        plan: {
          prescriptions: [],
          labOrders: [],
          imagingOrders: [],
          referrals: [],
          patientInstructions: 'Diet',
          followUpIn: '3 months',
          warningSigns: [],
        },
        status: 'signed',
      },
      {
        id: 'enc-2',
        patientId: 'pat-test',
        date: '2025-09-15T14:30:00Z',
        provider: 'Dr. Sarah Lin, MD',
        type: 'follow_up',
        reasonForVisit: 'BP follow-up',
        vitals: {
          systolicBp: 134,
          diastolicBp: 84,
          heartRate: 74,
          weightKg: 88.5,
          heightCm: 175,
          bmi: 28.9,
        },
        chiefComplaint: 'Follow-up',
        hpi: 'BP improving',
        physicalExam: {},
        assessment: {
          primaryDiagnosis: { code: 'I10', name: 'Essential (primary) hypertension', isPrimary: true },
          secondaryDiagnoses: [
            { code: 'E11.9', name: 'Type 2 diabetes mellitus without complications', isPrimary: false },
          ],
          clinicalSummary: 'Good progress',
        },
        plan: {
          prescriptions: [],
          labOrders: [],
          imagingOrders: [],
          referrals: [],
          patientInstructions: 'Continue walking',
          followUpIn: '4 months',
          warningSigns: [],
        },
        status: 'signed',
      },
    ],
    labResults: [],
    clinicalAlerts: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-09-15T14:30:00Z',
  };

  describe('extractVitalsTrend', () => {
    it('extracts chronological historical vitals in oldest-to-newest order', () => {
      const trend = extractVitalsTrend(mockPatient);
      expect(trend).toHaveLength(2);
      expect(trend[0].date).toBe('2025-05-10');
      expect(trend[0].systolic).toBe(140);
      expect(trend[0].diastolic).toBe(90);
      expect(trend[0].weightKg).toBe(90.0);

      expect(trend[1].date).toBe('2025-09-15');
      expect(trend[1].systolic).toBe(134);
      expect(trend[1].diastolic).toBe(84);
      expect(trend[1].weightKg).toBe(88.5);
    });

    it('appends current active encounter vitals as the latest point', () => {
      const currentVitals = {
        systolicBp: 128,
        diastolicBp: 80,
        heartRate: 70,
        weightKg: 87.2,
      };

      const trend = extractVitalsTrend(mockPatient, currentVitals, '2026-01-20T10:00:00Z');
      expect(trend).toHaveLength(3);
      expect(trend[2].isCurrent).toBe(true);
      expect(trend[2].systolic).toBe(128);
      expect(trend[2].diastolic).toBe(80);
      expect(trend[2].heartRate).toBe(70);
      expect(trend[2].weightKg).toBe(87.2);
    });

    it('returns empty array when patient has no encounters and no current vitals', () => {
      const emptyPatient = { ...mockPatient, encounters: [] };
      const trend = extractVitalsTrend(emptyPatient);
      expect(trend).toEqual([]);
    });
  });

  describe('calculateTrendDeltas', () => {
    it('calculates correct delta between latest and prior readings', () => {
      const points: VitalsTrendPoint[] = [
        {
          id: '1',
          date: '2025-05-10',
          displayDate: 'May 10',
          systolic: 140,
          diastolic: 90,
          heartRate: 80,
          weightKg: 90.0,
        },
        {
          id: '2',
          date: '2025-09-15',
          displayDate: 'Sep 15',
          systolic: 134,
          diastolic: 84,
          heartRate: 74,
          weightKg: 88.5,
        },
      ];

      const deltas = calculateTrendDeltas(points);
      expect(deltas.systolicDelta).toBe(-6);
      expect(deltas.diastolicDelta).toBe(-6);
      expect(deltas.heartRateDelta).toBe(-6);
      expect(deltas.weightDelta).toBe(-1.5);
      expect(deltas.summaryText).toContain('BP -6/-6 mmHg');
      expect(deltas.summaryText).toContain('Weight -1.5 kg');
    });

    it('handles single reading safely', () => {
      const points: VitalsTrendPoint[] = [
        {
          id: '1',
          date: '2025-05-10',
          displayDate: 'May 10',
          systolic: 120,
          diastolic: 80,
          heartRate: 72,
        },
      ];

      const deltas = calculateTrendDeltas(points);
      expect(deltas.systolicDelta).toBeUndefined();
      expect(deltas.summaryText).toBe('Single reading on file');
    });

    it('handles zero readings safely', () => {
      const deltas = calculateTrendDeltas([]);
      expect(deltas.summaryText).toBe('No prior vitals on file');
    });
  });

  describe('extractRecentDiagnoses', () => {
    it('aggregates and deduplicates diagnoses from encounters and active problem list', () => {
      const list = extractRecentDiagnoses(mockPatient);

      // Should contain I10, E11.9 from encounters, and M17.11 from active problems
      expect(list.length).toBe(3);

      const codes = list.map((i) => i.code);
      expect(codes).toContain('I10');
      expect(codes).toContain('E11.9');
      expect(codes).toContain('M17.11');

      // Check first item (newest encounter diagnosis)
      expect(list[0].code).toBe('I10');
      expect(list[0].type).toBe('encounter_diagnosis');
      expect(list[0].isPrimary).toBe(true);
    });

    it('marks active problems properly', () => {
      const list = extractRecentDiagnoses(mockPatient);
      const kneeProblem = list.find((i) => i.code === 'M17.11');
      expect(kneeProblem).toBeDefined();
      expect(kneeProblem?.type).toBe('active_problem');
      expect(kneeProblem?.name).toContain('osteoarthritis');
    });
  });
});
