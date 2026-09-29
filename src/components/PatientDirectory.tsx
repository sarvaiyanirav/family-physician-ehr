import React, { useState, useMemo } from 'react';
import { Search, Plus, FileText, ArrowRight, AlertTriangle, Activity } from 'lucide-react';
import { Patient } from '../types/clinical';
import { calculateAge } from '../services/storageService';

interface PatientDirectoryProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient, tab?: string) => void;
  onNewPatient: () => void;
  onStartEncounter: (patient: Patient) => void;
}

export const PatientDirectory: React.FC<PatientDirectoryProps> = ({
  patients,
  onSelectPatient,
  onNewPatient,
  onStartEncounter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'today' | 'in_exam' | 'waiting' | 'chronic'>('all');

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Filter tab
      if (filterMode === 'today' && patient.visitStatus !== 'scheduled_today' && patient.visitStatus !== 'in_exam' && patient.visitStatus !== 'waiting' && patient.visitStatus !== 'completed') {
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

      return (
        fullName.includes(term) ||
        mrn.includes(term) ||
        phone.includes(term) ||
        conditions.includes(term) ||
        allergies.includes(term)
      );
    });
  }, [patients, filterMode, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Section: Clinic Overview Banner & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Cascade Family Practice Registry
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
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
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, MRN, condition..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <button
            onClick={onNewPatient}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Intake</span>
          </button>
        </div>
      </div>

      {/* Segmented Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Patients ({patients.length})
          </button>
          <button
            onClick={() => setFilterMode('today')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filterMode === 'today'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today&apos;s Clinic ({patients.filter((p) => p.visitStatus && p.visitStatus !== 'not_scheduled').length})
          </button>
          <button
            onClick={() => setFilterMode('in_exam')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filterMode === 'in_exam'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Exam ({patients.filter((p) => p.visitStatus === 'in_exam').length})
          </button>
          <button
            onClick={() => setFilterMode('waiting')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filterMode === 'waiting'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Waiting Room ({patients.filter((p) => p.visitStatus === 'waiting').length})
          </button>
          <button
            onClick={() => setFilterMode('chronic')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              filterMode === 'chronic'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chronic Disease Cohort
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing {filteredPatients.length} of {patients.length} records
        </div>
      </div>

      {/* Patient Table Grid */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {filteredPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">Patient Name & MRN</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Clinic Status</th>
                  <th className="py-3 px-4">Active Conditions / Problem List</th>
                  <th className="py-3 px-4">Safety & Allergies</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => {
                  const age = calculateAge(patient.dob);
                  const latestEncounter = patient.encounters[0];
                  const hasSevereAllergy = patient.allergies.some(
                    (a) => a.severity === 'severe_anaphylaxis'
                  );

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => onSelectPatient(patient)}
                    >
                      {/* Name & MRN */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                          {patient.lastName}, {patient.firstName}
                          {patient.preferredName && (
                            <span className="text-xs font-normal text-slate-500 ml-1">
                              &ldquo;{patient.preferredName}&rdquo;
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] mt-0.5">
                          <span>{patient.mrn}</span>
                          <span aria-hidden="true">·</span>
                          <span>{patient.healthCardNumber}</span>
                        </div>
                      </td>

                      {/* Demographics */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-medium text-slate-900">
                          {age} yrs <span className="text-slate-400 capitalize">/ {patient.sex}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          DOB: <span className="font-mono">{patient.dob}</span>
                        </div>
                      </td>

                      {/* Clinic Status */}
                      <td className="py-3.5 px-4">
                        {patient.visitStatus === 'in_exam' && (
                          <div>
                            <span className="font-semibold text-teal-800">In Exam Room</span>
                            <div className="text-[11px] text-slate-500 font-mono">{patient.scheduledTime}</div>
                          </div>
                        )}
                        {patient.visitStatus === 'waiting' && (
                          <div>
                            <span className="font-semibold text-amber-700">In Waiting Area</span>
                            <div className="text-[11px] text-slate-500 font-mono">{patient.scheduledTime}</div>
                          </div>
                        )}
                        {patient.visitStatus === 'scheduled_today' && (
                          <div>
                            <span className="font-semibold text-slate-800">Scheduled Today</span>
                            <div className="text-[11px] text-slate-500 font-mono">{patient.scheduledTime}</div>
                          </div>
                        )}
                        {patient.visitStatus === 'completed' && (
                          <div>
                            <span className="text-slate-500 font-medium">Encounter Complete</span>
                            <div className="text-[11px] text-slate-400 font-mono">{patient.scheduledTime}</div>
                          </div>
                        )}
                        {(!patient.visitStatus || patient.visitStatus === 'not_scheduled') && (
                          <span className="text-slate-400">Rostered / Recall</span>
                        )}
                      </td>

                      {/* Active Problems */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {patient.activeProblems.length > 0 ? (
                          <div className="space-y-1">
                            {patient.activeProblems.slice(0, 2).map((prb) => (
                              <div key={prb.id} className="text-slate-800 truncate">
                                <span className="font-mono text-slate-400 mr-1 text-[11px]">
                                  {prb.icdCode}
                                </span>
                                <span>{prb.description}</span>
                              </div>
                            ))}
                            {patient.activeProblems.length > 2 && (
                              <div className="text-[11px] text-slate-400 font-mono">
                                +{patient.activeProblems.length - 2} more conditions
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No chronic diagnoses</span>
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
                                    ? 'text-rose-700 font-bold'
                                    : 'text-amber-800 font-medium'
                                }`}
                              >
                                {alg.severity === 'severe_anaphylaxis' && (
                                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                )}
                                <span>{alg.allergen}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono">NKDA</span>
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
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors cursor-pointer"
                            title="Start or open clinical SOAP encounter"
                          >
                            <Activity className="w-3.5 h-3.5 text-teal-700" />
                            <span>SOAP Chart</span>
                          </button>
                          <button
                            onClick={() => onSelectPatient(patient)}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
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
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No matching patient records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search criteria or register a new patient intake.
            </p>
            <button
              onClick={onNewPatient}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Patient</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
