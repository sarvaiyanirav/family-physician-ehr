import React from 'react';
import { UserPlus, Download, Upload, RotateCcw } from 'lucide-react';

interface HeaderProps {
  activeView: 'directory' | 'chart' | 'calculators' | 'schedule';
  onNavigate: (view: 'directory' | 'chart' | 'calculators' | 'schedule') => void;
  onNewPatient: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onResetData: () => void;
  patientCount: number;
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
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('directory')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                PraxisMD
              </span>
            </button>

            {/* Zone 2: Clean text navigation links with subtle active states */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button
                onClick={() => onNavigate('directory')}
                className={`py-1 text-left transition-colors cursor-pointer border-b-2 ${
                  activeView === 'directory'
                    ? 'text-teal-700 border-teal-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 border-transparent'
                }`}
              >
                Patient Registry
              </button>
              <button
                onClick={() => onNavigate('schedule')}
                className={`py-1 text-left transition-colors cursor-pointer border-b-2 ${
                  activeView === 'schedule'
                    ? 'text-teal-700 border-teal-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 border-transparent'
                }`}
              >
                Today&apos;s Clinic
              </button>
              <button
                onClick={() => onNavigate('calculators')}
                className={`py-1 text-left transition-colors cursor-pointer border-b-2 ${
                  activeView === 'calculators'
                    ? 'text-teal-700 border-teal-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 border-transparent'
                }`}
              >
                Clinical Calculators
              </button>
            </nav>
          </div>

          {/* Zone 3: Primary Actions and Quick Utilities */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 pr-3">
              <button
                onClick={onExportCSV}
                title="Export patient roster to CSV"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden lg:inline">CSV Roster</span>
              </button>
              <button
                onClick={onExportJSON}
                title="Backup all records (JSON)"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden lg:inline">JSON Backup</span>
              </button>
              <button
                onClick={onImportJSON}
                title="Import records from JSON file"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden lg:inline">Import</span>
              </button>
              <button
                onClick={onResetData}
                title="Reset database to verified sample patients"
                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="sr-only">Reset Sample Data</span>
              </button>
            </div>

            <button
              onClick={onNewPatient}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs transition-colors cursor-pointer whitespace-nowrap"
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
