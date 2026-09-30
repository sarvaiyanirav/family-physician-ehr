import React, { useState, useMemo } from 'react';
import {
  TestTube,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileText,
  Search,
  Trash2,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Patient, LabResult } from '../types/clinical';

interface LabsManagementProps {
  patient: Patient;
  onUpdatePatient: (updated: Patient) => void;
}

// Preset laboratory panels for 1-click clinical parsing & entry
const SAMPLE_LAB_PANELS = [
  {
    name: 'Comprehensive Metabolic Panel (CMP)',
    category: 'Biochemistry',
    sampleText: `Glucose: 142 mg/dL (Ref: 70 - 99 mg/dL) [High]
BUN: 24 mg/dL (Ref: 7 - 20 mg/dL) [High]
Creatinine: 1.28 mg/dL (Ref: 0.60 - 1.10 mg/dL) [High]
eGFR: 52 mL/min/1.73m² (Ref: > 60 mL/min/1.73m²) [Low]
Sodium: 139 mEq/L (Ref: 135 - 145 mEq/L) [Normal]
Potassium: 4.9 mEq/L (Ref: 3.5 - 5.1 mEq/L) [Normal]
Chloride: 102 mEq/L (Ref: 98 - 107 mEq/L) [Normal]
Carbon Dioxide (CO2): 25 mEq/L (Ref: 22 - 29 mEq/L) [Normal]
Calcium: 9.4 mg/dL (Ref: 8.6 - 10.2 mg/dL) [Normal]
Total Protein: 7.1 g/dL (Ref: 6.4 - 8.3 g/dL) [Normal]
Albumin: 4.2 g/dL (Ref: 3.5 - 5.0 g/dL) [Normal]
Total Bilirubin: 0.8 mg/dL (Ref: 0.2 - 1.2 mg/dL) [Normal]
Alkaline Phosphatase: 74 U/L (Ref: 44 - 147 U/L) [Normal]
AST (SGOT): 28 U/L (Ref: 10 - 40 U/L) [Normal]
ALT (SGPT): 34 U/L (Ref: 7 - 56 U/L) [Normal]`,
  },
  {
    name: 'Complete Blood Count (CBC with Diff)',
    category: 'Hematology',
    sampleText: `WBC: 11.8 10*3/uL (Ref: 4.5 - 11.0 10*3/uL) [High]
RBC: 4.82 10*6/uL (Ref: 4.30 - 5.90 10*6/uL) [Normal]
Hemoglobin: 14.6 g/dL (Ref: 13.5 - 17.5 g/dL) [Normal]
Hematocrit: 43.8 % (Ref: 41.0 - 50.0 %) [Normal]
MCV: 90.8 fL (Ref: 80.0 - 100.0 fL) [Normal]
MCH: 30.2 pg (Ref: 27.0 - 33.0 pg) [Normal]
Platelets: 138 10*3/uL (Ref: 150 - 450 10*3/uL) [Low]
Neutrophils %: 68.2 % (Ref: 40.0 - 75.0 %) [Normal]
Lymphocytes %: 22.4 % (Ref: 20.0 - 45.0 %) [Normal]`,
  },
  {
    name: 'Lipid Panel',
    category: 'Lipids',
    sampleText: `Total Cholesterol: 228 mg/dL (Ref: < 200 mg/dL) [High]
Triglycerides: 198 mg/dL (Ref: < 150 mg/dL) [High]
HDL Cholesterol: 42 mg/dL (Ref: > 40 mg/dL) [Normal]
LDL Cholesterol (Calc): 146 mg/dL (Ref: < 100 mg/dL) [High]
Non-HDL Cholesterol: 186 mg/dL (Ref: < 130 mg/dL) [High]
Chol/HDL Ratio: 5.4 (Ref: < 5.0) [High]`,
  },
  {
    name: 'Diabetic & Renal Surveillance',
    category: 'Endocrine',
    sampleText: `Hemoglobin A1c: 7.6 % (Ref: < 5.7 %) [High]
Estimated Avg Glucose (eAG): 171 mg/dL (Ref: < 117 mg/dL) [High]
Urine Microalbumin: 68 mg/L (Ref: < 20 mg/L) [High]
Urine Creatinine: 120 mg/dL (Ref: 20 - 320 mg/dL) [Normal]
Urine Albumin/Creatinine Ratio (UACR): 56.7 mg/g (Ref: < 30.0 mg/g) [High]`,
  },
];

