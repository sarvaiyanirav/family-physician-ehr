import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  CheckCircle,
  FileCheck,
  Printer,
  Sparkles,
  AlertCircle,
  ChevronDown,
  Plus,
  Trash2,
  Calendar,
  User,
  HeartPulse,
  Stethoscope,
  Pill,
  ShieldAlert,
} from 'lucide-react';
import { Patient, Encounter, Vitals, PrescriptionOrder, DiagnosisEntry } from '../types/clinical';
import { UserAccount } from '../types/auth';
import { CLINICAL_TEMPLATES } from '../data/clinicalTemplates';
import { COMMON_PRIMARY_CARE_ICD10, COMMON_LAB_ORDERS, COMMON_IMAGING_ORDERS, COMMON_SPECIALTY_REFERRALS } from '../data/icdCodes';
import { calculateBmi } from '../services/storageService';
import { EncounterVitalsDashboard } from './EncounterVitalsDashboard';

interface EncounterCaptureProps {
  patient: Patient;
  existingEncounter?: Encounter;
  onSaveEncounter: (encounter: Encounter, isSigned: boolean) => void;
  onClose: () => void;
  onPrintAVS: (encounter: Encounter) => void;
  onPrintNote: (encounter: Encounter) => void;
  staffUser?: UserAccount;
}

