import React, { useState } from 'react';
import {
  Phone,
  Calendar,
  AlertTriangle,
  Pill,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  MapPin,
  Clock,
  ShieldAlert,
  Share2,
  ChevronDown,
  ChevronUp,
  Download,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { Patient, Encounter } from '../types/clinical';
import { calculateAge, calculateBmi } from '../services/storageService';

interface MobileVisitSummaryProps {
  patient: Patient;
  encounter: Encounter;
  onBack?: () => void;
  isSimulatorModal?: boolean;
}

export const MobileVisitSummary: React.FC<MobileVisitSummaryProps> = ({
  patient,
  encounter,
  onBack,
  isSimulatorModal = false,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [sharedToast, setSharedToast] = useState(false);

  const age = calculateAge(patient.dob);
  const vitals = encounter.vitals;
  const bmiCalc = vitals ? calculateBmi(vitals.weightKg, vitals.heightCm) : null;

  const visitDate = new Date(encounter.date);
  const formattedDate = visitDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const prescriptions = encounter.plan?.prescriptions || [];
  const instructionsList = (encounter.plan?.patientInstructions || '')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Visit Summary: ${patient.firstName} ${patient.lastName}`,
          text: `My clinic visit instructions from ${encounter.provider || 'Dr. Sarah Lin'} on ${formattedDate}.`,
          url: window.location.href,
        });
        return;
      } catch (e) {
        // User cancelled or share failed
      }
    }
    // Fallback: copy link
    try {
      await navigator.clipboard.writeText(window.location.href);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Download .ics calendar file for the next appointment
  const handleAddToCalendar = () => {
    const title = `Follow-Up: Cascade Family Health Centre (${encounter.provider || 'Dr. Sarah Lin'})`;
    const description = `Medical follow-up appointment: ${encounter.plan?.followUpIn || 'Routine check'}. Clinic phone: (503) 555-0190`;
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Cascade Family Health Centre//Mobile AVS//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      'LOCATION:740 SW Horizon Blvd, Portland, OR 97201',
      `DTSTART:${new Date(Date.now() + 90 * 86400000).toISOString().replace(/-|:|\.\d+/g, '')}`,
      `DTEND:${new Date(Date.now() + 90 * 86400000 + 3600000).toISOString().replace(/-|:|\.\d+/g, '')}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'doctor-followup.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`bg-gray-50 min-h-screen text-gray-900 ${isSimulatorModal ? 'max-w-md mx-auto rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800' : ''}`}>
      {/* Top Clinic Mobile Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 -ml-1 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-red-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            +
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 leading-tight">
              Cascade Family Health
            </div>
            <div className="text-[10px] text-gray-500 font-mono">
              Patient Care Summary
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 cursor-pointer"
            title="Share or copy link"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <a
            href="tel:5035550190"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-700 text-white rounded-full text-xs font-semibold shadow-xs hover:bg-red-800 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        </div>
      </header>

      {/* Share Toast */}
      {sharedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mobile summary link copied!</span>
        </div>
      )}

      {/* Mobile Body Content */}
      <main className="p-4 space-y-4 pb-20">
        {/* Welcome Patient Card */}
        <section className="bg-gradient-to-br from-red-800 to-red-950 text-white rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-red-200">
                After-Visit Instructions
              </span>
              <h1 className="text-lg font-bold mt-0.5">
                Hello, {patient.preferredName || patient.firstName}!
              </h1>
              <p className="text-xs text-red-100">
                Here are your instructions from your visit on {formattedDate}.
              </p>
            </div>
            <span className="text-right text-[10px] font-mono text-red-200 bg-red-900/60 px-2 py-0.5 rounded border border-red-700">
              MRN: {patient.mrn}
            </span>
          </div>

          <div className="pt-2 border-t border-red-700/60 flex items-center justify-between text-xs text-red-100">
            <span>Provider: <strong>{encounter.provider || patient.primaryPhysician}</strong></span>
            <span>{encounter.type.replace('_', ' ')}</span>
          </div>
        </section>

        {/* Allergy Warning Badge */}
        {patient.allergies.length > 0 ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-rose-900">Your Documented Drug Allergies:</span>
              <div className="text-rose-800 text-[11px]">
                {patient.allergies.map((a) => `${a.allergen} (${a.reaction})`).join('; ')}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No Known Drug Allergies (NKDA) on file.</span>
          </div>
        )}

        {/* Emergency Red Flags Notice */}
        <section className="bg-rose-500/10 border-2 border-rose-400 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>WHEN TO SEEK IMMEDIATE EMERGENCY CARE</span>
          </div>
          <p className="text-[11px] text-rose-900 leading-relaxed">
            Call <strong>911</strong> or go to the nearest emergency room immediately if you experience chest pain, sudden shortness of breath, sudden facial drooping or weakness, or persistent high fever.
          </p>
          <a
            href="tel:911"
            className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-rose-700 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call 911 Immediately</span>
          </a>
        </section>

        {/* Actionable Care Instructions Checklist */}
        <section className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-700" />
              <h2 className="text-sm font-bold text-gray-900">Your At-Home Care Plan</h2>
            </div>
            <span className="text-[10px] font-mono text-gray-400">Tap to check off</span>
          </div>

          {instructionsList.length > 0 ? (
            <div className="space-y-2">
              {instructionsList.map((instruction, idx) => {
                const isChecked = !!completedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-xs ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100/70'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-gray-400 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span className={`flex-1 leading-relaxed ${isChecked ? 'line-through opacity-75' : 'font-medium'}`}>
                      {instruction}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">
              Continue your daily wellness routine and take prescribed medications as directed.
            </p>
          )}
        </section>

        {/* Today's Prescriptions & Medication Schedule */}
        <section className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-red-700" />
              <h2 className="text-sm font-bold text-gray-900">Medications & Prescriptions</h2>
            </div>
            <span className="text-xs font-bold text-red-700 font-mono">
              {prescriptions.length} {prescriptions.length === 1 ? 'New / Refilled' : 'New / Refilled'}
            </span>
          </div>

          {prescriptions.length > 0 ? (
            <div className="space-y-2.5">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-3 bg-red-50/40 border border-red-200 rounded-xl space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-sm">{rx.drug}</span>
                    <span className="font-mono text-[11px] text-red-900 bg-red-100 px-2 py-0.5 rounded font-semibold">
                      {rx.dose}
                    </span>
                  </div>
                  <div className="text-gray-800 font-medium">
                    {rx.instructions || 'Take as directed by doctor.'}
                  </div>
                  <div className="pt-1 border-t border-red-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                    <span>{rx.route} · {rx.frequency}</span>
                    <span>Refills: {rx.refills ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">
              No new medications were prescribed today. Continue taking your existing active medications as instructed.
            </p>
          )}

          {/* Active Medication List */}
          {patient.medications.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <div className="text-[11px] font-bold text-gray-600 uppercase mb-1.5">
                Current Active Home Regimen:
              </div>
              <div className="space-y-1.5">
                {patient.medications.filter((m) => m.status === 'active').map((m) => (
                  <div
                    key={m.id}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-gray-900">{m.name}</span>{' '}
                      <span className="text-gray-500 font-mono text-[11px]">{m.dosage}</span>
                      <div className="text-[10px] text-gray-500">{m.frequency}</div>
                    </div>
                    <span className="text-[10px] text-emerald-800 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Reason for Visit & Clinical Assessment */}
        <section className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <Stethoscope className="w-4 h-4 text-red-700" />
            <h2 className="text-sm font-bold text-gray-900">Diagnosis & Clinical Review</h2>
          </div>

          <div>
            <div className="text-[11px] text-gray-500 uppercase font-mono">Primary Diagnosis:</div>
            <div className="text-sm font-bold text-gray-900 mt-0.5">
              {encounter.assessment.primaryDiagnosis.name}
            </div>
          </div>

          {encounter.assessment.clinicalSummary && (
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-gray-800 leading-relaxed mt-2">
              <div className="font-semibold text-gray-900 mb-0.5">Doctor&apos;s Note to You:</div>
              <p>{encounter.assessment.clinicalSummary}</p>
            </div>
          )}
        </section>

        {/* Vitals Snapshot */}
        {vitals && (
          <section className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-2 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <HeartPulse className="w-4 h-4 text-red-700" />
              <h2 className="text-sm font-bold text-gray-900">Today&apos;s Vital Signs</h2>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-[10px] font-mono text-gray-500 uppercase">Blood Pressure</div>
                <div className="text-base font-extrabold text-gray-900 mt-0.5">
                  {vitals.systolicBp}/{vitals.diastolicBp}
                </div>
                <div className="text-[10px] text-gray-400">mmHg</div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-[10px] font-mono text-gray-500 uppercase">Heart Rate</div>
                <div className="text-base font-extrabold text-gray-900 mt-0.5">
                  {vitals.heartRate}
                </div>
                <div className="text-[10px] text-gray-400">beats / min</div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-[10px] font-mono text-gray-500 uppercase">Weight</div>
                <div className="text-sm font-bold text-gray-900 mt-0.5">
                  {vitals.weightKg} kg
                </div>
                <div className="text-[10px] text-gray-400">
                  {vitals.weightKg ? `(${(vitals.weightKg * 2.20462).toFixed(1)} lbs)` : ''}
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-[10px] font-mono text-gray-500 uppercase">BMI</div>
                <div className="text-sm font-bold text-gray-900 mt-0.5">
                  {bmiCalc?.bmi || '—'}
                </div>
                <div className="text-[10px] text-gray-500 font-medium">
                  {bmiCalc?.label || 'Normal'}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Follow-Up & Calendar Action */}
        <section className="bg-red-50/70 border border-red-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-[10px] font-mono uppercase font-bold text-red-900">
                Next Appointment
              </span>
              <div className="text-sm font-bold text-red-950 mt-0.5">
                {encounter.plan?.followUpIn || 'In 3 months for routine follow-up'}
              </div>
              <p className="text-[11px] text-red-800 mt-1">
                Please contact our reception desk to confirm the exact date and time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-red-200">
            <button
              onClick={handleAddToCalendar}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-white text-red-900 border border-red-300 rounded-xl text-xs font-semibold shadow-2xs hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-red-700" />
              <span>Add to Calendar</span>
            </button>

            <a
              href="tel:5035550190"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-red-700 text-white rounded-xl text-xs font-semibold shadow-2xs hover:bg-red-800 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Book by Phone</span>
            </a>
          </div>
        </section>

        {/* Clinic Location & Directions */}
        <section className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3 text-xs">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <MapPin className="w-4 h-4 text-red-700" />
            <h2 className="text-sm font-bold text-gray-900">Clinic Location & Hours</h2>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-gray-900">Cascade Family Health Centre</div>
            <div className="text-gray-600">740 SW Horizon Blvd, Suite 300, Portland, OR 97201</div>
            <div className="text-gray-500 font-mono text-[11px]">Phone: (503) 555-0190 · Fax: (503) 555-0199</div>
            <div className="text-gray-500 text-[11px]">Office Hours: Mon – Fri 8:00 AM – 5:00 PM</div>
          </div>

          <a
            href="https://maps.google.com/?q=740+SW+Horizon+Blvd+Portland+OR+97201"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-red-700" />
            <span>Get Directions in Maps</span>
          </a>
        </section>

        {/* Footer Note */}
        <div className="text-center text-[10px] text-gray-400 font-mono pt-2">
          Verified medical care instructions for {patient.lastName}, {patient.firstName}.<br />
          Cascade Family Health Centre EHR.
        </div>
      </main>
    </div>
  );
};
