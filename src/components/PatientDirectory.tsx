import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  FileText,
  ArrowRight,
  AlertTriangle,
  Activity,
  Users,
  CalendarCheck,
  Clock,
  ShieldAlert,
  AlertOctagon,
  Flame,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { Patient, TriagePriority } from '../types/clinical';
import { calculateAge } from '../services/storageService';
import { PatientAvatar } from './PatientAvatar';

interface PatientDirectoryProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient, tab?: string) => void;
  onNewPatient: () => void;
  onStartEncounter: (patient: Patient) => void;
  onUpdatePatient?: (patient: Patient) => void;
}

export const PatientDirectory: React.FC<PatientDirectoryProps> = ({
  patients,
  onSelectPatient,
  onNewPatient,
  onStartEncounter,
  onUpdatePatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'today' | 'triage_critical' | 'in_exam' | 'waiting' | 'chronic'>('all');

  // Compute key summary statistics
  const summaryStats = useMemo(() => {
    const totalPatients = patients.length;

    // Triage counts
    const emergencyCount = patients.filter((p) => p.triagePriority === 'emergency').length;
    const urgentCount = patients.filter((p) => p.triagePriority === 'urgent').length;
    const routineCount = patients.filter((p) => !p.triagePriority || p.triagePriority === 'routine').length;
    
    // Encounters today / scheduled today
    const scheduledToday = patients.filter(
      (p) => p.visitStatus && p.visitStatus !== 'not_scheduled'
    );
    const inExamOrWaiting = patients.filter(
      (p) => p.visitStatus === 'in_exam' || p.visitStatus === 'waiting'
    ).length;
    const completedToday = patients.filter(
      (p) => p.visitStatus === 'completed'
    ).length;

    // Upcoming follow-ups: patients with follow-up directives in their plan
    const upcomingFollowUps = patients.filter((p) => {
      const latest = p.encounters[0];
      return latest?.plan?.followUpIn && latest.plan.followUpIn !== 'PRN';
    }).length;

    // High risk / severe allergies safety watch
    const highRiskSafetyCount = patients.filter(
      (p) =>
        p.allergies.some((a) => a.severity === 'severe_anaphylaxis') ||
        p.clinicalAlerts.some((alert) =>
          alert.toLowerCase().includes('risk') ||
          alert.toLowerCase().includes('anticoagulant') ||
          alert.toLowerCase().includes('anaphylaxis')
        )
    ).length;

    return {
      totalPatients,
      emergencyCount,
      urgentCount,
      routineCount,
      todayTotal: scheduledToday.length,
      inExamOrWaiting,
      completedToday,
      upcomingFollowUps,
      highRiskSafetyCount,
    };
  }, [patients]);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Filter tab
      if (filterMode === 'today' && patient.visitStatus !== 'scheduled_today' && patient.visitStatus !== 'in_exam' && patient.visitStatus !== 'waiting' && patient.visitStatus !== 'completed') {
        return false;
      }
      if (filterMode === 'triage_critical' && patient.triagePriority !== 'emergency' && patient.triagePriority !== 'urgent') {
        return false;
      }
      if (filterMode === 'in_exam' && patient.visitStatus !== 'in_exam') {
        return false;
      }
      if (filterMode === 'waiting' && patient.visitStatus !== 'waiting') {
        return false;
      }
      if (filterMode === 'chronic' && patient.activeProblems.length === 0) {
        return false;
      }

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const mrn = patient.mrn.toLowerCase();
      const phone = patient.phone.toLowerCase();
      const conditions = patient.activeProblems.map((p) => p.description.toLowerCase()).join(' ');
      const allergies = patient.allergies.map((a) => a.allergen.toLowerCase()).join(' ');
      const triage = (patient.triagePriority || '').toLowerCase();
      const note = (patient.triageNote || '').toLowerCase();

      return (
        fullName.includes(term) ||
        mrn.includes(term) ||
        phone.includes(term) ||
        conditions.includes(term) ||
        allergies.includes(term) ||
        triage.includes(term) ||
        note.includes(term)
      );
    });
  }, [patients, filterMode, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Section: Clinic Overview Banner & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Cascade Family Practice Registry
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-mono">
            <span>Provider: Dr. Sarah Lin, MD</span>
            <span aria-hidden="true">·</span>
            <span>Room 3B</span>
            <span aria-hidden="true">·</span>
            <span>{patients.length} Active Rostered Patients</span>
          </div>
        </div>

        {/* Live Search and Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, MRN, condition..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          <button
            onClick={onNewPatient}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Intake</span>
          </button>
        </div>
      </div>

      {/* Top Summary Statistics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients Stat */}
        <div
          onClick={() => setFilterMode('all')}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs hover:border-gray-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Rostered Patients
            </span>
            <span className="p-1.5 bg-gray-100 group-hover:bg-red-50 rounded-md transition-colors">
              <Users className="w-4 h-4 text-gray-600 group-hover:text-red-700" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-gray-900 tabular-nums">
              {summaryStats.totalPatients}
            </span>
            <span className="text-xs text-gray-500">Active Dossiers</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>Primary care cohort</span>
            <span className="text-red-700 font-medium group-hover:underline">View all</span>
          </div>
        </div>

        {/* Encounters Today Stat */}
        <div
          onClick={() => setFilterMode('today')}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs hover:border-gray-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Today&apos;s Encounters
            </span>
            <span className="p-1.5 bg-gray-100 group-hover:bg-red-50 rounded-md transition-colors">
              <Activity className="w-4 h-4 text-gray-600 group-hover:text-red-700" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-gray-900 tabular-nums">
              {summaryStats.todayTotal}
            </span>
            <span className="text-xs text-gray-500">Clinic Visits</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>
              {summaryStats.inExamOrWaiting} in progress · {summaryStats.completedToday} complete
            </span>
            <span className="text-red-700 font-medium group-hover:underline font-sans">Filter</span>
          </div>
        </div>

        {/* Triage & Acuity Watch Stat Card */}
        <div
          onClick={() => setFilterMode('triage_critical')}
          className={`bg-white border rounded-lg p-4 shadow-xs transition-colors cursor-pointer group ${
            summaryStats.emergencyCount > 0
              ? 'border-red-300 hover:border-red-400 bg-red-50/20'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Triage Acuity Watch
            </span>
            <span
              className={`p-1.5 rounded-md transition-colors ${
                summaryStats.emergencyCount > 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 group-hover:bg-amber-50 group-hover:text-amber-700'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-red-700 tabular-nums">
              {summaryStats.emergencyCount}
            </span>
            <span className="text-xs font-semibold text-red-800">Emergency</span>
            <span className="text-gray-300">·</span>
            <span className="text-lg font-bold font-mono text-amber-700 tabular-nums">
              {summaryStats.urgentCount}
            </span>
            <span className="text-xs font-medium text-amber-800">Urgent</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>{summaryStats.routineCount} Routine cases</span>
            <span className="text-red-700 font-semibold group-hover:underline">Filter Critical</span>
          </div>
        </div>

        {/* Upcoming Follow-ups Stat */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Upcoming Follow-ups
            </span>
            <span className="p-1.5 bg-gray-100 rounded-md">
              <CalendarCheck className="w-4 h-4 text-gray-600" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-gray-900 tabular-nums">
              {summaryStats.upcomingFollowUps}
            </span>
            <span className="text-xs text-gray-500">Scheduled Recalls</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Chronic disease & acute reviews</span>
            <span className="text-gray-600">On Track</span>
          </div>
        </div>
      </div>

      {/* High-Visibility Critical Emergency Triage Banner */}
      {summaryStats.emergencyCount > 0 && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
            </span>
            <div>
              <span className="font-bold text-red-950 text-sm">
                CRITICAL TRIAGE ALERT: {summaryStats.emergencyCount} Emergency Case Requires Immediate Attention
              </span>
              <p className="text-red-800 text-[11px] mt-0.5">
                Red-flag clinical symptoms detected (e.g. acute chest pressure, hypertensive urgency, severe anaphylaxis risk). Prioritize exam room triage immediately.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterMode('triage_critical')}
            className="px-3.5 py-1.5 font-bold text-white bg-red-700 hover:bg-red-800 rounded shadow-xs cursor-pointer shrink-0 transition-colors whitespace-nowrap"
          >
            Review Critical Cases ({summaryStats.emergencyCount}) →
          </button>
        </div>
      )}

      {/* Segmented Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg text-xs font-medium overflow-x-auto border border-gray-200">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-white text-gray-900 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Patients ({patients.length})
          </button>

          <button
            onClick={() => setFilterMode('triage_critical')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterMode === 'triage_critical'
                ? 'bg-red-700 text-white shadow-xs font-semibold'
                : summaryStats.emergencyCount > 0
                ? 'bg-red-100 text-red-900 font-bold hover:bg-red-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
            <span>Critical & Urgent ({summaryStats.emergencyCount + summaryStats.urgentCount})</span>
            {summaryStats.emergencyCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {summaryStats.emergencyCount} Emerg
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterMode('today')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'today'
                ? 'bg-white text-gray-900 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Today&apos;s Clinic ({patients.filter((p) => p.visitStatus && p.visitStatus !== 'not_scheduled').length})
          </button>
          <button
            onClick={() => setFilterMode('in_exam')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'in_exam'
                ? 'bg-white text-gray-900 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            In Exam ({patients.filter((p) => p.visitStatus === 'in_exam').length})
          </button>
          <button
            onClick={() => setFilterMode('waiting')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'waiting'
                ? 'bg-white text-gray-900 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Waiting Room ({patients.filter((p) => p.visitStatus === 'waiting').length})
          </button>
          <button
            onClick={() => setFilterMode('chronic')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'chronic'
                ? 'bg-white text-gray-900 shadow-xs font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Chronic Disease Cohort
          </button>
        </div>

        <div className="text-xs text-gray-500 font-mono">
          Showing {filteredPatients.length} of {patients.length} records
        </div>
      </div>

      {/* Patient Table Grid */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
        {filteredPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/80 border-b border-gray-200 text-gray-700 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Patient Name & MRN</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Triage Priority</th>
                  <th className="py-3 px-4">Clinic Status</th>
                  <th className="py-3 px-4">Active Conditions / Problem List</th>
                  <th className="py-3 px-4">Safety & Allergies</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((patient) => {
                  const age = calculateAge(patient.dob);
                  const isEmergency = patient.triagePriority === 'emergency';
                  const isUrgent = patient.triagePriority === 'urgent';
                  const isRoutine = !patient.triagePriority || patient.triagePriority === 'routine';

                  return (
                    <tr
                      key={patient.id}
                      className={`hover:bg-gray-50/80 transition-colors group cursor-pointer ${
                        isEmergency
                          ? 'border-l-4 border-l-red-600 bg-red-50/25'
                          : isUrgent
                          ? 'border-l-4 border-l-amber-500 bg-amber-50/15'
                          : 'border-l-4 border-l-transparent'
                      }`}
                      onClick={() => onSelectPatient(patient)}
                    >
                      {/* Name & MRN */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <PatientAvatar patient={patient} size="md" />
                          <div>
                            <div className="font-semibold text-gray-900 text-sm group-hover:text-red-700 transition-colors flex items-center gap-1.5">
                              {isEmergency && (
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                </span>
                              )}
                              <span>
                                {patient.lastName}, {patient.firstName}
                              </span>
                              {patient.preferredName && (
                                <span className="text-xs font-normal text-gray-500">
                                  &ldquo;{patient.preferredName}&rdquo;
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[11px] mt-0.5">
                              <span>{patient.mrn}</span>
                              <span aria-hidden="true">·</span>
                              <span>{patient.healthCardNumber}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Demographics */}
                      <td className="py-3.5 px-4 text-gray-700">
                        <div className="font-medium text-gray-900">
                          {age} yrs <span className="text-gray-400 capitalize">/ {patient.sex}</span>
                        </div>
                        <div className="text-gray-500 text-[11px] mt-0.5">
                          DOB: <span className="font-mono">{patient.dob}</span>
                        </div>
                      </td>

                      {/* Triage Priority Tag & Inline Switcher */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {isEmergency ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                              <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                              <span>EMERGENCY</span>
                            </span>
                          ) : isUrgent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>URGENT</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-red-700" />
                              <span>ROUTINE</span>
                            </span>
                          )}

                          {patient.triageNote && (
                            <p
                              className={`text-[11px] line-clamp-2 max-w-[210px] italic ${
                                isEmergency
                                  ? 'text-red-950 font-semibold'
                                  : isUrgent
                                  ? 'text-amber-900 font-medium'
                                  : 'text-gray-500'
                              }`}
                            >
                              {patient.triageNote}
                            </p>
                          )}

                          {/* Quick Triage Selector */}
                          <div className="pt-0.5">
                            <select
                              value={patient.triagePriority || 'routine'}
                              onChange={(e) => {
                                const newPrio = e.target.value as TriagePriority;
                                if (onUpdatePatient) {
                                  onUpdatePatient({
                                    ...patient,
                                    triagePriority: newPrio,
                                  });
                                }
                              }}
                              className="text-[10px] font-sans text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 cursor-pointer focus:outline-none focus:border-red-600"
                              title="Update clinical triage tag"
                            >
                              <option value="routine">Set Routine</option>
                              <option value="urgent">Set Urgent</option>
                              <option value="emergency">Set Emergency</option>
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* Clinic Status */}
                      <td className="py-3.5 px-4">
                        {patient.visitStatus === 'in_exam' && (
                          <div>
                            <span className="font-semibold text-red-800">In Exam Room</span>
                            <div className="text-[11px] text-gray-500 font-mono">{patient.scheduledTime}</div>
                          </div>
                        )}
                        {patient.visitStatus === 'waiting' && (
                          <div>
                            <span className="font-semibold text-amber-700">In Waiting Area</span>
                            <div className="text-[11px] text-gray-500 font-mono">{patient.scheduledTime}</div>
                          </div>
                        )}
                        {patient.visitStatus === 'scheduled_today' && (
                          <div>
                            <span className="font-semibold text-gray-800">Scheduled Today</span>
                            <div className="text-[11px] text-gray-500 font-mono">{patient.scheduledTime}</div>
                          </div>
                        )}
                        {patient.visitStatus === 'completed' && (
                          <div>
                            <span className="text-gray-500 font-medium">Encounter Complete</span>
                            <div className="text-[11px] text-gray-400 font-mono">{patient.scheduledTime}</div>
                          </div>
                        )}
                        {(!patient.visitStatus || patient.visitStatus === 'not_scheduled') && (
                          <span className="text-gray-400">Rostered / Recall</span>
                        )}
                      </td>

                      {/* Active Problems */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {patient.activeProblems.length > 0 ? (
                          <div className="space-y-1">
                            {patient.activeProblems.slice(0, 2).map((prb) => (
                              <div key={prb.id} className="text-gray-800 truncate">
                                <span className="font-mono text-gray-400 mr-1 text-[11px]">
                                  {prb.icdCode}
                                </span>
                                <span>{prb.description}</span>
                              </div>
                            ))}
                            {patient.activeProblems.length > 2 && (
                              <div className="text-[11px] text-gray-400 font-mono">
                                +{patient.activeProblems.length - 2} more conditions
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No chronic diagnoses</span>
                        )}
                      </td>

                      {/* Safety & Allergies */}
                      <td className="py-3.5 px-4">
                        {patient.allergies.length > 0 ? (
                          <div className="space-y-0.5">
                            {patient.allergies.map((alg) => (
                              <div
                                key={alg.id}
                                className={`text-[11px] flex items-center gap-1 ${
                                  alg.severity === 'severe_anaphylaxis'
                                    ? 'text-red-700 font-bold'
                                    : 'text-amber-800 font-medium'
                                }`}
                              >
                                {alg.severity === 'severe_anaphylaxis' && (
                                  <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                )}
                                <span>{alg.allergen}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-[11px] font-mono">NKDA</span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onStartEncounter(patient)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors cursor-pointer"
                            title="Start or open clinical SOAP encounter"
                          >
                            <Activity className="w-3.5 h-3.5 text-red-700" />
                            <span>SOAP Chart</span>
                          </button>
                          <button
                            onClick={() => onSelectPatient(patient)}
                            className="p-1 text-gray-400 hover:text-gray-800 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                            title="View Full Patient Dossier"
                          >
                            <ArrowRight className="w-4 h-4" />
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
          <div className="py-12 px-4 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-800">No matching patient records found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search criteria or register a new patient intake.
            </p>
            <button
              onClick={onNewPatient}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Patient Intake</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
