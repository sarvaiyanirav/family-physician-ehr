# PraxisMD — Family Practice Clinical Intake & Charting System

A modern clinical electronic health record (EHR) and data capture application purpose-built for **family physicians**, primary care clinicians, and ambulatory clinics.

---

## 🌟 Key Features

### 1. Patient Registry & Longitudinal Dossier
- **Demographics & Intake**: Legal and preferred name, date of birth, age, sex, gender identity, health card/insurance numbers, contact details, emergency contacts, primary language, and interpreter needs.
- **Resuscitation Code Status**: Full Code, DNR, DNI, and Limited Intervention directives prominently displayed on patient banners.
- **Safety & Allergy Alerts**: Real-time allergy tracking categorized by drug, food, and environmental triggers, with severity levels (mild, moderate, severe anaphylaxis). Built-in safety warnings prevent prescribing conflicting medications.

### 2. Clinical Encounter & SOAP Note Charting
- **Subjective (S)**: Chief Complaint, structured History of Present Illness (HPI), and Review of Systems (ROS) with negative baseline toggles.
- **Objective (O)**: Vital signs recording (BP, Pulse, RR, Temp, $\text{SpO}_2$, Weight, Height) with automated BMI computation and clinical classification. System-by-system physical exam with 1-click normal examination baselines.
- **Assessment (A)**: Diagnostic formulations linked to primary care ICD-10 codes with clinical synthesis and medical decision-making (MDM) documentation.
- **Plan (P)**: Pharmacotherapy prescription ordering with sig, dosage, and dispense counts; diagnostic lab test requests; imaging orders; specialist referrals; and patient instructions.
- **1-Click Clinical Templates**: Pre-configured templates for Hypertension Review, Type 2 Diabetes Management, Annual Physical Examination, Acute Upper Respiratory Infection (URI), and Mechanical Low Back Pain.
- **Speech-to-Text Dictation**: Native Web Speech API integration allowing voice dictation directly into clinical note fields.

### 3. Primary Care Decision Support Calculators
- **AHA/ACC 10-Year ASCVD Risk Estimator**: Estimates 10-year risk of atherosclerotic cardiovascular events with statin therapy recommendations.
- **2021 CKD-EPI eGFR Calculator**: Creatinine-based renal filtration rate estimation with Chronic Kidney Disease (CKD) staging (G1–G5).
- **$\text{CHA}_2\text{DS}_2\text{-VASc}$ Score**: Stroke risk stratification in non-valvular atrial fibrillation to guide oral anticoagulation.
- **BMI & Ideal Body Weight Calculator**: Computes healthy weight target ranges based on height and body habitus.

### 4. Patient Handoff & Data Portability
- **Patient After-Visit Summary (AVS)**: Plain-language instructions, updated medication lists, and red-flag emergency warning signs formatted for direct printing or PDF export.
- **Data Export & Backup**: Full JSON database backup and CSV patient roster export.

---

## 🚀 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Motion
- **Fonts**: Plus Jakarta Sans & JetBrains Mono

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 📂 Project Structure

```
├── src/
│   ├── components/
│   │   ├── ClinicalCalculators.tsx   # ASCVD, eGFR, CHA2DS2-VASc, BMI tools
│   │   ├── EncounterCapture.tsx      # Comprehensive SOAP charting & templates
│   │   ├── Header.tsx                # Top navigation & export actions
│   │   ├── NewPatientModal.tsx       # Intake & demographic capture modal
│   │   ├── PatientChart.tsx          # Longitudinal dossier (Meds, Vitals, Labs)
│   │   ├── PatientDirectory.tsx      # High-density patient table & search
│   │   └── TodaySchedule.tsx         # Daily clinic queue & room status
│   ├── data/
│   │   ├── clinicalTemplates.ts      # Rapid primary care SOAP templates
│   │   ├── icdCodes.ts               # Common primary care ICD-10 & lab panels
│   │   └── mockPatients.ts           # Realistic multi-visit primary care cohort
│   ├── services/
│   │   └── storageService.ts         # Local persistence, calculations & CSV/JSON export
│   ├── types/
│   │   └── clinical.ts               # Clinical domain TypeScript definitions
│   ├── App.tsx                       # Main application state & routing
│   ├── index.css                     # Tailwind CSS & custom typography
│   └── main.tsx                      # Application entry point
├── metadata.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 License
Apache-2.0
