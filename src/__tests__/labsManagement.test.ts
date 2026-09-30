import { describe, it, expect } from 'vitest';
import {
  calculateFlag,
  inferLabCategory,
  parseRawLabText,
} from '../components/LabsManagement';

describe('Labs Management & Diagnostic Data Parser', () => {
  describe('calculateFlag', () => {
    it('identifies normal values within standard numeric range (min - max)', () => {
      expect(calculateFlag('140', '135 - 145')).toBe('normal');
      expect(calculateFlag('4.2', '3.5 to 5.0')).toBe('normal');
    });

    it('identifies abnormal high values exceeding reference upper limit', () => {
      expect(calculateFlag('150', '135 - 145')).toBe('high');
      expect(calculateFlag('5.8', '3.5 - 5.0')).toBe('high');
    });

    it('identifies abnormal low values below reference lower limit', () => {
      expect(calculateFlag('130', '135 - 145')).toBe('low');
      expect(calculateFlag('3.1', '3.5 - 5.0')).toBe('low');
    });

    it('flags panic/critical values exceeding 1.6x upper threshold', () => {
      // 145 * 1.6 = 232
      expect(calculateFlag('240', '135 - 145')).toBe('critical');
    });

    it('flags panic/critical values below 0.6x lower threshold', () => {
      // 135 * 0.6 = 81
      expect(calculateFlag('75', '135 - 145')).toBe('critical');
    });

    it('handles "< max" reference ranges properly', () => {
      expect(calculateFlag('5.2', '< 5.7')).toBe('normal');
      expect(calculateFlag('6.2', '< 5.7')).toBe('high');
      expect(calculateFlag('11.5', '< 5.7')).toBe('critical');
    });

    it('handles "> min" reference ranges properly', () => {
      expect(calculateFlag('75', '> 60')).toBe('normal');
      expect(calculateFlag('50', '> 60')).toBe('low');
      expect(calculateFlag('25', '> 60')).toBe('critical');
    });

    it('returns normal for non-numeric or unparsable inputs', () => {
      expect(calculateFlag('Negative', 'Negative')).toBe('normal');
      expect(calculateFlag('Non-reactive', 'Non-reactive')).toBe('normal');
    });
  });

  describe('inferLabCategory', () => {
    it('categorizes lipid profile tests', () => {
      expect(inferLabCategory('Total Cholesterol')).toBe('Lipids');
      expect(inferLabCategory('HDL Cholesterol')).toBe('Lipids');
      expect(inferLabCategory('LDL Direct')).toBe('Lipids');
      expect(inferLabCategory('Triglycerides')).toBe('Lipids');
    });

    it('categorizes endocrine & metabolic tests', () => {
      expect(inferLabCategory('Hemoglobin A1c')).toBe('Endocrine');
      expect(inferLabCategory('TSH (Thyroid Stimulating Hormone)')).toBe('Endocrine');
      expect(inferLabCategory('Free T4')).toBe('Endocrine');
      expect(inferLabCategory('Cortisol')).toBe('Endocrine');
    });

    it('categorizes complete blood count & hematology tests', () => {
      expect(inferLabCategory('WBC Count')).toBe('Hematology');
      expect(inferLabCategory('Platelets')).toBe('Hematology');
      expect(inferLabCategory('Hemoglobin')).toBe('Hematology');
      expect(inferLabCategory('Hematocrit')).toBe('Hematology');
    });

    it('categorizes renal & urinalysis tests', () => {
      expect(inferLabCategory('Serum Creatinine')).toBe('Renal / Urinalysis');
      expect(inferLabCategory('eGFR (CKD-EPI)')).toBe('Renal / Urinalysis');
      expect(inferLabCategory('BUN (Blood Urea Nitrogen)')).toBe('Renal / Urinalysis');
      expect(inferLabCategory('Urinalysis Microalbumin')).toBe('Renal / Urinalysis');
    });

    it('falls back to Biochemistry for general metabolic tests', () => {
      expect(inferLabCategory('Serum Sodium')).toBe('Biochemistry');
      expect(inferLabCategory('Potassium')).toBe('Biochemistry');
    });
  });

  describe('parseRawLabText', () => {
    it('parses tab-delimited laboratory output lines', () => {
      const raw = `Sodium\t142\tmmol/L\t135-145\nPotassium\t4.1\tmmol/L\t3.5-5.0`;
      const parsed = parseRawLabText(raw, '2026-09-30');

      expect(parsed).toHaveLength(2);
      expect(parsed[0].testName).toBe('Sodium');
      expect(parsed[0].value).toBe('142');
      expect(parsed[0].unit).toBe('mmol/L');
      expect(parsed[0].flag).toBe('normal');

      expect(parsed[1].testName).toBe('Potassium');
      expect(parsed[1].value).toBe('4.1');
    });

    it('parses formatted colon & parentheses lab report text', () => {
      const raw = `Glucose, Fasting: 156 mg/dL (Ref: 70 - 99) [High]\nHbA1c: 7.8 % (Ref: < 5.7) [High]`;
      const parsed = parseRawLabText(raw, '2026-09-30');

      expect(parsed).toHaveLength(2);
      expect(parsed[0].testName).toBe('Glucose, Fasting');
      expect(parsed[0].value).toBe('156');
      expect(parsed[0].flag).toBe('high');

      expect(parsed[1].testName).toBe('HbA1c');
      expect(parsed[1].value).toBe('7.8');
      expect(parsed[1].flag).toBe('high');
    });

    it('skips comments and headers starting with # or "test name"', () => {
      const raw = `# Lab Report\nTest Name\tValue\tUnit\tReference Range\nCalcium\t9.5\tmg/dL\t8.5-10.5`;
      const parsed = parseRawLabText(raw, '2026-09-30');

      expect(parsed).toHaveLength(1);
      expect(parsed[0].testName).toBe('Calcium');
      expect(parsed[0].value).toBe('9.5');
    });
  });
});
