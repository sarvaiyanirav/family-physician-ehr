import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from '../services/storageService';
import { Patient } from '../types/clinical';

describe('Storage Service & Patient Repository', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStore[key] || null,
      setItem: (key: string, val: string) => {
        mockStore[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
    });
  });

  it('initializes and returns default verified patients when storage is empty', () => {
    const list = storageService.getPatients();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty('mrn');
    expect(list[0]).toHaveProperty('firstName');
    expect(list[0]).toHaveProperty('lastName');
  });

  it('saves an updated patient with an updated timestamp', () => {
    const patients = storageService.getPatients();
    const target = { ...patients[0], firstName: 'UpdatedName', triagePriority: 'emergency' as const };

    storageService.savePatient(target);

    const reloaded = storageService.getPatientById(target.id);
    expect(reloaded).toBeDefined();
    expect(reloaded?.firstName).toBe('UpdatedName');
    expect(reloaded?.triagePriority).toBe('emergency');
    expect(reloaded?.updatedAt).toBeDefined();
  });

  it('adds a new patient when saving with an unknown ID', () => {
    const initialCount = storageService.getPatients().length;
    const newPatient: Patient = {
      id: 'test-new-pat-999',
      mrn: 'MRN-999999',
      healthCardNumber: 'HC-9999-999',
      firstName: 'Alice',
      lastName: 'Wonderland',
      dob: '1995-03-20',
      sex: 'female',
      phone: '555-0199',
      email: 'alice@example.com',
      address: { street: '123 Test St', city: 'Seattle', state: 'WA', zip: '98101' },
      emergencyContact: { name: 'Bob', relationship: 'Spouse', phone: '555-0198' },
      primaryLanguage: 'English',
      needsInterpreter: false,
      primaryPhysician: 'Dr. Sarah Lin, MD',
      clinicLocation: 'Cascade Family Practice',
      codeStatus: 'Full Code',
      allergies: [],
      activeProblems: [],
      pastMedicalHistory: [],
      pastSurgicalHistory: [],
      familyHistory: [],
      preventiveScreenings: [],
      socialHistory: {
        smokingStatus: 'never',
        alcoholUse: 'none',
        recreationalDrugs: 'none',
        occupation: 'Engineer',
        livingArrangement: 'Independent',
        exerciseRoutine: 'Moderate',
        dietaryHabits: 'Balanced',
      },
      medications: [],
      immunizations: [],
      encounters: [],
      labResults: [],
      hospitalizations: [],
      clinicalAlerts: [],
      visitStatus: 'waiting',
      triagePriority: 'urgent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.savePatient(newPatient);

    const updatedList = storageService.getPatients();
    expect(updatedList.length).toBe(initialCount + 1);
    expect(storageService.getPatientById('test-new-pat-999')?.lastName).toBe('Wonderland');
  });

  it('deletes a patient record by ID', () => {
    const patients = storageService.getPatients();
    const idToDelete = patients[0].id;
    const initialCount = patients.length;

    storageService.deletePatient(idToDelete);

    const remaining = storageService.getPatients();
    expect(remaining.length).toBe(initialCount - 1);
    expect(storageService.getPatientById(idToDelete)).toBeUndefined();
  });

  it('resets repository to default cohort data', () => {
    storageService.deletePatient(storageService.getPatients()[0].id);
    const restored = storageService.resetToDefault();
    expect(restored.length).toBeGreaterThan(3);
  });

  it('imports valid JSON patient lists', () => {
    const validJson = JSON.stringify([
      {
        id: 'pat-import-1',
        mrn: 'MRN-IMP-101',
        firstName: 'Imported',
        lastName: 'Patient',
      },
    ]);

    const success = storageService.importFromJSON(validJson);
    expect(success).toBe(true);

    const patients = storageService.getPatients();
    expect(patients[0].mrn).toBe('MRN-IMP-101');
  });

  it('rejects invalid or malformed JSON payloads', () => {
    expect(storageService.importFromJSON('bad json {{{')).toBe(false);
    expect(storageService.importFromJSON('[]')).toBe(false);
    expect(storageService.importFromJSON(JSON.stringify([{ missingMrn: true }]))).toBe(false);
  });
});
