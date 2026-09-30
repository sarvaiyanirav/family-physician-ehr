import React, { useState } from 'react';
import { Calculator, Heart, Activity, Scale, ShieldAlert } from 'lucide-react';
import { calculateCKDEpi, calculateASCVDScore, calculateBmi } from '../services/storageService';
import { Patient } from '../types/clinical';

interface ClinicalCalculatorsProps {
  initialPatient?: Patient;
}

export interface ChadsParams {
  chf: boolean;
  htn: boolean;
  age: number;
  diabetes: boolean;
  strokeHistory: boolean;
  vascularDisease: boolean;
  sex: 'male' | 'female';
}

export function calculateChads2Vasc(params: ChadsParams): number {
  let score = 0;
  if (params.chf) score += 1;
  if (params.htn) score += 1;
  if (params.age >= 75) score += 2;
  else if (params.age >= 65) score += 1;
  if (params.diabetes) score += 1;
  if (params.strokeHistory) score += 2;
  if (params.vascularDisease) score += 1;
  if (params.sex === 'female') score += 1;
  return score;
}

export function getCkdStage(gfr: number) {
  if (gfr >= 90) return { stage: 'Stage G1 (Normal / High)', desc: 'GFR ≥ 90 mL/min/1.73m²', color: 'text-emerald-700' };
  if (gfr >= 60) return { stage: 'Stage G2 (Mildly Decreased)', desc: 'GFR 60-89 mL/min/1.73m²', color: 'text-emerald-700' };
  if (gfr >= 45) return { stage: 'Stage G3a (Mild-to-Moderate)', desc: 'GFR 45-59 mL/min/1.73m²', color: 'text-amber-700' };
  if (gfr >= 30) return { stage: 'Stage G3b (Moderate-to-Severe)', desc: 'GFR 30-44 mL/min/1.73m²', color: 'text-amber-800' };
  if (gfr >= 15) return { stage: 'Stage G4 (Severely Decreased)', desc: 'GFR 15-29 mL/min/1.73m²', color: 'text-rose-700' };
  return { stage: 'Stage G5 (Kidney Failure)', desc: 'GFR < 15 mL/min/1.73m²', color: 'text-rose-800' };
}

