import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Download,
  User,
  ArrowRight,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  ShieldCheck,
  Edit2,
  Printer,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Patient, Encounter, DiagnosisEntry } from '../types/clinical';
import { calculateAge } from '../services/storageService';
import { PatientAvatar } from './PatientAvatar';

interface EncountersDashboardProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onStartEncounter: (patient: Patient, encounter?: Encounter) => void;
  onViewVisitSummary: (patient: Patient, encounter: Encounter) => void;
  onNewPatient: () => void;
}

interface EnrichedEncounter extends Encounter {
  patient: Patient;
}

const VISIT_TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  chronic_disease: { label: 'Chronic Disease', color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200' },
  follow_up: { label: 'Follow-Up', color: 'text-indigo-800', bg: 'bg-indigo-50 border-indigo-200' },
  routine_annual: { label: 'Annual Wellness', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
  acute_illness: { label: 'Acute Care', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
  medication_review: { label: 'Med Review', color: 'text-purple-800', bg: 'bg-purple-50 border-purple-200' },
  well_child: { label: 'Well Child', color: 'text-teal-800', bg: 'bg-teal-50 border-teal-200' },
  mental_health: { label: 'Mental Health', color: 'text-rose-800', bg: 'bg-rose-50 border-rose-200' },
};

export const EncountersDashboard: React.FC<EncountersDashboardProps> = ({
  patients,
  onSelectPatient,
  onStartEncounter,
  onViewVisitSummary,
  onNewPatient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'signed' | 'draft'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [timeHorizon, setTimeHorizon] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'patient_name'>('date_desc');
  const [showCharts, setShowCharts] = useState(true);
  const [isPatientPickerOpen, setIsPatientPickerOpen] = useState(false);
  const [patientPickerSearch, setPatientPickerSearch] = useState('');

  // Flatten all encounters across all patients
  const allEncounters: EnrichedEncounter[] = useMemo(() => {
    const list: EnrichedEncounter[] = [];
    patients.forEach((p) => {
      if (p.encounters && Array.isArray(p.encounters)) {
        p.encounters.forEach((enc) => {
          list.push({ ...enc, patient: p });
        });
      }
    });
    return list;
  }, [patients]);

  // Unique providers list
  const uniqueProviders = useMemo(() => {
    const set = new Set<string>();
    allEncounters.forEach((e) => {
      if (e.provider) set.add(e.provider);
    });
    return Array.from(set);
  }, [allEncounters]);

  // Filtered encounters based on controls
  const filteredEncounters = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = Date.now();

    return allEncounters.filter((item) => {
      // Time Horizon
      if (timeHorizon !== 'all') {
        const itemTime = new Date(item.date).getTime();
        const daysAgo = (now - itemTime) / (1000 * 60 * 60 * 24);
        if (timeHorizon === '7d' && daysAgo > 7) return false;
        if (timeHorizon === '30d' && daysAgo > 30) return false;
        if (timeHorizon === '90d' && daysAgo > 90) return false;
      }

      // Status
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Type
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Provider
      if (providerFilter !== 'all' && item.provider !== providerFilter) return false;

      // Search Query
      if (q) {
        const patientName = `${item.patient.firstName} ${item.patient.lastName}`.toLowerCase();
        const mrn = item.patient.mrn.toLowerCase();
        const reason = (item.reasonForVisit || item.chiefComplaint || '').toLowerCase();
        const primaryDx = (item.assessment?.primaryDiagnosis?.name || '').toLowerCase();
        const primaryCode = (item.assessment?.primaryDiagnosis?.code || '').toLowerCase();
        const prov = (item.provider || '').toLowerCase();
        const billing = (item.billingCode || '').toLowerCase();

        return (
          patientName.includes(q) ||
          mrn.includes(q) ||
          reason.includes(q) ||
          primaryDx.includes(q) ||
          primaryCode.includes(q) ||
          prov.includes(q) ||
          billing.includes(q)
        );
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'patient_name') {
        return a.patient.lastName.localeCompare(b.patient.lastName);
      }
      return 0;
    });
  }, [allEncounters, searchQuery, statusFilter, typeFilter, providerFilter, timeHorizon, sortBy]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = allEncounters.length;
    const signed = allEncounters.filter((e) => e.status === 'signed').length;
    const drafts = allEncounters.filter((e) => e.status === 'draft');
    const complianceRate = total > 0 ? Math.round((signed / total) * 100) : 100;

    // Count types
    const typeCounts: Record<string, number> = {};
    allEncounters.forEach((e) => {
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    });
    let topTypeKey = '';
    let topTypeCount = 0;
    Object.entries(typeCounts).forEach(([k, v]) => {
      if (v > topTypeCount) {
        topTypeCount = v;
        topTypeKey = k;
      }
    });

    return {
      total,
      signed,
      drafts,
      complianceRate,
      topType: VISIT_TYPE_LABELS[topTypeKey]?.label || 'Routine Follow-Up',
      topTypeCount,
    };
  }, [allEncounters]);

  // Analytics: Encounters volume by month
  const monthlyData = useMemo(() => {
    const counts: Record<string, number> = {};
    allEncounters.forEach((e) => {
      const d = new Date(e.date);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts).map(([month, count]) => ({
      name: month,
      encounters: count,
    }));
  }, [allEncounters]);

  // Analytics: Top Diagnoses
  const topDiagnoses = useMemo(() => {
    const dxMap: Record<string, { code: string; name: string; count: number }> = {};
    allEncounters.forEach((e) => {
      const dx = e.assessment?.primaryDiagnosis;
      if (dx && dx.code) {
        if (!dxMap[dx.code]) {
          dxMap[dx.code] = { code: dx.code, name: dx.name, count: 0 };
        }
        dxMap[dx.code].count += 1;
      }
    });

    return Object.values(dxMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((item) => ({
        label: `${item.code}: ${item.name.length > 22 ? item.name.slice(0, 20) + '...' : item.name}`,
        count: item.count,
        code: item.code,
      }));
  }, [allEncounters]);

  // Analytics: CPT Codes distribution
  const cptData = useMemo(() => {
    const map: Record<string, number> = {};
    allEncounters.forEach((e) => {
      const code = e.billingCode || '99214';
      map[code] = (map[code] || 0) + 1;
    });

    return Object.entries(map).map(([code, count]) => ({
      code,
      count,
    }));
  }, [allEncounters]);

  // Export Encounters to CSV
  const handleExportCSV = () => {
    const headers = [
      'Encounter Date',
      'Patient Name',
      'MRN',
      'DOB',
      'Age',
      'Gender',
      'Provider',
      'Visit Type',
      'Reason For Visit',
      'Primary Diagnosis Code',
      'Primary Diagnosis',
      'Billing Code (CPT)',
      'Documentation Status',
      'Prescriptions Count',
    ];

    const rows = filteredEncounters.map((e) => [
      new Date(e.date).toISOString().slice(0, 10),
      `"${e.patient.lastName}, ${e.patient.firstName}"`,
      e.patient.mrn,
      e.patient.dob,
      calculateAge(e.patient.dob),
      e.patient.sex,
      `"${e.provider}"`,
      `"${VISIT_TYPE_LABELS[e.type]?.label || e.type}"`,
      `"${(e.reasonForVisit || e.chiefComplaint || '').replace(/"/g, '""')}"`,
      e.assessment?.primaryDiagnosis?.code || '',
      `"${(e.assessment?.primaryDiagnosis?.name || '').replace(/"/g, '""')}"`,
      e.billingCode || '99214',
      e.status,
      e.plan?.prescriptions?.length || 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `practice_encounters_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter patients for new encounter picker
  const pickerMatchingPatients = useMemo(() => {
    const q = patientPickerSearch.trim().toLowerCase();
    if (!q) return patients.slice(0, 8);
    return patients
      .filter(
        (p) =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.dob.includes(q)
      )
      .slice(0, 10);
  }, [patients, patientPickerSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Dashboard Top Title & Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                Encounters & Clinical Documentation Dashboard
              </h1>
              <p className="text-xs text-gray-500">
                Practice-wide encounter volume, documentation velocity, unsigned notes worklist & coding analysis
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
              showCharts
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{showCharts ? 'Hide Visual Analytics' : 'Show Visual Analytics'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md shadow-2xs transition-colors cursor-pointer"
            title="Download CSV report of filtered encounters"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsPatientPickerOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Start New Encounter</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Encounters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-gray-500 font-semibold">
              Total Encounters Logged
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Across {patients.length} active patient profiles
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700">
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        {/* Signed vs Draft Compliance */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-gray-500 font-semibold">
              Signing Compliance
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">
              {stats.complianceRate}%
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {stats.signed} of {stats.total} notes signed & finalized
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Signature Alert */}
        <div
          onClick={() => setStatusFilter(stats.drafts.length > 0 ? 'draft' : 'all')}
          className={`border rounded-xl p-4 shadow-xs flex items-center justify-between transition-all cursor-pointer ${
            stats.drafts.length > 0
              ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400'
              : 'bg-white border-gray-200'
          }`}
        >
          <div>
            <div className="text-[11px] font-mono uppercase text-amber-900 font-semibold flex items-center gap-1">
              <span>Unsigned Draft Notes</span>
              {stats.drafts.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-1">
              {stats.drafts.length}
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">
              {stats.drafts.length > 0 ? 'Action required: click to view worklist' : 'All clinical notes signed'}
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-100/80 border border-amber-300 flex items-center justify-center text-amber-800">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Primary Case Type */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase text-gray-500 font-semibold">
              Primary Visit Category
            </div>
            <div className="text-sm font-bold text-gray-900 mt-1 truncate max-w-[170px]">
              {stats.topType}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {stats.topTypeCount} visits ({stats.total > 0 ? Math.round((stats.topTypeCount / stats.total) * 100) : 0}%)
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Draft Notes Attention Worklist Banner */}
      {stats.drafts.length > 0 && statusFilter !== 'signed' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                ATTENTION: {stats.drafts.length} Clinical Encounter {stats.drafts.length === 1 ? 'Note Needs' : 'Notes Need'} Attestation & Signature
              </span>
            </div>
            <button
              onClick={() => setStatusFilter('draft')}
              className="text-[11px] text-amber-800 font-semibold hover:underline"
            >
              Filter table to drafts →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {stats.drafts.slice(0, 3).map((draft) => (
              <div
                key={draft.id}
                className="bg-white p-3 rounded-lg border border-amber-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 truncate">
                    {draft.patient.lastName}, {draft.patient.firstName}
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono">
                    {new Date(draft.date).toLocaleDateString()} · {draft.provider}
                  </div>
                  <div className="text-[11px] text-amber-800 font-medium truncate mt-0.5">
                    {draft.reasonForVisit || draft.chiefComplaint}
                  </div>
                </div>

                <button
                  onClick={() => onStartEncounter(draft.patient, draft)}
                  className="shrink-0 px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors cursor-pointer"
                >
                  Resume & Sign
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics Charts Section */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart 1: Encounter Volume Over Time */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-gray-900">Encounter Volume Trend</span>
              <span className="text-[10px] font-mono text-gray-400">Monthly</span>
            </div>
            <div className="h-44 w-full">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '6px',
                        color: '#f8fafc',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="encounters" fill="#b91c1c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  No timeline data available
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Top Primary Diagnoses */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-gray-900">Top Addressed Primary Diagnoses</span>
              <span className="text-[10px] font-mono text-gray-400">ICD-10</span>
            </div>
            <div className="space-y-2 pt-1 text-xs">
              {topDiagnoses.length > 0 ? (
                topDiagnoses.map((dx, idx) => (
                  <div key={dx.code} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-gray-800 truncate max-w-[200px]" title={dx.label}>
                        {dx.label}
                      </span>
                      <span className="font-mono text-gray-500 font-bold">{dx.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-red-700 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (dx.count / (topDiagnoses[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-32 flex items-center justify-center text-xs text-gray-400">
                  No primary diagnoses on record
                </div>
              )}
            </div>
          </div>

          {/* Chart 3: CPT Billing & Complexity */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-bold text-gray-900">E&M Level of Service (CPT)</span>
              <span className="text-[10px] font-mono text-gray-400">Distribution</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              {cptData.map((c) => (
                <div key={c.code} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <div className="text-[10px] font-mono text-gray-500 font-bold">CPT {c.code}</div>
                  <div className="text-lg font-extrabold text-gray-900 mt-0.5">{c.count}</div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    {stats.total > 0 ? Math.round((c.count / stats.total) * 100) : 0}% visits
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, MRN, provider, chief complaint, diagnosis..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Status Buttons */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs w-full md:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({allEncounters.length})
            </button>
            <button
              onClick={() => setStatusFilter('signed')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                statusFilter === 'signed' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Signed ({stats.signed})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                statusFilter === 'draft' ? 'bg-amber-100 text-amber-900 shadow-2xs font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Drafts ({stats.drafts.length})
            </button>
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400 text-[11px] uppercase font-mono font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filters:
            </span>

            {/* Visit Type Dropdown */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:border-red-600"
            >
              <option value="all">All Visit Types</option>
              <option value="routine_annual">Annual Wellness Visit</option>
              <option value="follow_up">Follow-Up Visit</option>
              <option value="chronic_disease">Chronic Disease Management</option>
              <option value="acute_illness">Acute Illness</option>
              <option value="medication_review">Medication Review</option>
              <option value="well_child">Well Child</option>
              <option value="mental_health">Mental Health</option>
            </select>

            {/* Provider Dropdown */}
            {uniqueProviders.length > 1 && (
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:border-red-600"
              >
                <option value="all">All Attending Providers</option>
                {uniqueProviders.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}

            {/* Time Horizon */}
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value as any)}
              className="px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:border-red-600"
            >
              <option value="all">All Time Records</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-[11px] font-mono">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:border-red-600"
            >
              <option value="date_desc">Visit Date (Newest first)</option>
              <option value="date_asc">Visit Date (Oldest first)</option>
              <option value="patient_name">Patient Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Encounters Master Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between text-xs">
          <div className="font-bold text-gray-900">
            Clinical Encounters Record ({filteredEncounters.length} matching)
          </div>
          <div className="text-[11px] text-gray-500 font-mono">
            Showing verified practice documentation
          </div>
        </div>

        {filteredEncounters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/90 text-gray-600 border-b border-gray-200 font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">Visit Date & Time</th>
                  <th className="py-2.5 px-4">Patient Profile</th>
                  <th className="py-2.5 px-4">Visit Type</th>
                  <th className="py-2.5 px-4">Chief Complaint / Reason</th>
                  <th className="py-2.5 px-4">Primary Diagnosis</th>
                  <th className="py-2.5 px-4">Provider / CPT</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Clinical Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEncounters.map((item) => {
                  const visitDate = new Date(item.date);
                  const formattedDate = visitDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const formattedTime = visitDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  });
                  const typeBadge = VISIT_TYPE_LABELS[item.type] || {
                    label: item.type,
                    color: 'text-gray-800',
                    bg: 'bg-gray-100 border-gray-200',
                  };

                  return (
                    <tr key={`${item.patient.id}-${item.id}`} className="hover:bg-gray-50/80 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-gray-900 text-xs">{formattedDate}</div>
                        <div className="text-[11px] text-gray-400">{formattedTime}</div>
                      </td>

                      {/* Patient */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <PatientAvatar patient={item.patient} size="sm" />
                          <div>
                            <div
                              onClick={() => onSelectPatient(item.patient)}
                              className="font-bold text-gray-900 hover:text-red-700 transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{item.patient.lastName}, {item.patient.firstName}</span>
                            </div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              DOB: {item.patient.dob} ({calculateAge(item.patient.dob)}y) · MRN: {item.patient.mrn}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Visit Type */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${typeBadge.bg} ${typeBadge.color}`}
                        >
                          {typeBadge.label}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-gray-900 line-clamp-1">
                          {item.reasonForVisit || item.chiefComplaint || 'Routine medical check'}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          Rx: {item.plan?.prescriptions?.length || 0} ordered
                        </div>
                      </td>

                      {/* Primary Diagnosis */}
                      <td className="py-3 px-4 max-w-xs">
                        {item.assessment?.primaryDiagnosis ? (
                          <div>
                            <span className="font-mono text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 font-bold mr-1">
                              {item.assessment.primaryDiagnosis.code}
                            </span>
                            <span className="text-gray-900 font-medium text-xs">
                              {item.assessment.primaryDiagnosis.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">None recorded</span>
                        )}
                      </td>

                      {/* Provider & CPT */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="font-medium text-gray-800">{item.provider}</div>
                        <div className="text-gray-400 font-mono">CPT: {item.billingCode || '99214'}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {item.status === 'signed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Signed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Draft</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectPatient(item.patient)}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            title="Open Patient Chart"
                          >
                            <User className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onStartEncounter(item.patient, item)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                            title={item.status === 'signed' ? 'View/Review Note' : 'Resume & Sign Note'}
                          >
                            <Edit2 className="w-3 h-3 text-gray-600" />
                            <span>{item.status === 'signed' ? 'Note' : 'Sign'}</span>
                          </button>

                          <button
                            onClick={() => onViewVisitSummary(item.patient, item)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors cursor-pointer"
                            title="Open Printable Patient Visit Summary (AVS)"
                          >
                            <Printer className="w-3 h-3 text-red-700" />
                            <span>AVS</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <FileText className="w-10 h-10 text-gray-300 mx-auto" />
            <div className="font-semibold text-sm text-gray-800">No encounters found matching filters</div>
            <p className="text-xs text-gray-400">
              Try adjusting your search criteria, time horizon, or status filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTypeFilter('all');
                setProviderFilter('all');
                setTimeHorizon('all');
              }}
              className="mt-2 px-3 py-1.5 text-xs text-red-700 hover:underline font-medium cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Patient Picker Modal for + Start New Encounter */}
      {isPatientPickerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Select Patient to Start Clinical Encounter
                </h3>
                <p className="text-xs text-gray-500">
                  Choose a patient from your clinical panel or register a new one
                </p>
              </div>
              <button
                onClick={() => setIsPatientPickerOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={patientPickerSearch}
                onChange={(e) => setPatientPickerSearch(e.target.value)}
                placeholder="Search patient by name, DOB, or MRN..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>

            {/* Patient candidate list */}
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-md">
              {pickerMatchingPatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setIsPatientPickerOpen(false);
                    onStartEncounter(p);
                  }}
                  className="p-3 hover:bg-red-50/60 transition-colors cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-gray-900">
                      {p.lastName}, {p.firstName}
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono">
                      DOB: {p.dob} ({calculateAge(p.dob)}y) · MRN: {p.mrn} · HC: {p.healthCardNumber}
                    </div>
                  </div>
                  <button className="px-2.5 py-1 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded transition-colors">
                    Start Visit →
                  </button>
                </div>
              ))}

              {pickerMatchingPatients.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-400">
                  No matching patients found.
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsPatientPickerOpen(false);
                  onNewPatient();
                }}
                className="text-red-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register New Patient Instead</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPatientPickerOpen(false)}
                className="px-3 py-1.5 text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