// Determine category based on test name
export function inferLabCategory(testName: string): string {
  const name = testName.toLowerCase();
  if (name.includes('cholesterol') || name.includes('triglyceride') || name.includes('hdl') || name.includes('ldl') || name.includes('lipid')) {
    return 'Lipids';
  }
  if (name.includes('hba1c') || name.includes('a1c') || name.includes('tsh') || name.includes('thyroid') || name.includes('t4') || name.includes('t3') || name.includes('cortisol') || name.includes('insulin')) {
    return 'Endocrine';
  }
  if (name.includes('wbc') || name.includes('rbc') || name.includes('hemoglobin') || name.includes('hematocrit') || name.includes('platelet') || name.includes('neutrophil') || name.includes('lymphocyte') || name.includes('mcv') || name.includes('mch')) {
    return 'Hematology';
  }
  if (name.includes('egfr') || name.includes('creatinine') || name.includes('bun') || name.includes('urea') || name.includes('urinalysis') || name.includes('microalbumin') || name.includes('uacr')) {
    return 'Renal / Urinalysis';
  }
  return 'Biochemistry';
}

// Calculate abnormal flag based on numeric value & reference range
export function calculateFlag(valueStr: string, rangeStr: string): 'normal' | 'high' | 'low' | 'critical' {
  const val = parseFloat(valueStr);
  if (isNaN(val)) return 'normal';

  // Check critical keywords or extreme deviations
  const lowerRange = rangeStr.toLowerCase();

  // Pattern: "< X" or "<= X"
  const lessThanMatch = rangeStr.match(/<\s*=?\s*([0-9.]+)/);
  if (lessThanMatch) {
    const max = parseFloat(lessThanMatch[1]);
    if (val > max * 1.7) return 'critical';
    if (val > max) return 'high';
    return 'normal';
  }

  // Pattern: "> X" or ">= X"
  const greaterThanMatch = rangeStr.match(/>\s*=?\s*([0-9.]+)/);
  if (greaterThanMatch) {
    const min = parseFloat(greaterThanMatch[1]);
    if (val < min * 0.5) return 'critical';
    if (val < min) return 'low';
    return 'normal';
  }

  // Pattern: "min - max" or "min to max"
  const rangeMatch = rangeStr.match(/([0-9.]+)\s*(?:-|to)\s*([0-9.]+)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);

    if (val < min * 0.6) return 'critical';
    if (val > max * 1.6) return 'critical';
    if (val < min) return 'low';
    if (val > max) return 'high';
    return 'normal';
  }

  return 'normal';
}

