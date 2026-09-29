import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  FileText,
  Activity,
  Pill,
  ShieldAlert,
  Calendar,
  Phone,
  User,
  Heart,
  AlertTriangle,
  Printer,
  CheckCircle,
  Clock,
  Trash2,
  Edit2,
  Syringe,
  FileCheck,
  TrendingUp,
  TestTube,
  AlertOctagon,
} from 'lucide-react';
import { Patient, Encounter, Medication, Problem, Allergy, TriagePriority } from '../types/clinical';
import { calculateAge, calculateBmi } from '../services/storageService';
import { COMMON_PRIMARY_CARE_ICD10 } from '../data/icdCodes';
import { PediatricGrowthChart } from './PediatricGrowthChart';
import { LabsManagement } from './LabsManagement';

interface PatientChartProps {
  patient: Patient;
  onBack: () => void;
  onStartEncounter: (encounter?: Encounter) => void;
  onUpdatePatient: (updated: Patient) => void;
  onOpenCalculators: () => void;
}

export const PatientChart: React.FC<PatientChartProps> = ({
  patient,
  onBack,
  onStartEncounter,
  onUpdatePatient,
  onOpenCalculators,
}) => {
  const [activeTab, setActiveTab] = useState<'encounters' | 'meds_problems' | 'vitals' | 'growth_chart' | 'labs' | 'history' | 'preventive' | 'print'>('encounters');
  const [selectedEncounterForView, setSelectedEncounterForView] = useState<Encounter | null>(
    patient.encounters[0] || null
  );

  // Quick modals for adding problem or medication
  const [isAddingProblem, setIsAddingProblem] = useState(false);
  const [newProbCode, setNewProbCode] = useState('I10');
  const [newProbName, setNewProbName] = useState('Essential (primary) hypertension');
  const [newProbNotes, setNewProbNotes] = useState('');

  const [isAddingMed, setIsAddingMed] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedFreq, setNewMedFreq] = useState('Once daily');
  const [newMedIndication, setNewMedIndication] = useState('');

  const [isAddingAllergy, setIsAddingAllergy] = useState(false);
  const [newAlgSubstance, setNewAlgSubstance] = useState('');
  const [newAlgReaction, setNewAlgReaction] = useState('');
  const [newAlgSeverity, setNewAlgSeverity] = useState<Allergy['severity']>('moderate');

  const age = calculateAge(patient.dob);
  const latestVitals = patient.encounters[0]?.vitals;
  const bmiObj = latestVitals ? calculateBmi(latestVitals.weightKg, latestVitals.heightCm) : null;

  const handleAddProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProbName.trim()) return;
    const newProb: Problem = {
      id: `prb-${Date.now()}`,
      icdCode: newProbCode,
      description: newProbName.trim(),
      status: 'active',
      onsetDate: new Date().toISOString().slice(0, 10),
      notes: newProbNotes.trim() || undefined,
    };
    const updated = {
      ...patient,
      activeProblems: [newProb, ...patient.activeProblems],
    };
    onUpdatePatient(updated);
    setIsAddingProblem(false);
    setNewProbNotes('');
  };

  const handleToggleProblemStatus = (problemId: string) => {
    const updatedProblems = patient.activeProblems.map((p) => {
      if (p.id === problemId) {
        return {
          ...p,
          status: (p.status === 'active' ? 'resolved' : 'active') as Problem['status'],
        };
      }
      return p;
    });
    onUpdatePatient({ ...patient, activeProblems: updatedProblems });
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDose.trim()) return;
    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDose.trim(),
      route: 'Oral',
      frequency: newMedFreq.trim(),
      indication: newMedIndication.trim() || 'General maintenance',
      prescribedDate: new Date().toISOString().slice(0, 10),
      prescribedBy: patient.primaryPhysician || 'Dr. Sarah Lin, MD',
      status: 'active',
    };
    onUpdatePatient({ ...patient, medications: [newMed, ...patient.medications] });
    setIsAddingMed(false);
    setNewMedName('');
    setNewMedDose('');
    setNewMedIndication('');
  };

  const handleToggleMedStatus = (medId: string) => {
    const updatedMeds = patient.medications.map((m) => {
      if (m.id === medId) {
        return {
          ...m,
          status: (m.status === 'active' ? 'discontinued' : 'active') as Medication['status'],
        };
      }
      return m;
    });
    onUpdatePatient({ ...patient, medications: updatedMeds });
  };

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlgSubstance.trim()) return;
    const newAlg: Allergy = {
      id: `alg-${Date.now()}`,
      allergen: newAlgSubstance.trim(),
      type: 'drug',
      reaction: newAlgReaction.trim() || 'Allergic reaction',
      severity: newAlgSeverity,
      identifiedDate: new Date().toISOString().slice(0, 10),
    };
    onUpdatePatient({
      ...patient,
      allergies: [...patient.allergies, newAlg],
      clinicalAlerts: [...patient.clinicalAlerts, `${newAlgSubstance.trim()} allergy`],
    });
    setIsAddingAllergy(false);
    setNewAlgSubstance('');
    setNewAlgReaction('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Registry</span>
        </button>

        <div className="flex items-center gap-2">
          {age <= 20 && (
            <button
              onClick={() => setActiveTab('growth_chart')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer border ${
                activeTab === 'growth_chart'
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'text-teal-800 bg-teal-50 border-teal-200 hover:bg-teal-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Pediatric Growth Chart</span>
            </button>
          )}

          <button
            onClick={onOpenCalculators}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-teal-700" />
            <span>Clinical Calculators</span>
          </button>

          <button
            onClick={() => onStartEncounter()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Clinical Encounter</span>
          </button>
        </div>
      </div>

      {/* Primary Patient Dossier Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {patient.lastName}, {patient.firstName}
                {patient.preferredName && (
                  <span className="text-base font-normal text-slate-500 ml-2">
                    &ldquo;{patient.preferredName}&rdquo;
                  </span>
                )}
              </h1>
              <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                MRN: {patient.mrn}
              </span>
              <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                HC: {patient.healthCardNumber}
              </span>

              {/* Triage Priority Badge & Selector */}
              <div className="flex items-center gap-1.5">
                <select
                  value={patient.triagePriority || 'routine'}
                  onChange={(e) => {
                    onUpdatePatient({
                      ...patient,
                      triagePriority: e.target.value as TriagePriority,
                    });
                  }}
                  className={`text-xs font-bold px-2 py-1 rounded border cursor-pointer uppercase ${
                    patient.triagePriority === 'emergency'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : patient.triagePriority === 'urgent'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Update Triage Priority"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              {patient.codeStatus !== 'Full Code' ? (
                <span className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded">
                  {patient.codeStatus}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded">
                  Full Code
                </span>
              )}
            </div>

            {patient.triagePriority === 'emergency' && (
              <div className="mt-3 p-3 bg-rose-50 border-2 border-rose-500 rounded-md flex items-center justify-between gap-3 text-xs text-rose-950">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                  <div>
                    <span className="font-bold">CRITICAL EMERGENCY TRIAGE PRIORITY:</span>{' '}
                    <span>{patient.triageNote || 'Immediate medical evaluation and clinical stabilization recommended.'}</span>
                  </div>
                </div>
                <button
                  onClick={() => onStartEncounter()}
                  className="px-3 py-1 font-bold text-white bg-rose-700 hover:bg-rose-800 rounded shadow-xs cursor-pointer shrink-0"
                >
                  Immediate Encounter →
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2 font-mono">
              <span>{age} years old</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{patient.sex}</span>
              <span aria-hidden="true">·</span>
              <span>DOB: {patient.dob}</span>
              <span aria-hidden="true">·</span>
              <span>Ph: {patient.phone}</span>
              <span aria-hidden="true">·</span>
              <span>Physician: {patient.primaryPhysician}</span>
            </div>
          </div>

          {/* Recent Vitals Strip */}
          {latestVitals && (
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-md border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Latest BP</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {latestVitals.systolicBp}/{latestVitals.diastolicBp}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">mmHg</span>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Pulse</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {latestVitals.heartRate}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">BPM</span>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">BMI</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {bmiObj?.bmi || latestVitals.bmi || '—'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">kg/m²</span>
              </div>
            </div>
          )}
        </div>

        {/* Safety & Allergy Strip */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Allergies:</span>
            {patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((alg) => (
                  <span
                    key={alg.id}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                      alg.severity === 'severe_anaphylaxis'
                        ? 'bg-rose-100 text-rose-900 font-bold border border-rose-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {alg.severity === 'severe_anaphylaxis' && (
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                    )}
                    <span>{alg.allergen}</span>
                    <span className="text-slate-500">({alg.reaction})</span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-500 font-mono">No Known Drug Allergies (NKDA)</span>
            )}
          </div>

          <div className="text-slate-500 text-[11px]">
            Emergency Contact: <span className="font-medium text-slate-800">{patient.emergencyContact.name}</span> ({patient.emergencyContact.relationship}) · <span className="font-mono">{patient.emergencyContact.phone}</span>
          </div>
        </div>
      </div>

      {/* Longitudinal Dossier Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('encounters')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'encounters'
                ? 'border-teal-700 text-teal-800 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Clinical Encounters & SOAP Notes ({patient.encounters.length})
          </button>
          <button
            onClick={() => setActiveTab('meds_problems')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'meds_problems'
                ? 'border-teal-700 text-teal-800 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Medications & Problem List ({patient.medications.length} / {patient.activeProblems.length})
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'vitals'
                ? 'border-teal-700 text-teal-800 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Vitals & Flowsheet
          </button>
          {age <= 20 && (
            <button
              onClick={() => setActiveTab('growth_chart')}
              className={`py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'growth_chart'
                  ? 'border-teal-700 text-teal-800 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
              <span>Pediatric Growth Chart</span>
              <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-1.5 py-0.5 rounded border border-teal-200">
                CDC Curves
              </span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('labs')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'labs'
                ? 'border-teal-700 text-teal-800 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <TestTube className="w-3.5 h-3.5 text-teal-700" />
            <span>Labs & Diagnostics ({patient.labResults.length})</span>
            {patient.labResults.some((l) => l.flag !== 'normal') && (
              <span className="text-[10px] bg-rose-50 text-rose-800 font-bold px-1.5 py-0.5 rounded border border-rose-200">
                {patient.labResults.filter((l) => l.flag !== 'normal').length} Abnormal
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-teal-700 text-teal-800 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Allergies & Medical/Family History
          </button>
          <button
            onClick={() => setActiveTab('preventive')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'preventive'
                ? 'border-teal-700 text-teal-800 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Preventive & Immunizations
          </button>
          <button
            onClick={() => setActiveTab('print')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'print'
                ? 'border-teal-700 text-teal-800 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Printable Documents & AVS
          </button>
        </nav>
      </div>

      {/* TAB CONTENT 1: ENCOUNTERS & SOAP NOTES */}
      {activeTab === 'encounters' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Encounter Timeline</h2>
            <button
              onClick={() => onStartEncounter()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Encounter</span>
            </button>
          </div>

          {patient.encounters.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Encounter List on Left */}
              <div className="space-y-3">
                {patient.encounters.map((enc) => {
                  const isSelected = selectedEncounterForView?.id === enc.id;
                  return (
                    <div
                      key={enc.id}
                      onClick={() => setSelectedEncounterForView(enc)}
                      className={`p-4 rounded-lg border transition-all cursor-pointer text-xs ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          {new Date(enc.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span
                          className={`font-medium text-[11px] ${
                            enc.status === 'signed' ? 'text-teal-700' : 'text-amber-700'
                          }`}
                        >
                          {enc.status === 'signed' ? 'Signed' : 'Draft'}
                        </span>
                      </div>

                      <div className="text-slate-600 mt-1 font-medium capitalize">
                        {enc.type.replace('_', ' ')}
                      </div>

                      <div className="text-slate-700 mt-1 line-clamp-2">
                        {enc.reasonForVisit || enc.chiefComplaint}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-500 font-mono text-[11px]">
                        <span>{enc.provider}</span>
                        <span>CPT: {enc.billingCode || '99214'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Encounter Detailed View on Right */}
              {selectedEncounterForView && (
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Clinical Encounter Note —{' '}
                        {new Date(selectedEncounterForView.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                      <div className="text-slate-500 text-xs font-mono mt-0.5">
                        Provider: {selectedEncounterForView.provider} · CPT Billing: {selectedEncounterForView.billingCode || '99214'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onStartEncounter(selectedEncounterForView)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit / Resume</span>
                      </button>
                      <button
                        onClick={handlePrint}
                        className="p-1 text-slate-500 hover:text-slate-800 rounded cursor-pointer"
                        title="Print Note"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Vitals */}
                  {selectedEncounterForView.vitals && (
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <div className="font-semibold text-slate-700 mb-1">Encounter Vitals:</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                        <div>BP: <span className="font-bold text-slate-900">{selectedEncounterForView.vitals.systolicBp}/{selectedEncounterForView.vitals.diastolicBp} mmHg</span></div>
                        <div>HR: <span className="font-bold text-slate-900">{selectedEncounterForView.vitals.heartRate} bpm</span></div>
                        <div>RR: <span className="font-bold text-slate-900">{selectedEncounterForView.vitals.respiratoryRate} /min</span></div>
                        <div>SpO2: <span className="font-bold text-slate-900">{selectedEncounterForView.vitals.oxygenSaturation}%</span></div>
                        <div>Temp: <span className="font-bold text-slate-900">{selectedEncounterForView.vitals.temperatureC}°C</span></div>
                        <div>Wt: <span className="font-bold text-slate-900">{selectedEncounterForView.vitals.weightKg} kg</span></div>
                        <div>BMI: <span className="font-bold text-slate-900">{selectedEncounterForView.vitals.bmi || '—'}</span></div>
                        <div>Pain: <span className="font-bold text-slate-900">{selectedEncounterForView.vitals.painScore || 0}/10</span></div>
                      </div>
                    </div>
                  )}

                  {/* Subjective */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-teal-800 mb-1">
                      Subjective
                    </h4>
                    <p className="text-slate-700 font-medium">Chief Complaint: {selectedEncounterForView.chiefComplaint}</p>
                    <p className="text-slate-700 mt-2 leading-relaxed whitespace-pre-line">
                      {selectedEncounterForView.hpi}
                    </p>
                  </div>

                  {/* ROS */}
                  {selectedEncounterForView.reviewOfSystems && Object.keys(selectedEncounterForView.reviewOfSystems).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-800 text-xs mb-1">Review of Systems (ROS):</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded">
                        {Object.entries(selectedEncounterForView.reviewOfSystems).map(([sys, text]) => (
                          <div key={sys}>
                            <span className="font-medium text-slate-900">{sys}: </span>
                            <span>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Objective (Physical Exam) */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-teal-800 mb-1">
                      Objective (Physical Examination)
                    </h4>
                    <div className="space-y-1 text-slate-700 leading-relaxed">
                      {Object.entries(selectedEncounterForView.physicalExam).map(([sys, findings]) => (
                        <div key={sys}>
                          <span className="font-semibold text-slate-900">{sys}: </span>
                          <span>{findings}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assessment */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-teal-800 mb-1">
                      Assessment & Diagnoses
                    </h4>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded space-y-1">
                      <div className="font-semibold text-slate-900">
                        1. {selectedEncounterForView.assessment.primaryDiagnosis.name} (ICD-10: {selectedEncounterForView.assessment.primaryDiagnosis.code})
                      </div>
                      {selectedEncounterForView.assessment.secondaryDiagnoses.map((sec, idx) => (
                        <div key={sec.code} className="text-slate-700">
                          {idx + 2}. {sec.name} (ICD-10: {sec.code})
                        </div>
                      ))}
                      {selectedEncounterForView.assessment.clinicalSummary && (
                        <div className="text-slate-600 italic pt-1 border-t border-slate-200 mt-2">
                          Clinical Synthesis: {selectedEncounterForView.assessment.clinicalSummary}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Plan */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-teal-800 mb-1">
                      Plan & Treatment
                    </h4>
                    <div className="space-y-3">
                      {/* Prescriptions */}
                      {selectedEncounterForView.plan.prescriptions.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-800">Prescriptions:</span>
                          <ul className="list-disc list-inside mt-1 space-y-1 text-slate-700">
                            {selectedEncounterForView.plan.prescriptions.map((rx) => (
                              <li key={rx.id}>
                                <span className="font-semibold">{rx.drug} {rx.dose}</span> — {rx.frequency} ({rx.instructions})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Orders */}
                      {selectedEncounterForView.plan.labOrders.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-800">Diagnostics Ordered:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedEncounterForView.plan.labOrders.map((lab) => (
                              <span key={lab} className="px-2 py-0.5 bg-teal-50 text-teal-900 rounded border border-teal-200 text-[11px]">
                                {lab}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Patient Instructions */}
                      {selectedEncounterForView.plan.patientInstructions && (
                        <div>
                          <span className="font-semibold text-slate-800">Patient Counseling & Care Plan:</span>
                          <p className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded">
                            {selectedEncounterForView.plan.patientInstructions}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px] pt-2 border-t border-slate-100">
                        <span>Follow-up: <strong className="text-slate-900">{selectedEncounterForView.plan.followUpIn}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Signed by: <strong className="text-slate-900">{selectedEncounterForView.provider}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800">No encounters charted yet for this patient</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Begin documentation with a new SOAP encounter using validated clinical templates.
              </p>
              <button
                onClick={() => onStartEncounter()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start First Encounter</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: MEDICATIONS & PROBLEM LIST */}
      {activeTab === 'meds_problems' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Medications */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">Current Medications List</h3>
              </div>
              <button
                onClick={() => setIsAddingMed(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Prescribe / Add Rx</span>
              </button>
            </div>

            {/* Add Med Form */}
            {isAddingMed && (
              <form onSubmit={handleAddMedication} className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-3 text-xs">
                <div className="font-semibold text-slate-800">New Medication Entry</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="Drug name (e.g. Atorvastatin)"
                    className="px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={newMedDose}
                    onChange={(e) => setNewMedDose(e.target.value)}
                    placeholder="Dose (e.g. 20 mg)"
                    className="px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newMedFreq}
                    onChange={(e) => setNewMedFreq(e.target.value)}
                    placeholder="Frequency (e.g. Once daily at bedtime)"
                    className="px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newMedIndication}
                    onChange={(e) => setNewMedIndication(e.target.value)}
                    placeholder="Indication (e.g. Hyperlipidemia)"
                    className="px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingMed(false)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-teal-700 text-white rounded font-medium cursor-pointer"
                  >
                    Save Rx
                  </button>
                </div>
              </form>
            )}

            {patient.medications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {patient.medications.map((med) => (
                  <div key={med.id} className="py-3 flex items-start justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{med.name} {med.dosage}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            med.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {med.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        {med.route} · {med.frequency} · Indication: {med.indication}
                      </div>
                      <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                        Prescribed: {med.prescribedDate} by {med.prescribedBy}
                      </div>
                      {med.adherenceNotes && (
                        <div className="text-teal-800 text-[11px] italic mt-0.5">
                          Adherence: {med.adherenceNotes}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleMedStatus(med.id)}
                      className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded cursor-pointer shrink-0"
                    >
                      {med.status === 'active' ? 'Discontinue' : 'Reactivate'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4">No medications on profile.</p>
            )}
          </div>

          {/* Active Problems List */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">Problem List & Chronic Diagnoses</h3>
              </div>
              <button
                onClick={() => setIsAddingProblem(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Diagnosis</span>
              </button>
            </div>

            {/* Add Problem Form */}
            {isAddingProblem && (
              <form onSubmit={handleAddProblem} className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-3 text-xs">
                <div className="font-semibold text-slate-800">Add Clinical Problem</div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newProbCode}
                    onChange={(e) => setNewProbCode(e.target.value)}
                    placeholder="ICD-10 (e.g. I10)"
                    className="px-2 py-1 font-mono bg-white border border-slate-300 rounded focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={newProbName}
                    onChange={(e) => setNewProbName(e.target.value)}
                    placeholder="Diagnosis name"
                    className="col-span-2 px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none"
                  />
                </div>
                <textarea
                  rows={2}
                  value={newProbNotes}
                  onChange={(e) => setNewProbNotes(e.target.value)}
                  placeholder="Clinical tracking notes (e.g. target values, control status)..."
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingProblem(false)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-teal-700 text-white rounded font-medium cursor-pointer"
                  >
                    Save Condition
                  </button>
                </div>
              </form>
            )}

            {patient.activeProblems.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {patient.activeProblems.map((prob) => (
                  <div key={prob.id} className="py-3 flex items-start justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 font-semibold">[{prob.icdCode}]</span>
                        <span className="font-bold text-slate-900">{prob.description}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            prob.status === 'active'
                              ? 'bg-teal-50 text-teal-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {prob.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                        Onset: {prob.onsetDate}
                      </div>
                      {prob.notes && (
                        <div className="text-slate-600 text-[11px] mt-1 bg-slate-50 p-1.5 rounded">
                          {prob.notes}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleProblemStatus(prob.id)}
                      className="text-xs text-slate-500 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded cursor-pointer shrink-0"
                    >
                      {prob.status === 'active' ? 'Mark Resolved' : 'Mark Active'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4">No active problems recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: VITALS FLOWSHEET */}
      {activeTab === 'vitals' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Longitudinal Vitals Flowsheet</h3>
              <p className="text-xs text-slate-500">
                Chronological vital signs captured across clinic encounters
              </p>
            </div>
            <div className="flex items-center gap-2">
              {age <= 20 && (
                <button
                  onClick={() => setActiveTab('growth_chart')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
                  <span>CDC Growth Chart</span>
                </button>
              )}
              <button
                onClick={() => onStartEncounter()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Capture New Vitals</span>
              </button>
            </div>
          </div>

          {age <= 20 && (
            <div className="bg-teal-50/80 border border-teal-200 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-teal-950">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-700 shrink-0" />
                <span>
                  <strong>Pediatric Anthropometrics Active:</strong> Plot stature, weight, and BMI percentiles (5th–95th) against standard CDC curves.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('growth_chart')}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                View Pediatric Growth Chart →
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Blood Pressure (mmHg)</th>
                  <th className="py-2.5 px-3">Heart Rate (bpm)</th>
                  <th className="py-2.5 px-3">Resp Rate (/min)</th>
                  <th className="py-2.5 px-3">SpO2 (%)</th>
                  <th className="py-2.5 px-3">Temp (°C)</th>
                  <th className="py-2.5 px-3">Weight (kg)</th>
                  <th className="py-2.5 px-3">BMI (kg/m²)</th>
                  <th className="py-2.5 px-3">Pain (0-10)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patient.encounters.map((enc) => {
                  const v = enc.vitals;
                  const isHighBp = v.systolicBp && (v.systolicBp >= 140 || (v.diastolicBp && v.diastolicBp >= 90));
                  return (
                    <tr key={enc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-slate-900 font-semibold">
                        {new Date(enc.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold ${isHighBp ? 'text-rose-700' : 'text-slate-900'}`}>
                          {v.systolicBp ? `${v.systolicBp}/${v.diastolicBp}` : '—'}
                        </span>
                        {isHighBp && <span className="text-[10px] text-rose-600 ml-1 font-sans">(! High)</span>}
                      </td>
                      <td className="py-3 px-3">{v.heartRate || '—'}</td>
                      <td className="py-3 px-3">{v.respiratoryRate || '—'}</td>
                      <td className="py-3 px-3">{v.oxygenSaturation ? `${v.oxygenSaturation}%` : '—'}</td>
                      <td className="py-3 px-3">{v.temperatureC ? `${v.temperatureC}°C` : '—'}</td>
                      <td className="py-3 px-3">{v.weightKg ? `${v.weightKg} kg` : '—'}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900">{v.bmi || '—'}</span>
                      </td>
                      <td className="py-3 px-3">{v.painScore ?? 0}/10</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PEDIATRIC GROWTH CHART */}
      {activeTab === 'growth_chart' && (
        <PediatricGrowthChart
          patient={patient}
          onUpdatePatient={onUpdatePatient}
        />
      )}

      {/* TAB CONTENT: LABS & DIAGNOSTICS */}
      {activeTab === 'labs' && (
        <LabsManagement
          patient={patient}
          onUpdatePatient={onUpdatePatient}
        />
      )}

      {/* TAB CONTENT 4: ALLERGIES & HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Allergies Section */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Allergies & Adverse Drug Reactions</h3>
              </div>
              <button
                onClick={() => setIsAddingAllergy(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Allergen</span>
              </button>
            </div>

            {isAddingAllergy && (
              <form onSubmit={handleAddAllergy} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={newAlgSubstance}
                    onChange={(e) => setNewAlgSubstance(e.target.value)}
                    placeholder="Allergen (e.g. Sulfa, Latex)"
                    className="px-2 py-1 bg-white border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    value={newAlgReaction}
                    onChange={(e) => setNewAlgReaction(e.target.value)}
                    placeholder="Reaction (e.g. Hives, Anaphylaxis)"
                    className="px-2 py-1 bg-white border border-slate-300 rounded"
                  />
                  <select
                    value={newAlgSeverity}
                    onChange={(e) => setNewAlgSeverity(e.target.value as any)}
                    className="px-2 py-1 bg-white border border-slate-300 rounded"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe_anaphylaxis">Severe Anaphylaxis</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAllergy(false)}
                    className="px-2 py-1 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-rose-700 text-white rounded font-medium"
                  >
                    Save Allergen
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patient.allergies.map((alg) => (
                <div
                  key={alg.id}
                  className={`p-3 rounded-md border text-xs ${
                    alg.severity === 'severe_anaphylaxis'
                      ? 'border-rose-300 bg-rose-50/60'
                      : 'border-amber-200 bg-amber-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{alg.allergen}</span>
                    <span className="capitalize font-semibold text-[11px] text-slate-600">
                      {alg.severity.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-slate-700 mt-1">Reaction: {alg.reaction}</div>
                  <div className="text-slate-400 font-mono text-[10px] mt-1">
                    Verified: {alg.identifiedDate}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social History & Family History Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Social History */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Social & Lifestyle History
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-slate-700">Tobacco Smoking: </span>
                  <span className="capitalize text-slate-900">{patient.socialHistory.smokingStatus}</span>
                  {patient.socialHistory.smokingPacksPerDay && (
                    <span className="text-slate-500"> ({patient.socialHistory.smokingPacksPerDay} packs/day for {patient.socialHistory.smokingYears} yrs)</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Alcohol Consumption: </span>
                  <span className="capitalize text-slate-900">{patient.socialHistory.alcoholUse}</span>
                  {patient.socialHistory.alcoholDrinksPerWeek !== undefined && (
                    <span className="text-slate-500"> ({patient.socialHistory.alcoholDrinksPerWeek} drinks/wk)</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Occupation: </span>
                  <span className="text-slate-900">{patient.socialHistory.occupation || 'Not documented'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Living Situation: </span>
                  <span className="text-slate-900">{patient.socialHistory.livingArrangement || 'Not documented'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Exercise & Activity: </span>
                  <span className="text-slate-900">{patient.socialHistory.exerciseRoutine || 'Not documented'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Dietary Habits: </span>
                  <span className="text-slate-900">{patient.socialHistory.dietaryHabits || 'Not documented'}</span>
                </div>
              </div>
            </div>

            {/* Family History */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Family Pedigree & Medical History
              </h3>
              {patient.familyHistory.length > 0 ? (
                <div className="space-y-3">
                  {patient.familyHistory.map((item) => (
                    <div key={item.id} className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{item.relation}</span>
                        {item.ageAtOnsetOrDeath && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {item.ageAtOnsetOrDeath}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-700 mt-1">
                        {item.conditions.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No family history recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: PREVENTIVE CARE & LABS */}
      {activeTab === 'preventive' && (
        <div className="space-y-6">
          {/* Preventive Screening Deadlines */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              USPSTF Preventive Care & Cancer Screenings
            </h3>
            {patient.preventiveScreenings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {patient.preventiveScreenings.map((scr) => (
                  <div key={scr.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{scr.screeningType}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          scr.status === 'up_to_date'
                            ? 'bg-emerald-50 text-emerald-800'
                            : scr.status === 'due_soon'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {scr.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    {scr.resultSummary && (
                      <p className="text-slate-600 mt-1 text-[11px]">{scr.resultSummary}</p>
                    )}
                    <div className="text-slate-400 font-mono text-[10px] mt-2 flex items-center justify-between">
                      <span>Last: {scr.lastCompletedDate || 'None'}</span>
                      <span>Next Due: {scr.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No preventive screenings recorded.</p>
            )}
          </div>

          {/* Immunizations */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Immunization Records
            </h3>
            {patient.immunizations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                {patient.immunizations.map((imm) => (
                  <div key={imm.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-semibold text-slate-900 font-sans">{imm.vaccineName}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Administered: {imm.dateAdministered}</div>
                    <span className="text-[10px] font-semibold text-teal-800 uppercase mt-1 inline-block">
                      {imm.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No vaccines on file.</p>
            )}
          </div>

          {/* Laboratory Results */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Recent Laboratory & Diagnostic Results ({patient.labResults.length})
              </h3>
              <button
                onClick={() => setActiveTab('labs')}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors cursor-pointer"
              >
                <TestTube className="w-3.5 h-3.5 text-teal-700" />
                <span>Open Structured Labs & Parser →</span>
              </button>
            </div>
            {patient.labResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Test Name</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Value</th>
                      <th className="py-2 px-3">Reference Range</th>
                      <th className="py-2 px-3">Collected Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patient.labResults.map((lab) => (
                      <tr key={lab.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">{lab.testName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{lab.category}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`font-bold ${
                              lab.flag === 'high' || lab.flag === 'critical'
                                ? 'text-rose-700'
                                : lab.flag === 'low'
                                ? 'text-amber-700'
                                : 'text-slate-900'
                            }`}
                          >
                            {lab.value} {lab.unit}
                          </span>
                          {lab.flag !== 'normal' && (
                            <span className="text-[10px] text-rose-600 ml-1 font-sans">
                              ({lab.flag.toUpperCase()})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{lab.referenceRange}</td>
                        <td className="py-2.5 px-3 text-slate-500">{lab.collectedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No lab results on profile.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: PRINTABLE DOCUMENTS & AFTER-VISIT SUMMARY */}
      {activeTab === 'print' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Patient After-Visit Summary (AVS) & Clinical Dossier
              </h2>
              <p className="text-xs text-slate-500">
                Print-ready official document formatted for patient handoff or physician chart transfer
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document / Save as PDF</span>
            </button>
          </div>

          {/* Printable Container (styled for crisp printing) */}
          <div className="p-8 border border-slate-200 rounded-lg max-w-4xl mx-auto space-y-6 bg-white text-slate-900 text-xs">
            {/* Clinical Letterhead */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <h1 className="text-lg font-bold uppercase tracking-tight text-slate-900">
                  Cascade Family Health Centre
                </h1>
                <p className="text-slate-600 text-xs mt-0.5">
                  Primary Care, Preventive Medicine & Chronic Disease Management
                </p>
                <p className="text-slate-500 font-mono text-[11px]">
                  740 SW Horizon Blvd · Portland, OR 97201 · Ph: (503) 555-0190
                </p>
              </div>
              <div className="text-right font-mono text-[11px] text-slate-600">
                <div>Date: {new Date().toLocaleDateString()}</div>
                <div>Attending: {patient.primaryPhysician}</div>
              </div>
            </div>

            {/* Patient Header Block */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="font-semibold">Patient: </span>
                <span className="text-slate-900 font-bold">{patient.lastName}, {patient.firstName}</span>
                <div className="text-slate-600 font-mono">DOB: {patient.dob} ({age} yrs) · {patient.sex}</div>
                <div className="text-slate-600 font-mono">MRN: {patient.mrn} · HC: {patient.healthCardNumber}</div>
              </div>
              <div>
                <span className="font-semibold text-rose-800">Drug Allergies: </span>
                <span className="text-slate-900 font-medium">
                  {patient.allergies.length > 0
                    ? patient.allergies.map((a) => `${a.allergen} (${a.reaction})`).join('; ')
                    : 'No Known Drug Allergies (NKDA)'}
                </span>
                <div className="text-slate-600 mt-1">
                  Code Status: <span className="font-bold">{patient.codeStatus}</span>
                </div>
              </div>
            </div>

            {/* Current Active Medications */}
            <div>
              <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Current Prescribed Medications
              </h3>
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-600 border-b border-slate-200">
                    <th className="py-1">Medication</th>
                    <th className="py-1">Dosage & Route</th>
                    <th className="py-1">Frequency / Instructions</th>
                    <th className="py-1">Indication</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patient.medications.filter((m) => m.status === 'active').map((med) => (
                    <tr key={med.id}>
                      <td className="py-1.5 font-bold font-sans">{med.name}</td>
                      <td className="py-1.5">{med.dosage} ({med.route})</td>
                      <td className="py-1.5">{med.frequency}</td>
                      <td className="py-1.5 font-sans text-slate-600">{med.indication}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Active Diagnoses */}
            <div>
              <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                Active Diagnoses & Chronic Problems
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {patient.activeProblems.filter((p) => p.status === 'active').map((p) => (
                  <div key={p.id}>
                    <span className="font-mono text-slate-500 mr-1">[{p.icdCode}]</span>
                    <span className="font-medium text-slate-900">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Encounter Care Instructions */}
            {patient.encounters[0] && (
              <div className="space-y-2">
                <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  Care Plan & Patient Instructions (Visit: {new Date(patient.encounters[0].date).toLocaleDateString()})
                </h3>
                <p className="leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                  {patient.encounters[0].plan.patientInstructions || 'Continue current healthy lifestyle and medication regimen.'}
                </p>
                <div className="font-semibold text-slate-800">
                  Follow-Up Appointment: <span className="font-normal font-mono">{patient.encounters[0].plan.followUpIn}</span>
                </div>
              </div>
            )}

            {/* Red Flag Warning Box */}
            <div className="p-3 border border-rose-300 bg-rose-50/50 rounded text-xs space-y-1">
              <span className="font-bold text-rose-900">When to Seek Emergency Medical Attention:</span>
              <p className="text-rose-800">
                If you experience sudden chest pain or tightness, sudden shortness of breath, sudden facial drooping or weakness in your arms/legs, or severe acute symptoms, call 911 or go to the nearest emergency department immediately.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-8 flex justify-between items-end border-t border-slate-200 text-xs">
              <div>
                <div className="font-mono text-slate-500 text-[10px]">VERIFIED CLINICAL RECORD</div>
                <div className="font-semibold text-slate-900">{patient.primaryPhysician}</div>
              </div>
              <div className="border-t border-slate-400 w-48 text-center pt-1 text-slate-600 font-mono text-[11px]">
                Clinician Signature
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
