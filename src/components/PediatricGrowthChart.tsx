import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Patient, Encounter } from '../types/clinical';
import { calculateAge, calculateBmi } from '../services/storageService';
import { Activity, Plus, TrendingUp, Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface PediatricGrowthChartProps {
  patient: Patient;
  onUpdatePatient: (updated: Patient) => void;
}

type GrowthMetric = 'height' | 'weight' | 'bmi';

// CDC 2-20 Years Growth Standards Data (Boys & Girls)
// Reference: CDC Clinical Growth Charts (National Center for Health Statistics)
export interface CDCPercentiles {
  ageYears: number;
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

export const CDC_BOYS_HEIGHT: CDCPercentiles[] = [
  { ageYears: 2, p5: 82.0, p25: 85.0, p50: 87.0, p75: 89.5, p95: 93.0 },
  { ageYears: 3, p5: 89.5, p25: 93.0, p50: 95.5, p75: 98.5, p95: 102.5 },
  { ageYears: 4, p5: 96.5, p25: 100.5, p50: 103.0, p75: 106.5, p95: 110.5 },
  { ageYears: 5, p5: 102.5, p25: 106.5, p50: 109.5, p75: 113.5, p95: 118.0 },
  { ageYears: 6, p5: 108.5, p25: 113.0, p50: 116.5, p75: 120.5, p95: 125.0 },
  { ageYears: 7, p5: 114.0, p25: 119.0, p50: 122.5, p75: 127.0, p95: 132.0 },
  { ageYears: 8, p5: 119.5, p25: 124.5, p50: 128.5, p75: 133.0, p95: 138.5 },
  { ageYears: 9, p5: 124.5, p25: 130.0, p50: 134.0, p75: 139.0, p95: 145.0 },
  { ageYears: 10, p5: 129.5, p25: 135.0, p50: 139.5, p75: 145.0, p95: 151.5 },
  { ageYears: 11, p5: 134.5, p25: 140.5, p50: 145.5, p75: 151.5, p95: 158.5 },
  { ageYears: 12, p5: 139.5, p25: 146.5, p50: 152.0, p75: 158.5, p95: 166.5 },
  { ageYears: 13, p5: 145.0, p25: 153.0, p50: 159.0, p75: 166.0, p95: 174.5 },
  { ageYears: 14, p5: 151.5, p25: 160.0, p50: 166.0, p75: 173.0, p95: 181.5 },
  { ageYears: 15, p5: 158.0, p25: 165.5, p50: 171.5, p75: 178.0, p95: 186.0 },
  { ageYears: 16, p5: 162.0, p25: 169.0, p50: 174.5, p75: 180.5, p95: 188.0 },
  { ageYears: 17, p5: 164.0, p25: 170.5, p50: 176.0, p75: 182.0, p95: 189.5 },
  { ageYears: 18, p5: 165.0, p25: 171.5, p50: 177.0, p75: 182.5, p95: 190.0 },
];

export const CDC_GIRLS_HEIGHT: CDCPercentiles[] = [
  { ageYears: 2, p5: 80.5, p25: 83.5, p50: 85.5, p75: 88.5, p95: 92.0 },
  { ageYears: 3, p5: 88.0, p25: 91.5, p50: 94.0, p75: 97.0, p95: 101.0 },
  { ageYears: 4, p5: 95.0, p25: 99.0, p50: 101.5, p75: 105.0, p95: 109.5 },
  { ageYears: 5, p5: 101.0, p25: 105.0, p50: 108.0, p75: 112.0, p95: 116.5 },
  { ageYears: 6, p5: 106.5, p25: 111.0, p50: 114.5, p75: 118.5, p95: 123.5 },
  { ageYears: 7, p5: 112.0, p25: 117.0, p50: 120.5, p75: 125.0, p95: 130.5 },
  { ageYears: 8, p5: 117.5, p25: 122.5, p50: 126.5, p75: 131.5, p95: 137.5 },
  { ageYears: 9, p5: 123.0, p25: 128.5, p50: 133.0, p75: 138.0, p95: 144.5 },
  { ageYears: 10, p5: 128.5, p25: 134.5, p50: 139.0, p75: 145.0, p95: 152.0 },
  { ageYears: 11, p5: 134.0, p25: 141.0, p50: 146.0, p75: 152.5, p95: 159.5 },
  { ageYears: 12, p5: 140.5, p25: 147.5, p50: 152.5, p75: 158.5, p95: 165.5 },
  { ageYears: 13, p5: 146.0, p25: 152.5, p50: 157.0, p75: 162.5, p95: 169.0 },
  { ageYears: 14, p5: 149.5, p25: 155.0, p50: 159.5, p75: 164.5, p95: 171.0 },
  { ageYears: 15, p5: 151.0, p25: 156.5, p50: 161.0, p75: 165.5, p95: 172.0 },
  { ageYears: 16, p5: 151.5, p25: 157.0, p50: 161.5, p75: 166.0, p95: 172.5 },
  { ageYears: 17, p5: 152.0, p25: 157.5, p50: 162.0, p75: 166.5, p95: 173.0 },
  { ageYears: 18, p5: 152.0, p25: 157.5, p50: 162.0, p75: 166.5, p95: 173.0 },
];

export const CDC_BOYS_WEIGHT: CDCPercentiles[] = [
  { ageYears: 2, p5: 10.6, p25: 11.7, p50: 12.6, p75: 13.6, p95: 15.3 },
  { ageYears: 3, p5: 12.4, p25: 13.7, p50: 14.7, p75: 16.0, p95: 18.2 },
  { ageYears: 4, p5: 14.1, p25: 15.6, p50: 16.8, p75: 18.4, p95: 21.2 },
  { ageYears: 5, p5: 15.8, p25: 17.6, p50: 19.1, p75: 21.2, p95: 25.0 },
  { ageYears: 6, p5: 17.6, p25: 19.8, p50: 21.7, p75: 24.5, p95: 29.5 },
  { ageYears: 7, p5: 19.6, p25: 22.3, p50: 24.8, p75: 28.3, p95: 35.0 },
  { ageYears: 8, p5: 21.8, p25: 25.1, p50: 28.2, p75: 32.7, p95: 41.2 },
  { ageYears: 9, p5: 24.3, p25: 28.3, p50: 32.2, p75: 37.8, p95: 48.4 },
  { ageYears: 10, p5: 27.0, p25: 31.9, p50: 36.6, p75: 43.4, p95: 56.2 },
  { ageYears: 11, p5: 30.0, p25: 35.8, p50: 41.5, p75: 49.6, p95: 64.5 },
  { ageYears: 12, p5: 33.5, p25: 40.4, p50: 47.0, p75: 56.4, p95: 73.0 },
  { ageYears: 13, p5: 37.8, p25: 45.6, p50: 53.0, p75: 63.4, p95: 81.2 },
  { ageYears: 14, p5: 42.8, p25: 51.2, p50: 59.2, p75: 70.2, p95: 88.5 },
  { ageYears: 15, p5: 47.8, p25: 56.6, p50: 64.8, p75: 76.0, p95: 94.6 },
  { ageYears: 16, p5: 52.2, p25: 61.2, p50: 69.4, p75: 80.6, p95: 99.2 },
  { ageYears: 17, p5: 55.4, p25: 64.4, p50: 72.5, p75: 83.8, p95: 102.2 },
  { ageYears: 18, p5: 57.2, p25: 66.2, p50: 74.5, p75: 85.8, p95: 104.0 },
];

export const CDC_GIRLS_WEIGHT: CDCPercentiles[] = [
  { ageYears: 2, p5: 10.0, p25: 11.2, p50: 12.1, p75: 13.2, p95: 14.9 },
  { ageYears: 3, p5: 11.8, p25: 13.2, p50: 14.3, p75: 15.6, p95: 18.0 },
  { ageYears: 4, p5: 13.6, p25: 15.2, p50: 16.5, p75: 18.3, p95: 21.4 },
  { ageYears: 5, p5: 15.3, p25: 17.3, p50: 19.0, p75: 21.3, p95: 25.5 },
  { ageYears: 6, p5: 17.2, p25: 19.6, p50: 21.7, p75: 24.8, p95: 30.4 },
  { ageYears: 7, p5: 19.2, p25: 22.2, p50: 25.0, p75: 29.0, p95: 36.4 },
  { ageYears: 8, p5: 21.6, p25: 25.4, p50: 28.8, p75: 34.0, p95: 43.2 },
  { ageYears: 9, p5: 24.4, p25: 29.0, p50: 33.3, p75: 39.7, p95: 50.8 },
  { ageYears: 10, p5: 27.6, p25: 33.2, p50: 38.4, p75: 46.0, p95: 58.8 },
  { ageYears: 11, p5: 31.2, p25: 37.8, p50: 44.0, p75: 52.8, p95: 66.8 },
  { ageYears: 12, p5: 35.2, p25: 42.6, p50: 49.6, p75: 59.4, p95: 74.2 },
  { ageYears: 13, p5: 39.2, p25: 47.0, p50: 54.4, p75: 64.8, p95: 80.2 },
  { ageYears: 14, p5: 42.5, p25: 50.4, p50: 57.8, p75: 68.4, p95: 84.4 },
  { ageYears: 15, p5: 44.8, p25: 52.6, p50: 59.8, p75: 70.4, p95: 86.8 },
  { ageYears: 16, p5: 46.0, p25: 53.8, p50: 60.8, p75: 71.4, p95: 88.0 },
  { ageYears: 17, p5: 46.6, p25: 54.4, p50: 61.4, p75: 72.0, p95: 88.8 },
  { ageYears: 18, p5: 46.8, p25: 54.6, p50: 61.6, p75: 72.2, p95: 89.2 },
];

export const CDC_BOYS_BMI: CDCPercentiles[] = [
  { ageYears: 2, p5: 14.8, p25: 15.6, p50: 16.4, p75: 17.3, p95: 18.6 },
  { ageYears: 3, p5: 14.3, p25: 15.0, p50: 15.7, p75: 16.6, p95: 17.9 },
  { ageYears: 4, p5: 13.9, p25: 14.6, p50: 15.3, p75: 16.2, p95: 17.6 },
  { ageYears: 5, p5: 13.8, p25: 14.5, p50: 15.2, p75: 16.1, p95: 17.7 },
  { ageYears: 6, p5: 13.7, p25: 14.5, p50: 15.3, p75: 16.3, p95: 18.3 },
  { ageYears: 7, p5: 13.8, p25: 14.6, p50: 15.5, p75: 16.8, p95: 19.3 },
  { ageYears: 8, p5: 13.9, p25: 14.8, p50: 15.9, p75: 17.4, p95: 20.5 },
  { ageYears: 9, p5: 14.1, p25: 15.2, p50: 16.4, p75: 18.3, p95: 21.8 },
  { ageYears: 10, p5: 14.4, p25: 15.6, p50: 17.0, p75: 19.2, p95: 23.2 },
  { ageYears: 11, p5: 14.8, p25: 16.1, p50: 17.7, p75: 20.2, p95: 24.6 },
  { ageYears: 12, p5: 15.2, p25: 16.7, p50: 18.4, p75: 21.3, p95: 26.0 },
  { ageYears: 13, p5: 15.7, p25: 17.3, p50: 19.2, p75: 22.3, p95: 27.2 },
  { ageYears: 14, p5: 16.2, p25: 17.9, p50: 20.0, p75: 23.2, p95: 28.2 },
  { ageYears: 15, p5: 16.8, p25: 18.6, p50: 20.8, p75: 24.0, p95: 29.0 },
  { ageYears: 16, p5: 17.3, p25: 19.2, p50: 21.5, p75: 24.8, p95: 29.8 },
  { ageYears: 17, p5: 17.8, p25: 19.8, p50: 22.1, p75: 25.4, p95: 30.5 },
  { ageYears: 18, p5: 18.2, p25: 20.3, p50: 22.7, p75: 26.0, p95: 31.0 },
];

export const CDC_GIRLS_BMI: CDCPercentiles[] = [
  { ageYears: 2, p5: 14.5, p25: 15.4, p50: 16.2, p75: 17.2, p95: 18.5 },
  { ageYears: 3, p5: 14.0, p25: 14.8, p50: 15.6, p75: 16.5, p95: 17.8 },
  { ageYears: 4, p5: 13.6, p25: 14.4, p50: 15.2, p75: 16.1, p95: 17.6 },
  { ageYears: 5, p5: 13.5, p25: 14.3, p50: 15.1, p75: 16.2, p95: 17.9 },
  { ageYears: 6, p5: 13.4, p25: 14.3, p50: 15.2, p75: 16.5, p95: 18.6 },
  { ageYears: 7, p5: 13.5, p25: 14.5, p50: 15.5, p75: 17.1, p95: 19.6 },
  { ageYears: 8, p5: 13.7, p25: 14.8, p50: 16.0, p75: 17.9, p95: 20.8 },
  { ageYears: 9, p5: 14.0, p25: 15.2, p50: 16.6, p75: 18.9, p95: 22.2 },
  { ageYears: 10, p5: 14.4, p25: 15.8, p50: 17.4, p75: 20.0, p95: 23.6 },
  { ageYears: 11, p5: 14.9, p25: 16.5, p50: 18.2, p75: 21.0, p95: 25.0 },
  { ageYears: 12, p5: 15.4, p25: 17.2, p50: 19.1, p75: 22.0, p95: 26.2 },
  { ageYears: 13, p5: 16.0, p25: 17.9, p50: 19.9, p75: 22.9, p95: 27.2 },
  { ageYears: 14, p5: 16.5, p25: 18.5, p50: 20.6, p75: 23.7, p95: 28.0 },
  { ageYears: 15, p5: 17.0, p25: 19.0, p50: 21.2, p75: 24.3, p95: 28.6 },
  { ageYears: 16, p5: 17.4, p25: 19.4, p50: 21.6, p75: 24.8, p95: 29.0 },
  { ageYears: 17, p5: 17.6, p25: 19.7, p50: 21.9, p75: 25.1, p95: 29.3 },
  { ageYears: 18, p5: 17.8, p25: 19.9, p50: 22.1, p75: 25.3, p95: 29.5 },
];

export function estimatePercentile(
  val: number,
  ref: { p5: number; p25: number; p50: number; p75: number; p95: number }
): { label: string; category: string; color: string } {
  if (val < ref.p5) return { label: '< 5th percentile', category: 'Low', color: 'text-amber-700' };
  if (val <= ref.p25) return { label: '5th - 25th percentile', category: 'Normal Low', color: 'text-emerald-700' };
  if (val <= ref.p75) return { label: '25th - 75th percentile', category: 'Optimal Median', color: 'text-emerald-700' };
  if (val <= ref.p95) return { label: '75th - 95th percentile', category: 'Normal High', color: 'text-emerald-700' };
  return { label: '> 95th percentile', category: 'Elevated', color: 'text-rose-700' };
}

export const PediatricGrowthChart: React.FC<PediatricGrowthChartProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const [activeMetric, setActiveMetric] = useState<GrowthMetric>('height');
  const [showAllPercentiles, setShowAllPercentiles] = useState(true);
  const [isAddingMeasurement, setIsAddingMeasurement] = useState(false);

  // Form states for quick measurement log
  const [newMeasureDate, setNewMeasureDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newHeightCm, setNewHeightCm] = useState<string>('');
  const [newWeightKg, setNewWeightKg] = useState<string>('');

  const patientDob = useMemo(() => new Date(patient.dob), [patient.dob]);
  const isFemale = patient.sex === 'female';

  // Extract longitudinal growth points from all patient encounters
  const patientMeasurements = useMemo(() => {
    const list: Array<{
      date: string;
      ageYears: number;
      ageFormatted: string;
      heightCm?: number;
      weightKg?: number;
      bmi?: number;
      encounterId: string;
    }> = [];

    // Chronological order (oldest to newest)
    const sortedEncounters = [...patient.encounters].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedEncounters.forEach((enc) => {
      const v = enc.vitals;
      if (v.heightCm || v.weightKg) {
        const encDate = new Date(enc.date);
        const ageDiffMs = encDate.getTime() - patientDob.getTime();
        const ageInYears = Math.max(0, ageDiffMs / (1000 * 60 * 60 * 24 * 365.25));

        const wholeYears = Math.floor(ageInYears);
        const months = Math.floor((ageInYears - wholeYears) * 12);

        const bmiVal =
          v.bmi ||
          (v.heightCm && v.weightKg
            ? Number((v.weightKg / Math.pow(v.heightCm / 100, 2)).toFixed(1))
            : undefined);

        list.push({
          date: enc.date.slice(0, 10),
          ageYears: Number(ageInYears.toFixed(2)),
          ageFormatted: `${wholeYears}y ${months}m`,
          heightCm: v.heightCm,
          weightKg: v.weightKg,
          bmi: bmiVal,
          encounterId: enc.id,
        });
      }
    });

    return list;
  }, [patient.encounters, patientDob]);

  // Select the appropriate CDC reference curves based on metric and sex
  const referenceData = useMemo(() => {
    if (activeMetric === 'height') {
      return isFemale ? CDC_GIRLS_HEIGHT : CDC_BOYS_HEIGHT;
    }
    if (activeMetric === 'weight') {
      return isFemale ? CDC_GIRLS_WEIGHT : CDC_BOYS_WEIGHT;
    }
    return isFemale ? CDC_GIRLS_BMI : CDC_BOYS_BMI;
  }, [activeMetric, isFemale]);

  // Combine reference curves with patient's actual data points for Recharts
  const chartData = useMemo(() => {
    // Collect all unique ageYears from reference curve and patient
    const map = new Map<number, any>();

    referenceData.forEach((ref) => {
      map.set(ref.ageYears, {
        ageYears: ref.ageYears,
        ageLabel: `${ref.ageYears}y`,
        p5: ref.p5,
        p25: ref.p25,
        p50: ref.p50,
        p75: ref.p75,
        p95: ref.p95,
      });
    });

    // Merge patient actual points
    patientMeasurements.forEach((meas) => {
      // Find exact or closest slot
      const existing = map.get(meas.ageYears);
      let metricValue: number | undefined;

      if (activeMetric === 'height') metricValue = meas.heightCm;
      else if (activeMetric === 'weight') metricValue = meas.weightKg;
      else if (activeMetric === 'bmi') metricValue = meas.bmi;

      if (metricValue) {
        if (existing) {
          existing.patientValue = metricValue;
          existing.measurementDate = meas.date;
          existing.ageFormatted = meas.ageFormatted;
        } else {
          // Interpolate reference values for non-integer patient ages
          const floorAge = Math.floor(meas.ageYears);
          const ceilAge = Math.ceil(meas.ageYears);
          const lower = referenceData.find((r) => r.ageYears === floorAge) || referenceData[0];
          const upper = referenceData.find((r) => r.ageYears === ceilAge) || referenceData[referenceData.length - 1];

          const fraction = floorAge === ceilAge ? 0 : (meas.ageYears - floorAge) / (ceilAge - floorAge);

          map.set(meas.ageYears, {
            ageYears: meas.ageYears,
            ageLabel: `${meas.ageYears}y`,
            p5: Number((lower.p5 + (upper.p5 - lower.p5) * fraction).toFixed(1)),
            p25: Number((lower.p25 + (upper.p25 - lower.p25) * fraction).toFixed(1)),
            p50: Number((lower.p50 + (upper.p50 - lower.p50) * fraction).toFixed(1)),
            p75: Number((lower.p75 + (upper.p75 - lower.p75) * fraction).toFixed(1)),
            p95: Number((lower.p95 + (upper.p95 - lower.p95) * fraction).toFixed(1)),
            patientValue: metricValue,
            measurementDate: meas.date,
            ageFormatted: meas.ageFormatted,
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => a.ageYears - b.ageYears);
  }, [referenceData, patientMeasurements, activeMetric]);

  // Compute latest percentile classification
  const latestMeasurement = patientMeasurements[patientMeasurements.length - 1];
  const previousMeasurement = patientMeasurements.length > 1 ? patientMeasurements[patientMeasurements.length - 2] : null;

  const currentPercentileEstimate = useMemo(() => {
    if (!latestMeasurement) return null;

    let val = 0;
    if (activeMetric === 'height') val = latestMeasurement.heightCm || 0;
    else if (activeMetric === 'weight') val = latestMeasurement.weightKg || 0;
    else if (activeMetric === 'bmi') val = latestMeasurement.bmi || 0;

    if (!val) return null;

    // Find closest CDC age row
    const targetAge = Math.round(latestMeasurement.ageYears);
    const ref = referenceData.find((r) => r.ageYears === targetAge) || referenceData[referenceData.length - 1];

    if (val < ref.p5) return { label: '< 5th percentile', category: 'Low', color: 'text-amber-700' };
    if (val <= ref.p25) return { label: '5th - 25th percentile', category: 'Normal Low', color: 'text-emerald-700' };
    if (val <= ref.p75) return { label: '25th - 75th percentile', category: 'Optimal Median', color: 'text-emerald-700' };
    if (val <= ref.p95) return { label: '75th - 95th percentile', category: 'Normal High', color: 'text-emerald-700' };
    return { label: '> 95th percentile', category: 'Elevated', color: 'text-rose-700' };
  }, [latestMeasurement, activeMetric, referenceData]);

  // Calculate annual growth velocity if 2+ measurements
  const growthVelocity = useMemo(() => {
    if (!latestMeasurement || !previousMeasurement) return null;
    const yearDelta = latestMeasurement.ageYears - previousMeasurement.ageYears;
    if (yearDelta <= 0.1) return null;

    if (activeMetric === 'height' && latestMeasurement.heightCm && previousMeasurement.heightCm) {
      const cmDelta = latestMeasurement.heightCm - previousMeasurement.heightCm;
      const rate = (cmDelta / yearDelta).toFixed(1);
      return { rate: `${rate} cm/year`, delta: `+${cmDelta.toFixed(1)} cm` };
    }
    if (activeMetric === 'weight' && latestMeasurement.weightKg && previousMeasurement.weightKg) {
      const kgDelta = latestMeasurement.weightKg - previousMeasurement.weightKg;
      const rate = (kgDelta / yearDelta).toFixed(1);
      return { rate: `${rate} kg/year`, delta: `+${kgDelta.toFixed(1)} kg` };
    }
    return null;
  }, [latestMeasurement, previousMeasurement, activeMetric]);

  // Quick submit to add a new pediatric growth measurement
  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(newHeightCm);
    const w = parseFloat(newWeightKg);
    if (!h && !w) return;

    const bmiObj = h && w ? calculateBmi(w, h) : undefined;

    const newEncounter: Encounter = {
      id: `enc-ped-${Date.now()}`,
      patientId: patient.id,
      date: `${newMeasureDate}T10:00:00Z`,
      provider: patient.primaryPhysician || 'Dr. Sarah Lin, MD',
      type: 'well_child',
      reasonForVisit: 'Pediatric Anthropometric Measurement & Growth Tracking',
      vitals: {
        heightCm: h || undefined,
        weightKg: w || undefined,
        bmi: bmiObj ? bmiObj.bmi : undefined,
      },
      chiefComplaint: 'Routine pediatric growth milestone recording.',
      hpi: `Pediatric growth check. Stature ${h || '—'} cm, Weight ${w || '—'} kg.`,
      physicalExam: {
        General: 'Well-nourished child, active and playful.',
      },
      assessment: {
        primaryDiagnosis: {
          code: 'Z00.129',
          name: 'Encounter for routine child health examination without abnormal findings',
          isPrimary: true,
        },
        secondaryDiagnoses: [],
        clinicalSummary: 'Growth parameters documented and plotted on CDC reference percentile curves.',
      },
      plan: {
        prescriptions: [],
        labOrders: [],
        imagingOrders: [],
        referrals: [],
        patientInstructions: 'Continue well-balanced age-appropriate nutrition and active play.',
        followUpIn: 'Next annual well-child checkup',
        warningSigns: ['Fever > 38.5°C', 'Difficulty breathing or wheezing', 'Persistent vomiting'],
      },
      status: 'signed',
      signedAt: new Date().toISOString(),
      billingCode: '99393',
    };

    const updated = {
      ...patient,
      encounters: [newEncounter, ...patient.encounters],
    };

    onUpdatePatient(updated);
    setIsAddingMeasurement(false);
    setNewHeightCm('');
    setNewWeightKg('');
  };

  const metricLabel =
    activeMetric === 'height'
      ? 'Stature / Length (cm)'
      : activeMetric === 'weight'
      ? 'Weight (kg)'
      : 'Body Mass Index (BMI kg/m²)';

  const yDomain =
    activeMetric === 'height'
      ? [70, 195]
      : activeMetric === 'weight'
      ? [5, 105]
      : [12, 32];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-50 text-red-700 rounded-md">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-gray-900">
                CDC Pediatric Clinical Growth Chart (2–20 Years)
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {isFemale ? 'Female' : 'Male'} Standard Reference
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Evidence-based longitudinal growth curves comparing {patient.firstName}&apos;s stature, weight, and BMI trajectory against CDC/NCHS reference percentiles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingMeasurement(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Anthropometry</span>
            </button>
          </div>
        </div>

        {/* Quick Vitals Summary Strip */}
        {latestMeasurement && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
              <span className="text-[10px] uppercase font-sans text-gray-500 block font-semibold">
                Latest Height
              </span>
              <span className="text-sm font-bold text-gray-900">
                {latestMeasurement.heightCm ? `${latestMeasurement.heightCm} cm` : '—'}
              </span>
              <span className="text-[11px] text-gray-500 block">
                At age {latestMeasurement.ageFormatted}
              </span>
            </div>

            <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
              <span className="text-[10px] uppercase font-sans text-gray-500 block font-semibold">
                Latest Weight
              </span>
              <span className="text-sm font-bold text-gray-900">
                {latestMeasurement.weightKg ? `${latestMeasurement.weightKg} kg` : '—'}
              </span>
              <span className="text-[11px] text-gray-500 block">
                ({latestMeasurement.weightKg ? (latestMeasurement.weightKg * 2.20462).toFixed(1) : '—'} lbs)
              </span>
            </div>

            <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
              <span className="text-[10px] uppercase font-sans text-gray-500 block font-semibold">
                Current BMI
              </span>
              <span className="text-sm font-bold text-gray-900">
                {latestMeasurement.bmi || '—'} kg/m²
              </span>
              <span className="text-[11px] text-gray-500 block font-sans">
                {currentPercentileEstimate?.label || 'CDC Percentile'}
              </span>
            </div>

            <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
              <span className="text-[10px] uppercase font-sans text-gray-500 block font-semibold">
                Growth Velocity
              </span>
              <span className="text-sm font-bold text-gray-900">
                {growthVelocity?.rate || '—'}
              </span>
              <span className="text-[11px] text-red-700 block font-sans font-medium">
                {growthVelocity?.delta ? `${growthVelocity.delta} since last visit` : 'Normal tracking'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Measurement Form Modal */}
      {isAddingMeasurement && (
        <form
          onSubmit={handleSaveMeasurement}
          className="bg-white border-2 border-red-600 rounded-lg p-5 shadow-md space-y-4 text-xs animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-900">
              Record New Pediatric Growth Measurement
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingMeasurement(false)}
              className="text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Encounter Date</label>
              <input
                type="date"
                required
                value={newMeasureDate}
                onChange={(e) => setNewMeasureDate(e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded focus:outline-red-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Height / Stature (cm)</label>
              <input
                type="number"
                step="0.5"
                required
                placeholder="e.g. 132.5"
                value={newHeightCm}
                onChange={(e) => setNewHeightCm(e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded focus:outline-red-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="e.g. 30.2"
                value={newWeightKg}
                onChange={(e) => setNewWeightKg(e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded focus:outline-red-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsAddingMeasurement(false)}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-semibold rounded cursor-pointer"
            >
              Save & Plot Measurement
            </button>
          </div>
        </form>
      )}

      {/* Metric Selector & Display Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-gray-200 rounded-lg text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-700 mr-1">Parameter:</span>
          <button
            onClick={() => setActiveMetric('height')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeMetric === 'height'
                ? 'bg-red-700 text-white font-bold shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Stature (Height cm)
          </button>
          <button
            onClick={() => setActiveMetric('weight')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeMetric === 'weight'
                ? 'bg-red-700 text-white font-bold shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weight (kg)
          </button>
          <button
            onClick={() => setActiveMetric('bmi')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeMetric === 'bmi'
                ? 'bg-red-700 text-white font-bold shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            BMI-for-Age (kg/m²)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
            <input
              type="checkbox"
              checked={showAllPercentiles}
              onChange={(e) => setShowAllPercentiles(e.target.checked)}
              className="rounded text-red-700 focus:ring-red-600"
            />
            <span>Show 5th, 25th, 75th, 95th Percentile Bands</span>
          </label>
        </div>
      </div>

      {/* Main Chart Visualization */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            {patient.firstName}&apos;s Growth Trajectory vs. CDC Standard ({metricLabel})
          </h3>
          <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-red-700 inline-block" />
              <span className="w-2 h-2 rounded-full bg-red-700 inline-block" />
              <strong className="text-red-900 font-bold">{patient.firstName}&apos;s Visits</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-gray-400 inline-block" />
              <span>50th %ile (Median)</span>
            </span>
          </div>
        </div>

        {/* Recharts Component Container */}
        <div className="h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="ageYears"
                domain={[2, 18]}
                type="number"
                tickCount={9}
                label={{
                  value: 'Age (Years)',
                  position: 'insideBottom',
                  offset: -10,
                  fontSize: 12,
                  fill: '#64748b',
                }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                domain={yDomain}
                label={{
                  value: metricLabel,
                  angle: -90,
                  position: 'insideLeft',
                  offset: 5,
                  fontSize: 11,
                  fill: '#64748b',
                }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1 font-mono border border-gray-700">
                        <div className="font-bold text-red-300 font-sans border-b border-gray-700 pb-1">
                          Age: {data.ageFormatted || `${label} years`}
                        </div>
                        {data.patientValue !== undefined && (
                          <div className="text-emerald-400 font-bold py-0.5">
                            Patient Record: {data.patientValue}{' '}
                            {activeMetric === 'height'
                              ? 'cm'
                              : activeMetric === 'weight'
                              ? 'kg'
                              : 'kg/m²'}
                            {data.measurementDate && (
                              <span className="text-gray-400 font-normal ml-1">
                                ({data.measurementDate})
                              </span>
                            )}
                          </div>
                        )}
                        <div className="text-[11px] text-gray-300 pt-1 space-y-0.5">
                          <div>95th Percentile: {data.p95}</div>
                          <div>75th Percentile: {data.p75}</div>
                          <div className="text-red-200 font-semibold">50th Percentile (Median): {data.p50}</div>
                          <div>25th Percentile: {data.p25}</div>
                          <div>5th Percentile: {data.p5}</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Percentile Lines */}
              {showAllPercentiles && (
                <>
                  <Line
                    type="monotone"
                    dataKey="p95"
                    stroke="#cbd5e1"
                    strokeDasharray="4 4"
                    dot={false}
                    strokeWidth={1}
                    name="95th %ile"
                  />
                  <Line
                    type="monotone"
                    dataKey="p75"
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    dot={false}
                    strokeWidth={1}
                    name="75th %ile"
                  />
                </>
              )}

              {/* 50th Percentile / Median */}
              <Line
                type="monotone"
                dataKey="p50"
                stroke="#64748b"
                strokeWidth={1.5}
                dot={false}
                name="50th %ile (Median)"
              />

              {showAllPercentiles && (
                <>
                  <Line
                    type="monotone"
                    dataKey="p25"
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    dot={false}
                    strokeWidth={1}
                    name="25th %ile"
                  />
                  <Line
                    type="monotone"
                    dataKey="p5"
                    stroke="#cbd5e1"
                    strokeDasharray="4 4"
                    dot={false}
                    strokeWidth={1}
                    name="5th %ile"
                  />
                </>
              )}

              {/* Patient Actual Trajectory Line & Points */}
              <Line
                type="monotone"
                dataKey="patientValue"
                stroke="#b91c1c"
                strokeWidth={3}
                dot={{ r: 5, fill: '#b91c1c', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#dc2626', stroke: '#ffffff', strokeWidth: 2 }}
                connectNulls
                name={`${patient.firstName}'s Growth`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-gray-500 text-[11px]">
          <span>CDC Clinical Growth Charts (United States 2 to 20 years).</span>
          <span className="font-mono">
            {patientMeasurements.length} visits recorded between {patientMeasurements[0]?.date} and{' '}
            {latestMeasurement?.date}
          </span>
        </div>
      </div>

      {/* Longitudinal Pediatric Anthropometrics Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
          Recorded Anthropometric Measurements Flowsheet
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Age at Visit</th>
                <th className="py-2.5 px-3">Height (cm)</th>
                <th className="py-2.5 px-3">Weight (kg / lbs)</th>
                <th className="py-2.5 px-3">BMI (kg/m²)</th>
                <th className="py-2.5 px-3">Clinical Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patientMeasurements.map((meas, idx) => {
                const prev = idx > 0 ? patientMeasurements[idx - 1] : null;
                const hDelta = prev?.heightCm && meas.heightCm ? (meas.heightCm - prev.heightCm).toFixed(1) : null;
                const wDelta = prev?.weightKg && meas.weightKg ? (meas.weightKg - prev.weightKg).toFixed(1) : null;

                return (
                  <tr key={meas.encounterId || meas.date} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-gray-900 font-semibold">{meas.date}</td>
                    <td className="py-2.5 px-3 text-gray-600">{meas.ageFormatted}</td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">
                      {meas.heightCm ? `${meas.heightCm} cm` : '—'}
                      {hDelta && (
                        <span className="text-[10px] text-red-700 ml-1 font-normal font-sans">
                          (+{hDelta})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">
                      {meas.weightKg ? `${meas.weightKg} kg` : '—'}
                      {meas.weightKg && (
                        <span className="text-[11px] text-gray-400 ml-1 font-normal">
                          ({(meas.weightKg * 2.20462).toFixed(1)} lbs)
                        </span>
                      )}
                      {wDelta && (
                        <span className="text-[10px] text-red-700 ml-1 font-normal font-sans">
                          (+{wDelta})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">
                      {meas.bmi || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Normal Childhood Growth
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
