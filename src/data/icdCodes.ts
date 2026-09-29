export interface ICDCodeItem {
  code: string;
  name: string;
  category: string;
}

export const COMMON_PRIMARY_CARE_ICD10: ICDCodeItem[] = [
  // Cardiovascular
  { code: 'I10', name: 'Essential (primary) hypertension', category: 'Cardiovascular' },
  { code: 'E78.5', name: 'Hyperlipidemia, unspecified', category: 'Cardiovascular' },
  { code: 'I25.10', name: 'Atherosclerotic heart disease', category: 'Cardiovascular' },
  { code: 'I48.91', name: 'Unspecified atrial fibrillation', category: 'Cardiovascular' },
  { code: 'I50.9', name: 'Heart failure, unspecified', category: 'Cardiovascular' },

  // Endocrine & Metabolic
  { code: 'E11.9', name: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
  { code: 'E11.65', name: 'Type 2 diabetes mellitus with hyperglycemia', category: 'Endocrine' },
  { code: 'E03.9', name: 'Hypothyroidism, unspecified', category: 'Endocrine' },
  { code: 'E66.9', name: 'Obesity, unspecified', category: 'Endocrine' },
  { code: 'E66.01', name: 'Morbid (severe) obesity due to excess calories', category: 'Endocrine' },
  { code: 'E55.9', name: 'Vitamin D deficiency, unspecified', category: 'Endocrine' },

  // Respiratory
  { code: 'J06.9', name: 'Acute upper respiratory infection, unspecified', category: 'Respiratory' },
  { code: 'J20.9', name: 'Acute bronchitis, unspecified', category: 'Respiratory' },
  { code: 'J45.909', name: 'Unspecified asthma, uncomplicated', category: 'Respiratory' },
  { code: 'J44.9', name: 'Chronic obstructive pulmonary disease, unspecified', category: 'Respiratory' },
  { code: 'J01.90', name: 'Acute sinusitis, unspecified', category: 'Respiratory' },
  { code: 'J02.9', name: 'Acute pharyngitis, unspecified', category: 'Respiratory' },
  { code: 'J30.9', name: 'Allergic rhinitis, unspecified', category: 'Respiratory' },

  // Musculoskeletal
  { code: 'M54.5', name: 'Low back pain', category: 'Musculoskeletal' },
  { code: 'M19.90', name: 'Primary osteoarthritis, unspecified site', category: 'Musculoskeletal' },
  { code: 'M17.11', name: 'Unilateral primary osteoarthritis, right knee', category: 'Musculoskeletal' },
  { code: 'M54.2', name: 'Cervicalgia (Neck pain)', category: 'Musculoskeletal' },
  { code: 'M79.3', name: 'Panniculitis, unspecified (soft tissue pain)', category: 'Musculoskeletal' },
  { code: 'M75.10', name: 'Rotator cuff tear or rupture', category: 'Musculoskeletal' },

  // Gastrointestinal
  { code: 'K21.9', name: 'Gastro-esophageal reflux disease without esophagitis', category: 'Gastrointestinal' },
  { code: 'K58.9', name: 'Irritable bowel syndrome without diarrhea', category: 'Gastrointestinal' },
  { code: 'K59.00', name: 'Constipation, unspecified', category: 'Gastrointestinal' },
  { code: 'K29.70', name: 'Gastritis, unspecified, without bleeding', category: 'Gastrointestinal' },

  // Mental Health & Neurological
  { code: 'F32.9', name: 'Major depressive disorder, single episode, unspecified', category: 'Mental Health' },
  { code: 'F41.1', name: 'Generalized anxiety disorder', category: 'Mental Health' },
  { code: 'F41.9', name: 'Anxiety disorder, unspecified', category: 'Mental Health' },
  { code: 'G43.909', name: 'Migraine, unspecified, not intractable', category: 'Neurological' },
  { code: 'G47.00', name: 'Insomnia, unspecified', category: 'Neurological' },

  // Renal & Genitourinary
  { code: 'N39.0', name: 'Urinary tract infection, site not specified', category: 'Genitourinary' },
  { code: 'N18.3', name: 'Chronic kidney disease, stage 3 (moderate)', category: 'Renal' },
  { code: 'N40.0', name: 'Benign prostatic hyperplasia without lower urinary tract symptoms', category: 'Genitourinary' },

  // Dermatology
  { code: 'L20.9', name: 'Atopic dermatitis, unspecified (Eczema)', category: 'Dermatology' },
  { code: 'L30.9', name: 'Dermatitis, unspecified', category: 'Dermatology' },
  { code: 'L40.9', name: 'Psoriasis, unspecified', category: 'Dermatology' },

  // Preventive & Routine
  { code: 'Z00.00', name: 'Encounter for general adult medical examination without abnormal findings', category: 'Preventive' },
  { code: 'Z00.01', name: 'Encounter for general adult medical examination with abnormal findings', category: 'Preventive' },
  { code: 'Z00.129', name: 'Encounter for routine child health check without abnormal findings', category: 'Preventive' },
  { code: 'Z23', name: 'Encounter for immunization', category: 'Preventive' }
];

export const COMMON_LAB_ORDERS = [
  'Complete Blood Count (CBC) w/ Differential',
  'Comprehensive Metabolic Panel (CMP)',
  'Lipid Panel (Total, HDL, LDL, Triglycerides)',
  'Hemoglobin A1c (HbA1c)',
  'Thyroid Stimulating Hormone (TSH) w/ reflex FT4',
  'Serum Creatinine & Estimated GFR',
  'Urine Microalbumin / Creatinine Ratio',
  'Urinalysis Complete w/ Microscopy',
  'Vitamin D 25-Hydroxy',
  'Vitamin B12 & Folate',
  'Serum Ferritin & Iron Binding Capacity',
  'C-Reactive Protein (High Sensitivity hs-CRP)',
  'Prothrombin Time / INR',
  'Liver Function Tests (ALT, AST, ALP, Bilirubin)',
  'Rapid Strep Antigen Test',
  'SARS-CoV-2 / Influenza A+B Rapid PCR'
];

export const COMMON_IMAGING_ORDERS = [
  'Chest X-Ray (PA & Lateral)',
  'Lumbar Spine X-Ray (AP & Lateral)',
  'Knee X-Ray (AP & Lateral Weight-bearing)',
  'Abdominal Ultrasound (Complete)',
  'Renal & Bladder Ultrasound',
  'Echocardiogram (Transthoracic 2D/Doppler)',
  'DEXA Bone Mineral Density Scan',
  'Screening Mammography (Bilateral 3D Tomosynthesis)'
];

export const COMMON_SPECIALTY_REFERRALS = [
  'Cardiology',
  'Endocrinology & Metabolism',
  'Gastroenterology',
  'Orthopedic Surgery',
  'Neurology',
  'Dermatology',
  'Pulmonology',
  'Psychiatry & Behavioral Health',
  'Physical Therapy (Physiotherapy)',
  'Dietitian / Certified Diabetes Educator',
  'Ophthalmology (Diabetic Retinal Exam)',
  'Podiatry'
];
