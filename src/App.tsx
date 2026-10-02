import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { PatientDirectory } from './components/PatientDirectory';
import { PatientChart } from './components/PatientChart';
import { EncounterCapture } from './components/EncounterCapture';
import { ClinicalCalculators } from './components/ClinicalCalculators';
import { TodaySchedule } from './components/TodaySchedule';
import { NewPatientModal } from './components/NewPatientModal';
import { PatientVisitSummary } from './components/PatientVisitSummary';
import { MobileVisitSummary } from './components/MobileVisitSummary';
import { EncountersDashboard } from './components/EncountersDashboard';
import { UserManagement } from './components/UserManagement';
import { AuthModal } from './components/AuthModal';
import { LabsManagement } from './components/LabsManagement';
import { Patient, Encounter } from './types/clinical';
import { UserAccount } from './types/auth';
import { userService } from './services/userService';
import { storageService } from './services/storageService';
import { auth, googleProvider, testConnection } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { firebasePatientService } from './services/firebasePatientService';
import { Check, AlertCircle } from 'lucide-react';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeView, setActiveView] = useState<'directory' | 'chart' | 'calculators' | 'schedule' | 'encounter' | 'encounters' | 'users' | 'labs'>('directory');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [editingEncounter, setEditingEncounter] = useState<Encounter | undefined>(undefined);
  const [viewingSummaryEncounter, setViewingSummaryEncounter] = useState<Encounter | null>(null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');

  // Staff Authorization User & Modal
  const [staffUser, setStaffUser] = useState<UserAccount>(() => userService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Support direct QR code scan URLs from mobile phones
  const [mobileDirectView, setMobileDirectView] = useState<{
    patientId: string | null;
    encounterId: string | null;
  } | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      if (mode === 'mobile-avs' || mode === 'patient-avs') {
        return {
          patientId: params.get('patientId'),
          encounterId: params.get('encounterId'),
        };
      }
    }
    return null;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial patients & connect Firebase
  useEffect(() => {
    // 1. Initial boot connection test per SKILL.md
    testConnection().then((connected) => {
      setSyncStatus(connected ? 'connected' : 'offline');
    });

    // 2. Load cached patients immediately so UI is instant
    const cached = storageService.getPatients();
    setPatients(cached);

    // 3. Listen to Firebase Auth state & attach real-time Firestore sync
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setSyncStatus('syncing');
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
        }
        unsubscribeFirestore = firebasePatientService.subscribeToPatients(
          (livePatients) => {
            if (livePatients && livePatients.length > 0) {
              setPatients(livePatients);
              storageService.savePatients(livePatients);
            }
            setSyncStatus('connected');
          },
          (err) => {
            console.warn('Firestore subscription fallback to cache:', err);
            setSyncStatus('offline');
          }
        );
      } else {
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }
        setSyncStatus('offline');
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSignIn = async () => {
    try {
      setSyncStatus('syncing');
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in with Google. Firestore synchronized.');
    } catch (err) {
      console.error('Google sign-in error:', err);
      showToast('Could not sign in with Google');
      setSyncStatus('offline');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('Signed out of practice account.');
      setSyncStatus('offline');
    } catch (err) {
      console.error('Sign out error:', err);
    }
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

    // Asynchronously synchronize to Firestore database
    firebasePatientService.savePatient(updatedPatient).catch((err) => {
      console.warn('Saved locally, Firestore sync pending:', err);
    });

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

    // Synchronize to Firestore database
    firebasePatientService.savePatient(updated).catch((err) => {
      console.warn('Updated locally, Firestore sync pending:', err);
    });

    showToast(`Updated health record for ${updated.lastName}, ${updated.firstName}`);
  };

  const handleNewPatientSaved = (newPatient: Patient) => {
    storageService.savePatient(newPatient);
    const updatedList = storageService.getPatients();
    setPatients(updatedList);
    setSelectedPatientId(newPatient.id);
    setActiveView('chart');

    // Synchronize to Firestore database
    firebasePatientService.savePatient(newPatient).catch((err) => {
      console.warn('Registered locally, Firestore sync pending:', err);
    });

    showToast(`Successfully registered ${newPatient.lastName}, ${newPatient.firstName}`);
  };

  const handleResetData = () => {
    if (window.confirm('Reset patient records to standard verified primary care sample patients? Any temporary edits will be restored.')) {
      const resetList = storageService.resetToDefault();
      setPatients(resetList);
      setSelectedPatientId(resetList[0]?.id || null);

      // Reset in Firestore database
      firebasePatientService.seedInitialCohort(resetList).catch((err) => {
        console.warn('Reset locally, Firestore sync pending:', err);
      });

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
        const imported = storageService.getPatients();
        setPatients(imported);
        firebasePatientService.seedInitialCohort(imported).catch(console.warn);
        showToast('Successfully imported clinical patient records');
      } else {
        alert('Invalid JSON patient file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // If accessed directly via mobile QR code scan, render the mobile patient instructions portal
  if (mobileDirectView) {
    const targetPatient =
      patients.find((p) => p.id === mobileDirectView.patientId) || patients[0];
    const targetEncounter =
      targetPatient?.encounters.find((e) => e.id === mobileDirectView.encounterId) ||
      targetPatient?.encounters[0];

    if (targetPatient && targetEncounter) {
      return (
        <MobileVisitSummary
          patient={targetPatient}
          encounter={targetEncounter}
          onBack={() => {
            if (typeof window !== 'undefined') {
              window.history.replaceState({}, '', window.location.pathname);
            }
            setMobileDirectView(null);
          }}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col font-sans selection:bg-red-100 selection:text-red-900">
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
        currentUser={currentUser}
        syncStatus={syncStatus}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        staffUser={staffUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-gray-700 animate-fade-in">
          <Check className="w-4 h-4 text-red-400" />
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
            onUpdatePatient={handleUpdatePatient}
          />
        )}

        {activeView === 'encounters' && (
          <EncountersDashboard
            patients={patients}
            onSelectPatient={handleSelectPatient}
            onStartEncounter={(p, enc) => handleStartEncounter(p, enc)}
            onViewVisitSummary={(p, enc) => {
              setSelectedPatientId(p.id);
              setViewingSummaryEncounter(enc);
            }}
            onNewPatient={() => setIsNewPatientModalOpen(true)}
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
            onViewVisitSummary={(enc) => setViewingSummaryEncounter(enc)}
          />
        )}

        {activeView === 'encounter' && selectedPatient && (
          <EncounterCapture
            patient={selectedPatient}
            existingEncounter={editingEncounter}
            onSaveEncounter={handleSaveEncounter}
            onClose={() => setActiveView('chart')}
            onPrintAVS={(enc) => setViewingSummaryEncounter(enc)}
            onPrintNote={(enc) => {
              window.print();
            }}
            staffUser={staffUser}
          />
        )}

        {activeView === 'calculators' && (
          <ClinicalCalculators initialPatient={selectedPatient} />
        )}

        {activeView === 'users' && (
          <UserManagement
            currentUser={staffUser}
            onSwitchUser={(user) => {
              setStaffUser(user);
              showToast(`Active session switched to ${user.displayName} (${user.role})`);
            }}
          />
        )}

        {activeView === 'labs' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                  Clinical Laboratory & Diagnostic Results Workbench
                </h1>
                <p className="text-xs text-gray-500">
                  Laboratory technician review, critical values verification, and test result entry
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md border border-emerald-200">
                Staff: {staffUser.displayName} ({staffUser.role})
              </span>
            </div>

            {selectedPatient ? (
              <LabsManagement
                patient={selectedPatient}
                onUpdatePatient={handleUpdatePatient}
              />
            ) : patients.length > 0 ? (
              <LabsManagement
                patient={patients[0]}
                onUpdatePatient={handleUpdatePatient}
              />
            ) : (
              <div className="bg-white p-8 text-center text-xs text-gray-500">
                No patients available for laboratory testing.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Patient Visit Summary (AVS) Full-Page Printer Modal */}
      {viewingSummaryEncounter && selectedPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs print:static print:bg-white print:overflow-visible">
          <PatientVisitSummary
            patient={selectedPatient}
            encounter={viewingSummaryEncounter}
            onClose={() => setViewingSummaryEncounter(null)}
            onEditEncounter={() => {
              const enc = viewingSummaryEncounter;
              setViewingSummaryEncounter(null);
              handleStartEncounter(selectedPatient, enc);
            }}
          />
        </div>
      )}

      {/* New Patient Intake Modal */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSave={handleNewPatientSaved}
      />

      {/* Clinic Staff Authentication & Role Switcher Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={staffUser}
          onLoginSuccess={(user) => {
            setStaffUser(user);
            showToast(`Authenticated as ${user.displayName} (${user.role})`);
          }}
        />
      )}
    </div>
  );
}
