import { Patient } from '../types/clinical';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-001',
    mrn: 'PRX-48102',
    firstName: 'Arthur',
    lastName: 'Pendelton',
    preferredName: 'Art',
    dob: '1958-03-14',
    sex: 'male',
    genderIdentity: 'Cisgender male',
    phone: '(555) 234-8901',
    email: 'arthur.pendelton@example.com',
    address: {
      street: '742 Evergreen Ridge Way',
      city: 'Portland',
      state: 'OR',
      zip: '97201'
    },
    emergencyContact: {
      name: 'Margaret Pendelton',
      relationship: 'Spouse',
      phone: '(555) 234-8902'
    },
    healthCardNumber: 'HC-992019-OR',
    primaryLanguage: 'English',
    needsInterpreter: false,
    codeStatus: 'Full Code',
    primaryPhysician: 'Dr. Sarah Lin, MD',
    clinicLocation: 'Cascade Family Health Centre',
    allergies: [
      {
        id: 'alg-001',
        allergen: 'Sulfa Drugs (Sulfamethoxazole)',
        type: 'drug',
        reaction: 'Generalized maculopapular rash, pruritus',
        severity: 'moderate',
        identifiedDate: '2015-08-12'
      }
    ],
    activeProblems: [
      {
        id: 'prb-001',
        icdCode: 'I10',
        description: 'Essential (primary) hypertension',
        status: 'active',
        onsetDate: '2012-05-10',
        notes: 'Well controlled with ACEi + CCB combination.'
      },
      {
        id: 'prb-002',
        icdCode: 'E11.9',
        description: 'Type 2 diabetes mellitus without complications',
        status: 'active',
        onsetDate: '2016-11-20',
        notes: 'Target HbA1c < 7.0%. Monitored quarterly.'
      },
      {
        id: 'prb-003',
        icdCode: 'M17.11',
        description: 'Unilateral primary osteoarthritis, right knee',
        status: 'active',
        onsetDate: '2019-04-18',
        notes: 'Mild-moderate joint space narrowing.'
      },
      {
        id: 'prb-004',
        icdCode: 'E78.5',
        description: 'Hyperlipidemia, unspecified',
        status: 'active',
        onsetDate: '2014-02-15'
      }
    ],
    pastMedicalHistory: [
      { id: 'pmh-1', condition: 'Essential Hypertension', diagnosedYear: '2012' },
      { id: 'pmh-2', condition: 'Type 2 Diabetes Mellitus', diagnosedYear: '2016' },
      { id: 'pmh-3', condition: 'Dyslipidemia', diagnosedYear: '2014' }
    ],
    pastSurgicalHistory: [
      { id: 'psh-1', procedure: 'Laparoscopic Cholecystectomy', year: '2008', hospitalOrSurgeon: 'St. Vincent Hospital' },
      { id: 'psh-2', procedure: 'Right Inguinal Hernia Repair', year: '2017', hospitalOrSurgeon: 'Providence Medical' }
    ],
    medications: [
      {
        id: 'med-001',
        name: 'Lisinopril',
        dosage: '20 mg',
        route: 'Oral',
        frequency: 'Once daily in morning',
        indication: 'Hypertension',
        prescribedDate: '2021-01-15',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active',
        adherenceNotes: 'Good compliance, takes with breakfast.'
      },
      {
        id: 'med-002',
        name: 'Amlodipine Besylate',
        dosage: '5 mg',
        route: 'Oral',
        frequency: 'Once daily',
        indication: 'Hypertension',
        prescribedDate: '2022-06-10',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active'
      },
      {
        id: 'med-003',
        name: 'Metformin Hydrochloride ER',
        dosage: '1,000 mg',
        route: 'Oral',
        frequency: 'Twice daily with meals',
        indication: 'Type 2 Diabetes',
        prescribedDate: '2018-03-22',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active',
        adherenceNotes: 'Tolerates well, no GI distress.'
      },
      {
        id: 'med-004',
        name: 'Atorvastatin Calcium',
        dosage: '20 mg',
        route: 'Oral',
        frequency: 'Once daily at bedtime',
        indication: 'Hyperlipidemia / Primary CVD prevention',
        prescribedDate: '2019-09-05',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active'
      },
      {
        id: 'med-005',
        name: 'Acetaminophen (Tylenol Arthritis)',
        dosage: '650 mg',
        route: 'Oral',
        frequency: 'Every 8 hours PRN knee pain',
        indication: 'Right knee osteoarthritis',
        prescribedDate: '2023-02-14',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active'
      }
    ],
    socialHistory: {
      smokingStatus: 'former',
      smokingPacksPerDay: 0.5,
      smokingYears: 15,
      alcoholUse: 'occasional',
      alcoholDrinksPerWeek: 2,
      recreationalDrugs: 'None',
      occupation: 'Retired High School History Teacher',
      livingArrangement: 'Lives in single-story home with spouse of 41 years',
      exerciseRoutine: 'Walks neighborhood 30 minutes, 4 days/week',
      dietaryHabits: 'Heart-healthy DASH diet, moderates dietary carbohydrates and sweets'
    },
    familyHistory: [
      {
        id: 'fh-1',
        relation: 'Father',
        conditions: ['Myocardial infarction at age 62', 'Hypertension'],
        ageAtOnsetOrDeath: 'Deceased at 71 (Heart Failure)'
      },
      {
        id: 'fh-2',
        relation: 'Mother',
        conditions: ['Type 2 Diabetes', 'Osteoporosis'],
        ageAtOnsetOrDeath: 'Deceased at 84 (Stroke)'
      },
      {
        id: 'fh-3',
        relation: 'Older Brother',
        conditions: ['Coronary Artery Disease (Stented at 59)'],
        ageAtOnsetOrDeath: 'Alive, age 73'
      }
    ],
    immunizations: [
      { id: 'imm-1', vaccineName: 'Influenza (Quadrivalent high-dose)', dateAdministered: '2025-10-15', status: 'completed' },
      { id: 'imm-2', vaccineName: 'COVID-19 Updated Booster', dateAdministered: '2025-10-15', status: 'completed' },
      { id: 'imm-3', vaccineName: 'Pneumococcal PCV20 (Prevnar 20)', dateAdministered: '2023-11-04', status: 'completed' },
      { id: 'imm-4', vaccineName: 'Recombinant Zoster (Shingrix Dose 2)', dateAdministered: '2022-05-18', status: 'completed' },
      { id: 'imm-5', vaccineName: 'Tdap (Tetanus, Diphtheria, Pertussis)', dateAdministered: '2019-07-22', status: 'completed' }
    ],
    preventiveScreenings: [
      {
        id: 'scr-1',
        screeningType: 'Colorectal Cancer',
        lastCompletedDate: '2023-04-12',
        dueDate: '2033-04-12',
        status: 'up_to_date',
        resultSummary: 'Colonoscopy: 1 benign hyperplastic polyp removed in sigmoid. Normal mucosa.'
      },
      {
        id: 'scr-2',
        screeningType: 'Diabetic Eye Exam',
        lastCompletedDate: '2025-05-14',
        dueDate: '2026-05-14',
        status: 'up_to_date',
        resultSummary: 'Dilated fundus exam: No diabetic retinopathy, clear media.'
      },
      {
        id: 'scr-3',
        screeningType: 'Diabetic Foot Exam',
        lastCompletedDate: '2025-12-10',
        dueDate: '2026-12-10',
        status: 'up_to_date',
        resultSummary: 'Normal 10g monofilament sensation, 2+ DP/PT pulses, no skin fissures.'
      },
      {
        id: 'scr-4',
        screeningType: 'Lipid Panel',
        lastCompletedDate: '2026-01-20',
        dueDate: '2027-01-20',
        status: 'up_to_date',
        resultSummary: 'LDL 78 mg/dL (on statin therapy), HDL 48 mg/dL.'
      }
    ],
    encounters: [
      {
        id: 'enc-001',
        patientId: 'pat-001',
        date: '2026-01-20T10:30:00Z',
        provider: 'Dr. Sarah Lin, MD',
        type: 'chronic_disease',
        reasonForVisit: 'Quarterly chronic disease monitoring (T2DM, HTN).',
        vitals: {
          systolicBp: 132,
          diastolicBp: 82,
          heartRate: 72,
          respiratoryRate: 16,
          temperatureC: 36.8,
          oxygenSaturation: 98,
          heightCm: 178,
          weightKg: 87.5,
          bmi: 27.6,
          painScore: 2
        },
        chiefComplaint: 'Routine 3-month review of blood pressure and diabetes management.',
        hpi: 'Arthur presents for regular follow-up. Blood pressures at home run between 128-136 systolic. Blood glucose logs range 115-140 mg/dL fasting. Reports mild right knee soreness after walking more than 40 minutes, managed with occasional Tylenol. Denies orthostatic lightheadedness, chest pain, SOB, or polyuria.',
        reviewOfSystems: {
          Constitutional: 'No fever, chills, or night sweats.',
          Cardiovascular: 'Denies chest tightness, exertional dyspnea, palpitations.',
          Endocrine: 'No severe hypoglycemia episodes reported.',
          Musculoskeletal: 'Mild right knee joint stiffness on cold mornings.'
        },
        physicalExam: {
          General: 'Well-appearing, alert, oriented x 4, sitting comfortably.',
          Cardiovascular: 'RRR, S1/S2 distinct. No murmurs or carotid bruits.',
          Respiratory: 'CTAB, clear throughout, normal respiratory excursions.',
          Abdomen: 'Soft, non-tender, active bowel sounds. No organomegaly.',
          Extremities: 'Right knee without acute effusion or erythema. Crepitus on passive flexion. No ankle edema.'
        },
        assessment: {
          primaryDiagnosis: { code: 'E11.9', name: 'Type 2 diabetes mellitus without complications', isPrimary: true },
          secondaryDiagnoses: [
            { code: 'I10', name: 'Essential (primary) hypertension', isPrimary: false },
            { code: 'M17.11', name: 'Unilateral primary osteoarthritis, right knee', isPrimary: false }
          ],
          clinicalSummary: 'Chronic medical conditions in stable control. BP 132/82 mmHg today. Fasting glycemia satisfactory.'
        },
        plan: {
          prescriptions: [
            {
              id: 'rx-1',
              drug: 'Lisinopril',
              dose: '20 mg',
              route: 'Oral',
              frequency: 'Once daily',
              dispenseQuantity: '90 tablets',
              refills: 3,
              instructions: 'Continue daily.'
            },
            {
              id: 'rx-2',
              drug: 'Metformin Hydrochloride ER',
              dose: '1,000 mg',
              route: 'Oral',
              frequency: 'Twice daily with meals',
              dispenseQuantity: '180 tablets',
              refills: 3,
              instructions: 'Take with breakfast and dinner.'
            }
          ],
          labOrders: ['Hemoglobin A1c (HbA1c)', 'Comprehensive Metabolic Panel (CMP)', 'Urine Microalbumin / Creatinine Ratio'],
          imagingOrders: [],
          referrals: ['Ophthalmology (Annual Diabetic Retinal Check)'],
          patientInstructions: 'Maintain low-sodium DASH diet. Continue regular walking. Scheduled annual dilated eye exam.',
          followUpIn: '3 months',
          warningSigns: ['Sudden weakness or numbness', 'Chest pain or pressure', 'Blood sugar < 70 or > 300 mg/dL']
        },
        status: 'signed',
        signedAt: '2026-01-20T11:15:00Z',
        billingCode: '99214'
      }
    ],
    labResults: [
      {
        id: 'lab-1',
        testName: 'Hemoglobin A1c',
        category: 'Endocrine',
        value: '7.1',
        unit: '%',
        referenceRange: '< 5.7 (Target < 7.0)',
        flag: 'high',
        collectedDate: '2026-01-20'
      },
      {
        id: 'lab-2',
        testName: 'Estimated GFR (CKD-EPI)',
        category: 'Renal / Urinalysis',
        value: '74',
        unit: 'mL/min/1.73m²',
        referenceRange: '> 60',
        flag: 'normal',
        collectedDate: '2026-01-20'
      },
      {
        id: 'lab-3',
        testName: 'Serum Creatinine',
        category: 'Renal / Urinalysis',
        value: '1.08',
        unit: 'mg/dL',
        referenceRange: '0.70 - 1.30',
        flag: 'normal',
        collectedDate: '2026-01-20'
      },
      {
        id: 'lab-4',
        testName: 'Urine Microalbumin/Creatinine',
        category: 'Renal / Urinalysis',
        value: '22',
        unit: 'mg/g',
        referenceRange: '< 30',
        flag: 'normal',
        collectedDate: '2026-01-20'
      },
      {
        id: 'lab-5',
        testName: 'Total Cholesterol',
        category: 'Lipids',
        value: '158',
        unit: 'mg/dL',
        referenceRange: '< 200',
        flag: 'normal',
        collectedDate: '2026-01-20'
      },
      {
        id: 'lab-6',
        testName: 'LDL Cholesterol',
        category: 'Lipids',
        value: '78',
        unit: 'mg/dL',
        referenceRange: '< 100',
        flag: 'normal',
        collectedDate: '2026-01-20'
      },
      {
        id: 'lab-7',
        testName: 'HDL Cholesterol',
        category: 'Lipids',
        value: '48',
        unit: 'mg/dL',
        referenceRange: '> 40',
        flag: 'normal',
        collectedDate: '2026-01-20'
      },
      {
        id: 'lab-8',
        testName: 'Serum Potassium',
        category: 'Biochemistry',
        value: '4.4',
        unit: 'mmol/L',
        referenceRange: '3.5 - 5.1',
        flag: 'normal',
        collectedDate: '2026-01-20'
      }
    ],
    clinicalAlerts: ['Sulfa allergy', 'Target HbA1c < 7.0%'],
    visitStatus: 'scheduled_today',
    scheduledTime: '09:15 AM',
    triagePriority: 'routine',
    triageNote: 'Regular quarterly chronic disease follow-up (T2DM, HTN)',
    createdAt: '2020-04-10T08:00:00Z',
    updatedAt: '2026-01-20T11:15:00Z'
  },
  {
    id: 'pat-002',
    mrn: 'PRX-51980',
    firstName: 'Elena',
    lastName: 'Rostova',
    preferredName: 'Elena',
    dob: '1984-07-22',
    sex: 'female',
    genderIdentity: 'Cisgender female',
    phone: '(555) 872-3419',
    email: 'elena.rostova@example.com',
    address: {
      street: '1240 Oakwood Lane, Apt 4B',
      city: 'Portland',
      state: 'OR',
      zip: '97205'
    },
    emergencyContact: {
      name: 'Dmitri Rostov',
      relationship: 'Brother',
      phone: '(555) 872-3420'
    },
    healthCardNumber: 'HC-881920-OR',
    primaryLanguage: 'English',
    needsInterpreter: false,
    codeStatus: 'Full Code',
    primaryPhysician: 'Dr. Sarah Lin, MD',
    clinicLocation: 'Cascade Family Health Centre',
    allergies: [
      {
        id: 'alg-002',
        allergen: 'Penicillin / Amoxicillin',
        type: 'drug',
        reaction: 'Severe anaphylaxis: Laryngeal edema, acute urticaria, hypotension (required IM epinephrine in ED)',
        severity: 'severe_anaphylaxis',
        identifiedDate: '2011-09-03'
      },
      {
        id: 'alg-003',
        allergen: 'Tree Nuts (Walnuts, Hazelnuts)',
        type: 'food',
        reaction: 'Oral itching, lip angioedema',
        severity: 'moderate',
        identifiedDate: '2017-04-11'
      }
    ],
    activeProblems: [
      {
        id: 'prb-005',
        icdCode: 'G43.909',
        description: 'Migraine, unspecified, not intractable',
        status: 'active',
        onsetDate: '2015-02-10',
        notes: 'Averages 2-3 episodes per month, triggered by sleep deprivation and stress.'
      },
      {
        id: 'prb-006',
        icdCode: 'J45.909',
        description: 'Unspecified asthma, uncomplicated',
        status: 'active',
        onsetDate: '2004-06-15',
        notes: 'Mild intermittent. Well-controlled with PRN Albuterol.'
      },
      {
        id: 'prb-007',
        icdCode: 'F41.1',
        description: 'Generalized anxiety disorder',
        status: 'active',
        onsetDate: '2021-08-30',
        notes: 'In active cognitive behavioral therapy (CBT).'
      }
    ],
    pastMedicalHistory: [
      { id: 'pmh-4', condition: 'Bronchial Asthma (Childhood onset)', diagnosedYear: '2004' },
      { id: 'pmh-5', condition: 'Migraines without aura', diagnosedYear: '2015' }
    ],
    pastSurgicalHistory: [
      { id: 'psh-3', procedure: 'Tonsillectomy', year: '1996' }
    ],
    medications: [
      {
        id: 'med-006',
        name: 'Albuterol HFA Inhaler (ProAir)',
        dosage: '90 mcg/puff',
        route: 'Inhalation',
        frequency: '1-2 puffs q4-6h PRN wheezing or dyspnea',
        indication: 'Asthma rescue',
        prescribedDate: '2024-03-12',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active'
      },
      {
        id: 'med-007',
        name: 'Sumatriptan (Imitrex)',
        dosage: '50 mg',
        route: 'Oral',
        frequency: '1 tablet at migraine onset, repeat in 2h if needed (Max 200mg/24h)',
        indication: 'Acute Migraine abortive',
        prescribedDate: '2023-10-18',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active'
      },
      {
        id: 'med-008',
        name: 'Sertraline (Zoloft)',
        dosage: '50 mg',
        route: 'Oral',
        frequency: 'Once daily in morning',
        indication: 'Generalized anxiety disorder',
        prescribedDate: '2024-01-15',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active'
      }
    ],
    socialHistory: {
      smokingStatus: 'never',
      alcoholUse: 'occasional',
      alcoholDrinksPerWeek: 1,
      recreationalDrugs: 'None',
      occupation: 'Graphic Designer & Creative Director',
      livingArrangement: 'Lives alone in apartment',
      exerciseRoutine: 'Vinyasa yoga 3x weekly, cycling on weekends',
      dietaryHabits: 'Vegetarian, strictly avoids tree nuts'
    },
    familyHistory: [
      {
        id: 'fh-4',
        relation: 'Mother',
        conditions: ['Migraines', 'Hypothyroidism'],
        ageAtOnsetOrDeath: 'Alive, age 68'
      },
      {
        id: 'fh-5',
        relation: 'Maternal Aunt',
        conditions: ['Breast Cancer at age 52'],
        ageAtOnsetOrDeath: 'Deceased at 58'
      }
    ],
    immunizations: [
      { id: 'imm-6', vaccineName: 'Influenza (Quadrivalent)', dateAdministered: '2025-11-02', status: 'completed' },
      { id: 'imm-7', vaccineName: 'COVID-19 Booster', dateAdministered: '2025-11-02', status: 'completed' },
      { id: 'imm-8', vaccineName: 'Tdap Booster', dateAdministered: '2020-03-14', status: 'completed' }
    ],
    preventiveScreenings: [
      {
        id: 'scr-5',
        screeningType: 'Cervical Pap Smear',
        lastCompletedDate: '2024-09-18',
        dueDate: '2027-09-18',
        status: 'up_to_date',
        resultSummary: 'Cytology: Negative for intraepithelial lesion or malignancy. High-risk HPV negative.'
      },
      {
        id: 'scr-6',
        screeningType: 'Mammogram',
        dueDate: '2026-07-22',
        status: 'due_soon',
        resultSummary: 'Baseline screening recommended at age 40 due to maternal aunt breast cancer history.'
      }
    ],
    encounters: [],
    labResults: [
      {
        id: 'lab-9',
        testName: 'Complete Blood Count (WBC)',
        category: 'Hematology',
        value: '6.4',
        unit: 'x10³/µL',
        referenceRange: '4.5 - 11.0',
        flag: 'normal',
        collectedDate: '2025-06-12'
      },
      {
        id: 'lab-10',
        testName: 'Hemoglobin',
        category: 'Hematology',
        value: '13.8',
        unit: 'g/dL',
        referenceRange: '12.0 - 16.0',
        flag: 'normal',
        collectedDate: '2025-06-12'
      },
      {
        id: 'lab-11',
        testName: 'TSH',
        category: 'Endocrine',
        value: '1.92',
        unit: 'µIU/mL',
        referenceRange: '0.45 - 4.50',
        flag: 'normal',
        collectedDate: '2025-06-12'
      }
    ],
    clinicalAlerts: ['PENICILLIN ANAPHYLAXIS', 'Severe Tree Nut Allergy', 'Screening Mammogram Due'],
    visitStatus: 'in_exam',
    scheduledTime: '09:45 AM',
    triagePriority: 'urgent',
    triageNote: 'Acute severe migraine flare with photophobia and nausea',
    createdAt: '2021-02-14T09:00:00Z',
    updatedAt: '2025-11-02T10:00:00Z'
  },
  {
    id: 'pat-003',
    mrn: 'PRX-60914',
    firstName: 'Marcus',
    lastName: 'Vance',
    dob: '1995-11-08',
    sex: 'male',
    genderIdentity: 'Cisgender male',
    phone: '(555) 441-9023',
    email: 'marcus.vance@example.com',
    address: {
      street: '418 SW 5th Avenue',
      city: 'Portland',
      state: 'OR',
      zip: '97204'
    },
    emergencyContact: {
      name: 'Chloe Vance',
      relationship: 'Spouse',
      phone: '(555) 441-9025'
    },
    healthCardNumber: 'HC-771029-OR',
    primaryLanguage: 'English',
    needsInterpreter: false,
    codeStatus: 'Full Code',
    primaryPhysician: 'Dr. Sarah Lin, MD',
    clinicLocation: 'Cascade Family Health Centre',
    allergies: [],
    activeProblems: [
      {
        id: 'prb-008',
        icdCode: 'J06.9',
        description: 'Acute upper respiratory infection, unspecified',
        status: 'active',
        onsetDate: '2026-09-25',
        notes: 'Chief complaint today.'
      }
    ],
    pastMedicalHistory: [],
    pastSurgicalHistory: [
      { id: 'psh-4', procedure: 'Wisdom Teeth Extraction', year: '2016' }
    ],
    medications: [],
    socialHistory: {
      smokingStatus: 'never',
      alcoholUse: 'occasional',
      alcoholDrinksPerWeek: 3,
      recreationalDrugs: 'None',
      occupation: 'Software Engineer',
      livingArrangement: 'Lives with spouse',
      exerciseRoutine: 'Running 5k 3x/week, gym weight training',
      dietaryHabits: 'Balanced Mediterranean-style diet'
    },
    familyHistory: [
      {
        id: 'fh-6',
        relation: 'Father',
        conditions: ['Hypertension at age 55'],
        ageAtOnsetOrDeath: 'Alive, age 61'
      }
    ],
    immunizations: [
      { id: 'imm-9', vaccineName: 'Influenza', dateAdministered: '2025-10-10', status: 'completed' },
      { id: 'imm-10', vaccineName: 'Tdap', dateAdministered: '2021-05-19', status: 'completed' }
    ],
    preventiveScreenings: [],
    encounters: [],
    labResults: [],
    clinicalAlerts: ['No Known Drug Allergies (NKDA)'],
    visitStatus: 'waiting',
    scheduledTime: '10:00 AM',
    triagePriority: 'emergency',
    triageNote: 'Acute substernal chest pressure, diaphoresis, and hypertensive urgency (BP 178/104)',
    createdAt: '2023-08-11T14:00:00Z',
    updatedAt: '2026-09-29T08:00:00Z'
  },
  {
    id: 'pat-004',
    mrn: 'PRX-32091',
    firstName: 'Clara',
    lastName: 'Simmons',
    dob: '1949-05-19',
    sex: 'female',
    genderIdentity: 'Cisgender female',
    phone: '(555) 712-4099',
    email: 'clara.simmons@example.com',
    address: {
      street: '883 Rose Garden Terrace',
      city: 'Portland',
      state: 'OR',
      zip: '97210'
    },
    emergencyContact: {
      name: 'Thomas Simmons',
      relationship: 'Adult Son (Healthcare Proxy)',
      phone: '(555) 712-4098'
    },
    healthCardNumber: 'HC-440192-OR',
    primaryLanguage: 'English',
    needsInterpreter: false,
    codeStatus: 'DNR',
    primaryPhysician: 'Dr. Sarah Lin, MD',
    clinicLocation: 'Cascade Family Health Centre',
    allergies: [
      {
        id: 'alg-004',
        allergen: 'Codeine',
        type: 'drug',
        reaction: 'Severe nausea, dizziness, vomiting, confusion',
        severity: 'moderate',
        identifiedDate: '2010-03-19'
      }
    ],
    activeProblems: [
      {
        id: 'prb-009',
        icdCode: 'I48.91',
        description: 'Unspecified atrial fibrillation',
        status: 'active',
        onsetDate: '2018-01-22',
        notes: 'Rate controlled on beta blocker. Anticoagulated with Eliquis (Apixaban).'
      },
      {
        id: 'prb-010',
        icdCode: 'M81.0',
        description: 'Age-related osteoporosis without current pathological fracture',
        status: 'active',
        onsetDate: '2017-09-14',
        notes: 'DEXA T-score -2.8 lumbar spine.'
      },
      {
        id: 'prb-011',
        icdCode: 'I10',
        description: 'Essential (primary) hypertension',
        status: 'active',
        onsetDate: '2008-11-04'
      }
    ],
    pastMedicalHistory: [
      { id: 'pmh-6', condition: 'Atrial Fibrillation (Paroxysmal to persistent)', diagnosedYear: '2018' },
      { id: 'pmh-7', condition: 'Osteoporosis', diagnosedYear: '2017' },
      { id: 'pmh-8', condition: 'Essential Hypertension', diagnosedYear: '2008' }
    ],
    pastSurgicalHistory: [
      { id: 'psh-5', procedure: 'Left Total Hip Arthroplasty', year: '2019', hospitalOrSurgeon: 'OHSU Orthopedics' },
      { id: 'psh-6', procedure: 'Cataract extraction bilateral', year: '2021' }
    ],
    medications: [
      {
        id: 'med-009',
        name: 'Apixaban (Eliquis)',
        dosage: '5 mg',
        route: 'Oral',
        frequency: 'Twice daily',
        indication: 'Stroke prevention in Atrial Fibrillation',
        prescribedDate: '2020-02-14',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active',
        adherenceNotes: 'Strict adherence, blister packaged.'
      },
      {
        id: 'med-010',
        name: 'Metoprolol Tartrate',
        dosage: '25 mg',
        route: 'Oral',
        frequency: 'Twice daily with meals',
        indication: 'Ventricular rate control in Atrial Fibrillation',
        prescribedDate: '2018-01-25',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active'
      },
      {
        id: 'med-011',
        name: 'Alendronate Sodium',
        dosage: '70 mg',
        route: 'Oral',
        frequency: 'Once weekly on Sunday mornings',
        indication: 'Osteoporosis',
        prescribedDate: '2021-04-10',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active',
        adherenceNotes: 'Takes with full glass of water, sits upright 30 mins.'
      },
      {
        id: 'med-012',
        name: 'Calcium Carbonate + Vitamin D3',
        dosage: '600 mg / 400 IU',
        route: 'Oral',
        frequency: 'Twice daily with food',
        indication: 'Bone density support',
        prescribedDate: '2017-09-20',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active'
      }
    ],
    socialHistory: {
      smokingStatus: 'never',
      alcoholUse: 'none',
      recreationalDrugs: 'None',
      occupation: 'Retired Librarian',
      livingArrangement: 'Lives in assisted living facility (assisted medication management)',
      exerciseRoutine: 'Chair yoga, gentle walking in garden with walker',
      dietaryHabits: 'Nutritious balanced meals provided by residence dining'
    },
    familyHistory: [
      {
        id: 'fh-7',
        relation: 'Mother',
        conditions: ['Hip fracture at age 79', 'Dementia'],
        ageAtOnsetOrDeath: 'Deceased at 82'
      }
    ],
    immunizations: [
      { id: 'imm-11', vaccineName: 'Influenza High-Dose', dateAdministered: '2025-09-30', status: 'completed' },
      { id: 'imm-12', vaccineName: 'RSV Vaccine (Arexvy)', dateAdministered: '2024-10-12', status: 'completed' },
      { id: 'imm-13', vaccineName: 'Pneumococcal PCV20', dateAdministered: '2023-10-05', status: 'completed' }
    ],
    preventiveScreenings: [
      {
        id: 'scr-7',
        screeningType: 'Bone Density (DEXA)',
        lastCompletedDate: '2024-11-15',
        dueDate: '2026-11-15',
        status: 'up_to_date',
        resultSummary: 'Lumbar spine T-score -2.6, Femoral neck T-score -2.4. Stable compared to 2022.'
      }
    ],
    encounters: [],
    labResults: [
      {
        id: 'lab-12',
        testName: 'Serum Creatinine',
        category: 'Renal / Urinalysis',
        value: '1.14',
        unit: 'mg/dL',
        referenceRange: '0.50 - 1.10',
        flag: 'high',
        collectedDate: '2025-11-10'
      },
      {
        id: 'lab-13',
        testName: 'Estimated GFR (CKD-EPI)',
        category: 'Renal / Urinalysis',
        value: '48',
        unit: 'mL/min/1.73m²',
        referenceRange: '> 60',
        flag: 'low',
        collectedDate: '2025-11-10'
      },
      {
        id: 'lab-14',
        testName: 'Serum Calcium',
        category: 'Biochemistry',
        value: '9.3',
        unit: 'mg/dL',
        referenceRange: '8.6 - 10.2',
        flag: 'normal',
        collectedDate: '2025-11-10'
      }
    ],
    clinicalAlerts: ['HIGH FALL RISK', 'ANTICOAGULANT (ELIQUIS)', 'DNR CODE STATUS'],
    visitStatus: 'completed',
    scheduledTime: '08:30 AM',
    triagePriority: 'urgent',
    triageNote: 'Elderly fall with head contusion on direct oral anticoagulant (Eliquis)',
    createdAt: '2018-01-20T11:00:00Z',
    updatedAt: '2026-09-29T09:00:00Z'
  },
  {
    id: 'pat-005',
    mrn: 'PRX-78210',
    firstName: 'Liam',
    lastName: 'Davis',
    dob: '2017-09-12',
    sex: 'male',
    genderIdentity: 'Boy',
    phone: '(555) 902-6134',
    email: 'rachel.davis@example.com',
    address: {
      street: '312 Maple Leaf Court',
      city: 'Beaverton',
      state: 'OR',
      zip: '97005'
    },
    emergencyContact: {
      name: 'Rachel Davis',
      relationship: 'Mother (Legal Guardian)',
      phone: '(555) 902-6134'
    },
    healthCardNumber: 'HC-662910-OR',
    primaryLanguage: 'English',
    needsInterpreter: false,
    codeStatus: 'Full Code',
    primaryPhysician: 'Dr. Sarah Lin, MD',
    clinicLocation: 'Cascade Family Health Centre',
    allergies: [
      {
        id: 'alg-005',
        allergen: 'Peanuts',
        type: 'food',
        reaction: 'Anaphylaxis (Hives, facial angioedema, stridor, bronchospasm)',
        severity: 'severe_anaphylaxis',
        identifiedDate: '2020-04-18'
      }
    ],
    activeProblems: [
      {
        id: 'prb-012',
        icdCode: 'L20.9',
        description: 'Atopic dermatitis, unspecified (Eczema)',
        status: 'active',
        onsetDate: '2018-05-10',
        notes: 'In antecubital and popliteal fossae.'
      }
    ],
    pastMedicalHistory: [
      { id: 'pmh-9', condition: 'Severe Peanut Allergy', diagnosedYear: '2020' },
      { id: 'pmh-10', condition: 'Mild Infantile Eczema', diagnosedYear: '2018' }
    ],
    pastSurgicalHistory: [],
    medications: [
      {
        id: 'med-013',
        name: 'EpiPen Jr (Epinephrine Auto-Injector)',
        dosage: '0.15 mg',
        route: 'Intramuscular',
        frequency: 'Inject immediately into anterolateral thigh for accidental peanut exposure / anaphylaxis',
        indication: 'Peanut anaphylaxis emergency rescue',
        prescribedDate: '2025-08-20',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active',
        adherenceNotes: 'Mother keeps 2 pens in school nurse office, 2 pens at home.'
      },
      {
        id: 'med-014',
        name: 'Hydrocortisone 1% Cream',
        dosage: 'Topical thin layer',
        route: 'Topical',
        frequency: 'Twice daily PRN eczema flares',
        indication: 'Atopic dermatitis',
        prescribedDate: '2024-02-11',
        prescribedBy: 'Dr. Sarah Lin, MD',
        status: 'active'
      }
    ],
    socialHistory: {
      smokingStatus: 'never',
      alcoholUse: 'none',
      recreationalDrugs: 'None',
      occupation: '3rd Grade Elementary Student',
      livingArrangement: 'Lives with parents and younger sister',
      exerciseRoutine: 'Youth soccer league, active play',
      dietaryHabits: 'Nut-free home and school lunch program'
    },
    familyHistory: [
      {
        id: 'fh-8',
        relation: 'Mother',
        conditions: ['Allergic Rhinitis', 'Eczema'],
        ageAtOnsetOrDeath: 'Alive, age 37'
      }
    ],
    immunizations: [
      { id: 'imm-14', vaccineName: 'DTaP #5', dateAdministered: '2022-09-15', status: 'completed' },
      { id: 'imm-15', vaccineName: 'MMR #2', dateAdministered: '2022-09-15', status: 'completed' },
      { id: 'imm-16', vaccineName: 'Varicella #2', dateAdministered: '2022-09-15', status: 'completed' },
      { id: 'imm-17', vaccineName: 'Influenza pediatric', dateAdministered: '2025-10-18', status: 'completed' }
    ],
    preventiveScreenings: [],
    encounters: [
      {
        id: 'enc-liam-8',
        patientId: 'pat-005',
        date: '2025-10-18T11:00:00Z',
        provider: 'Dr. Sarah Lin, MD',
        type: 'well_child',
        reasonForVisit: '8-Year Well-Child Examination & school clearance.',
        vitals: {
          systolicBp: 102,
          diastolicBp: 64,
          heartRate: 84,
          respiratoryRate: 20,
          temperatureC: 36.7,
          oxygenSaturation: 99,
          heightCm: 131,
          weightKg: 29.5,
          bmi: 17.2,
          painScore: 0
        },
        chiefComplaint: '8-year pediatric preventive health checkup.',
        hpi: 'Liam attends 3rd grade. Active in youth soccer. No asthma symptoms. Peanut avoidance strictly observed.',
        reviewOfSystems: {
          Constitutional: 'Good appetite, sleeping 10 hours nightly.',
          Respiratory: 'No cough, wheezing, or exertional shortness of breath.',
          Dermatologic: 'Mild eczema patches on antecubital folds, well managed with moisturizer.'
        },
        physicalExam: {
          General: 'Alert, interactive, pleasant 8-year-old boy in no distress.',
          Cardiovascular: 'Regular rate and rhythm, no murmurs.',
          Respiratory: 'Clear breath sounds bilaterally, no wheezes or rales.',
          Abdomen: 'Soft, non-tender, no hepatosplenomegaly.',
          Extremities: 'Normal range of motion and pediatric gait.'
        },
        assessment: {
          primaryDiagnosis: { code: 'Z00.129', name: 'Encounter for routine child health examination without abnormal findings', isPrimary: true },
          secondaryDiagnoses: [
            { code: 'Z91.010', name: 'Allergy to peanuts', isPrimary: false },
            { code: 'L20.9', name: 'Atopic dermatitis, unspecified', isPrimary: false }
          ],
          clinicalSummary: 'Normal development and growth along 55th percentile for stature and weight. Updated school epinephrine auto-injector action plan.'
        },
        plan: {
          prescriptions: [],
          labOrders: [],
          imagingOrders: [],
          referrals: [],
          patientInstructions: 'Continue strict peanut avoidance. Signed school sports physical form.',
          followUpIn: '1 year (9-year well-child visit)',
          warningSigns: ['Fever > 38.5°C', 'Difficulty breathing or wheezing', 'Persistent vomiting']
        },
        status: 'signed',
        signedAt: '2025-10-18T11:45:00Z',
        billingCode: '99393'
      },
      {
        id: 'enc-liam-7',
        patientId: 'pat-005',
        date: '2024-09-25T14:00:00Z',
        provider: 'Dr. Sarah Lin, MD',
        type: 'well_child',
        reasonForVisit: '7-Year Well-Child Examination.',
        vitals: {
          systolicBp: 100,
          diastolicBp: 62,
          heartRate: 86,
          respiratoryRate: 20,
          temperatureC: 36.6,
          oxygenSaturation: 99,
          heightCm: 125,
          weightKg: 26.1,
          bmi: 16.7,
          painScore: 0
        },
        chiefComplaint: '7-year well-child checkup.',
        hpi: 'Healthy 7-year-old boy with normal school progress and physical activity.',
        physicalExam: {
          General: 'Well nourished, playful, good eye contact.'
        },
        assessment: {
          primaryDiagnosis: { code: 'Z00.129', name: 'Routine child health examination', isPrimary: true },
          secondaryDiagnoses: [],
          clinicalSummary: 'Normal growth and development.'
        },
        plan: {
          prescriptions: [],
          labOrders: [],
          imagingOrders: [],
          referrals: [],
          patientInstructions: 'Encourage 60 mins daily physical play. Dental checkup every 6 months.',
          followUpIn: '1 year',
          warningSigns: ['Fever > 38.5°C', 'Difficulty breathing or wheezing', 'Persistent vomiting']
        },
        status: 'signed',
        billingCode: '99393'
      },
      {
        id: 'enc-liam-6',
        patientId: 'pat-005',
        date: '2023-09-19T09:30:00Z',
        provider: 'Dr. Sarah Lin, MD',
        type: 'well_child',
        reasonForVisit: '6-Year Well-Child Examination.',
        vitals: {
          systolicBp: 98,
          diastolicBp: 60,
          heartRate: 88,
          respiratoryRate: 22,
          temperatureC: 36.8,
          oxygenSaturation: 99,
          heightCm: 118,
          weightKg: 22.8,
          bmi: 16.4,
          painScore: 0
        },
        chiefComplaint: '6-year well-child checkup and school readiness.',
        hpi: 'Starting 1st grade. Immunizations complete.',
        physicalExam: {
          General: 'Active, healthy 6-year-old.'
        },
        assessment: {
          primaryDiagnosis: { code: 'Z00.129', name: 'Routine child health examination', isPrimary: true },
          secondaryDiagnoses: [],
          clinicalSummary: 'Growth tracking along 50-60th percentile.'
        },
        plan: {
          prescriptions: [],
          labOrders: [],
          imagingOrders: [],
          referrals: [],
          patientInstructions: 'Bicycle helmet safety counseling.',
          followUpIn: '1 year',
          warningSigns: ['Fever > 38.5°C', 'Difficulty breathing or wheezing', 'Persistent vomiting']
        },
        status: 'signed',
        billingCode: '99393'
      },
      {
        id: 'enc-liam-5',
        patientId: 'pat-005',
        date: '2022-09-22T10:15:00Z',
        provider: 'Dr. Sarah Lin, MD',
        type: 'well_child',
        reasonForVisit: '5-Year Kindergarten Entry Physical.',
        vitals: {
          systolicBp: 96,
          diastolicBp: 58,
          heartRate: 90,
          respiratoryRate: 22,
          temperatureC: 36.7,
          oxygenSaturation: 99,
          heightCm: 111,
          weightKg: 20.0,
          bmi: 16.2,
          painScore: 0
        },
        chiefComplaint: '5-year checkup and kindergarten booster vaccines.',
        hpi: 'Pre-kindergarten wellness exam.',
        physicalExam: {
          General: 'Well-developed 5-year-old.'
        },
        assessment: {
          primaryDiagnosis: { code: 'Z00.129', name: 'Routine child health examination', isPrimary: true },
          secondaryDiagnoses: [],
          clinicalSummary: 'Appropriate cognitive, motor, and somatic growth.'
        },
        plan: {
          prescriptions: [],
          labOrders: [],
          imagingOrders: [],
          referrals: [],
          patientInstructions: 'Administered DTaP, MMR, IPV, and Varicella boosters.',
          followUpIn: '1 year',
          warningSigns: ['Fever > 38.5°C', 'Difficulty breathing or wheezing', 'Persistent vomiting']
        },
        status: 'signed',
        billingCode: '99393'
      },
      {
        id: 'enc-liam-4',
        patientId: 'pat-005',
        date: '2021-09-15T11:00:00Z',
        provider: 'Dr. Sarah Lin, MD',
        type: 'well_child',
        reasonForVisit: '4-Year Well-Child Examination.',
        vitals: {
          systolicBp: 94,
          diastolicBp: 58,
          heartRate: 92,
          respiratoryRate: 24,
          temperatureC: 36.8,
          oxygenSaturation: 99,
          heightCm: 104,
          weightKg: 17.4,
          bmi: 16.1,
          painScore: 0
        },
        chiefComplaint: '4-year well-child visit.',
        hpi: 'Preschool child, speech clear, milestones on target.',
        physicalExam: {
          General: 'Happy, cooperative 4-year-old.'
        },
        assessment: {
          primaryDiagnosis: { code: 'Z00.129', name: 'Routine child health check', isPrimary: true },
          secondaryDiagnoses: [],
          clinicalSummary: 'Normal development.'
        },
        plan: {
          prescriptions: [],
          labOrders: [],
          imagingOrders: [],
          referrals: [],
          patientInstructions: 'Limit screen time to under 1 hour daily.',
          followUpIn: '1 year',
          warningSigns: ['Fever > 38.5°C', 'Difficulty breathing or wheezing', 'Persistent vomiting']
        },
        status: 'signed',
        billingCode: '99392'
      },
      {
        id: 'enc-liam-3',
        patientId: 'pat-005',
        date: '2020-09-20T10:00:00Z',
        provider: 'Dr. Sarah Lin, MD',
        type: 'well_child',
        reasonForVisit: '3-Year Well-Child Examination.',
        vitals: {
          systolicBp: 92,
          diastolicBp: 56,
          heartRate: 96,
          respiratoryRate: 24,
          temperatureC: 36.9,
          oxygenSaturation: 98,
          heightCm: 96,
          weightKg: 15.2,
          bmi: 16.5,
          painScore: 0
        },
        chiefComplaint: '3-year well-child examination.',
        hpi: 'Potty trained, speaks in full sentences.',
        physicalExam: {
          General: 'Well-nourished toddler.'
        },
        assessment: {
          primaryDiagnosis: { code: 'Z00.129', name: 'Routine child health check', isPrimary: true },
          secondaryDiagnoses: [],
          clinicalSummary: 'Normal 3-year growth and milestones.'
        },
        plan: {
          prescriptions: [],
          labOrders: [],
          imagingOrders: [],
          referrals: [],
          patientInstructions: 'Promote calcium rich foods, water over juice.',
          followUpIn: '1 year',
          warningSigns: ['Fever > 38.5°C', 'Difficulty breathing or wheezing', 'Persistent vomiting']
        },
        status: 'signed',
        billingCode: '99392'
      },
      {
        id: 'enc-liam-2',
        patientId: 'pat-005',
        date: '2019-09-18T10:00:00Z',
        provider: 'Dr. Sarah Lin, MD',
        type: 'well_child',
        reasonForVisit: '24-Month Well-Child Examination.',
        vitals: {
          systolicBp: 90,
          diastolicBp: 54,
          heartRate: 102,
          respiratoryRate: 26,
          temperatureC: 36.8,
          oxygenSaturation: 99,
          heightCm: 88,
          weightKg: 13.0,
          bmi: 16.8,
          painScore: 0
        },
        chiefComplaint: '2-year well-child checkup.',
        hpi: 'Walking, running, 50+ words, 2-word phrases.',
        physicalExam: {
          General: 'Active 24-month-old toddler.'
        },
        assessment: {
          primaryDiagnosis: { code: 'Z00.129', name: 'Routine 24-month checkup', isPrimary: true },
          secondaryDiagnoses: [],
          clinicalSummary: 'Healthy 2-year-old child.'
        },
        plan: {
          prescriptions: [],
          labOrders: [],
          imagingOrders: [],
          referrals: [],
          patientInstructions: 'Transition from whole milk to 1-2% milk.',
          followUpIn: '1 year',
          warningSigns: ['Fever > 38.5°C', 'Difficulty breathing or wheezing', 'Persistent vomiting']
        },
        status: 'signed',
        billingCode: '99392'
      }
    ],
    labResults: [],
    clinicalAlerts: ['SEVERE PEANUT ANAPHYLAXIS', 'EpiPen Jr on file'],
    visitStatus: 'scheduled_today',
    scheduledTime: '11:15 AM',
    triagePriority: 'routine',
    triageNote: 'Well-child checkup & school sports form clearance',
    createdAt: '2019-10-01T10:00:00Z',
    updatedAt: '2025-10-18T14:30:00Z'
  }
];
