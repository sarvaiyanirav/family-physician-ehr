import { ClinicalTemplate } from '../types/clinical';

export const CLINICAL_TEMPLATES: ClinicalTemplate[] = [
  {
    id: 'tpl-htn-review',
    name: 'Hypertension Chronic Disease Review',
    category: 'Chronic Disease',
    encounterType: 'chronic_disease',
    defaultReason: 'Routine 3-month hypertension check-up and blood pressure monitoring.',
    defaultHpi: 'Patient presents for scheduled follow-up of essential hypertension. Reports taking anti-hypertensive regimen as directed without missing doses. Denies chest pain, palpitations, shortness of breath, orthopnea, headache, vision changes, or lower extremity edema. Home blood pressures have averaged 130-138 / 80-86 mmHg over the past month. Dietary sodium restriction and moderate physical activity discussed.',
    defaultRos: {
      Constitutional: 'Denies fever, chills, fatigue, or unprompted weight loss.',
      Cardiovascular: 'Denies chest tightness, exertional dyspnea, palpitations, or lightheadedness.',
      Neurological: 'Denies focal weakness, dizziness, syncope, or headaches.',
      Respiratory: 'Denies cough, wheezing, or nocturnal dyspnea.',
      Renal: 'Denies dysuria, hematuria, or nocturia.'
    },
    defaultPhysicalExam: {
      General: 'Alert, pleasant, in no acute cardiopulmonary distress. Well nourished.',
      Cardiovascular: 'Regular rate and rhythm (RRR). S1/S2 present, normal intensity. No murmurs, gallops, or friction rubs heard. Peripheral pulses 2+ symmetric bilaterally.',
      Respiratory: 'Clear to auscultation bilaterally (CTAB). No wheezes, rales, or rhonchi. Normal work of breathing.',
      Abdomen: 'Soft, non-tender, non-distended. Bowel sounds present x 4 quadrants. No palpable abdominal bruits.',
      Extremities: 'No cyanosis, clubbing, or peripheral pitting edema in bilateral lower extremities.'
    },
    defaultDiagnoses: [
      { code: 'I10', name: 'Essential (primary) hypertension', isPrimary: true }
    ],
    defaultPrescriptions: [
      {
        drug: 'Lisinopril',
        dose: '20 mg',
        route: 'Oral',
        frequency: 'Once daily in morning',
        dispenseQuantity: '90 tablets',
        refills: 3,
        instructions: 'Take 1 tablet daily by mouth with or without food. Monitor home BP weekly.'
      }
    ],
    defaultLabOrders: [
      'Comprehensive Metabolic Panel (CMP)',
      'Serum Creatinine & Estimated GFR',
      'Urine Microalbumin / Creatinine Ratio'
    ],
    defaultInstructions: 'Continue low-sodium DASH diet (< 2,300 mg sodium/day). Maintain aerobic exercise 150 min/week. Keep a home BP log 2-3 times weekly and bring to next visit. Return immediately or go to nearest ER if experiencing severe chest pain, sudden vision changes, severe headache, or shortness of breath.',
    defaultFollowUp: '3 months'
  },
  {
    id: 'tpl-t2dm-review',
    name: 'Type 2 Diabetes Mellitus Follow-up',
    category: 'Chronic Disease',
    encounterType: 'chronic_disease',
    defaultReason: 'Quarterly diabetic evaluation, glycemic review, and medication reconciliation.',
    defaultHpi: 'Patient attends regular quarterly diabetes care review. Reports adhering to prescribed oral/injectable hypoglycemic therapy. Denies overt hypoglycemia episodes (no diaphoresis, tremors, confusion). Fasting morning blood glucose readings typically 110-140 mg/dL. Reports satisfactory compliance with balanced carbohydrate meal planning. No polyuria, polydipsia, or blurred vision.',
    defaultRos: {
      Constitutional: 'No malaise, fevers, or unintentional weight fluctuations.',
      Endocrine: 'No cold/heat intolerance. Fasting readings stable.',
      Eyes: 'No acute changes in visual acuity, floaters, or scotomas.',
      Neurological: 'Denies burning dysesthesias, numbness, or tingling in feet or hands.',
      Integumentary: 'Denies non-healing skin sores, calluses, or ulcers.'
    },
    defaultPhysicalExam: {
      General: 'Comfortable, oriented x 3, well-groomed. Normal mood and affect.',
      Eyes: 'Pupils equal, round, reactive to light. Visual acuity intact.',
      Cardiovascular: 'Regular rhythm, crisp S1/S2, no murmurs.',
      Extremities: 'Feet warm with brisk capillary refill (< 2s). Dorsalis pedis and posterior tibial pulses 2+ bilaterally.',
      Neurological: 'Intact 10g Semmes-Weinstein monofilament sensation across 10 plantar points on both feet. No calluses or skin breakdown.'
    },
    defaultDiagnoses: [
      { code: 'E11.9', name: 'Type 2 diabetes mellitus without complications', isPrimary: true },
      { code: 'E78.5', name: 'Hyperlipidemia, unspecified', isPrimary: false }
    ],
    defaultPrescriptions: [
      {
        drug: 'Metformin Hydrochloride ER',
        dose: '1,000 mg',
        route: 'Oral',
        frequency: 'Twice daily with meals',
        dispenseQuantity: '180 tablets',
        refills: 3,
        instructions: 'Take with morning and evening meal to reduce gastrointestinal upset.'
      }
    ],
    defaultLabOrders: [
      'Hemoglobin A1c (HbA1c)',
      'Lipid Panel (Total, HDL, LDL, Triglycerides)',
      'Urine Microalbumin / Creatinine Ratio',
      'Comprehensive Metabolic Panel (CMP)'
    ],
    defaultInstructions: 'Aim for HbA1c < 7.0%. Continue daily foot self-inspections with mirror. Maintain regular carbohydrate control. Annual dilated eye exam scheduled. Contact clinic if blood glucose consistently > 250 mg/dL or < 70 mg/dL.',
    defaultFollowUp: '3 months'
  },
  {
    id: 'tpl-annual-physical',
    name: 'Annual Preventive Health Exam',
    category: 'Preventive Care',
    encounterType: 'routine_annual',
    defaultReason: 'Annual comprehensive preventive health and wellness examination.',
    defaultHpi: 'Patient presents for annual preventive health examination and wellness counseling. Generally feels well and reports good functional baseline. Diet is balanced with regular intake of fresh produce and whole grains. Sleep quality is restorative (approx 7 hours/night). No tobacco or illicit drug use. Reviews screening milestones appropriate for age.',
    defaultRos: {
      Constitutional: 'No fever, chills, night sweats, or unexpected weight changes.',
      HEENT: 'No hearing loss, vision changes, chronic sinus congestion, or sore throat.',
      Cardiovascular: 'No chest pain, palpitations, orthopnea, or ankle swelling.',
      Respiratory: 'No shortness of breath, chronic cough, or wheezing.',
      Gastrointestinal: 'No dysphagia, abdominal pain, reflux, melena, or bowel changes.',
      Musculoskeletal: 'No persistent joint stiffness, muscle aches, or functional limitations.',
      Psychiatric: 'PHQ-2 and GAD-2 screening negative. Good mood and interest in activities.'
    },
    defaultPhysicalExam: {
      General: 'Well-developed, well-nourished in no acute distress.',
      HEENT: 'Normocephalic, atraumatic. Sclerae anicteric. Oropharynx clear without erythema or exudate. Tympanic membranes intact bilaterally.',
      Neck: 'Supple, full range of motion. No lymphadenopathy. Thyroid normal size, smooth, no nodules. JVP normal.',
      Cardiovascular: 'RRR, normal S1 and S2, no murmur, gallop, or click.',
      Respiratory: 'Lungs clear to auscultation bilaterally in all fields. Normal respiratory effort.',
      Abdomen: 'Soft, flat, non-tender, non-distended. Normal active bowel sounds. No hepatosplenomegaly or masses.',
      Musculoskeletal: 'Normal gait, full active and passive ROM in all major joints.',
      Skin: 'Warm, dry, no suspicious pigmented lesions or rash.',
      Neurological: 'Cranial nerves II-XII grossly intact. Deep tendon reflexes 2+ symmetrical.'
    },
    defaultDiagnoses: [
      { code: 'Z00.00', name: 'Encounter for general adult medical examination without abnormal findings', isPrimary: true }
    ],
    defaultPrescriptions: [],
    defaultLabOrders: [
      'Complete Blood Count (CBC) w/ Differential',
      'Comprehensive Metabolic Panel (CMP)',
      'Lipid Panel (Total, HDL, LDL, Triglycerides)',
      'Thyroid Stimulating Hormone (TSH) w/ reflex FT4'
    ],
    defaultInstructions: 'Continue healthy lifestyle habits. Age-appropriate screening reviewed. Immunizations updated. Call if new or concerning symptoms arise before next annual check.',
    defaultFollowUp: '12 months'
  },
  {
    id: 'tpl-acute-uri',
    name: 'Acute Upper Respiratory Infection (URI)',
    category: 'Acute Illness',
    encounterType: 'acute_illness',
    defaultReason: 'Nasal congestion, sore throat, and mild cough for 4 days.',
    defaultHpi: 'Patient presents with 4-day history of scratchy throat, nasal congestion with clear to whitish rhinorrhea, and non-productive cough. Mild low-grade subjective fever on day 1 (not measured), resolved. Denies severe facial pain, dental pain, purulent sputum, hemoptysis, or shortness of breath. Has been taking over-the-counter acetaminophen with mild relief.',
    defaultRos: {
      Constitutional: 'Fatigue and mild malaise. No rigors or high fever.',
      HEENT: 'Mild bilateral ear fullness, nasal congestion. No severe earache or sinus pressure.',
      Respiratory: 'Intermittent dry cough. No wheeze, stridor, or chest tightness.'
    },
    defaultPhysicalExam: {
      General: 'Alert, oriented, speaking in full sentences without respiratory difficulty.',
      HEENT: 'Nasal mucosa erythematous with clear drainage. Pharynx mildly injected, no tonsillar enlargement or exudates. Uvula midline. TMs clear.',
      Neck: 'Mild anterior cervical lymph node tenderness, non-enlarged (< 1 cm), mobile.',
      Respiratory: 'Lungs clear to auscultation throughout. Good air movement bilaterally. No wheezes or crackles.'
    },
    defaultDiagnoses: [
      { code: 'J06.9', name: 'Acute upper respiratory infection, unspecified', isPrimary: true }
    ],
    defaultPrescriptions: [
      {
        drug: 'Benzonatate',
        dose: '100 mg',
        route: 'Oral',
        frequency: 'Three times daily as needed for cough',
        dispenseQuantity: '20 capsules',
        refills: 0,
        instructions: 'Swallow whole with water; do not chew or crush.'
      }
    ],
    defaultLabOrders: [
      'Rapid Strep Antigen Test'
    ],
    defaultInstructions: 'Presumed viral etiology; antibiotics are not indicated at this time. Hydrate generously (warm liquids), use saline nasal spray, honey/lozenges for throat comfort, and OTC acetaminophen/ibuprofen as needed. Seek urgent evaluation if developing high fevers > 102°F, shortness of breath, inability to swallow liquids, or symptoms worsening past day 10.',
    defaultFollowUp: 'PRN if no improvement in 7-10 days'
  },
  {
    id: 'tpl-low-back-pain',
    name: 'Mechanical Low Back Pain',
    category: 'Musculoskeletal',
    encounterType: 'acute_illness',
    defaultReason: 'Lower back ache and muscular stiffness following lifting 3 days ago.',
    defaultHpi: 'Patient reports onset of bilateral lumbo-sacral pain 3 days ago after bending and lifting heavy boxes. Pain is dull, aching, graded 5-6/10 on movement, relieved by resting flat with knees bent. Denies radiation below the knee, numbness or tingling in lower extremities, saddle anesthesia, bowel or bladder incontinence, fever, or history of malignancy.',
    defaultRos: {
      Musculoskeletal: 'Lumbosacral pain and stiffness. No joint redness or swelling elsewhere.',
      Neurological: 'Denies leg weakness, numbness, or foot drop.',
      Genitourinary: 'Normal urinary continence and sensation.'
    },
    defaultPhysicalExam: {
      Musculoskeletal: 'Tenderness to palpation over lumbar paraspinal musculature bilaterally (L2-L5). No midline vertebral step-off or focal bone tenderness. Flexion and extension mildly restricted by muscle spasms.',
      Neurological: 'Negative straight leg raise (SLR) bilaterally at 70 degrees. Patellar and Achilles reflexes 2+ symmetrical. Normal toe and heel walking. Normal bilateral foot dorsiflexion and plantarflexion strength (5/5).'
    },
    defaultDiagnoses: [
      { code: 'M54.5', name: 'Low back pain', isPrimary: true }
    ],
    defaultPrescriptions: [
      {
        drug: 'Cyclobenzaprine',
        dose: '5 mg',
        route: 'Oral',
        frequency: 'Once nightly at bedtime as needed for spasm',
        dispenseQuantity: '15 tablets',
        refills: 0,
        instructions: 'May cause drowsiness. Do not drive or operate machinery after taking.'
      }
    ],
    defaultLabOrders: [],
    defaultInstructions: 'Stay active as tolerated—avoid prolonged bed rest which delays recovery. Apply moist heat to lumbar muscles for 15-20 min several times daily. Gentle walking and hamstring/hip flexor stretches. Physical therapy referral initiated if not significantly improved in 2 weeks. Seek emergency care immediately if experiencing numbness in the groin/saddle area, weakness in the legs, or loss of bowel/bladder control (red flags for cauda equina).',
    defaultFollowUp: '2-3 weeks if pain persists'
  }
];
