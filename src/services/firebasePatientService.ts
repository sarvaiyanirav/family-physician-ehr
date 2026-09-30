import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Patient } from '../types/clinical';
import { INITIAL_PATIENTS } from '../data/mockPatients';

const PATIENTS_COLLECTION = 'patients';

/**
 * Removes undefined fields recursively so Firestore doesn't throw invalid-argument errors.
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

export const firebasePatientService = {
  /**
   * Subscribes to real-time updates for all patients in Firestore.
   */
  subscribeToPatients(
    onSuccess: (patients: Patient[]) => void,
    onError?: (error: unknown) => void
  ): Unsubscribe {
    const colRef = collection(db, PATIENTS_COLLECTION);

    return onSnapshot(
      colRef,
      (snapshot) => {
        const patients: Patient[] = [];
        snapshot.forEach((docSnap) => {
          patients.push(docSnap.data() as Patient);
        });

        // If database is empty, seed with initial mock data
        if (patients.length === 0 && auth.currentUser) {
          this.seedInitialCohort(INITIAL_PATIENTS).catch((err) => {
            console.error('Failed to seed initial patients:', err);
          });
          onSuccess(INITIAL_PATIENTS);
          return;
        }

        onSuccess(patients);
      },
      (error) => {
        console.error('Firestore onSnapshot error:', error);
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, PATIENTS_COLLECTION);
      }
    );
  },

  /**
   * Saves or updates a patient document in Firestore.
   */
  async savePatient(patient: Patient): Promise<void> {
    const docPath = `${PATIENTS_COLLECTION}/${patient.id}`;
    try {
      const sanitized = sanitizeForFirestore({
        ...patient,
        updatedAt: new Date().toISOString(),
      });
      const docRef = doc(db, PATIENTS_COLLECTION, patient.id);
      await setDoc(docRef, sanitized, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },

  /**
   * Deletes a patient document from Firestore.
   */
  async deletePatient(patientId: string): Promise<void> {
    const docPath = `${PATIENTS_COLLECTION}/${patientId}`;
    try {
      const docRef = doc(db, PATIENTS_COLLECTION, patientId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  },

  /**
   * Seeds default patient cohort using a Firestore batch write.
   */
  async seedInitialCohort(patients: Patient[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      patients.forEach((p) => {
        const docRef = doc(db, PATIENTS_COLLECTION, p.id);
        batch.set(docRef, sanitizeForFirestore(p), { merge: true });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, PATIENTS_COLLECTION);
    }
  },

  /**
   * One-time fetch of all patients from Firestore.
   */
  async getPatientsOnce(): Promise<Patient[]> {
    try {
      const colRef = collection(db, PATIENTS_COLLECTION);
      const snapshot = await getDocs(colRef);
      const list: Patient[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Patient);
      });
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, PATIENTS_COLLECTION);
    }
  },
};
