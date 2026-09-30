import React, { useState } from 'react';
import { X, Check, AlertTriangle, AlertOctagon, Activity } from 'lucide-react';
import { Patient, Allergy, Problem, TriagePriority } from '../types/clinical';
import { COMMON_PRIMARY_CARE_ICD10 } from '../data/icdCodes';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [dob, setDob] = useState('1985-06-15');
  const [sex, setSex] = useState<'male' | 'female' | 'intersex'>('female');
  const [genderIdentity, setGenderIdentity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('OR');
  const [zip, setZip] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [healthCard, setHealthCard] = useState('');
  const [primaryLang, setPrimaryLang] = useState('English');
  const [needsInterpreter, setNeedsInterpreter] = useState(false);
  const [codeStatus, setCodeStatus] = useState<Patient['codeStatus']>('Full Code');
  const [primaryPhysician, setPrimaryPhysician] = useState('Dr. Sarah Lin, MD');
  const [triagePriority, setTriagePriority] = useState<TriagePriority>('routine');
  const [triageNote, setTriageNote] = useState('');

  // Initial Clinical Baseline
  const [allergyInput, setAllergyInput] = useState('');
  const [allergySeverity, setAllergySeverity] = useState<Allergy['severity']>('mild');
  const [allergyReaction, setAllergyReaction] = useState('');
  const [allergiesList, setAllergiesList] = useState<Allergy[]>([]);

  const [selectedProblems, setSelectedProblems] = useState<Problem[]>([]);
  const [problemSearch, setProblemSearch] = useState('');

  if (!isOpen) return null;

  const handleAddAllergy = () => {
    if (!allergyInput.trim()) return;
    const newAlg: Allergy = {
      id: `alg-${Date.now()}`,
      allergen: allergyInput.trim(),
      type: 'drug',
      reaction: allergyReaction.trim() || 'Unspecified reaction',
      severity: allergySeverity,
      identifiedDate: new Date().toISOString().slice(0, 10),
    };
    setAllergiesList([...allergiesList, newAlg]);
    setAllergyInput('');
    setAllergyReaction('');
  };

  const handleRemoveAllergy = (id: string) => {
    setAllergiesList(allergiesList.filter((a) => a.id !== id));
  };

  const handleToggleProblem = (code: string, name: string) => {
    const existing = selectedProblems.find((p) => p.icdCode === code);
    if (existing) {
      setSelectedProblems(selectedProblems.filter((p) => p.icdCode !== code));
    } else {
      setSelectedProblems([
        ...selectedProblems,
        {
          id: `prb-${Date.now()}-${code}`,
          icdCode: code,
          description: name,
          status: 'active',
          onsetDate: new Date().toISOString().slice(0, 10),
        },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !dob) return;

    const generatedMrn = `PRX-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      mrn: generatedMrn,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      preferredName: preferredName.trim() || undefined,
      dob,
      sex,
      genderIdentity: genderIdentity.trim() || (sex === 'male' ? 'Cisgender male' : sex === 'female' ? 'Cisgender female' : ''),
      phone: phone.trim() || '(555) 000-0000',
      email: email.trim(),
      address: {
        street: street.trim(),
        city: city.trim() || 'Portland',
        state: state.trim() || 'OR',
        zip: zip.trim(),
      },
      emergencyContact: {
        name: emergencyName.trim(),
        relationship: emergencyRel.trim(),
        phone: emergencyPhone.trim(),
      },
      healthCardNumber: healthCard.trim() || `HC-${Math.floor(100000 + Math.random() * 900000)}-OR`,
      primaryLanguage: primaryLang,
      needsInterpreter,
      codeStatus,
      primaryPhysician,
      clinicLocation: 'Cascade Family Health Centre',
      allergies: allergiesList,
      activeProblems: selectedProblems,
      pastMedicalHistory: [],
      pastSurgicalHistory: [],
      medications: [],
      socialHistory: {
        smokingStatus: 'never',
        alcoholUse: 'none',
        recreationalDrugs: 'None',
        occupation: '',
        livingArrangement: '',
        exerciseRoutine: '',
        dietaryHabits: '',
      },
      familyHistory: [],
      immunizations: [],
      preventiveScreenings: [],
      encounters: [],
      labResults: [],
      clinicalAlerts: allergiesList.length > 0 ? allergiesList.map((a) => `${a.allergen} allergy`) : ['No Known Drug Allergies (NKDA)'],
      visitStatus: 'waiting',
      scheduledTime: 'Walk-in Intake',
      triagePriority,
      triageNote: triageNote.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newPatient);
    onClose();
  };

  const filteredIcd = COMMON_PRIMARY_CARE_ICD10.filter(
    (item) =>
      item.name.toLowerCase().includes(problemSearch.toLowerCase()) ||
      item.code.toLowerCase().includes(problemSearch.toLowerCase())
  ).slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">New Patient Intake</h2>
            <p className="text-xs text-gray-500">
              Primary care registration, demographics, and clinical baseline
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Demographics */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-800 mb-3">
              1. Patient Identification & Demographics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Legal First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Eleanor"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Legal Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Vance"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Preferred / Alias Name
                </label>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-mono border border-gray-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Assigned Sex at Birth *
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="intersex">Intersex</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Gender Identity
                </label>
                <input
                  type="text"
                  value={genderIdentity}
                  onChange={(e) => setGenderIdentity(e.target.value)}
                  placeholder="e.g. Cisgender female, Non-binary"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Health Insurance */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-800 mb-3">
              2. Contact & Administrative
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Primary Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3 py-1.5 text-sm font-mono border border-gray-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Health Card / Insurance ID
                </label>
                <input
                  type="text"
                  value={healthCard}
                  onChange={(e) => setHealthCard(e.target.value)}
                  placeholder="e.g. HC-749102-OR"
                  className="w-full px-3 py-1.5 text-sm font-mono border border-gray-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street address and apartment/suite"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  City, State, Zip
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-2/3 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:border-red-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="OR"
                    className="w-1/3 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Baseline - Allergies */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-800 mb-2">
              3. Clinical Safety: Allergies & Intolerances
            </h3>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Allergen / Substance
                  </label>
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    placeholder="e.g. Penicillin, Codeine, Peanuts"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Severity
                  </label>
                  <select
                    value={allergySeverity}
                    onChange={(e) => setAllergySeverity(e.target.value as any)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
                  >
                    <option value="mild">Mild (rash/itching)</option>
                    <option value="moderate">Moderate (angioedema/GI)</option>
                    <option value="severe_anaphylaxis">Severe Anaphylaxis</option>
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="w-full py-1.5 px-3 text-xs font-medium text-red-800 bg-red-100 hover:bg-red-200 rounded-md transition-colors cursor-pointer"
                  >
                    + Add Allergen
                  </button>
                </div>
              </div>

              {allergiesList.length > 0 ? (
                <div className="divide-y divide-gray-200 pt-1">
                  {allergiesList.map((alg) => (
                    <div key={alg.id} className="flex items-center justify-between py-1.5 text-xs">
                      <div>
                        <span className="font-semibold text-gray-900">{alg.allergen}</span>
                        <span className="text-gray-500 ml-2">({alg.severity.replace('_', ' ')})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(alg.id)}
                        className="text-rose-600 hover:text-rose-800 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No allergies recorded (Will be noted as NKDA)</p>
              )}
            </div>
          </div>

          {/* Section 4: Initial Active Problems / Past History */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-red-800 mb-2">
              4. Initial Problem List / Common Conditions
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                value={problemSearch}
                onChange={(e) => setProblemSearch(e.target.value)}
                placeholder="Search common conditions (e.g. Hypertension, Diabetes, Asthma)..."
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredIcd.map((item) => {
                  const isChecked = selectedProblems.some((p) => p.icdCode === item.code);
                  return (
                    <button
                      type="button"
                      key={item.code}
                      onClick={() => handleToggleProblem(item.code, item.name)}
                      className={`flex items-start gap-2 p-2 text-left text-xs border rounded-md transition-colors cursor-pointer ${
                        isChecked
                          ? 'border-red-600 bg-red-50/60 text-red-950 font-medium'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                      }`}
                    >
                      <span className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border text-[10px] shrink-0 ${
                        isChecked ? 'bg-red-700 border-red-700 text-white' : 'border-gray-300'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </span>
                      <div>
                        <span className="font-mono text-gray-500 mr-1.5">[{item.code}]</span>
                        <span>{item.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 5: Code Status & Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Resuscitation Code Status
              </label>
              <select
                value={codeStatus}
                onChange={(e) => setCodeStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
              >
                <option value="Full Code">Full Code (Resuscitation requested)</option>
                <option value="DNR">DNR (Do Not Resuscitate)</option>
                <option value="DNI">DNI (Do Not Intubate)</option>
                <option value="Limited Intervention">Limited Intervention</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Assigned Primary Physician
              </label>
              <input
                type="text"
                value={primaryPhysician}
                onChange={(e) => setPrimaryPhysician(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Initial Triage Priority Tag
              </label>
              <select
                value={triagePriority}
                onChange={(e) => setTriagePriority(e.target.value as TriagePriority)}
                className="w-full px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
              >
                <option value="routine">Routine (Standard ambulatory appointment / preventive)</option>
                <option value="urgent">Urgent (Acute symptom onset / priority evaluation)</option>
                <option value="emergency">Emergency (Critical red flag / immediate physician attention)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Triage Clinical Reason / Chief Symptom (Optional)
              </label>
              <input
                type="text"
                value={triageNote}
                onChange={(e) => setTriageNote(e.target.value)}
                placeholder="e.g. Acute chest discomfort, asthma flare, or routine follow-up"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md shadow-xs transition-colors cursor-pointer"
            >
              Register & Open Patient Chart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
