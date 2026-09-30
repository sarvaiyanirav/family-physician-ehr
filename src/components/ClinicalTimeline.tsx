import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Building2,
  Syringe,
  Activity,
  Scissors,
  FileText,
  AlertTriangle,
  Plus,
  Search,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Filter,
  Layers,
  Bed,
} from 'lucide-react';
import { Patient, HospitalizationRecord, Problem, Immunization, SurgicalHistoryItem, Encounter } from '../types/clinical';
import { calculateAge } from '../services/storageService';

interface ClinicalTimelineProps {
  patient: Patient;
  onUpdatePatient: (updated: Patient) => void;
  onStartEncounter?: (encounter?: Encounter) => void;
}

export type TimelineEventType =
  | 'hospitalization'
  | 'chronic_diagnosis'
  | 'immunization'
  | 'surgery'
  | 'encounter';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  dateStr: string; // YYYY-MM-DD or YYYY
  sortDate: Date;
  title: string;
  subtitle?: string;
  facilityOrProvider?: string;
  description?: string;
  code?: string;
  statusBadge?: string;
  statusColor?: string;
  rawData?: any;
}

// Calculate age string at the time of a past date
function calculateAgeAtDate(dobStr: string, eventDateStr: string): string {
  try {
    const dob = new Date(dobStr);
    // If only year is given (e.g. "2019")
    const isYearOnly = /^\d{4}$/.test(eventDateStr);
    const eventDate = isYearOnly ? new Date(`${eventDateStr}-06-01`) : new Date(eventDateStr);
    
    if (isNaN(dob.getTime()) || isNaN(eventDate.getTime())) return '';

    let years = eventDate.getFullYear() - dob.getFullYear();
    let months = eventDate.getMonth() - dob.getMonth();

    if (months < 0 || (months === 0 && eventDate.getDate() < dob.getDate())) {
      years--;
      months += 12;
    }

    if (years < 0) return '';
    if (years === 0) return `${months} mos old`;
    if (isYearOnly || months === 0) return `Age ${years} yrs`;
    return `Age ${years}y ${months}m`;
  } catch {
    return '';
  }
}