export const ClinicalCalculators: React.FC<ClinicalCalculatorsProps> = ({ initialPatient }) => {
  const [activeTab, setActiveTab] = useState<'egfr' | 'ascvd' | 'bmi' | 'chads'>('ascvd');

  // eGFR State
  const [egfrAge, setEgfrAge] = useState<number>(initialPatient ? 65 : 62);
  const [egfrSex, setEgfrSex] = useState<'male' | 'female'>((initialPatient?.sex as any) || 'male');
  const [serumCreatinine, setSerumCreatinine] = useState<number>(
    Number(initialPatient?.labResults.find((l) => l.testName.toLowerCase().includes('creatinine'))?.value) || 1.15
  );

  // ASCVD State
  const [ascvdAge, setAscvdAge] = useState<number>(initialPatient ? 65 : 58);
  const [ascvdSex, setAscvdSex] = useState<'male' | 'female'>((initialPatient?.sex as any) || 'male');
  const [totalChol, setTotalChol] = useState<number>(
    Number(initialPatient?.labResults.find((l) => l.testName.toLowerCase().includes('total cholesterol'))?.value) || 195
  );
  const [hdlChol, setHdlChol] = useState<number>(
    Number(initialPatient?.labResults.find((l) => l.testName.toLowerCase().includes('hdl'))?.value) || 45
  );
  const [systolicBp, setSystolicBp] = useState<number>(
    initialPatient?.encounters[0]?.vitals.systolicBp || 135
  );
  const [onHtnMeds, setOnHtnMeds] = useState<boolean>(
    initialPatient?.medications.some((m) => m.indication.toLowerCase().includes('hypertension')) || true
  );
  const [isSmoker, setIsSmoker] = useState<boolean>(
    initialPatient?.socialHistory.smokingStatus === 'current'
  );
  const [isDiabetic, setIsDiabetic] = useState<boolean>(
    initialPatient?.activeProblems.some((p) => p.description.toLowerCase().includes('diabetes')) || false
  );

  // BMI State
  const [bmiWeightKg, setBmiWeightKg] = useState<number>(
    initialPatient?.encounters[0]?.vitals.weightKg || 82.0
  );
  const [bmiHeightCm, setBmiHeightCm] = useState<number>(
    initialPatient?.encounters[0]?.vitals.heightCm || 175
  );

  // CHA2DS2-VASc State
  const [chadsAge, setChadsAge] = useState<number>(initialPatient ? 68 : 70);
  const [chadsSex, setChadsSex] = useState<'male' | 'female'>((initialPatient?.sex as any) || 'female');
  const [chf, setChf] = useState(false);
  const [htn, setHtn] = useState(true);
  const [strokeHistory, setStrokeHistory] = useState(false);
  const [vascularDisease, setVascularDisease] = useState(false);
  const [diabetes, setDiabetes] = useState(false);

  // Calculations
  const calculatedEgfr = calculateCKDEpi(serumCreatinine, egfrAge, egfrSex);
  const ascvdResult = calculateASCVDScore({
    age: ascvdAge,
    sex: ascvdSex,
    totalChol,
    hdl: hdlChol,
    systolicBp,
    onHtnMeds,
    isSmoker,
    isDiabetic,
  });

  const bmiResult = calculateBmi(bmiWeightKg, bmiHeightCm);

  // CHADS2-VASc Calculation
  const chadsScore = calculateChads2Vasc({
    chf,
    htn,
    age: chadsAge,
    diabetes,
    strokeHistory,
    vascularDisease,
    sex: chadsSex,
  });

  const ckd = getCkdStage(calculatedEgfr);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Primary Care Clinical Decision Calculators
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Evidence-based cardiovascular, renal, and stroke risk stratification algorithms for family physicians.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg max-w-xl text-xs font-medium">
        <button
          onClick={() => setActiveTab('ascvd')}
          className={`flex-1 py-1.5 px-3 rounded-md transition-colors cursor-pointer text-center ${
            activeTab === 'ascvd' ? 'bg-white text-gray-900 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ASCVD 10-Yr Risk
        </button>
        <button
          onClick={() => setActiveTab('egfr')}
          className={`flex-1 py-1.5 px-3 rounded-md transition-colors cursor-pointer text-center ${
            activeTab === 'egfr' ? 'bg-white text-gray-900 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          eGFR (CKD-EPI)
        </button>
        <button
          onClick={() => setActiveTab('chads')}
          className={`flex-1 py-1.5 px-3 rounded-md transition-colors cursor-pointer text-center ${
            activeTab === 'chads' ? 'bg-white text-gray-900 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          CHA₂DS₂-VASc
        </button>
        <button
          onClick={() => setActiveTab('bmi')}
          className={`flex-1 py-1.5 px-3 rounded-md transition-colors cursor-pointer text-center ${
            activeTab === 'bmi' ? 'bg-white text-gray-900 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          BMI & Target Weight
        </button>
      </div>

      {/* TAB 1: ASCVD 10-YEAR RISK */}
      {activeTab === 'ascvd' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Heart className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-gray-900">
                AHA/ACC 10-Year ASCVD Risk Calculator
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={ascvdAge}
                  onChange={(e) => setAscvdAge(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Biological Sex</label>
                <select
                  value={ascvdSex}
                  onChange={(e) => setAscvdSex(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Total Cholesterol (mg/dL)</label>
                <input
                  type="number"
                  value={totalChol}
                  onChange={(e) => setTotalChol(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">HDL Cholesterol (mg/dL)</label>
                <input
                  type="number"
                  value={hdlChol}
                  onChange={(e) => setHdlChol(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Systolic Blood Pressure (mmHg)</label>
                <input
                  type="number"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded-md"
                />
              </div>

              <div className="space-y-2 pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onHtnMeds}
                    onChange={(e) => setOnHtnMeds(e.target.checked)}
                    className="rounded text-red-700 focus:ring-red-600"
                  />
                  <span>Treated for Hypertension</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSmoker}
                    onChange={(e) => setIsSmoker(e.target.checked)}
                    className="rounded text-red-700 focus:ring-red-600"
                  />
                  <span>Current Tobacco Smoker</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDiabetic}
                    onChange={(e) => setIsDiabetic(e.target.checked)}
                    className="rounded text-red-700 focus:ring-red-600"
                  />
                  <span>History of Diabetes</span>
                </label>
              </div>
            </div>
          </div>

          {/* Outcome Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                10-Year ASCVD Risk Score
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-mono text-gray-900">
                  {ascvdResult.scorePercent}%
                </span>
              </div>
              <div className={`text-xs font-bold mt-1 ${ascvdResult.color}`}>
                {ascvdResult.riskCategory}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-2 leading-relaxed">
                <p className="font-semibold text-gray-800">Primary Care Clinical Guidance:</p>
                {ascvdResult.scorePercent >= 20 && (
                  <p>
                    High Risk: High-intensity statin therapy strongly recommended (e.g. Atorvastatin 40-80mg or Rosuvastatin 20-40mg). Target LDL reduction ≥ 50%.
                  </p>
                )}
                {ascvdResult.scorePercent >= 7.5 && ascvdResult.scorePercent < 20 && (
                  <p>
                    Intermediate Risk: Moderate-intensity statin therapy recommended after clinician-patient risk discussion. Consider CAC score if decision is borderline.
                  </p>
                )}
                {ascvdResult.scorePercent >= 5.0 && ascvdResult.scorePercent < 7.5 && (
                  <p>
                    Borderline Risk: Emphasize lifestyle counseling (DASH diet, physical activity, weight management). Re-evaluate in 12 months.
                  </p>
                )}
                {ascvdResult.scorePercent < 5.0 && (
                  <p>
                    Low Risk: Lifestyle modifications and primary prevention counseling. Statin therapy not routinely indicated unless familial hypercholesterolemia.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: eGFR */}
      {activeTab === 'egfr' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Activity className="w-4 h-4 text-red-700" />
              <h2 className="text-sm font-bold text-gray-900">
                2021 CKD-EPI Creatinine Equation (eGFR)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Serum Creatinine (mg/dL)</label>
                <input
                  type="number"
                  step="0.01"
                  value={serumCreatinine}
                  onChange={(e) => setSerumCreatinine(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={egfrAge}
                  onChange={(e) => setEgfrAge(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Biological Sex</label>
                <select
                  value={egfrSex}
                  onChange={(e) => setEgfrSex(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Estimated GFR
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-mono text-gray-900">
                  {calculatedEgfr}
                </span>
                <span className="text-xs text-gray-500 font-mono">mL/min/1.73m²</span>
              </div>
              <div className={`text-xs font-bold mt-1 ${ckd.color}`}>
                {ckd.stage}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-1.5">
                <p className="font-semibold text-gray-800">Primary Care Follow-up:</p>
                {calculatedEgfr < 30 ? (
                  <p className="text-rose-700">
                    Nephrology referral advised. Review renally-cleared medications (Metformin, DOACs, ACEi/ARB titration).
                  </p>
                ) : calculatedEgfr < 60 ? (
                  <p>
                    Check urine microalbumin-to-creatinine ratio annually. Control BP &lt; 130/80 mmHg. Avoid NSAIDs.
                  </p>
                ) : (
                  <p>Preserved renal filtration. Continue regular routine monitoring.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHA2DS2-VASc */}
      {activeTab === 'chads' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-gray-900">
                CHA₂DS₂-VASc Stroke Risk Score (in Atrial Fibrillation)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chf}
                  onChange={(e) => setChf(e.target.checked)}
                  className="rounded text-red-700"
                />
                <span>Congestive Heart Failure / LV dysfunction (+1)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={htn}
                  onChange={(e) => setHtn(e.target.checked)}
                  className="rounded text-red-700"
                />
                <span>Hypertension (BP &gt; 140/90 or treated) (+1)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={diabetes}
                  onChange={(e) => setDiabetes(e.target.checked)}
                  className="rounded text-red-700"
                />
                <span>Diabetes Mellitus (+1)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={strokeHistory}
                  onChange={(e) => setStrokeHistory(e.target.checked)}
                  className="rounded text-red-700"
                />
                <span>Prior Stroke, TIA, or Thromboembolism (+2)</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vascularDisease}
                  onChange={(e) => setVascularDisease(e.target.checked)}
                  className="rounded text-red-700"
                />
                <span>Vascular Disease (Prior MI, PAD, Aortic plaque) (+1)</span>
              </label>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1">Age</label>
                  <input
                    type="number"
                    value={chadsAge}
                    onChange={(e) => setChadsAge(Number(e.target.value))}
                    className="w-full px-2 py-1 font-mono border border-gray-300 rounded"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-1">Sex</label>
                  <select
                    value={chadsSex}
                    onChange={(e) => setChadsSex(e.target.value as any)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  >
                    <option value="male">Male (0)</option>
                    <option value="female">Female (+1)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                CHA₂DS₂-VASc Score
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-mono text-gray-900">
                  {chadsScore}
                </span>
                <span className="text-xs text-gray-500">Points</span>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600 space-y-2">
                <p className="font-semibold text-gray-800">Anticoagulation Guideline:</p>
                {chadsScore >= 2 ? (
                  <p className="text-rose-700 font-medium">
                    Oral Anticoagulation (DOAC e.g. Apixaban, Rivaroxaban) is strongly recommended in non-valvular AF unless contraindicated.
                  </p>
                ) : chadsScore === 1 ? (
                  <p className="text-amber-800">
                    Intermediate risk: Oral anticoagulation should be considered based on shared decision making.
                  </p>
                ) : (
                  <p className="text-emerald-700">
                    Low risk: No antithrombotic therapy required.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BMI */}
      {activeTab === 'bmi' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Scale className="w-4 h-4 text-red-700" />
              <h2 className="text-sm font-bold text-gray-900">
                BMI & Ideal Body Weight Calculator
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={bmiHeightCm}
                  onChange={(e) => setBmiHeightCm(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bmiWeightKg}
                  onChange={(e) => setBmiWeightKg(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 font-mono border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col justify-between">
            {bmiResult && (
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Calculated BMI
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold font-mono text-gray-900">
                    {bmiResult.bmi}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">kg/m²</span>
                </div>
                <div className={`text-xs font-bold mt-1 ${bmiResult.color}`}>
                  {bmiResult.label}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
                  <p>
                    Healthy weight range for {bmiHeightCm} cm: <br />
                    <span className="font-mono font-semibold text-gray-900">
                      {Math.round(18.5 * (bmiHeightCm / 100) ** 2)} kg – {Math.round(24.9 * (bmiHeightCm / 100) ** 2)} kg
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
