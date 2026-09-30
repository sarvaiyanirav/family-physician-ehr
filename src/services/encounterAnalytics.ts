import { Patient, Encounter, Vitals } from '../types/clinical';

export interface VitalsTrendPoint {
  id: string;
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. "Jan 20" or "01/20"
  systolic: number;
  diastolic: number;
  heartRate: number;
  weightKg?: number;
  bmi?: number;
  temperatureC?: number;
  oxygenSaturation?: number;
  isCurrent?: boolean;
}

export interface RecentDiagnosisItem {
  id: string;
  code: string;
  name: string;
  date: string;
  type: 'encounter_diagnosis' | 'active_problem';
  isPrimary?: boolean;
  encounterType?: string;
  provider?: string;
}

export interface TrendDeltas {
  systolicDelta?: number;
  diastolicDelta?: number;
  weightDelta?: number;
  heartRateDelta?: number;
  summaryText: string;
}

function formatShortDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString.slice(0, 10);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return isoString.slice(0, 10);
  }
}

/**
 * Extracts chronological vitals trend points across all patient encounters,
 * optionally including the currently active encounter's vitals.
 */
export function extractVitalsTrend(
  patient: Patient,
  currentVitals?: Vitals,
  currentDate?: string
): VitalsTrendPoint[] {
  const points: VitalsTrendPoint[] = [];

  // Sort encounters chronologically (oldest to newest)
  const sortedEncounters = [...(patient.encounters || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedEncounters.forEach((enc) => {
    const v = enc.vitals;
    if (v && (v.systolicBp || v.heartRate || v.weightKg)) {
      points.push({
        id: enc.id,
        date: enc.date.slice(0, 10),
        displayDate: formatShortDate(enc.date),
        systolic: v.systolicBp || 120,
        diastolic: v.diastolicBp || 80,
        heartRate: v.heartRate || 72,
        weightKg: v.weightKg,
        bmi: v.bmi,
        temperatureC: v.temperatureC,
        oxygenSaturation: v.oxygenSaturation,
        isCurrent: false,
      });
    }
  });

  // If current encounter has valid vitals, append as the latest point
  if (
    currentVitals &&
    (currentVitals.systolicBp || currentVitals.heartRate || currentVitals.weightKg)
  ) {
    const todayStr = currentDate
      ? currentDate.slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    // If the last point is on the exact same date and encounter, update it; otherwise append
    const lastPoint = points[points.length - 1];
    if (lastPoint && lastPoint.date === todayStr && lastPoint.isCurrent) {
      lastPoint.systolic = currentVitals.systolicBp || lastPoint.systolic;
      lastPoint.diastolic = currentVitals.diastolicBp || lastPoint.diastolic;
      lastPoint.heartRate = currentVitals.heartRate || lastPoint.heartRate;
      lastPoint.weightKg = currentVitals.weightKg ?? lastPoint.weightKg;
      lastPoint.bmi = currentVitals.bmi ?? lastPoint.bmi;
    } else {
      points.push({
        id: 'current-encounter-vitals',
        date: todayStr,
        displayDate: 'Today',
        systolic: currentVitals.systolicBp || 120,
        diastolic: currentVitals.diastolicBp || 80,
        heartRate: currentVitals.heartRate || 72,
        weightKg: currentVitals.weightKg,
        bmi: currentVitals.bmi,
        temperatureC: currentVitals.temperatureC,
        oxygenSaturation: currentVitals.oxygenSaturation,
        isCurrent: true,
      });
    }
  }

  return points;
}

/**
 * Calculates comparative trend deltas between the latest and prior vitals reading.
 */
export function calculateTrendDeltas(points: VitalsTrendPoint[]): TrendDeltas {
  if (points.length < 2) {
    return {
      summaryText: points.length === 1 ? 'Single reading on file' : 'No prior vitals on file',
    };
  }

  const latest = points[points.length - 1];
  const prior = points[points.length - 2];

  const systolicDelta = latest.systolic - prior.systolic;
  const diastolicDelta = latest.diastolic - prior.diastolic;
  const heartRateDelta = latest.heartRate - prior.heartRate;
  const weightDelta =
    latest.weightKg && prior.weightKg
      ? Number((latest.weightKg - prior.weightKg).toFixed(1))
      : undefined;

  let summaryParts: string[] = [];

  if (Math.abs(systolicDelta) >= 1) {
    summaryParts.push(
      `BP ${systolicDelta > 0 ? '+' : ''}${systolicDelta}/${diastolicDelta > 0 ? '+' : ''}${diastolicDelta} mmHg`
    );
  } else {
    summaryParts.push('BP stable');
  }

  if (weightDelta !== undefined && Math.abs(weightDelta) >= 0.2) {
    summaryParts.push(`Weight ${weightDelta > 0 ? '+' : ''}${weightDelta} kg`);
  }

  if (Math.abs(heartRateDelta) >= 3) {
    summaryParts.push(`HR ${heartRateDelta > 0 ? '+' : ''}${heartRateDelta} bpm`);
  }

  return {
    systolicDelta,
    diastolicDelta,
    weightDelta,
    heartRateDelta,
    summaryText: summaryParts.join(' · ') || 'Vitals stable',
  };
}

/**
 * Extracts a deduplicated chronological summary of recent diagnoses
 * from both active problems and previous encounters.
 */
export function extractRecentDiagnoses(patient: Patient): RecentDiagnosisItem[] {
  const items: RecentDiagnosisItem[] = [];
  const seenCodes = new Set<string>();

  // 1. First add diagnoses from encounters (newest first)
  const sortedEncounters = [...(patient.encounters || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  sortedEncounters.forEach((enc) => {
    const primary = enc.assessment?.primaryDiagnosis;
    if (primary && primary.code && !seenCodes.has(primary.code)) {
      seenCodes.add(primary.code);
      items.push({
        id: `enc-dx-prim-${enc.id}-${primary.code}`,
        code: primary.code,
        name: primary.name,
        date: enc.date.slice(0, 10),
        type: 'encounter_diagnosis',
        isPrimary: true,
        encounterType: enc.type,
        provider: enc.provider,
      });
    }

    (enc.assessment?.secondaryDiagnoses || []).forEach((sec) => {
      if (sec && sec.code && !seenCodes.has(sec.code)) {
        seenCodes.add(sec.code);
        items.push({
          id: `enc-dx-sec-${enc.id}-${sec.code}`,
          code: sec.code,
          name: sec.name,
          date: enc.date.slice(0, 10),
          type: 'encounter_diagnosis',
          isPrimary: false,
          encounterType: enc.type,
          provider: enc.provider,
        });
      }
    });
  });

  // 2. Include any active problem list items not yet captured
  (patient.activeProblems || []).forEach((prob) => {
    if (prob.icdCode && !seenCodes.has(prob.icdCode)) {
      seenCodes.add(prob.icdCode);
      items.push({
        id: `prob-${prob.id}`,
        code: prob.icdCode,
        name: prob.description,
        date: prob.onsetDate || 'Established',
        type: 'active_problem',
        isPrimary: false,
      });
    }
  });

  return items;
}
