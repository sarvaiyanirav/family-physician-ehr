import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { PatientDirectory } from './components/PatientDirectory';
import { PatientChart } from './components/PatientChart';
import { EncounterCapture } from './components/EncounterCapture';
import { ClinicalCalculators } from './components/ClinicalCalculators';
import { TodaySchedule } from './components/TodaySchedule';
import { NewPatientModal } from './components/NewPatientModal';
import { Patient, Encounter } from './types/clinical';
import { storageService } from './services/storageService';
import { Check, AlertCircle } from 'lucide-react';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeView, setActiveView] = useState<'directory' | 'chart' | 'calculators' | 'schedule' | 'encounter'>('directory');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [editingEncounter, setEditingEncounter] = useState<Encounter | undefined>(undefined);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial patients
  useEffect(() => {
    const list = storageService.getPatients();
    setPatients(list);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setActiveView('chart');
  };

  const handleStartEncounter = (patient: Patient, encounter?: Encounter) => {
    setSelectedPatientId(patient.id);
    setEditingEncounter(encounter);
    setActiveView('encounter');
  };

  const handleSaveEncounter = (encounter: Encounter, isSigned: boolean) => {
    if (!selectedPatient) return;

    // Check if encounter already exists in patient's records
    const existingIndex = selectedPatient.encounters.findIndex((e) => e.id === encounter.id);
    let updatedEncounters: Encounter[];

    if (existingIndex >= 0) {
      updatedEncounters = [...selectedPatient.encounters];
      updatedEncounters[existingIndex] = encounter;
    } else {
      updatedEncounters = [encounter, ...selectedPatient.encounters];
    }

    // Also sync any newly prescribed medications to the patient's active medication list!
    const existingMedNames = new Set(selectedPatient.medications.map((m) => m.name.toLowerCase()));
    const newMedsToAdd = encounter.plan.prescriptions
      .filter((rx) => rx.drug.trim() && !existingMedNames.has(rx.drug.trim().toLowerCase()))
      .map((rx) => ({
        id: `med-${Date.now()}-${Math.random()}`,
        name: rx.drug.trim(),
        dosage: rx.dose.trim(),
        route: rx.route || 'Oral',
        frequency: rx.frequency,
        indication: encounter.assessment.primaryDiagnosis.name || 'Clinical therapy',
        prescribedDate: new Date().toISOString().slice(0, 10),
        prescribedBy: encounter.provider,
        status: 'active' as const,
        adherenceNotes: rx.instructions,
      }));

    // Update patient record
    const updatedPatient: Patient = {
      ...selectedPatient,
      encounters: updatedEncounters,
      medications: [...newMedsToAdd, ...selectedPatient.medications],
      visitStatus: isSigned ? 'completed' : 'in_exam',
      updatedAt: new Date().toISOString(),
    };

    storageService.savePatient(updatedPatient);
    setPatients(storageService.getPatients());

    showToast(
      isSigned
        ? `Encounter finalized & signed by ${encounter.provider}`
        : 'Encounter draft saved successfully'
    );

    setActiveView('chart');
  };

  const handleUpdatePatient = (updated: Patient) => {
    storageService.savePatient(updated);
    setPatients(storageService.getPatients());
    showToast(`Updated health record for ${updated.lastName}, ${updated.firstName}`);
  };

  const handleNewPatientSaved = (newPatient: Patient) => {
    storageService.savePatient(newPatient);
    const updatedList = storageService.getPatients();
    setPatients(updatedList);
    setSelectedPatientId(newPatient.id);
    setActiveView('chart');
    showToast(`Successfully registered ${newPatient.lastName}, ${newPatient.firstName}`);
  };

  const handleResetData = () => {
    if (window.confirm('Reset patient records to standard verified primary care sample patients? Any temporary edits will be restored.')) {
      const resetList = storageService.resetToDefault();
      setPatients(resetList);
      setSelectedPatientId(resetList[0]?.id || null);
      showToast('Restored standard clinical cohort data');
    }
  };

  const handleExportCSV = () => {
    storageService.exportToCSV();
    showToast('Downloaded patient registry CSV export');
  };

  const handleExportJSON = () => {
    storageService.exportToJSON();
    showToast('Downloaded complete JSON clinical backup');
  };

  const handleImportJSONClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importFromJSON(content);
      if (success) {
        setPatients(storageService.getPatients());
        showToast('Successfully imported clinical patient records');
      } else {
        alert('Invalid JSON patient file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* Top Bar Header */}
      <Header
        activeView={activeView === 'encounter' ? 'chart' : activeView}
        onNavigate={(view) => setActiveView(view)}
        onNewPatient={() => setIsNewPatientModalOpen(true)}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSONClick}
        onResetData={handleResetData}
        patientCount={patients.length}
        patients={patients}
        onSelectPatient={handleSelectPatient}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700 animate-fade-in">
          <Check className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main View Port */}
      <main className="flex-1 pb-16">
        {activeView === 'directory' && (
          <PatientDirectory
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onNewPatient={() => setIsNewPatientModalOpen(true)}
            onStartEncounter={(p) => handleStartEncounter(p)}
          />
        )}

        {activeView === 'schedule' && (
          <TodaySchedule
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onStartEncounter={(p) => handleStartEncounter(p)}
          />
        )}

        {activeView === 'chart' && selectedPatient && (
          <PatientChart
            patient={selectedPatient}
            onBack={() => setActiveView('directory')}
            onStartEncounter={(enc) => handleStartEncounter(selectedPatient, enc)}
            onUpdatePatient={handleUpdatePatient}
            onOpenCalculators={() => setActiveView('calculators')}
          />
        )}

        {activeView === 'encounter' && selectedPatient && (
          <EncounterCapture
            patient={selectedPatient}
            existingEncounter={editingEncounter}
            onSaveEncounter={handleSaveEncounter}
            onClose={() => setActiveView('chart')}
            onPrintAVS={(enc) => {
              setActiveView('chart');
              showToast('Navigate to "Printable Documents & AVS" to review and print.');
            }}
            onPrintNote={(enc) => {
              window.print();
            }}
          />
        )}

        {activeView === 'calculators' && (
          <ClinicalCalculators initialPatient={selectedPatient} />
        )}
      </main>

      {/* New Patient Intake Modal */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSave={handleNewPatientSaved}
      />
    </div>
  );
}
