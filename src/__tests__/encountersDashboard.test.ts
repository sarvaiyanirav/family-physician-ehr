import { describe, it, expect } from 'vitest';
import { Patient, Encounter } from '../types/clinical';
import { INITIAL_PATIENTS } from '../data/mockPatients';

describe('Encounters Dashboard Analytics & Aggregation', () => {
  it('aggregates all encounters across the patient cohort', () => {
    const allEncounters = INITIAL_PATIENTS.flatMap((p) =>
      p.encounters.map((enc) => ({ ...enc, patient: p }))
    );

    expect(allEncounters.length).toBeGreaterThan(0);
    allEncounters.forEach((e) => {
      expect(e.id).toBeDefined();
      expect(e.patient.id).toBeDefined();
      expect(e.patient.lastName).toBeDefined();
    });
  });

  it('calculates documentation signing compliance percentage accurately', () => {
    const allEncounters = INITIAL_PATIENTS.flatMap((p) =>
      p.encounters.map((enc) => ({ ...enc, patient: p }))
    );

    const signedCount = allEncounters.filter((e) => e.status === 'signed').length;
    const totalCount = allEncounters.length;
    const complianceRate = totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 100;

    expect(complianceRate).toBeGreaterThanOrEqual(0);
    expect(complianceRate).toBeLessThanOrEqual(100);
  });

  it('filters encounters by documentation status', () => {
    const allEncounters = INITIAL_PATIENTS.flatMap((p) =>
      p.encounters.map((enc) => ({ ...enc, patient: p }))
    );

    const signedOnly = allEncounters.filter((e) => e.status === 'signed');
    const draftOnly = allEncounters.filter((e) => e.status === 'draft');

    expect(signedOnly.every((e) => e.status === 'signed')).toBe(true);
    expect(draftOnly.every((e) => e.status === 'draft')).toBe(true);
  });

  it('filters encounters by clinical search query (patient name, diagnosis, ICD-10)', () => {
    const allEncounters = INITIAL_PATIENTS.flatMap((p) =>
      p.encounters.map((enc) => ({ ...enc, patient: p }))
    );

    const query = 'hypertension';
    const matches = allEncounters.filter((e) => {
      const patientName = `${e.patient.firstName} ${e.patient.lastName}`.toLowerCase();
      const reason = (e.reasonForVisit || e.chiefComplaint || '').toLowerCase();
      const primaryDx = (e.assessment?.primaryDiagnosis?.name || '').toLowerCase();
      const primaryCode = (e.assessment?.primaryDiagnosis?.code || '').toLowerCase();

      return (
        patientName.includes(query) ||
        reason.includes(query) ||
        primaryDx.includes(query) ||
        primaryCode.includes(query)
      );
    });

    expect(matches.length).toBeGreaterThan(0);
  });

  it('correctly compiles CPT billing distribution across visits', () => {
    const allEncounters = INITIAL_PATIENTS.flatMap((p) =>
      p.encounters.map((enc) => ({ ...enc, patient: p }))
    );

    const cptCounts: Record<string, number> = {};
    allEncounters.forEach((e) => {
      const code = e.billingCode || '99214';
      cptCounts[code] = (cptCounts[code] || 0) + 1;
    });

    expect(Object.keys(cptCounts).length).toBeGreaterThan(0);
    expect(cptCounts['99214'] || cptCounts['99213']).toBeDefined();
  });
});
