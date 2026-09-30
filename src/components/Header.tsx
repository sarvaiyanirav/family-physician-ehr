import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Download, Upload, RotateCcw, Search, X, User, AlertTriangle, ArrowRight } from 'lucide-react';
import { Patient } from '../types/clinical';
import { calculateAge } from '../services/storageService';

interface HeaderProps {
  activeView: 'directory' | 'chart' | 'calculators' | 'schedule';
  onNavigate: (view: 'directory' | 'chart' | 'calculators' | 'schedule') => void;
  onNewPatient: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onResetData: () => void;
  patientCount: number;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  onNewPatient,
  onExportCSV,
  onExportJSON,
  onImportJSON,
  onResetData,
  patientCount,
  patients,
  onSelectPatient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter matching patients across name, DOB, and health card number
  const matchingPatients = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const preferred = patient.preferredName ? patient.preferredName.toLowerCase() : '';
      const dob = patient.dob.toLowerCase();
      const healthCard = patient.healthCardNumber.toLowerCase();
      const mrn = patient.mrn.toLowerCase();
      const phone = patient.phone.toLowerCase();

      return (
        fullName.includes(q) ||
        preferred.includes(q) ||
        dob.includes(q) ||
        healthCard.includes(q) ||
        mrn.includes(q) ||
        phone.includes(q)
      );
    });
  }, [patients, searchQuery]);

  // Global keyboard shortcut to focus search bar: Cmd+K / Ctrl+K or '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (patient: Patient) => {
    onSelectPatient(patient);
    setSearchQuery('');
    setIsOpen(false);
    searchInputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || matchingPatients.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % matchingPatients.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + matchingPatients.length) % matchingPatients.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = matchingPatients[selectedIndex];
      if (chosen) {
        handleSelect(chosen);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand & Core Navigation */}
          <div className="flex items-center gap-6 shrink-0">
            <button
              onClick={() => onNavigate('directory')}
              className="text-left group cursor-pointer focus:outline-none flex items-center gap-2"
            >
              <span className="w-7 h-7 rounded-md bg-red-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                +
              </span>
              <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:text-red-700 transition-colors">
                PraxisMD
              </span>
            </button>

            {/* Navigation links */}
            <nav className="hidden xl:flex items-center gap-5 text-sm font-medium">
              <button
                onClick={() => onNavigate('directory')}
                className={`py-1 text-left transition-colors cursor-pointer border-b-2 ${
                  activeView === 'directory'
                    ? 'text-red-700 border-red-700 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 border-transparent'
                }`}
              >
                Patient Registry
              </button>
              <button
                onClick={() => onNavigate('schedule')}
                className={`py-1 text-left transition-colors cursor-pointer border-b-2 ${
                  activeView === 'schedule'
                    ? 'text-red-700 border-red-700 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 border-transparent'
                }`}
              >
                Today&apos;s Clinic
              </button>
              <button
                onClick={() => onNavigate('calculators')}
                className={`py-1 text-left transition-colors cursor-pointer border-b-2 ${
                  activeView === 'calculators'
                    ? 'text-red-700 border-red-700 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 border-transparent'
                }`}
              >
                Clinical Calculators
              </button>
            </nav>
          </div>

          {/* Zone 2: Global Patient Search Bar */}
          <div className="flex-1 max-w-lg relative">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                  setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search patient by name, DOB (YYYY-MM-DD), health card #..."
                className="w-full pl-9 pr-16 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-300 rounded-md focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors placeholder:text-gray-400 text-gray-900"
              />

              <div className="absolute right-2.5 top-2 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white border border-gray-200 rounded">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>

            {/* Global Search Results Dropdown */}
            {isOpen && searchQuery.trim().length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50 divide-y divide-gray-100 animate-fade-in"
              >
                <div className="px-3 py-1.5 bg-gray-50 text-[11px] font-mono text-gray-500 flex items-center justify-between border-b border-gray-200">
                  <span>
                    {matchingPatients.length} matching {matchingPatients.length === 1 ? 'record' : 'records'}
                  </span>
                  <span>Use ↑↓ arrows to navigate, Enter to select</span>
                </div>

                {matchingPatients.length > 0 ? (
                  matchingPatients.map((patient, index) => {
                    const age = calculateAge(patient.dob);
                    const isSelected = index === selectedIndex;
                    const severeAllergy = patient.allergies.find(
                      (a) => a.severity === 'severe_anaphylaxis'
                    );

                    return (
                      <div
                        key={patient.id}
                        onMouseEnter={() => setSelectedIndex(index)}
                        onClick={() => handleSelect(patient)}
                        className={`p-3 cursor-pointer transition-colors flex items-start justify-between gap-3 text-xs ${
                          isSelected ? 'bg-red-50/80 text-red-950' : 'hover:bg-gray-50 text-gray-800'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              {patient.lastName}, {patient.firstName}
                              {patient.preferredName && (
                                <span className="font-normal text-gray-500 ml-1">
                                  &ldquo;{patient.preferredName}&rdquo;
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-[11px] text-gray-500">
                              [{patient.mrn}]
                            </span>
                            {patient.visitStatus === 'in_exam' && (
                              <span className="text-[10px] font-semibold text-red-800 bg-red-100/70 px-1.5 py-0.5 rounded">
                                In Exam
                              </span>
                            )}
                            {patient.visitStatus === 'waiting' && (
                              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                                Waiting
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-gray-500 font-mono">
                            <span>{age} yrs · <span className="capitalize">{patient.sex}</span></span>
                            <span aria-hidden="true">·</span>
                            <span>DOB: <strong className="text-gray-700">{patient.dob}</strong></span>
                            <span aria-hidden="true">·</span>
                            <span>HC: <strong className="text-gray-700">{patient.healthCardNumber}</strong></span>
                          </div>

                          {/* Quick Diagnosis / Allergy Indicator */}
                          <div className="flex items-center gap-2 text-[11px] pt-0.5">
                            {patient.activeProblems.length > 0 && (
                              <span className="text-gray-600 truncate max-w-xs">
                                {patient.activeProblems.slice(0, 2).map((p) => p.description).join(', ')}
                              </span>
                            )}
                            {severeAllergy && (
                              <span className="text-red-700 font-semibold flex items-center gap-0.5 shrink-0">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                {severeAllergy.allergen} Anaphylaxis
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center self-center text-gray-400 group-hover:text-red-700">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center space-y-2">
                    <p className="text-xs text-gray-500">
                      No patients matching &ldquo;{searchQuery}&rdquo; by name, DOB, or health card number.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onNewPatient();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-red-800 bg-red-50 hover:bg-red-100 rounded cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register As New Patient</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Zone 3: Primary Actions and Quick Utilities */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden lg:flex items-center gap-2 border-r border-gray-200 pr-3">
              <button
                onClick={onExportCSV}
                title="Export patient roster to CSV"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden xl:inline">CSV</span>
              </button>
              <button
                onClick={onExportJSON}
                title="Backup all records (JSON)"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden xl:inline">Backup</span>
              </button>
              <button
                onClick={onImportJSON}
                title="Import records from JSON file"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden xl:inline">Import</span>
              </button>
              <button
                onClick={onResetData}
                title="Reset database to verified sample patients"
                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="sr-only">Reset Sample Data</span>
              </button>
            </div>

            <button
              onClick={onNewPatient}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Patient Intake</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