export const EncounterCapture: React.FC<EncounterCaptureProps> = ({
  patient,
  existingEncounter,
  onSaveEncounter,
  onClose,
  onPrintAVS,
  onPrintNote,
  staffUser,
}) => {
  // Provider and visit metadata
  const [provider, setProvider] = useState(existingEncounter?.provider || patient.primaryPhysician || 'Dr. Sarah Lin, MD');
  const [encounterDate, setEncounterDate] = useState(
    existingEncounter?.date ? existingEncounter.date.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [visitType, setVisitType] = useState<Encounter['type']>(existingEncounter?.type || 'follow_up');
  const [billingCode, setBillingCode] = useState(existingEncounter?.billingCode || '99214');
  const [reasonForVisit, setReasonForVisit] = useState(existingEncounter?.reasonForVisit || '');

  // Vitals
  const [vitals, setVitals] = useState<Vitals>(
    existingEncounter?.vitals || {
      systolicBp: 124,
      diastolicBp: 78,
      heartRate: 72,
      respiratoryRate: 16,
      temperatureC: 36.8,
      oxygenSaturation: 98,
      heightCm: 175,
      weightKg: 78.5,
      painScore: 0,
    }
  );

  // Auto-calculated BMI
  const bmiCalc = calculateBmi(vitals.weightKg, vitals.heightCm);

  // Subjective
  const [chiefComplaint, setChiefComplaint] = useState(existingEncounter?.chiefComplaint || '');
  const [hpi, setHpi] = useState(existingEncounter?.hpi || '');
  const [ros, setRos] = useState<Record<string, string>>(
    existingEncounter?.reviewOfSystems || {
      Constitutional: 'No fever, chills, or unexplained weight loss.',
      Cardiovascular: 'No chest pain, palpitations, or orthopnea.',
      Respiratory: 'No shortness of breath or cough.',
      Gastrointestinal: 'No abdominal pain, nausea, or bowel change.',
      Musculoskeletal: 'No acute joint pain or functional limitation.',
      Neurological: 'No focal weakness, dizziness, or headache.',
    }
  );

  // Objective (Physical Exam)
  const [physicalExam, setPhysicalExam] = useState<Record<string, string>>(
    existingEncounter?.physicalExam || {
      General: 'Alert, oriented x 3, well-nourished, no acute distress.',
      HEENT: 'Normocephalic, atraumatic. Pupils equal and reactive. Oropharynx clear.',
      Cardiovascular: 'Regular rate and rhythm. S1/S2 normal. No murmurs or gallops.',
      Respiratory: 'Clear to auscultation bilaterally. Normal respiratory effort.',
      Abdomen: 'Soft, non-tender, non-distended. Normal active bowel sounds.',
      Extremities: 'No cyanosis, clubbing, or peripheral edema. Pulses intact.',
      Neurological: 'Alert, conversational. Normal motor exam and gait.',
    }
  );

  // Assessment
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState<DiagnosisEntry>(
    existingEncounter?.assessment.primaryDiagnosis || {
      code: 'I10',
      name: 'Essential (primary) hypertension',
      isPrimary: true,
    }
  );
  const [secondaryDiagnoses, setSecondaryDiagnoses] = useState<DiagnosisEntry[]>(
    existingEncounter?.assessment.secondaryDiagnoses || []
  );
  const [clinicalSummary, setClinicalSummary] = useState(
    existingEncounter?.assessment.clinicalSummary || ''
  );

  // Plan
  const [prescriptions, setPrescriptions] = useState<PrescriptionOrder[]>(
    existingEncounter?.plan.prescriptions || []
  );
  const [labOrders, setLabOrders] = useState<string[]>(existingEncounter?.plan.labOrders || []);
  const [imagingOrders, setImagingOrders] = useState<string[]>(existingEncounter?.plan.imagingOrders || []);
  const [referrals, setReferrals] = useState<string[]>(existingEncounter?.plan.referrals || []);
  const [patientInstructions, setPatientInstructions] = useState(
    existingEncounter?.plan.patientInstructions || ''
  );
  const [followUpIn, setFollowUpIn] = useState(existingEncounter?.plan.followUpIn || '3 months');
  const [warningSigns, setWarningSigns] = useState<string[]>(
    existingEncounter?.plan.warningSigns || [
      'Chest pain or pressure',
      'Sudden shortness of breath',
      'Sudden severe headache or neurological symptoms',
      'High persistent fever > 101.5°F',
    ]
  );

  // Custom order inputs
  const [customLab, setCustomLab] = useState('');
  const [isSigned, setIsSigned] = useState(existingEncounter?.status === 'signed');

  // Speech Recognition state
  const [isRecordingHpi, setIsRecordingHpi] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecordingHpi) {
      setIsRecordingHpi(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecordingHpi(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript) {
          setHpi((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
        }
      };

      recognition.onerror = () => {
        setIsRecordingHpi(false);
      };

      recognition.onend = () => {
        setIsRecordingHpi(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsRecordingHpi(false);
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    const tpl = CLINICAL_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    setVisitType(tpl.encounterType);
    setReasonForVisit(tpl.defaultReason);
    setChiefComplaint(tpl.defaultReason);
    setHpi(tpl.defaultHpi);
    setRos(tpl.defaultRos);
    setPhysicalExam(tpl.defaultPhysicalExam);
    if (tpl.defaultDiagnoses.length > 0) {
      setPrimaryDiagnosis(tpl.defaultDiagnoses[0]);
      setSecondaryDiagnoses(tpl.defaultDiagnoses.slice(1));
    }
    if (tpl.defaultPrescriptions.length > 0) {
      setPrescriptions(
        tpl.defaultPrescriptions.map((rx, idx) => ({
          ...rx,
          id: `rx-${Date.now()}-${idx}`,
        }))
      );
    }
    setLabOrders(tpl.defaultLabOrders);
    setPatientInstructions(tpl.defaultInstructions);
    setFollowUpIn(tpl.defaultFollowUp);
  };

  const handleSetAllExamNormal = () => {
    setPhysicalExam({
      General: 'Alert, oriented x 4, well nourished, comfortable in exam chair.',
      HEENT: 'Normocephalic, atraumatic. Pupils equal and reactive to light. Mucous membranes moist.',
      Neck: 'Supple, full range of motion. No cervical lymphadenopathy. Thyroid normal size.',
      Cardiovascular: 'Regular rate and rhythm (RRR). S1/S2 normal intensity. No murmur or gallop heard.',
      Respiratory: 'Clear to auscultation bilaterally (CTAB). Good air exchange, no wheezes or crackles.',
      Abdomen: 'Soft, non-tender, non-distended. Normoactive bowel sounds. No guarding or rebound.',
      Musculoskeletal: 'Normal muscle tone and active ROM in all joints. No joint effusions.',
      Skin: 'Warm, dry, intact without suspicious lesions, rash, or petechiae.',
      Neurological: 'Cranial nerves II-XII grossly intact. Normal gait and stance.',
    });
  };

  const handleAddPrescription = () => {
    const newRx: PrescriptionOrder = {
      id: `rx-${Date.now()}`,
      drug: '',
      dose: '',
      route: 'Oral',
      frequency: 'Once daily',
      dispenseQuantity: '30 tablets',
      refills: 0,
      instructions: 'Take 1 tablet daily with water.',
    };
    setPrescriptions([...prescriptions, newRx]);
  };

  const handleUpdatePrescription = (id: string, field: keyof PrescriptionOrder, value: any) => {
    setPrescriptions(
      prescriptions.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleRemovePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
  };

  const handleToggleLab = (labName: string) => {
    if (labOrders.includes(labName)) {
      setLabOrders(labOrders.filter((l) => l !== labName));
    } else {
      setLabOrders([...labOrders, labName]);
    }
  };

  const handleAddCustomLab = () => {
    if (!customLab.trim()) return;
    if (!labOrders.includes(customLab.trim())) {
      setLabOrders([...labOrders, customLab.trim()]);
    }
    setCustomLab('');
  };

  const handleToggleImaging = (img: string) => {
    if (imagingOrders.includes(img)) {
      setImagingOrders(imagingOrders.filter((i) => i !== img));
    } else {
      setImagingOrders([...imagingOrders, img]);
    }
  };

  const handleToggleReferral = (ref: string) => {
    if (referrals.includes(ref)) {
      setReferrals(referrals.filter((r) => r !== ref));
    } else {
      setReferrals([...referrals, ref]);
    }
  };

  const handleSave = (sign: boolean) => {
    const finalEncounter: Encounter = {
      id: existingEncounter?.id || `enc-${Date.now()}`,
      patientId: patient.id,
      date: new Date(encounterDate).toISOString(),
      provider,
      type: visitType,
      reasonForVisit: reasonForVisit.trim() || 'General follow-up visit',
      vitals: {
        ...vitals,
        bmi: bmiCalc?.bmi,
        takenAt: new Date().toISOString(),
      },
      chiefComplaint: chiefComplaint.trim() || reasonForVisit.trim(),
      hpi: hpi.trim(),
      reviewOfSystems: ros,
      physicalExam,
      assessment: {
        primaryDiagnosis,
        secondaryDiagnoses,
        clinicalSummary: clinicalSummary.trim(),
      },
      plan: {
        prescriptions,
        labOrders,
        imagingOrders,
        referrals,
        patientInstructions: patientInstructions.trim(),
        followUpIn,
        warningSigns,
      },
      status: sign ? 'signed' : 'draft',
      signedAt: sign ? new Date().toISOString() : existingEncounter?.signedAt,
      billingCode,
    };

    onSaveEncounter(finalEncounter, sign);
  };

  const getCurrentEncounter = (): Encounter => ({
    id: existingEncounter?.id || `enc-${Date.now()}`,
    patientId: patient.id,
    date: new Date(encounterDate).toISOString(),
    provider,
    type: visitType,
    reasonForVisit: reasonForVisit.trim() || 'General follow-up visit',
    vitals: {
      ...vitals,
      bmi: bmiCalc?.bmi,
      takenAt: new Date().toISOString(),
    },
    chiefComplaint: chiefComplaint.trim() || reasonForVisit.trim(),
    hpi: hpi.trim(),
    reviewOfSystems: ros,
    physicalExam,
    assessment: {
      primaryDiagnosis,
      secondaryDiagnoses,
      clinicalSummary: clinicalSummary.trim(),
    },
    plan: {
      prescriptions,
      labOrders,
      imagingOrders,
      referrals,
      patientInstructions: patientInstructions.trim(),
      followUpIn,
      warningSigns,
    },
    status: isSigned ? 'signed' : 'draft',
    signedAt: isSigned ? existingEncounter?.signedAt || new Date().toISOString() : undefined,
    billingCode,
  });

  const handleImportDiagnosis = (dx: DiagnosisEntry) => {
    if (!primaryDiagnosis || !primaryDiagnosis.name) {
      setPrimaryDiagnosis({ ...dx, isPrimary: true });
    } else {
      const exists = secondaryDiagnoses.some((s) => s.code === dx.code);
      if (!exists && primaryDiagnosis.code !== dx.code) {
        setSecondaryDiagnoses([...secondaryDiagnoses, { ...dx, isPrimary: false }]);
      }
    }
  };

  // Allergy safety check: Alert if prescription matches any patient drug allergy!
  const allergyConflicts = prescriptions
    .filter((rx) => rx.drug.trim().length > 2)
    .filter((rx) =>
      patient.allergies.some((alg) =>
        rx.drug.toLowerCase().includes(alg.allergen.toLowerCase()) ||
        alg.allergen.toLowerCase().includes(rx.drug.toLowerCase())
      )
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner: Patient Context & Allergies Warning */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {patient.lastName}, {patient.firstName}
                </h1>
                <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {patient.mrn}
                </span>
                {patient.codeStatus !== 'Full Code' && (
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {patient.codeStatus}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span>DOB: {patient.dob}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{patient.sex}</span>
                <span aria-hidden="true">·</span>
                <span>HC: {patient.healthCardNumber}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintNote(existingEncounter || ({} as any))}
              disabled={!existingEncounter}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-md transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Note</span>
            </button>

            <button
              onClick={() => onPrintAVS(getCurrentEncounter())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors cursor-pointer"
              title="Preview and print clean PDF Patient Visit Summary (AVS)"
            >
              <FileCheck className="w-3.5 h-3.5 text-red-700" />
              <span>Patient Visit Summary (AVS)</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Safety Banner */}
        {patient.allergies.length > 0 ? (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-rose-800 bg-rose-50/70 p-2.5 rounded-md border border-rose-200">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">Documented Allergies:</span>
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((a) => (
                <span key={a.id} className="underline font-medium">
                  {a.allergen} ({a.reaction} - {a.severity.replace('_', ' ')})
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 pt-2 text-xs text-gray-500 font-mono">
            Safety: No Known Drug Allergies (NKDA)
          </div>
        )}

        {/* Drug Allergy Collision Alert */}
        {allergyConflicts.length > 0 && (
          <div className="mt-2 p-3 bg-rose-600 text-white rounded-md text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>
              CRITICAL WARNING: Prescribed drug &quot;{allergyConflicts[0].drug}&quot; matches documented patient allergy! Review immediately.
            </span>
          </div>
        )}
      </div>

      {/* Rapid Clinical Template Dropdown */}
      <div className="bg-red-50/60 border border-red-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-red-700" />
          <span className="text-xs font-semibold text-red-900">
            Rapid Primary Care Templates:
          </span>
          <span className="text-xs text-red-700 hidden lg:inline">
            Load validated SOAP structures, physical exams, and clinical orders
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {CLINICAL_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleApplyTemplate(tpl.id)}
              className="px-2.5 py-1 text-xs font-medium text-red-900 bg-white border border-red-300 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
            >
              {tpl.name.split(' ')[0]} {tpl.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Encounter Metadata Form */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white border border-gray-200 p-4 rounded-lg shadow-xs text-xs">
        <div>
          <label className="block font-medium text-gray-700 mb-1">Provider</label>
          <input
            type="text"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Date & Time</label>
          <input
            type="datetime-local"
            value={encounterDate}
            onChange={(e) => setEncounterDate(e.target.value)}
            className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">Visit Type</label>
          <select
            value={visitType}
            onChange={(e) => setVisitType(e.target.value as any)}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
          >
            <option value="follow_up">Chronic Follow-up</option>
            <option value="chronic_disease">Chronic Disease Management</option>
            <option value="routine_annual">Annual Physical / Wellness</option>
            <option value="acute_illness">Acute Illness</option>
            <option value="medication_review">Medication Review</option>
            <option value="mental_health">Mental Health</option>
            <option value="well_child">Well-Child Examination</option>
          </select>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1">CPT / Billing Code</label>
          <select
            value={billingCode}
            onChange={(e) => setBillingCode(e.target.value)}
            className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
          >
            <option value="99213">99213 - Established (Low Complexity)</option>
            <option value="99214">99214 - Established (Moderate Complexity)</option>
            <option value="99215">99215 - Established (High Complexity)</option>
            <option value="99203">99203 - New Patient (Low)</option>
            <option value="99204">99204 - New Patient (Moderate)</option>
            <option value="99395">99395 - Preventative 18-39 yrs</option>
            <option value="99396">99396 - Preventative 40-64 yrs</option>
            <option value="99397">99397 - Preventative 65+ yrs</option>
          </select>
        </div>
      </div>

      {/* Longitudinal Clinical Context & Vitals Baseline Mini Dashboard */}
      <EncounterVitalsDashboard
        patient={patient}
        currentVitals={vitals}
        currentDate={encounterDate}
        onImportDiagnosis={handleImportDiagnosis}
      />

      {/* SECTION: Vitals Capture */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
            <HeartPulse className="w-4 h-4 text-red-700" />
            <span>Vital Signs & Anthropometrics</span>
          </div>
          {bmiCalc && (
            <div className="text-xs flex items-center gap-2">
              <span className="text-gray-500">Calculated BMI:</span>
              <span className="font-mono font-bold text-gray-900">{bmiCalc.bmi} kg/m²</span>
              <span className={`font-medium ${bmiCalc.color}`}>({bmiCalc.label})</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 text-xs">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Systolic BP</label>
            <div className="flex items-center">
              <input
                type="number"
                value={vitals.systolicBp || ''}
                onChange={(e) => setVitals({ ...vitals, systolicBp: Number(e.target.value) || undefined })}
                placeholder="120"
                className="w-full px-2 py-1.5 font-mono text-center border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
              />
            </div>
            <span className="text-[10px] text-gray-400 block text-center mt-0.5">mmHg</span>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Diastolic BP</label>
            <div className="flex items-center">
              <input
                type="number"
                value={vitals.diastolicBp || ''}
                onChange={(e) => setVitals({ ...vitals, diastolicBp: Number(e.target.value) || undefined })}
                placeholder="80"
                className="w-full px-2 py-1.5 font-mono text-center border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
              />
            </div>
            <span className="text-[10px] text-gray-400 block text-center mt-0.5">mmHg</span>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Heart Rate</label>
            <input
              type="number"
              value={vitals.heartRate || ''}
              onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) || undefined })}
              placeholder="72"
              className="w-full px-2 py-1.5 font-mono text-center border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
            />
            <span className="text-[10px] text-gray-400 block text-center mt-0.5">BPM</span>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Resp Rate</label>
            <input
              type="number"
              value={vitals.respiratoryRate || ''}
              onChange={(e) => setVitals({ ...vitals, respiratoryRate: Number(e.target.value) || undefined })}
              placeholder="16"
              className="w-full px-2 py-1.5 font-mono text-center border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
            />
            <span className="text-[10px] text-gray-400 block text-center mt-0.5">/min</span>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              value={vitals.temperatureC || ''}
              onChange={(e) => setVitals({ ...vitals, temperatureC: Number(e.target.value) || undefined })}
              placeholder="36.8"
              className="w-full px-2 py-1.5 font-mono text-center border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
            />
            <span className="text-[10px] text-gray-400 block text-center mt-0.5">Celsius</span>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">SpO2 (%)</label>
            <input
              type="number"
              value={vitals.oxygenSaturation || ''}
              onChange={(e) => setVitals({ ...vitals, oxygenSaturation: Number(e.target.value) || undefined })}
              placeholder="98"
              className="w-full px-2 py-1.5 font-mono text-center border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
            />
            <span className="text-[10px] text-gray-400 block text-center mt-0.5">% Room Air</span>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Height (cm)</label>
            <input
              type="number"
              value={vitals.heightCm || ''}
              onChange={(e) => setVitals({ ...vitals, heightCm: Number(e.target.value) || undefined })}
              placeholder="175"
              className="w-full px-2 py-1.5 font-mono text-center border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
            />
            <span className="text-[10px] text-gray-400 block text-center mt-0.5">cm</span>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={vitals.weightKg || ''}
              onChange={(e) => setVitals({ ...vitals, weightKg: Number(e.target.value) || undefined })}
              placeholder="78.0"
              className="w-full px-2 py-1.5 font-mono text-center border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
            />
            <span className="text-[10px] text-gray-400 block text-center mt-0.5">kg</span>
          </div>
        </div>
      </div>

      {/* SOAP: S - Subjective */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <span className="w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center text-xs">
              S
            </span>
            <span>Subjective: Chief Complaint & History of Present Illness</span>
          </div>

          {speechSupported && (
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                isRecordingHpi
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Dictate clinical note with speech-to-text"
            >
              {isRecordingHpi ? <MicOff className="w-3.5 h-3.5 text-rose-600" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isRecordingHpi ? 'Recording Dictation...' : 'Voice Dictate'}</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Chief Complaint (CC) / Reason for Visit
            </label>
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. 3-month hypertension check-up, or Nasal congestion for 4 days"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              History of Present Illness (HPI)
            </label>
            <textarea
              rows={4}
              value={hpi}
              onChange={(e) => setHpi(e.target.value)}
              placeholder="Onset, location, duration, characteristics, aggravating/relieving factors, treatments tried, pertinent negatives..."
              className="w-full px-3 py-2 text-xs font-sans leading-relaxed border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Review of Systems (ROS) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700">Review of Systems (ROS)</span>
              <button
                type="button"
                onClick={() =>
                  setRos({
                    Constitutional: 'No fever, chills, diaphoresis, or significant weight changes.',
                    Cardiovascular: 'Denies chest pressure, palpitations, or orthopnea.',
                    Respiratory: 'Denies dyspnea, wheezing, or cough.',
                    Gastrointestinal: 'Denies heartburn, abdominal discomfort, nausea, or melena.',
                    Musculoskeletal: 'Denies joint swelling or severe muscular aches.',
                    Neurological: 'Denies dizziness, paresthesias, or headaches.',
                  })
                }
                className="text-[11px] text-red-700 hover:text-red-900 underline cursor-pointer"
              >
                Set Standard Negative ROS
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(ros).map(([system, text]) => (
                <div key={system} className="p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                  <div className="font-semibold text-gray-800 text-[11px]">{system}</div>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setRos({ ...ros, [system]: e.target.value })}
                    className="w-full mt-1 px-2 py-1 text-[11px] bg-white border border-gray-300 rounded focus:outline-none focus:border-red-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SOAP: O - Objective */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <span className="w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center text-xs">
              O
            </span>
            <span>Objective: Physical Examination</span>
          </div>

          <button
            type="button"
            onClick={handleSetAllExamNormal}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5 text-red-700" />
            <span>Set All Systems to Normal Exam</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {Object.entries(physicalExam).map(([system, findings]) => (
            <div key={system} className="p-2.5 bg-gray-50 border border-gray-200 rounded-md">
              <label className="block font-semibold text-gray-800 text-xs mb-1">
                {system}
              </label>
              <textarea
                rows={2}
                value={findings}
                onChange={(e) =>
                  setPhysicalExam({ ...physicalExam, [system]: e.target.value })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-red-600 leading-snug"
              />
            </div>
          ))}
        </div>
      </div>

      {/* SOAP: A - Assessment */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <span className="w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center text-xs">
              A
            </span>
            <span>Assessment: Diagnostic Formulations & ICD-10 Codes</span>
          </div>
        </div>

        <div className="space-y-3">
          {/* Primary Diagnosis */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Primary Diagnosis *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={primaryDiagnosis.code}
                onChange={(e) =>
                  setPrimaryDiagnosis({ ...primaryDiagnosis, code: e.target.value })
                }
                placeholder="ICD-10 (e.g. I10)"
                className="w-full px-2.5 py-1.5 text-xs font-mono border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
              />
              <input
                type="text"
                value={primaryDiagnosis.name}
                onChange={(e) =>
                  setPrimaryDiagnosis({ ...primaryDiagnosis, name: e.target.value })
                }
                placeholder="Condition description"
                className="sm:col-span-2 w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Quick ICD Picker */}
          <div>
            <span className="text-[11px] text-gray-500 font-medium block mb-1">
              Quick Pick Common Primary Care ICD-10:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PRIMARY_CARE_ICD10.slice(0, 8).map((icd) => (
                <button
                  type="button"
                  key={icd.code}
                  onClick={() => setPrimaryDiagnosis({ code: icd.code, name: icd.name, isPrimary: true })}
                  className="px-2 py-0.5 text-[11px] bg-gray-100 hover:bg-red-50 hover:text-red-900 border border-gray-200 rounded transition-colors cursor-pointer"
                >
                  <span className="font-mono text-gray-500 mr-1">[{icd.code}]</span>
                  <span>{icd.name.split(',')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Assessment Synthesis */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Clinical Assessment Synthesis & Medical Decision Making (MDM)
            </label>
            <textarea
              rows={2}
              value={clinicalSummary}
              onChange={(e) => setClinicalSummary(e.target.value)}
              placeholder="Summary of clinical status, control of chronic disease, risk factors, or differential diagnoses..."
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
            />
          </div>
        </div>
      </div>

      {/* SOAP: P - Plan */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-5">
        <div className="border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <span className="w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center text-xs">
              P
            </span>
            <span>Plan: Pharmacotherapy, Investigations, Referrals & Follow-Up</span>
          </div>
        </div>

        {/* Prescriptions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
              <Pill className="w-4 h-4 text-red-700" />
              <span>Prescriptions Ordered (Rx)</span>
            </div>
            <button
              type="button"
              onClick={handleAddPrescription}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Medication</span>
            </button>
          </div>

          {prescriptions.length > 0 ? (
            <div className="space-y-2">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-md grid grid-cols-1 sm:grid-cols-6 gap-2 items-center text-xs"
                >
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-gray-500 font-medium">Drug Name</label>
                    <input
                      type="text"
                      value={rx.drug}
                      onChange={(e) => handleUpdatePrescription(rx.id, 'drug', e.target.value)}
                      placeholder="e.g. Lisinopril"
                      className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 font-medium">Dosage</label>
                    <input
                      type="text"
                      value={rx.dose}
                      onChange={(e) => handleUpdatePrescription(rx.id, 'dose', e.target.value)}
                      placeholder="e.g. 20 mg"
                      className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 font-medium">Frequency & Sig</label>
                    <input
                      type="text"
                      value={rx.frequency}
                      onChange={(e) => handleUpdatePrescription(rx.id, 'frequency', e.target.value)}
                      placeholder="Once daily"
                      className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 font-medium">Dispense / Refills</label>
                    <input
                      type="text"
                      value={rx.dispenseQuantity}
                      onChange={(e) => handleUpdatePrescription(rx.id, 'dispenseQuantity', e.target.value)}
                      placeholder="90 tabs (3 refills)"
                      className="w-full px-2 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemovePrescription(rx.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No new or modified prescriptions for this encounter.</p>
          )}
        </div>

        {/* Laboratory & Diagnostic Tests */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-800">
            Laboratory & Diagnostic Orders
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_LAB_ORDERS.slice(0, 10).map((lab) => {
              const selected = labOrders.includes(lab);
              return (
                <button
                  type="button"
                  key={lab}
                  onClick={() => handleToggleLab(lab)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                    selected
                      ? 'bg-red-700 border-red-700 text-white font-medium'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {lab}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 max-w-md pt-1">
            <input
              type="text"
              value={customLab}
              onChange={(e) => setCustomLab(e.target.value)}
              placeholder="Add other lab order..."
              className="flex-1 px-2.5 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
            />
            <button
              type="button"
              onClick={handleAddCustomLab}
              className="px-3 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded-md text-gray-800 cursor-pointer"
            >
              Add Lab
            </button>
          </div>
        </div>

        {/* Specialty Referrals */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-800">
            Specialist Referrals
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SPECIALTY_REFERRALS.slice(0, 8).map((ref) => {
              const selected = referrals.includes(ref);
              return (
                <button
                  type="button"
                  key={ref}
                  onClick={() => handleToggleReferral(ref)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                    selected
                      ? 'bg-red-700 border-red-700 text-white font-medium'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {ref}
                </button>
              );
            })}
          </div>
        </div>

        {/* Patient Instructions & Follow-up */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Patient Instructions & Counseling (Printed on After-Visit Summary)
            </label>
            <textarea
              rows={3}
              value={patientInstructions}
              onChange={(e) => setPatientInstructions(e.target.value)}
              placeholder="Dietary changes, home blood pressure monitoring, exercise, symptom triggers..."
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Recommended Follow-Up
            </label>
            <select
              value={followUpIn}
              onChange={(e) => setFollowUpIn(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
            >
              <option value="1 week">1 week (Acute re-check)</option>
              <option value="2-3 weeks">2-3 weeks (Medication titration)</option>
              <option value="1 month">1 month</option>
              <option value="3 months">3 months (Quarterly chronic check)</option>
              <option value="6 months">6 months (Semi-annual)</option>
              <option value="12 months">12 months (Annual physical)</option>
              <option value="PRN">PRN (As needed if symptoms recur)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Encounter Actions / Sign Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between shadow-lg rounded-b-lg">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
          <span>Encounter Status:</span>
          <span className={`font-semibold ${isSigned ? 'text-red-700' : 'text-amber-700'}`}>
            {isSigned ? 'Signed & Finalized' : 'Draft In Progress'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onPrintAVS(getCurrentEncounter())}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors cursor-pointer"
            title="Preview Patient Visit Summary before or after signing"
          >
            <FileCheck className="w-4 h-4 text-red-700" />
            <span>Patient Visit Summary</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer"
          >
            Save Draft
          </button>

          {!staffUser || staffUser.role === 'doctor' || staffUser.role === 'admin' ? (
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Sign & Finalize Encounter</span>
            </button>
          ) : (
            <div className="relative group">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-100 rounded-md cursor-not-allowed border border-gray-200"
              >
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <span>Sign (Doctor / Admin Only)</span>
              </button>
              <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover:block bg-gray-900 text-white text-[11px] p-2 rounded shadow-lg whitespace-nowrap z-50">
                Staff role: {staffUser.role}. Only attending physician or admin can sign and finalize notes.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
