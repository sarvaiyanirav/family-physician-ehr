import React from 'react';
import { Clock, User, ArrowRight, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { Patient } from '../types/clinical';
import { calculateAge } from '../services/storageService';

interface TodayScheduleProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onStartEncounter: (patient: Patient) => void;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({
  patients,
  onSelectPatient,
  onStartEncounter,
}) => {
  const scheduledPatients = patients.filter(
    (p) => p.visitStatus && p.visitStatus !== 'not_scheduled'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Today&apos;s Clinic Queue & Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dr. Sarah Lin, MD · Cascade Family Health Centre ·{' '}
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
            In Exam ({patients.filter((p) => p.visitStatus === 'in_exam').length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            Waiting ({patients.filter((p) => p.visitStatus === 'waiting').length})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {scheduledPatients.map((patient) => {
          const age = calculateAge(patient.dob);
          const hasEncounterToday = patient.encounters.some(
            (e) => e.date.slice(0, 10) === new Date().toISOString().slice(0, 10)
          );

          return (
            <div
              key={patient.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="text-center font-mono py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mx-auto mb-0.5" />
                  <span className="text-xs font-bold text-slate-900 block">
                    {patient.scheduledTime || 'Scheduled'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectPatient(patient)}
                      className="font-bold text-base text-slate-900 hover:text-teal-700 transition-colors text-left cursor-pointer"
                    >
                      {patient.lastName}, {patient.firstName}
                    </button>
                    <span className="text-xs font-mono text-slate-500">[{patient.mrn}]</span>
                    {patient.visitStatus === 'in_exam' && (
                      <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        Exam Room 3B
                      </span>
                    )}
                    {patient.visitStatus === 'waiting' && (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Waiting Room (Checked-in)
                      </span>
                    )}
                    {patient.visitStatus === 'completed' && (
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        Visit Signed & Complete
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-1 font-mono">
                    <span>{age} yo {patient.sex}</span>
                    <span aria-hidden="true">·</span>
                    <span>DOB: {patient.dob}</span>
                    <span aria-hidden="true">·</span>
                    <span>Ph: {patient.phone}</span>
                  </div>

                  {/* Chronic Problems & Safety */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    {patient.activeProblems.slice(0, 2).map((prob) => (
                      <span
                        key={prob.id}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]"
                      >
                        {prob.description}
                      </span>
                    ))}
                    {patient.allergies.some((a) => a.severity === 'severe_anaphylaxis') && (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-semibold border border-rose-200 rounded text-[11px] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        <span>Severe Allergy</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectPatient(patient)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  View Dossier
                </button>

                <button
                  onClick={() => onStartEncounter(patient)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Launch SOAP Room</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
