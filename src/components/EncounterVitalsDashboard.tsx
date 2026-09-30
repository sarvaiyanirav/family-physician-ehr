import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  YAxis,
  XAxis,
} from 'recharts';
import {
  Activity,
  Heart,
  TrendingDown,
  TrendingUp,
  Scale,
  History,
  ChevronDown,
  ChevronUp,
  Plus,
  Stethoscope,
  Clock,
  Check,
} from 'lucide-react';
import { Patient, Vitals, DiagnosisEntry } from '../types/clinical';
import {
  extractVitalsTrend,
  extractRecentDiagnoses,
  calculateTrendDeltas,
  VitalsTrendPoint,
  RecentDiagnosisItem,
} from '../services/encounterAnalytics';

interface EncounterVitalsDashboardProps {
  patient: Patient;
  currentVitals?: Vitals;
  currentDate?: string;
  onImportDiagnosis?: (diagnosis: DiagnosisEntry) => void;
}

// Custom compact tooltip for sparklines
const SparklineTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload as VitalsTrendPoint;
    return (
      <div className="bg-gray-900 text-white text-[11px] px-2.5 py-1.5 rounded shadow-lg border border-gray-700 pointer-events-none z-50">
        <div className="font-semibold text-gray-200">
          {data.displayDate} {data.isCurrent && '(Today)'}
        </div>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} className="flex items-center gap-1.5 font-mono text-gray-300">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.stroke }}
            />
            <span className="capitalize">{entry.name}:</span>
            <span className="font-bold text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const EncounterVitalsDashboard: React.FC<EncounterVitalsDashboardProps> = ({
  patient,
  currentVitals,
  currentDate,
  onImportDiagnosis,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'bp' | 'hr' | 'weight'>('all');
  const [importedCodes, setImportedCodes] = useState<Set<string>>(new Set());

  // Extract trend data points
  const vitalsTrend = useMemo(() => {
    return extractVitalsTrend(patient, currentVitals, currentDate);
  }, [patient, currentVitals, currentDate]);

  // Extract recent diagnoses
  const recentDiagnoses = useMemo(() => {
    return extractRecentDiagnoses(patient);
  }, [patient]);

  // Trend deltas
  const deltas = useMemo(() => {
    return calculateTrendDeltas(vitalsTrend);
  }, [vitalsTrend]);

  const latestPoint = vitalsTrend[vitalsTrend.length - 1];

  const handleImport = (item: RecentDiagnosisItem) => {
    if (onImportDiagnosis) {
      onImportDiagnosis({
        code: item.code,
        name: item.name,
        isPrimary: false,
      });
      setImportedCodes((prev) => new Set([...prev, item.code]));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="bg-gray-50/90 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-red-100 text-red-700 rounded">
            <Activity className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="text-xs font-bold text-gray-900">
              Clinical Context & Vitals Baseline
            </span>
            <span className="text-[11px] text-gray-500 ml-2 hidden sm:inline">
              Longitudinal vitals sparklines & past diagnostic history
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-gray-500 hidden md:inline">
            {deltas.summaryText}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Hide Trends' : 'View Trends'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-4 space-y-4 animate-fade-in">
          {/* Top Row: 3 Vitals Trend Sparkline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Blood Pressure Sparkline */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-600" />
                  Blood Pressure
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-gray-700 border border-gray-200">
                  {deltas.systolicDelta !== undefined ? (
                    <span className="flex items-center gap-0.5">
                      {deltas.systolicDelta > 0 ? (
                        <TrendingUp className="w-3 h-3 text-rose-600" />
                      ) : deltas.systolicDelta < 0 ? (
                        <TrendingDown className="w-3 h-3 text-emerald-600" />
                      ) : null}
                      <span>
                        {deltas.systolicDelta > 0 ? `+${deltas.systolicDelta}` : deltas.systolicDelta} sys
                      </span>
                    </span>
                  ) : (
                    'Baseline'
                  )}
                </span>
              </div>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-gray-900">
                  {latestPoint ? `${latestPoint.systolic}/${latestPoint.diastolic}` : '—'}
                </span>
                <span className="text-[11px] text-gray-500">mmHg</span>
                <span className="text-[10px] text-gray-400 font-mono ml-auto">
                  {vitalsTrend.length} readings
                </span>
              </div>

              {/* Sparkline Canvas */}
              <div className="h-11 mt-2 -mx-1">
                {vitalsTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitalsTrend} margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
                      <Tooltip content={<SparklineTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        name="Systolic"
                        stroke="#b91c1c"
                        strokeWidth={2}
                        dot={{ r: 2, fill: '#b91c1c' }}
                        activeDot={{ r: 4, fill: '#b91c1c' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        name="Diastolic"
                        stroke="#f87171"
                        strokeWidth={1.5}
                        strokeDasharray="2 2"
                        dot={{ r: 1.5, fill: '#f87171' }}
                        activeDot={{ r: 3, fill: '#f87171' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[10px] text-gray-400 italic">
                    No vitals recorded
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-200/60 font-mono">
                <span>{vitalsTrend[0]?.displayDate || '—'}</span>
                <span className="flex items-center gap-2">
                  <span className="text-red-700 font-medium">● Systolic</span>
                  <span className="text-red-400 font-medium">·· Diastolic</span>
                </span>
                <span>{latestPoint?.displayDate || 'Today'}</span>
              </div>
            </div>

            {/* 2. Heart Rate (Pulse) Sparkline */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-red-600" />
                  Pulse / Heart Rate
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-gray-700 border border-gray-200">
                  {deltas.heartRateDelta !== undefined ? (
                    <span>{deltas.heartRateDelta > 0 ? `+${deltas.heartRateDelta}` : deltas.heartRateDelta} bpm</span>
                  ) : (
                    'Normal'
                  )}
                </span>
              </div>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-gray-900">
                  {latestPoint ? latestPoint.heartRate : '—'}
                </span>
                <span className="text-[11px] text-gray-500">BPM</span>
                <span className="text-[10px] text-gray-400 font-mono ml-auto">
                  Range: {Math.min(...vitalsTrend.map((p) => p.heartRate)) || 0} -{' '}
                  {Math.max(...vitalsTrend.map((p) => p.heartRate)) || 0}
                </span>
              </div>

              {/* Sparkline Canvas */}
              <div className="h-11 mt-2 -mx-1">
                {vitalsTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitalsTrend} margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
                      <Tooltip content={<SparklineTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        name="Heart Rate"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={{ r: 2, fill: '#dc2626' }}
                        activeDot={{ r: 4, fill: '#dc2626' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[10px] text-gray-400 italic">
                    No vitals recorded
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-200/60 font-mono">
                <span>{vitalsTrend[0]?.displayDate || '—'}</span>
                <span className="text-red-600 font-medium">● Beats per minute</span>
                <span>{latestPoint?.displayDate || 'Today'}</span>
              </div>
            </div>

            {/* 3. Weight & BMI Sparkline */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 flex items-center gap-1">
                  <Scale className="w-3 h-3 text-red-700" />
                  Weight & Anthropometrics
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-gray-700 border border-gray-200">
                  {deltas.weightDelta !== undefined ? (
                    <span>{deltas.weightDelta > 0 ? `+${deltas.weightDelta}` : deltas.weightDelta} kg</span>
                  ) : (
                    'Stable'
                  )}
                </span>
              </div>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-gray-900">
                  {latestPoint?.weightKg ? latestPoint.weightKg : '—'}
                </span>
                <span className="text-[11px] text-gray-500">kg</span>
                {latestPoint?.bmi && (
                  <span className="text-xs font-mono font-medium text-gray-700 ml-2">
                    (BMI {latestPoint.bmi})
                  </span>
                )}
              </div>

              {/* Sparkline Canvas */}
              <div className="h-11 mt-2 -mx-1">
                {vitalsTrend.some((p) => p.weightKg) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitalsTrend} margin={{ top: 2, right: 4, left: 4, bottom: 2 }}>
                      <Tooltip content={<SparklineTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="weightKg"
                        name="Weight (kg)"
                        stroke="#991b1b"
                        strokeWidth={2}
                        dot={{ r: 2, fill: '#991b1b' }}
                        activeDot={{ r: 4, fill: '#991b1b' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[10px] text-gray-400 italic">
                    Weight values not logged
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-200/60 font-mono">
                <span>{vitalsTrend[0]?.displayDate || '—'}</span>
                <span className="text-red-800 font-medium">● Kilograms (kg)</span>
                <span>{latestPoint?.displayDate || 'Today'}</span>
              </div>
            </div>
          </div>

          {/* Bottom Section: Recent Diagnoses History with Quick Carry-Forward */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                <History className="w-3.5 h-3.5 text-red-700" />
                <span>Recent Diagnostic History & Active Problem Context:</span>
              </div>
              <span className="text-[11px] text-gray-500">
                Click <strong className="text-red-700">+ Add</strong> to import into current encounter assessment
              </span>
            </div>

            {recentDiagnoses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recentDiagnoses.slice(0, 6).map((item) => {
                  const isImported = importedCodes.has(item.code);
                  return (
                    <div
                      key={item.id}
                      className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs transition-colors"
                    >
                      <span className="font-mono text-[11px] text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                        {item.code}
                      </span>
                      <span className="font-medium text-gray-900 truncate max-w-[200px]" title={item.name}>
                        {item.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {item.date}
                      </span>

                      {onImportDiagnosis && (
                        <button
                          type="button"
                          onClick={() => handleImport(item)}
                          disabled={isImported}
                          className={`ml-1 inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                            isImported
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                          }`}
                          title={isImported ? 'Added to current assessment' : 'Add to current assessment'}
                        >
                          {isImported ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 text-red-600" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No past diagnoses on file for this patient.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
