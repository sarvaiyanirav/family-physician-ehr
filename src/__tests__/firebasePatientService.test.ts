import { describe, it, expect, vi } from 'vitest';
import { sanitizeForFirestore } from '../services/firebasePatientService';
import { handleFirestoreError, OperationType } from '../firebase';

describe('Firebase Firestore Integration & Data Sanitization', () => {
  describe('sanitizeForFirestore', () => {
    it('removes undefined fields from flat objects', () => {
      const input = {
        name: 'John Doe',
        mrn: 'MRN-123',
        missingField: undefined,
        emptyNotes: undefined,
      };

      const cleaned = sanitizeForFirestore(input);
      expect(cleaned).toEqual({
        name: 'John Doe',
        mrn: 'MRN-123',
      });
      expect('missingField' in cleaned).toBe(false);
    });

    it('preserves valid falsy values like 0, false, null, and empty strings', () => {
      const input = {
        painScore: 0,
        needsInterpreter: false,
        notes: '',
        middleName: null,
        ignored: undefined,
      };

      const cleaned = sanitizeForFirestore(input);
      expect(cleaned).toEqual({
        painScore: 0,
        needsInterpreter: false,
        notes: '',
        middleName: null,
      });
    });

    it('recursively cleans nested objects and arrays', () => {
      const input = {
        patientId: 'pat-1',
        vitals: {
          systolicBp: 120,
          notes: undefined,
        },
        encounters: [
          {
            id: 'enc-1',
            chiefComplaint: 'Checkup',
            optionalField: undefined,
          },
        ],
      };

      const cleaned = sanitizeForFirestore(input);
      expect(cleaned).toEqual({
        patientId: 'pat-1',
        vitals: {
          systolicBp: 120,
        },
        encounters: [
          {
            id: 'enc-1',
            chiefComplaint: 'Checkup',
          },
        ],
      });
    });
  });

  describe('handleFirestoreError', () => {
    it('formats error context as a structured JSON string', () => {
      expect(() => {
        handleFirestoreError(
          new Error('Missing or insufficient permissions.'),
          OperationType.WRITE,
          'patients/pat-001'
        );
      }).toThrowError(/Missing or insufficient permissions/);
    });

    it('includes operationType and path in the thrown error JSON', () => {
      try {
        handleFirestoreError(
          new Error('Permission denied'),
          OperationType.GET,
          'patients'
        );
      } catch (err: any) {
        const parsed = JSON.parse(err.message);
        expect(parsed.operationType).toBe('get');
        expect(parsed.path).toBe('patients');
        expect(parsed.error).toContain('Permission denied');
        expect(parsed).toHaveProperty('authInfo');
      }
    });
  });
});
