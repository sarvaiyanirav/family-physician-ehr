import React from 'react';
import {
  Printer,
  X,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  HeartPulse,
  Pill,
  Stethoscope,
  FileText,
  ShieldAlert,
  Phone,
  MapPin,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Patient, Encounter, PrescriptionOrder } from '../types/clinical';
import { calculateAge, calculateBmi } from '../services/storageService';

interface PatientVisitSummaryProps {
  patient: Patient;
  encounter: Encounter;
  onClose?: () => void;
  onEditEncounter?: () => void;
}

export const PatientVisitSummary: React.FC<PatientVisitSummaryProps> = ({
  patient,
  encounter,
  onClose,
  onEditEncounter,
}) => {
  const age = calculateAge(patient.dob);
  const vitals = encounter.vitals;
  const bmiCalc = vitals ? calculateBmi(vitals.weightKg, vitals.heightCm) : null;

  // Format encounter visit date and time
  const visitDate = new Date(encounter.date);
  const formattedVisitDate = visitDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedVisitTime = visitDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  // Convert kg to lbs and cm to ft/in for patient readability
  const weightLbs = vitals?.weightKg ? (vitals.weightKg * 2.20462).toFixed(1) : null;
  const heightInchesTotal = vitals?.heightCm ? vitals.heightCm / 2.54 : null;
  const heightFt = heightInchesTotal ? Math.floor(heightInchesTotal / 12) : null;
  const heightIn = heightInchesTotal ? Math.round(heightInchesTotal % 12) : null;
  const tempF = vitals?.temperatureC ? ((vitals.temperatureC * 9) / 5 + 32).toFixed(1) : null;

  const prescriptions = encounter.plan?.prescriptions || [];
  const activeMedications = patient.medications?.filter((m) => m.status === 'active') || [];

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white text-gray-900">
      {/* Interactive Toolbar (hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">
              Patient After-Visit Summary (AVS)
            </h1>
            <p className="text-xs text-gray-500">
              {patient.lastName}, {patient.firstName} · Visit on {formattedVisitDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEditEncounter && (
            <button
              onClick={onEditEncounter}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md border border-gray-300 transition-colors cursor-pointer"
            >
              Edit Encounter Note
            </button>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title="Close summary"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Helpful print hint banner (hidden on print) */}
      <div className="max-w-4xl mx-auto mb-4 bg-red-50/60 border border-red-200 rounded-md p-3 text-xs text-red-800 flex items-center gap-2 no-print">
        <HelpCircle className="w-4 h-4 text-red-700 shrink-0" />
        <span>
          <strong>Printer Tip:</strong> In your browser print dialog, choose Destination: <strong>&ldquo;Save as PDF&rdquo;</strong> to generate a digital PDF copy for the patient portal or export.
        </span>
      </div>

      {/* Formal Printable Document Sheet */}
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg p-8 sm:p-10 shadow-md print:shadow-none print:border-none print:p-0 text-xs text-gray-900 space-y-6">
        {/* Letterhead Header */}
        <div className="flex items-start justify-between border-b-2 border-gray-900 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-red-700 text-white font-bold flex items-center justify-center text-xs">
                +
              </span>
              <span className="text-xl font-extrabold uppercase tracking-tight text-gray-900">
                Cascade Family Health Centre
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium">
              Department of Family & Community Medicine · Comprehensive Primary Care
            </p>
            <div className="text-[11px] text-gray-500 font-mono flex flex-wrap items-center gap-x-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                740 SW Horizon Blvd, Suite 300, Portland, OR 97201
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-gray-400" />
                (503) 555-0190
              </span>
              <span>Fax: (503) 555-0199</span>
            </div>
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 font-mono text-[10px] font-bold uppercase rounded border border-gray-300">
              After-Visit Summary (AVS)
            </span>
            <div className="text-xs font-bold text-gray-900 mt-1">
              Visit Date: {formattedVisitDate}
            </div>
            <div className="text-[11px] text-gray-500 font-mono">
              Time: {formattedVisitTime} · Attending: {encounter.provider || patient.primaryPhysician}
            </div>
          </div>
        </div>

        {/* Patient Demographics & Safety Alert Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/80 p-4 rounded-md border border-gray-200 page-break-avoid">
          {/* Patient Details */}
          <div className="space-y-1">
            <div className="text-gray-500 text-[10px] font-mono uppercase tracking-wider">
              Patient Identification
            </div>
            <div className="font-bold text-sm text-gray-900">
              {patient.lastName}, {patient.firstName}
              {patient.preferredName && (
                <span className="text-xs font-normal text-gray-500 ml-1">
                  (&ldquo;{patient.preferredName}&rdquo;)
                </span>
              )}
            </div>
            <div className="text-gray-600 font-mono text-[11px]">
              DOB: <strong>{patient.dob}</strong> ({age} years old)
            </div>
            <div className="text-gray-600 font-mono text-[11px]">
              MRN: {patient.mrn} · HC: {patient.healthCardNumber}
            </div>
          </div>

          {/* Contact & Care Team */}
          <div className="space-y-1">
            <div className="text-gray-500 text-[10px] font-mono uppercase tracking-wider">
              Practice Information
            </div>
            <div className="text-gray-700">
              Primary Physician: <strong className="text-gray-900">{patient.primaryPhysician}</strong>
            </div>
            <div className="text-gray-600">
              Clinic Location: {patient.clinicLocation || 'Cascade Main Clinic'}
            </div>
            <div className="text-gray-600 font-mono text-[11px]">
              Emergency Contact: {patient.emergencyContact.name} ({patient.emergencyContact.relationship}) - {patient.emergencyContact.phone}
            </div>
          </div>

          {/* Critical Allergy Warning */}
          <div className="space-y-1 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4">
            <div className="text-gray-500 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-red-600" />
              <span>Documented Allergies</span>
            </div>
            {patient.allergies.length > 0 ? (
              <div className="space-y-1">
                {patient.allergies.map((alg) => (
                  <div key={alg.id} className="text-rose-900 font-semibold text-[11px]">
                    ● {alg.allergen}{' '}
                    <span className="font-normal text-rose-700">
                      ({alg.reaction} - {alg.severity.replace('_', ' ')})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-emerald-800 font-medium text-[11px] bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block">
                ✓ No Known Drug Allergies (NKDA)
              </div>
            )}
          </div>
        </div>

        {/* Reason for Visit & Clinical Assessment */}
        <div className="space-y-3 page-break-avoid">
          <div className="flex items-center gap-2 border-b border-gray-300 pb-1.5">
            <Stethoscope className="w-4 h-4 text-red-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Reason for Visit & Diagnoses Addressed
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="text-[11px] font-semibold text-gray-500 uppercase">
                Chief Complaint / Reason for Appointment:
              </div>
              <div className="text-gray-900 font-medium mt-1">
                {encounter.reasonForVisit || encounter.chiefComplaint || 'Routine medical follow-up'}
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="text-[11px] font-semibold text-gray-500 uppercase">
                Primary Clinical Diagnosis:
              </div>
              <div className="text-gray-900 font-bold mt-1 flex items-baseline gap-2">
                <span>{encounter.assessment.primaryDiagnosis.name}</span>
                <span className="font-mono text-[11px] text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                  {encounter.assessment.primaryDiagnosis.code}
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Diagnoses */}
          {encounter.assessment.secondaryDiagnoses && encounter.assessment.secondaryDiagnoses.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-gray-700">
                Additional Conditions Addressed Today:
              </span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {encounter.assessment.secondaryDiagnoses.map((sec) => (
                  <span
                    key={sec.code}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-800 rounded border border-gray-200 text-[11px]"
                  >
                    <span className="font-mono text-gray-500">[{sec.code}]</span>
                    <span>{sec.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Impression & Discussion */}
          {encounter.assessment.clinicalSummary && (
            <div className="p-3 bg-red-50/40 border border-red-200 rounded text-gray-800 leading-relaxed text-xs">
              <div className="font-bold text-red-950 mb-1">Doctor&apos;s Clinical Summary & Explanation:</div>
              <p>{encounter.assessment.clinicalSummary}</p>
            </div>
          )}
        </div>

        {/* Vital Signs Recorded Today */}
        {vitals && (
          <div className="space-y-2 page-break-avoid">
            <div className="flex items-center gap-2 border-b border-gray-300 pb-1.5">
              <HeartPulse className="w-4 h-4 text-red-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Vital Signs Recorded During This Visit
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center">
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
                <div className="text-[10px] text-gray-500 uppercase font-mono">Blood Pressure</div>
                <div className="font-bold text-sm text-gray-900 mt-0.5">
                  {vitals.systolicBp}/{vitals.diastolicBp}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">mmHg</div>
              </div>

              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
                <div className="text-[10px] text-gray-500 uppercase font-mono">Pulse (Heart Rate)</div>
                <div className="font-bold text-sm text-gray-900 mt-0.5">
                  {vitals.heartRate}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">beats / min</div>
              </div>

              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
                <div className="text-[10px] text-gray-500 uppercase font-mono">Weight</div>
                <div className="font-bold text-sm text-gray-900 mt-0.5">
                  {vitals.weightKg} kg
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {weightLbs ? `(${weightLbs} lbs)` : ''}
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
                <div className="text-[10px] text-gray-500 uppercase font-mono">Height</div>
                <div className="font-bold text-sm text-gray-900 mt-0.5">
                  {vitals.heightCm} cm
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {heightFt !== null ? `(${heightFt}'${heightIn}")` : ''}
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
                <div className="text-[10px] text-gray-500 uppercase font-mono">Body Mass Index</div>
                <div className="font-bold text-sm text-gray-900 mt-0.5">
                  {bmiCalc?.bmi || '—'}
                </div>
                <div className="text-[10px] text-gray-500 font-medium">
                  {bmiCalc?.label || 'kg/m²'}
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded">
                <div className="text-[10px] text-gray-500 uppercase font-mono">Oxygen / Temp</div>
                <div className="font-bold text-sm text-gray-900 mt-0.5">
                  {vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : '—'}
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {vitals.temperatureC ? `${vitals.temperatureC}°C (${tempF}°F)` : 'Room air'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions Issued or Modified Today */}
        <div className="space-y-2 page-break-avoid">
          <div className="flex items-center gap-2 border-b border-gray-300 pb-1.5">
            <Pill className="w-4 h-4 text-red-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Prescriptions & Medication Orders from Today&apos;s Visit ({prescriptions.length})
            </h2>
          </div>

          {prescriptions.length > 0 ? (
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-gray-100/90 text-gray-700 border-b border-gray-200 text-[11px]">
                  <tr>
                    <th className="py-2 px-3">Medication & Strength</th>
                    <th className="py-2 px-3">Directions / Instructions</th>
                    <th className="py-2 px-3">Route & Frequency</th>
                    <th className="py-2 px-3">Quantity</th>
                    <th className="py-2 px-3">Refills</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {prescriptions.map((rx) => (
                    <tr key={rx.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <div className="font-bold text-gray-900">{rx.drug}</div>
                        <div className="font-mono text-gray-500 text-[11px]">{rx.dose}</div>
                      </td>
                      <td className="py-2 px-3 text-gray-800 font-medium">
                        {rx.instructions || 'Take as directed by physician.'}
                      </td>
                      <td className="py-2 px-3 text-gray-600 font-mono text-[11px]">
                        {rx.route} · {rx.frequency}
                      </td>
                      <td className="py-2 px-3 font-mono text-gray-700">
                        {rx.dispenseQuantity || '30-day supply'}
                      </td>
                      <td className="py-2 px-3 font-mono text-gray-700">
                        {rx.refills !== undefined ? `${rx.refills}` : '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic p-3 bg-gray-50 border border-gray-200 rounded">
              No new prescriptions were initiated during this visit. Continue taking previously prescribed medications as instructed below.
            </p>
          )}
        </div>

        {/* Complete Active Medication Reconciliation */}
        {activeMedications.length > 0 && (
          <div className="space-y-2 page-break-avoid">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
              Complete Verified Active Medications List:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {activeMedications.map((m) => (
                <div key={m.id} className="p-2 bg-gray-50/70 border border-gray-200 rounded flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900">{m.name}</span>
                    <span className="text-gray-600 ml-1.5">{m.dosage}</span>
                    <div className="text-gray-500 text-[10px]">{m.frequency} · {m.indication}</div>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-mono font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnostic Orders & Referrals */}
        {((encounter.plan?.labOrders && encounter.plan.labOrders.length > 0) ||
          (encounter.plan?.imagingOrders && encounter.plan.imagingOrders.length > 0) ||
          (encounter.plan?.referrals && encounter.plan.referrals.length > 0)) && (
          <div className="space-y-3 page-break-avoid">
            <div className="flex items-center gap-2 border-b border-gray-300 pb-1.5">
              <CheckCircle2 className="w-4 h-4 text-red-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Diagnostic Orders & Specialist Referrals
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {encounter.plan?.labOrders && encounter.plan.labOrders.length > 0 && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-1">
                  <div className="font-bold text-gray-900 text-xs">Laboratory Orders:</div>
                  <ul className="list-disc list-inside text-[11px] text-gray-700 space-y-0.5">
                    {encounter.plan.labOrders.map((lab, i) => (
                      <li key={i}>{lab}</li>
                    ))}
                  </ul>
                </div>
              )}

              {encounter.plan?.imagingOrders && encounter.plan.imagingOrders.length > 0 && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-1">
                  <div className="font-bold text-gray-900 text-xs">Diagnostic Imaging:</div>
                  <ul className="list-disc list-inside text-[11px] text-gray-700 space-y-0.5">
                    {encounter.plan.imagingOrders.map((img, i) => (
                      <li key={i}>{img}</li>
                    ))}
                  </ul>
                </div>
              )}

              {encounter.plan?.referrals && encounter.plan.referrals.length > 0 && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-1">
                  <div className="font-bold text-gray-900 text-xs">Specialist Referrals:</div>
                  <ul className="list-disc list-inside text-[11px] text-gray-700 space-y-0.5">
                    {encounter.plan.referrals.map((ref, i) => (
                      <li key={i}>{ref}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personalized Instructions & Self-Care Plan */}
        <div className="space-y-2 page-break-avoid">
          <div className="flex items-center gap-2 border-b border-gray-300 pb-1.5">
            <FileText className="w-4 h-4 text-red-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Personalized Care Instructions & Patient Plan
            </h2>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-800 leading-relaxed text-xs">
            <p className="whitespace-pre-line font-medium">
              {encounter.plan?.patientInstructions ||
                '1. Continue taking all medications as directed on your prescription labels.\n2. Maintain balanced low-sodium dietary habits and daily physical walking.\n3. Keep a log of your blood pressure readings twice weekly.\n4. Call the clinic if you have any questions or adverse medication side effects.'}
            </p>
          </div>
        </div>

        {/* Follow-up & Return Schedule */}
        <div className="p-4 bg-red-50/70 border border-red-200 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 page-break-avoid">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-red-700 shrink-0" />
            <div>
              <div className="text-[11px] font-bold text-red-950 uppercase tracking-wide">
                Recommended Follow-Up Interval:
              </div>
              <div className="text-sm font-bold text-red-900 mt-0.5">
                {encounter.plan?.followUpIn || 'In 3 months for routine follow-up'}
              </div>
            </div>
          </div>
          <div className="text-right text-[11px] text-red-800 font-mono">
            <div>Clinic Appointment Desk: <strong>(503) 555-0190</strong></div>
            <div>Hours: Mon - Fri 8:00 AM - 5:00 PM</div>
          </div>
        </div>

        {/* Red Flag Warning Signs Box */}
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-md space-y-2 page-break-avoid">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>WHEN TO SEEK IMMEDIATE MEDICAL ATTENTION (RED FLAGS):</span>
          </div>

          <p className="text-rose-950 text-[11px] leading-relaxed">
            Please call <strong>911</strong> or proceed to the nearest Emergency Department immediately if you experience any of the following warning signs:
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-rose-900 list-disc list-inside font-medium">
            {encounter.plan?.warningSigns && encounter.plan.warningSigns.length > 0 ? (
              encounter.plan.warningSigns.map((sign, idx) => (
                <li key={idx}>{sign}</li>
              ))
            ) : (
              <>
                <li>Sudden severe chest pain, pressure, or tightness</li>
                <li>Sudden shortness of breath or difficulty breathing</li>
                <li>Sudden facial drooping, arm weakness, or speech difficulty</li>
                <li>Sudden severe headache or altered mental status</li>
                <li>Persistent high fever greater than 101.5°F (38.6°C)</li>
                <li>Severe uncontrollable dizziness, fainting, or falls</li>
              </>
            )}
          </ul>
        </div>

        {/* Physician Attestation & Signature Line */}
        <div className="pt-6 border-t-2 border-gray-900 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs page-break-avoid">
          <div className="space-y-1">
            <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
              Physician Attestation & Electronic Signature
            </div>
            <div className="font-bold text-gray-900 text-sm">
              {encounter.provider || patient.primaryPhysician || 'Dr. Sarah Lin, MD'}
            </div>
            <div className="text-gray-500 text-[11px]">
              Family Medicine Specialist · Board Certified American Board of Family Medicine (ABFM)
            </div>
            <div className="text-gray-400 font-mono text-[10px]">
              NPI: 1982736450 · State License: MD-OR-49102 · Electronically signed on {formattedVisitDate}
            </div>
          </div>

          <div className="text-right space-y-2">
            <div className="w-56 border-b border-gray-400 text-right pb-1">
              <span className="font-serif italic text-sm text-gray-800">
                {encounter.provider || patient.primaryPhysician || 'Dr. Sarah Lin, MD'}
              </span>
            </div>
            <div className="text-[10px] font-mono text-gray-500">
              Verified Electronic Signature
            </div>
          </div>
        </div>

        {/* Clinic Footer */}
        <div className="text-center text-[10px] text-gray-400 font-mono pt-4 border-t border-gray-200">
          This Patient Visit Summary is part of the confidential medical record for {patient.lastName}, {patient.firstName} (MRN: {patient.mrn}). Produced by Cascade Family Health Centre EHR.
        </div>
      </div>
    </div>
  );
};