export const ClinicalTimeline: React.FC<ClinicalTimelineProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc = newest first
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(new Set());

  // Form states for manual milestone entry
  const [newEventCategory, setNewEventCategory] = useState<TimelineEventType>('hospitalization');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [newEventEndDate, setNewEventEndDate] = useState('');
  const [newFacility, setNewFacility] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newAttending, setNewAttending] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Aggregate all clinical records into a unified chronological array
  const allEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // 1. Hospitalizations
    if (patient.hospitalizations && patient.hospitalizations.length > 0) {
      patient.hospitalizations.forEach((hosp) => {
        let sortDate = new Date(hosp.admissionDate);
        if (isNaN(sortDate.getTime())) sortDate = new Date();

        events.push({
          id: hosp.id,
          type: 'hospitalization',
          dateStr: hosp.admissionDate,
          sortDate,
          title: hosp.admittingDiagnosis,
          subtitle: hosp.dischargeDate ? `Discharged: ${hosp.dischargeDate}` : 'Inpatient Admission',
          facilityOrProvider: hosp.facility,
          description: hosp.dischargeSummary,
          code: hosp.attendingPhysician ? `Attending: ${hosp.attendingPhysician}` : undefined,
          statusBadge: hosp.dischargeDate ? 'Inpatient Stay' : 'Active Admission',
          statusColor: 'bg-rose-50 text-rose-800 border-rose-200',
          rawData: hosp,
        });
      });
    }

    // 2. Chronic Condition Diagnoses & Problem List
    patient.activeProblems.forEach((problem) => {
      let sortDate = new Date(problem.onsetDate);
      if (isNaN(sortDate.getTime())) {
        // If year-only
        const yr = parseInt(problem.onsetDate);
        sortDate = !isNaN(yr) ? new Date(yr, 0, 1) : new Date(2020, 0, 1);
      }

      events.push({
        id: problem.id,
        type: 'chronic_diagnosis',
        dateStr: problem.onsetDate,
        sortDate,
        title: problem.description,
        subtitle: `ICD-10: ${problem.icdCode}`,
        facilityOrProvider: 'Primary Care Diagnosis Onset',
        description: problem.notes,
        code: problem.icdCode,
        statusBadge: problem.status === 'active' ? 'Active Chronic' : 'Resolved',
        statusColor: problem.status === 'active' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-gray-100 text-gray-700 border-gray-200',
        rawData: problem,
      });
    });

    // 2b. Past Medical History items
    patient.pastMedicalHistory.forEach((pmh) => {
      const yr = parseInt(pmh.diagnosedYear);
      const sortDate = !isNaN(yr) ? new Date(yr, 0, 1) : new Date(2015, 0, 1);

      events.push({
        id: pmh.id,
        type: 'chronic_diagnosis',
        dateStr: pmh.diagnosedYear,
        sortDate,
        title: pmh.condition,
        subtitle: 'Past Medical History',
        facilityOrProvider: 'Historical Clinical Record',
        description: pmh.notes,
        statusBadge: 'Historical PMHx',
        statusColor: 'bg-blue-50 text-blue-800 border-blue-200',
        rawData: pmh,
      });
    });

    // 3. Immunizations
    patient.immunizations.forEach((imm) => {
      const sortDate = new Date(imm.dateAdministered);

      events.push({
        id: imm.id,
        type: 'immunization',
        dateStr: imm.dateAdministered,
        sortDate: isNaN(sortDate.getTime()) ? new Date() : sortDate,
        title: imm.vaccineName,
        subtitle: `Vaccine Administration · ${imm.status.toUpperCase()}`,
        facilityOrProvider: 'Primary Care Vaccine Clinic',
        description: imm.lotNumber ? `Lot #: ${imm.lotNumber}` : 'Standard administration verified.',
        statusBadge: 'Immunization',
        statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        rawData: imm,
      });
    });

    // 4. Past Surgical History
    patient.pastSurgicalHistory.forEach((surg) => {
      const yr = parseInt(surg.year);
      const sortDate = !isNaN(yr) ? new Date(yr, 5, 1) : new Date(2018, 0, 1);

      events.push({
        id: surg.id,
        type: 'surgery',
        dateStr: surg.year,
        sortDate,
        title: surg.procedure,
        subtitle: 'Major Surgical Intervention',
        facilityOrProvider: surg.hospitalOrSurgeon || 'Surgical Center',
        description: surg.notes,
        statusBadge: 'Procedure / Surgery',
        statusColor: 'bg-purple-50 text-purple-800 border-purple-200',
        rawData: surg,
      });
    });

    // 5. Encounters
    patient.encounters.forEach((enc) => {
      const sortDate = new Date(enc.date);

      events.push({
        id: enc.id,
        type: 'encounter',
        dateStr: enc.date,
        sortDate: isNaN(sortDate.getTime()) ? new Date() : sortDate,
        title: enc.assessment?.primaryDiagnosis?.name || enc.reasonForVisit,
        subtitle: `${enc.type.replace('_', ' ').toUpperCase()} Encounter · ${enc.provider}`,
        facilityOrProvider: 'Cascade Family Health Centre',
        description: `Chief Complaint: ${enc.reasonForVisit}\nPlan: ${enc.plan?.patientInstructions || 'Standard outpatient follow-up.'}`,
        code: enc.billingCode || '99214',
        statusBadge: 'Clinic Visit',
        statusColor: 'bg-sky-50 text-sky-800 border-sky-200',
        rawData: enc,
      });
    });

    return events;
  }, [patient]);

  // Event category counts
  const eventCounts = useMemo(() => {
    return {
      all: allEvents.length,
      hospitalization: allEvents.filter((e) => e.type === 'hospitalization').length,
      chronic_diagnosis: allEvents.filter((e) => e.type === 'chronic_diagnosis').length,
      immunization: allEvents.filter((e) => e.type === 'immunization').length,
      surgery: allEvents.filter((e) => e.type === 'surgery').length,
      encounter: allEvents.filter((e) => e.type === 'encounter').length,
    };
  }, [allEvents]);

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    let result = allEvents.filter((event) => {
      // Type filter
      if (selectedTypeFilter !== 'all' && event.type !== selectedTypeFilter) {
        return false;
      }

      // Keyword search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(q);
        const matchesSub = (event.subtitle || '').toLowerCase().includes(q);
        const matchesFacility = (event.facilityOrProvider || '').toLowerCase().includes(q);
        const matchesDesc = (event.description || '').toLowerCase().includes(q);
        const matchesDate = event.dateStr.includes(q);
        return matchesTitle || matchesSub || matchesFacility || matchesDesc || matchesDate;
      }

      return true;
    });

    // Sort order
    result.sort((a, b) => {
      const diff = b.sortDate.getTime() - a.sortDate.getTime();
      return sortOrder === 'desc' ? diff : -diff;
    });

    return result;
  }, [allEvents, selectedTypeFilter, searchTerm, sortOrder]);

  // Group events by year for clear chronological sectioning
  const groupedByYear = useMemo(() => {
    const groups: { year: string; events: TimelineEvent[] }[] = [];
    const map = new Map<string, TimelineEvent[]>();

    filteredEvents.forEach((ev) => {
      const year = ev.dateStr.slice(0, 4) || 'Prior';
      if (!map.has(year)) {
        map.set(year, []);
      }
      map.get(year)!.push(ev);
    });

    map.forEach((events, year) => {
      groups.push({ year, events });
    });

    return groups;
  }, [filteredEvents]);

  // Handle adding a new milestone (hospitalization or major clinical event)
  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (newEventCategory === 'hospitalization') {
      const newHosp: HospitalizationRecord = {
        id: `hosp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        admissionDate: newEventDate,
        dischargeDate: newEventEndDate || undefined,
        facility: newFacility.trim() || 'Regional Hospital',
        admittingDiagnosis: newTitle.trim(),
        dischargeSummary: newNotes.trim() || undefined,
        attendingPhysician: newAttending.trim() || undefined,
      };

      const updatedHosps = [newHosp, ...(patient.hospitalizations || [])];
      onUpdatePatient({
        ...patient,
        hospitalizations: updatedHosps,
      });
    } else if (newEventCategory === 'chronic_diagnosis') {
      const newProb: Problem = {
        id: `prb-${Date.now()}`,
        icdCode: 'R69',
        description: newTitle.trim(),
        status: 'active',
        onsetDate: newEventDate,
        notes: newNotes.trim(),
      };
      onUpdatePatient({
        ...patient,
        activeProblems: [newProb, ...patient.activeProblems],
      });
    } else if (newEventCategory === 'immunization') {
      const newImm: Immunization = {
        id: `imm-${Date.now()}`,
        vaccineName: newTitle.trim(),
        dateAdministered: newEventDate,
        status: 'completed',
        lotNumber: newNotes.trim() || undefined,
      };
      onUpdatePatient({
        ...patient,
        immunizations: [newImm, ...patient.immunizations],
      });
    } else if (newEventCategory === 'surgery') {
      const newSurg: SurgicalHistoryItem = {
        id: `surg-${Date.now()}`,
        procedure: newTitle.trim(),
        year: newEventDate.slice(0, 4),
        hospitalOrSurgeon: newFacility.trim() || undefined,
        notes: newNotes.trim() || undefined,
      };
      onUpdatePatient({
        ...patient,
        pastSurgicalHistory: [newSurg, ...patient.pastSurgicalHistory],
      });
    }

    // Reset and close
    setIsAddEventOpen(false);
    setNewTitle('');
    setNewFacility('');
    setNewNotes('');
    setNewAttending('');
    setNewEventEndDate('');
  };

  const handleDeleteHospitalization = (hospId: string) => {
    if (!patient.hospitalizations) return;
    const updated = patient.hospitalizations.filter((h) => h.id !== hospId);
    onUpdatePatient({
      ...patient,
      hospitalizations: updated,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-50 text-red-700 rounded-md">
                <Clock className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-gray-900">
                Longitudinal Clinical Timeline & Patient History
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Unified chronological vertical flowsheet summarizing major hospitalizations, immunization milestones, surgeries, and chronic disease onsets with age-at-event tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>

            <button
              onClick={() => setIsAddEventOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-red-200" />
              <span>Log Milestone / Hospitalization</span>
            </button>
          </div>
        </div>

        {/* Category Metrics Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-100 text-xs">
          <div
            onClick={() => setSelectedTypeFilter('hospitalization')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              selectedTypeFilter === 'hospitalization'
                ? 'bg-rose-50 border-rose-300 text-rose-950 font-semibold'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-semibold text-gray-500">Hospitalizations</span>
              <Building2 className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-xl font-bold font-mono text-gray-900 mt-1">
              {eventCounts.hospitalization}
            </div>
          </div>

          <div
            onClick={() => setSelectedTypeFilter('chronic_diagnosis')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              selectedTypeFilter === 'chronic_diagnosis'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-semibold text-gray-500">Chronic Onsets</span>
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl font-bold font-mono text-gray-900 mt-1">
              {eventCounts.chronic_diagnosis}
            </div>
          </div>

          <div
            onClick={() => setSelectedTypeFilter('immunization')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              selectedTypeFilter === 'immunization'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-semibold text-gray-500">Immunizations</span>
              <Syringe className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-bold font-mono text-gray-900 mt-1">
              {eventCounts.immunization}
            </div>
          </div>

          <div
            onClick={() => setSelectedTypeFilter('surgery')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              selectedTypeFilter === 'surgery'
                ? 'bg-purple-50 border-purple-300 text-purple-950 font-semibold'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-semibold text-gray-500">Surgeries</span>
              <Scissors className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl font-bold font-mono text-gray-900 mt-1">
              {eventCounts.surgery}
            </div>
          </div>

          <div
            onClick={() => setSelectedTypeFilter('encounter')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              selectedTypeFilter === 'encounter'
                ? 'bg-sky-50 border-sky-300 text-sky-950 font-semibold'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-semibold text-gray-500">Clinic Visits</span>
              <FileText className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="text-xl font-bold font-mono text-gray-900 mt-1">
              {eventCounts.encounter}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: LOG CLINICAL MILESTONE / HOSPITALIZATION */}
      {isAddEventOpen && (
        <form
          onSubmit={handleSaveMilestone}
          className="bg-white border-2 border-red-600 rounded-lg p-5 shadow-lg space-y-4 text-xs animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-700" />
              <h3 className="text-sm font-bold text-gray-900">
                Log Clinical Milestone or Hospitalization
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAddEventOpen(false)}
              className="text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Category
              </label>
              <select
                value={newEventCategory}
                onChange={(e) => setNewEventCategory(e.target.value as TimelineEventType)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-red-600 bg-white"
              >
                <option value="hospitalization">Hospitalization / Inpatient Stay</option>
                <option value="chronic_diagnosis">Chronic Condition Onset</option>
                <option value="surgery">Major Surgery / Procedure</option>
                <option value="immunization">Immunization Administered</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                {newEventCategory === 'hospitalization' ? 'Admission Date' : 'Event / Onset Date'}
              </label>
              <input
                type="date"
                required
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded focus:outline-red-600"
              />
            </div>

            {newEventCategory === 'hospitalization' && (
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Discharge Date (Optional)
                </label>
                <input
                  type="date"
                  value={newEventEndDate}
                  onChange={(e) => setNewEventEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded focus:outline-red-600"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">
                {newEventCategory === 'hospitalization'
                  ? 'Admitting Diagnosis / Chief Reason'
                  : newEventCategory === 'surgery'
                  ? 'Surgical Procedure Name'
                  : newEventCategory === 'immunization'
                  ? 'Vaccine Name'
                  : 'Diagnosis / Condition Name'}
              </label>
              <input
                type="text"
                required
                placeholder={
                  newEventCategory === 'hospitalization'
                    ? 'e.g. Acute Exacerbation of Asthma / Bacterial Pneumonia'
                    : newEventCategory === 'surgery'
                    ? 'e.g. Laparoscopic Appendectomy'
                    : newEventCategory === 'immunization'
                    ? 'e.g. Shingrix (Zoster Recombinant)'
                    : 'e.g. Type 2 Diabetes Mellitus'
                }
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-red-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Facility / Hospital / Clinic
              </label>
              <input
                type="text"
                placeholder="e.g. Providence St. Vincent Medical Center"
                value={newFacility}
                onChange={(e) => setNewFacility(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-red-600"
              />
            </div>

            {newEventCategory === 'hospitalization' && (
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Attending Physician (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Robert Vance, MD"
                  value={newAttending}
                  onChange={(e) => setNewAttending(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-red-600"
                />
              </div>
            )}

            <div className={newEventCategory === 'hospitalization' ? 'sm:col-span-2' : 'sm:col-span-3'}>
              <label className="block text-gray-700 font-medium mb-1">
                Clinical Details / Discharge Summary / Treatment Interventions
              </label>
              <textarea
                rows={2}
                placeholder="Document key treatments, ICU stay, medication changes, and outpatient discharge instructions..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-red-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsAddEventOpen(false)}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-semibold rounded cursor-pointer"
            >
              Save Milestone to Timeline
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-gray-200 rounded-lg text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTypeFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              selectedTypeFilter === 'all'
                ? 'bg-red-700 text-white font-semibold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Milestones ({allEvents.length})
          </button>
          <button
            onClick={() => setSelectedTypeFilter('hospitalization')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              selectedTypeFilter === 'hospitalization'
                ? 'bg-rose-700 text-white font-semibold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Building2 className="w-3 h-3 text-rose-500" />
            <span>Hospitalizations ({eventCounts.hospitalization})</span>
          </button>
          <button
            onClick={() => setSelectedTypeFilter('chronic_diagnosis')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              selectedTypeFilter === 'chronic_diagnosis'
                ? 'bg-indigo-700 text-white font-semibold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Activity className="w-3 h-3 text-indigo-500" />
            <span>Diagnoses ({eventCounts.chronic_diagnosis})</span>
          </button>
          <button
            onClick={() => setSelectedTypeFilter('immunization')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              selectedTypeFilter === 'immunization'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Syringe className="w-3 h-3 text-emerald-500" />
            <span>Vaccines ({eventCounts.immunization})</span>
          </button>
          <button
            onClick={() => setSelectedTypeFilter('surgery')}
            className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              selectedTypeFilter === 'surgery'
                ? 'bg-purple-700 text-white font-semibold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Scissors className="w-3 h-3 text-purple-500" />
            <span>Surgeries ({eventCounts.surgery})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search timeline events..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-xs focus:outline-red-600"
          />
        </div>
      </div>

      {/* Main Vertical Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs">
        {groupedByYear.length > 0 ? (
          <div className="space-y-8">
            {groupedByYear.map((group) => (
              <div key={group.year} className="relative">
                {/* Year Header Marker */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs py-1.5 mb-4 flex items-center gap-2 border-b border-gray-100">
                  <span className="px-2.5 py-0.5 bg-red-800 text-white font-mono text-xs font-bold rounded-md shadow-xs">
                    {group.year}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {group.events.length} {group.events.length === 1 ? 'clinical event' : 'clinical events'}
                  </span>
                </div>

                {/* Vertical Spine */}
                <div className="relative pl-6 sm:pl-8 space-y-4 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {group.events.map((event) => {
                    const isExpanded = expandedEventIds.has(event.id);
                    const ageAtEvent = calculateAgeAtDate(patient.dob, event.dateStr);

                    return (
                      <div key={event.id} className="relative group">
                        {/* Dot on Spine */}
                        <div
                          className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs ${
                            event.type === 'hospitalization'
                              ? 'border-rose-600 text-rose-600'
                              : event.type === 'chronic_diagnosis'
                              ? 'border-indigo-600 text-indigo-600'
                              : event.type === 'immunization'
                              ? 'border-emerald-600 text-emerald-600'
                              : event.type === 'surgery'
                              ? 'border-purple-600 text-purple-600'
                              : 'border-sky-600 text-sky-600'
                          }`}
                        >
                          {event.type === 'hospitalization' ? (
                            <Building2 className="w-3 h-3" />
                          ) : event.type === 'chronic_diagnosis' ? (
                            <Activity className="w-3 h-3" />
                          ) : event.type === 'immunization' ? (
                            <Syringe className="w-3 h-3" />
                          ) : event.type === 'surgery' ? (
                            <Scissors className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                        </div>

                        {/* Event Card Content */}
                        <div
                          className={`border rounded-lg p-3.5 transition-all bg-white hover:border-gray-300 ${
                            event.type === 'hospitalization'
                              ? 'border-rose-200 bg-rose-50/20'
                              : event.type === 'chronic_diagnosis'
                              ? 'border-indigo-100 bg-indigo-50/15'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-sans ${
                                    event.statusColor || 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {event.statusBadge || event.type}
                                </span>

                                <span className="font-mono text-xs text-gray-500 font-semibold">
                                  {event.dateStr}
                                </span>

                                {ageAtEvent && (
                                  <span className="font-mono text-[11px] text-red-800 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded font-semibold">
                                    {ageAtEvent}
                                  </span>
                                )}

                                {event.code && (
                                  <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded">
                                    {event.code}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-sm font-bold text-gray-900 leading-snug">
                                {event.title}
                              </h4>

                              {event.subtitle && (
                                <p className="text-xs text-gray-600 font-medium">
                                  {event.subtitle}
                                </p>
                              )}

                              {event.facilityOrProvider && (
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono">
                                  <Building2 className="w-3 h-3 text-gray-400" />
                                  <span>{event.facilityOrProvider}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-start">
                              {event.description && (
                                <button
                                  onClick={() => toggleExpand(event.id)}
                                  className="text-[11px] text-red-700 hover:text-red-900 font-medium flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{isExpanded ? 'Less' : 'Details'}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}

                              {event.type === 'hospitalization' && (
                                <button
                                  onClick={() => handleDeleteHospitalization(event.id)}
                                  className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                                  title="Delete hospitalization"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expandable Clinical Notes / Discharge Summary */}
                          {isExpanded && event.description && (
                            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-700 bg-gray-50/80 p-2.5 rounded font-mono whitespace-pre-line animate-fade-in">
                              <span className="text-[10px] font-bold uppercase text-gray-500 font-sans block mb-1">
                                Clinical Summary & Interventions:
                              </span>
                              {event.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 italic">
            {searchTerm
              ? `No timeline milestones found matching "${searchTerm}".`
              : 'No clinical timeline events recorded yet. Click "Log Milestone / Hospitalization" to add.'}
          </div>
        )}
      </div>
    </div>
  );
};