// Robust text parser for copy-pasted or HL7 structured lab lines
export function parseRawLabText(rawText: string, collectedDate: string): LabResult[] {
  const lines = rawText.split('\n');
  const results: LabResult[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#') || line.toLowerCase().startsWith('test name')) continue;

    // Pattern 1: Delimited by tabs or commas: "Name\tValue\tUnit\tReference Range"
    if (line.includes('\t') || (line.includes(',') && !line.includes('('))) {
      const parts = line.split(line.includes('\t') ? '\t' : ',').map((p) => p.trim());
      if (parts.length >= 2) {
        const testName = parts[0];
        const valWithUnit = parts[1];
        const valMatch = valWithUnit.match(/^([0-9.]+)\s*(.*)$/);
        const val = valMatch ? valMatch[1] : parts[1];
        const unit = valMatch && valMatch[2] ? valMatch[2] : parts[2] || '';
        const range = parts[3] || parts[2] || 'Standard';
        const flag = calculateFlag(val, range);

        results.push({
          id: `lab-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          testName,
          category: inferLabCategory(testName),
          value: val,
          unit,
          referenceRange: range,
          flag,
          collectedDate,
        });
        continue;
      }
    }

    // Pattern 2: "Test Name: Value Unit (Ref: min - max) [Flag]"
    // e.g.: "Glucose: 142 mg/dL (Ref: 70 - 99 mg/dL) [High]"
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const testName = line.substring(0, colonIndex).trim();
      const rest = line.substring(colonIndex + 1).trim();

      // Look for reference range inside parentheses: (Ref: ...) or (...)
      let range = '';
      const parenMatch = rest.match(/\((?:ref:?\s*)?([^)]+)\)/i);
      if (parenMatch) {
        range = parenMatch[1].trim();
      }

      // Look for explicit flag inside brackets or parentheses: [High], [Low], [Critical], [Normal]
      let explicitFlag: 'normal' | 'high' | 'low' | 'critical' | null = null;
      if (/\[\s*(?:high|h)\s*\]|\(\s*high\s*\)/i.test(line)) explicitFlag = 'high';
      else if (/\[\s*(?:low|l)\s*\]|\(\s*low\s*\)/i.test(line)) explicitFlag = 'low';
      else if (/\[\s*(?:critical|panic)\s*\]/i.test(line)) explicitFlag = 'critical';
      else if (/\[\s*normal\s*\]/i.test(line)) explicitFlag = 'normal';

      // Extract value and unit before parentheses
      const beforeParen = rest.split('(')[0].trim();
      const valueMatch = beforeParen.match(/^([><=]?\s*[0-9.]+)\s*(.*)$/);

      if (valueMatch) {
        const val = valueMatch[1].trim();
        const unit = valueMatch[2].replace(/[\[\]]/g, '').trim();
        const finalFlag = explicitFlag || calculateFlag(val, range);

        results.push({
          id: `lab-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          testName,
          category: inferLabCategory(testName),
          value: val,
          unit,
          referenceRange: range || 'Standard',
          flag: finalFlag,
          collectedDate,
        });
        continue;
      }
    }

    // Pattern 3: Space separated e.g. "Hemoglobin 14.2 g/dL 13.5-17.5"
    const spaceMatch = line.match(/^([A-Za-z0-9\s/()-]+?)\s+([0-9.]+)\s*([a-zA-Z/%*0-9^³²\-]+)?\s*(?:\(?([0-9.]+\s*[-to]\s*[0-9.]+|<[0-9.]+|>?[0-9.]+)\)?)?/);
    if (spaceMatch && spaceMatch[2]) {
      const testName = spaceMatch[1].trim();
      const val = spaceMatch[2].trim();
      const unit = spaceMatch[3] ? spaceMatch[3].trim() : '';
      const range = spaceMatch[4] ? spaceMatch[4].trim() : 'Standard';
      const flag = calculateFlag(val, range);

      results.push({
        id: `lab-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        testName,
        category: inferLabCategory(testName),
        value: val,
        unit,
        referenceRange: range,
        flag,
        collectedDate,
      });
    }
  }

  return results;
}

export const LabsManagement: React.FC<LabsManagementProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [showAbnormalOnly, setShowAbnormalOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Parser / Importer Modal States
  const [isParserOpen, setIsParserOpen] = useState(false);
  const [rawInputText, setRawInputText] = useState('');
  const [importDate, setImportDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [parsedPreview, setParsedPreview] = useState<LabResult[]>([]);

  // Single Manual Entry Form States
  const [isSingleAddOpen, setIsSingleAddOpen] = useState(false);
  const [singleName, setSingleName] = useState('');
  const [singleCategory, setSingleCategory] = useState('Biochemistry');
  const [singleValue, setSingleValue] = useState('');
  const [singleUnit, setSingleUnit] = useState('mg/dL');
  const [singleRange, setSingleRange] = useState('70 - 99');
  const [singleFlag, setSingleFlag] = useState<'normal' | 'high' | 'low' | 'critical'>('normal');

  // Trigger real-time parsing when raw text changes
  const handleRawTextChange = (text: string) => {
    setRawInputText(text);
    if (!text.trim()) {
      setParsedPreview([]);
      return;
    }
    const parsed = parseRawLabText(text, importDate);
    setParsedPreview(parsed);
  };

  const handleApplyPreset = (sampleText: string) => {
    setRawInputText(sampleText);
    const parsed = parseRawLabText(sampleText, importDate);
    setParsedPreview(parsed);
  };

  const handleCommitParsedLabs = () => {
    if (parsedPreview.length === 0) return;
    const updatedLabs = [...parsedPreview, ...patient.labResults];
    onUpdatePatient({
      ...patient,
      labResults: updatedLabs,
    });
    setIsParserOpen(false);
    setRawInputText('');
    setParsedPreview([]);
  };

  const handleAddSingleLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim() || !singleValue.trim()) return;

    const autoFlag = calculateFlag(singleValue, singleRange);
    const finalFlag = singleFlag !== 'normal' ? singleFlag : autoFlag;

    const newLab: LabResult = {
      id: `lab-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      testName: singleName.trim(),
      category: singleCategory,
      value: singleValue.trim(),
      unit: singleUnit.trim(),
      referenceRange: singleRange.trim(),
      flag: finalFlag,
      collectedDate: importDate,
    };

    onUpdatePatient({
      ...patient,
      labResults: [newLab, ...patient.labResults],
    });

    setIsSingleAddOpen(false);
    setSingleName('');
    setSingleValue('');
  };

  const handleDeleteLab = (labId: string) => {
    const updated = patient.labResults.filter((l) => l.id !== labId);
    onUpdatePatient({ ...patient, labResults: updated });
  };

  // Group and count stats
  const labStats = useMemo(() => {
    const total = patient.labResults.length;
    const abnormal = patient.labResults.filter(
      (l) => l.flag === 'high' || l.flag === 'low' || l.flag === 'critical'
    );
    const critical = patient.labResults.filter((l) => l.flag === 'critical');
    const categories = Array.from(
      new Set(patient.labResults.map((l) => l.category))
    );

    return { total, abnormalCount: abnormal.length, criticalCount: critical.length, categories };
  }, [patient.labResults]);

  // Filtered labs
  const filteredLabs = useMemo(() => {
    return patient.labResults.filter((lab) => {
      // Abnormal filter
      if (showAbnormalOnly && lab.flag === 'normal') return false;

      // Category filter
      if (activeCategoryFilter !== 'all' && lab.category !== activeCategoryFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          lab.testName.toLowerCase().includes(q) ||
          lab.category.toLowerCase().includes(q) ||
          lab.value.toLowerCase().includes(q) ||
          lab.collectedDate.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [patient.labResults, showAbnormalOnly, activeCategoryFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-50 text-red-700 rounded-md">
                <TestTube className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-gray-900">
                Diagnostic Laboratory Results & Structured Flowsheet
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Structured clinical biomarker records with automated reference range parsing and abnormal out-of-range flagging.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSingleAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-red-700" />
              <span>Manual Entry</span>
            </button>

            <button
              onClick={() => setIsParserOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-200" />
              <span>Parse & Import Report</span>
            </button>
          </div>
        </div>

        {/* Abnormal Findings Summary Warning Banner */}
        {labStats.abnormalCount > 0 && (
          <div className="mt-4 p-3 bg-amber-50/90 border border-amber-200 rounded-md flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-amber-900">
                  {labStats.abnormalCount} Abnormal Lab {labStats.abnormalCount === 1 ? 'Value' : 'Values'} Flagged
                  {labStats.criticalCount > 0 && ` (${labStats.criticalCount} Critical)`}
                </span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Values outside standard physiological reference bounds require clinical review or physician sign-off.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAbnormalOnly(!showAbnormalOnly)}
              className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded border border-amber-300 cursor-pointer shrink-0 transition-colors"
            >
              {showAbnormalOnly ? 'Show All Results' : 'Filter Abnormal Only'}
            </button>
          </div>
        )}
      </div>

      {/* PARSER / IMPORTER MODAL */}
      {isParserOpen && (
        <div className="bg-white border-2 border-red-600 rounded-lg p-5 shadow-lg space-y-4 text-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-700" />
              <h3 className="text-sm font-bold text-gray-900">
                Structured Lab Data Parser & Importer
              </h3>
            </div>
            <button
              onClick={() => setIsParserOpen(false)}
              className="text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-600 text-xs">
            Paste raw text from electronic laboratory reports (Quest, LabCorp, hospital discharge, HL7 or comma/tab-delimited records). The parser automatically extracts test names, numeric values, units, reference intervals, and tags high/low/critical alerts.
          </p>

          {/* Quick preset panel selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-gray-500 uppercase">
              Quick Panels:
            </span>
            {SAMPLE_LAB_PANELS.map((panel) => (
              <button
                key={panel.name}
                type="button"
                onClick={() => handleApplyPreset(panel.sampleText)}
                className="px-2.5 py-1 text-[11px] font-medium bg-gray-100 hover:bg-red-50 hover:text-red-800 border border-gray-200 rounded transition-colors cursor-pointer"
              >
                + {panel.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input Column */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-700">
                  Raw Laboratory Text Input
                </label>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span>Collected Date:</span>
                  <input
                    type="date"
                    value={importDate}
                    onChange={(e) => setImportDate(e.target.value)}
                    className="px-2 py-0.5 border border-gray-300 rounded text-gray-900"
                  />
                </div>
              </div>
              <textarea
                rows={9}
                value={rawInputText}
                onChange={(e) => handleRawTextChange(e.target.value)}
                placeholder={`Paste laboratory output here, for example:\nGlucose: 142 mg/dL (Ref: 70 - 99 mg/dL) [High]\neGFR: 52 mL/min (Ref: > 60 mL/min) [Low]\nPotassium: 4.8 mEq/L (Ref: 3.5 - 5.0 mEq/L)`}
                className="w-full p-2.5 font-mono text-xs border border-gray-300 rounded-md focus:outline-red-600 bg-gray-50"
              />
            </div>

            {/* Parsed Preview Column */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">
                  Parsed Live Preview ({parsedPreview.length} items extracted)
                </span>
                {parsedPreview.some((p) => p.flag !== 'normal') && (
                  <span className="text-amber-700 font-bold text-[11px]">
                    {parsedPreview.filter((p) => p.flag !== 'normal').length} Out-of-Range
                  </span>
                )}
              </div>

              <div className="border border-gray-200 rounded-md max-h-56 overflow-y-auto bg-white divide-y divide-gray-100">
                {parsedPreview.length > 0 ? (
                  parsedPreview.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 flex items-center justify-between text-[11px] font-mono hover:bg-gray-50"
                    >
                      <div>
                        <span className="font-bold text-gray-900 font-sans mr-2">
                          {item.testName}
                        </span>
                        <span className="text-gray-500 text-[10px] bg-gray-100 px-1.5 py-0.2 rounded mr-2">
                          {item.category}
                        </span>
                        <span className="text-gray-400">Ref: {item.referenceRange}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {item.value} {item.unit}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-sans uppercase ${
                            item.flag === 'high' || item.flag === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : item.flag === 'low'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.flag}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-400 italic">
                    Type or paste lab report lines on the left to see structured parsing in real time.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setIsParserOpen(false);
                setRawInputText('');
                setParsedPreview([]);
              }}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={parsedPreview.length === 0}
              onClick={handleCommitParsedLabs}
              className="px-4 py-1.5 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-semibold rounded cursor-pointer"
            >
              Commit & Save {parsedPreview.length} Lab Results
            </button>
          </div>
        </div>
      )}

      {/* SINGLE MANUAL ENTRY MODAL */}
      {isSingleAddOpen && (
        <form
          onSubmit={handleAddSingleLab}
          className="bg-white border-2 border-red-600 rounded-lg p-5 shadow-lg space-y-4 text-xs animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-900">
              Manual Laboratory Entry
            </h3>
            <button
              type="button"
              onClick={() => setIsSingleAddOpen(false)}
              className="text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Test Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Serum Potassium"
                value={singleName}
                onChange={(e) => {
                  setSingleName(e.target.value);
                  setSingleCategory(inferLabCategory(e.target.value));
                }}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-red-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Category</label>
              <select
                value={singleCategory}
                onChange={(e) => setSingleCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:outline-red-600"
              >
                <option value="Biochemistry">Biochemistry</option>
                <option value="Hematology">Hematology</option>
                <option value="Lipids">Lipids</option>
                <option value="Endocrine">Endocrine</option>
                <option value="Renal / Urinalysis">Renal / Urinalysis</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Immunology">Immunology</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Collected Date</label>
              <input
                type="date"
                required
                value={importDate}
                onChange={(e) => setImportDate(e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded focus:outline-red-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Numeric Result</label>
              <input
                type="text"
                required
                placeholder="e.g. 5.6"
                value={singleValue}
                onChange={(e) => {
                  setSingleValue(e.target.value);
                  const auto = calculateFlag(e.target.value, singleRange);
                  setSingleFlag(auto);
                }}
                className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded focus:outline-red-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Unit</label>
              <input
                type="text"
                required
                placeholder="e.g. mEq/L"
                value={singleUnit}
                onChange={(e) => setSingleUnit(e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded focus:outline-red-600"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Reference Range</label>
              <input
                type="text"
                required
                placeholder="e.g. 3.5 - 5.0"
                value={singleRange}
                onChange={(e) => {
                  setSingleRange(e.target.value);
                  const auto = calculateFlag(singleValue, e.target.value);
                  setSingleFlag(auto);
                }}
                className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded focus:outline-red-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Flag:</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded uppercase text-[11px] ${
                  singleFlag === 'high' || singleFlag === 'critical'
                    ? 'bg-rose-100 text-rose-800'
                    : singleFlag === 'low'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {singleFlag}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSingleAddOpen(false)}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-semibold rounded cursor-pointer"
              >
                Add Result
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-gray-200 rounded-lg text-xs">
        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeCategoryFilter === 'all'
                ? 'bg-red-700 text-white font-semibold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Panels ({patient.labResults.length})
          </button>

          {labStats.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === cat
                  ? 'bg-red-700 text-white font-semibold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Toggle Abnormal */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700 shrink-0">
            <input
              type="checkbox"
              checked={showAbnormalOnly}
              onChange={(e) => setShowAbnormalOnly(e.target.checked)}
              className="rounded text-red-700 focus:ring-red-600"
            />
            <span>Abnormal Only</span>
          </label>

          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search test name..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-xs focus:outline-red-600"
            />
          </div>
        </div>
      </div>

      {/* Main Structured Results Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Test Name</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold">Result Value</th>
                <th className="py-2.5 px-4 font-semibold">Flag / Status</th>
                <th className="py-2.5 px-4 font-semibold">Standard Reference Interval</th>
                <th className="py-2.5 px-4 font-semibold">Collection Date</th>
                <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {filteredLabs.length > 0 ? (
                filteredLabs.map((lab) => {
                  const isHigh = lab.flag === 'high' || lab.flag === 'critical';
                  const isLow = lab.flag === 'low';
                  const isCritical = lab.flag === 'critical';

                  return (
                    <tr
                      key={lab.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isCritical
                          ? 'bg-rose-50/50'
                          : isHigh
                          ? 'bg-rose-50/30'
                          : isLow
                          ? 'bg-amber-50/30'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 block font-sans">
                          {lab.testName}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {lab.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`text-sm font-bold ${
                            isCritical
                              ? 'text-rose-900 bg-rose-100 px-1.5 py-0.5 rounded'
                              : isHigh
                              ? 'text-rose-700'
                              : isLow
                              ? 'text-amber-700'
                              : 'text-gray-900'
                          }`}
                        >
                          {lab.value}{' '}
                          <span className="text-xs font-normal text-gray-500 font-sans">
                            {lab.unit}
                          </span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        {lab.flag === 'critical' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            CRITICAL HIGH
                          </span>
                        ) : lab.flag === 'high' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                            HIGH (↑)
                          </span>
                        ) : lab.flag === 'low' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <ArrowDownRight className="w-3.5 h-3.5 text-amber-600" />
                            LOW (↓)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            NORMAL
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-gray-600 text-xs">
                        {lab.referenceRange} {lab.unit}
                      </td>

                      <td className="py-3 px-4 font-mono text-gray-500 text-xs">
                        {lab.collectedDate}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteLab(lab.id)}
                          title="Remove lab entry"
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 italic">
                    {searchTerm
                      ? `No lab results match "${searchTerm}".`
                      : showAbnormalOnly
                      ? 'No abnormal lab results recorded for this patient.'
                      : 'No lab results recorded. Click "Parse & Import Report" to import electronic records.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <span>
            Displaying {filteredLabs.length} of {patient.labResults.length} total laboratory parameters
          </span>
          <span>Verified Clinical Data Entry</span>
        </div>
      </div>
    </div>
  );
};
