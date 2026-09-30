import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  calculateBmi,
  calculateCKDEpi,
  calculateASCVDScore,
} from '../services/storageService';
import {
  calculateChads2Vasc,
  getCkdStage,
} from '../components/ClinicalCalculators';

describe('Clinical Calculations & Risk Stratification', () => {
  describe('calculateAge', () => {
    it('accurately calculates age in completed years', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 35;
      const birthMonth = String(today.getMonth() + 1).padStart(2, '0');
      const birthDay = String(today.getDate()).padStart(2, '0');
      const dob = `${birthYear}-${birthMonth}-${birthDay}`;

      expect(calculateAge(dob)).toBe(35);
    });

    it('returns age minus one if birthday has not yet occurred this year', () => {
      const today = new Date();
      // Choose date far in future of current year
      const futureMonth = today.getMonth() === 11 ? 12 : today.getMonth() + 2;
      const birthYear = today.getFullYear() - 40;
      if (futureMonth <= 12) {
        const dob = `${birthYear}-${String(futureMonth).padStart(2, '0')}-28`;
        expect(calculateAge(dob)).toBe(39);
      }
    });

    it('returns 0 for infants born in the current year', () => {
      const today = new Date();
      const dob = `${today.getFullYear()}-01-01`;
      expect(calculateAge(dob)).toBe(0);
    });

    it('handles empty or falsy dob safely', () => {
      expect(calculateAge('')).toBe(0);
    });
  });

  describe('calculateBmi', () => {
    it('calculates BMI correctly and classifies Normal weight', () => {
      const result = calculateBmi(70, 175);
      expect(result).not.toBeNull();
      expect(result?.bmi).toBe(22.9);
      expect(result?.label).toBe('Normal');
    });

    it('classifies Underweight when BMI < 18.5', () => {
      const result = calculateBmi(45, 170);
      expect(result).not.toBeNull();
      expect(result?.bmi).toBe(15.6);
      expect(result?.label).toBe('Underweight');
    });

    it('classifies Overweight when BMI is between 25 and 29.9', () => {
      const result = calculateBmi(80, 170);
      expect(result).not.toBeNull();
      expect(result?.bmi).toBe(27.7);
      expect(result?.label).toBe('Overweight');
    });

    it('classifies Obese Class 1 when BMI is 30 to 34.9', () => {
      const result = calculateBmi(95, 170);
      expect(result).not.toBeNull();
      expect(result?.bmi).toBe(32.9);
      expect(result?.label).toBe('Obese (Class 1)');
    });

    it('classifies Obese Class 2+ when BMI >= 35', () => {
      const result = calculateBmi(115, 170);
      expect(result).not.toBeNull();
      expect(result?.bmi).toBe(39.8);
      expect(result?.label).toBe('Obese (Class 2+)');
    });

    it('returns null for zero or negative measurements', () => {
      expect(calculateBmi(0, 170)).toBeNull();
      expect(calculateBmi(70, 0)).toBeNull();
      expect(calculateBmi(-10, 170)).toBeNull();
      expect(calculateBmi(undefined, 170)).toBeNull();
    });
  });

  describe('calculateCKDEpi (2021 Creatinine Equation)', () => {
    it('calculates expected eGFR for a male with normal creatinine', () => {
      const egfr = calculateCKDEpi(1.0, 50, 'male');
      expect(egfr).toBeGreaterThan(80);
      expect(egfr).toBeLessThan(110);
    });

    it('calculates expected eGFR for a female with normal creatinine', () => {
      const egfr = calculateCKDEpi(0.8, 50, 'female');
      expect(egfr).toBeGreaterThan(80);
      expect(egfr).toBeLessThan(110);
    });

    it('reflects decreased renal clearance for elevated serum creatinine', () => {
      const egfrNormal = calculateCKDEpi(0.9, 65, 'male');
      const egfrSevere = calculateCKDEpi(3.2, 65, 'male');
      expect(egfrSevere).toBeLessThan(egfrNormal);
      expect(egfrSevere).toBeLessThan(30);
    });

    it('handles non-positive or zero inputs gracefully', () => {
      expect(calculateCKDEpi(0, 50, 'male')).toBe(0);
      expect(calculateCKDEpi(-1, 50, 'female')).toBe(0);
      expect(calculateCKDEpi(1.0, 0, 'male')).toBe(0);
    });
  });

  describe('getCkdStage', () => {
    it('correctly stratifies KDIGO CKD stages', () => {
      expect(getCkdStage(95).stage).toContain('Stage G1');
      expect(getCkdStage(75).stage).toContain('Stage G2');
      expect(getCkdStage(50).stage).toContain('Stage G3a');
      expect(getCkdStage(35).stage).toContain('Stage G3b');
      expect(getCkdStage(20).stage).toContain('Stage G4');
      expect(getCkdStage(10).stage).toContain('Stage G5');
    });
  });

  describe('calculateASCVDScore', () => {
    it('returns 0 with Low (< 5%) for age out of validated range (<20 or >79)', () => {
      const young = calculateASCVDScore({
        age: 18,
        sex: 'male',
        totalChol: 190,
        hdl: 50,
        systolicBp: 120,
        onHtnMeds: false,
        isSmoker: false,
        isDiabetic: false,
      });
      expect(young.scorePercent).toBe(0);
      expect(young.riskCategory).toBe('Low (< 5%)');

      const elderly = calculateASCVDScore({
        age: 85,
        sex: 'female',
        totalChol: 190,
        hdl: 50,
        systolicBp: 120,
        onHtnMeds: false,
        isSmoker: false,
        isDiabetic: false,
      });
      expect(elderly.scorePercent).toBe(0);
      expect(elderly.riskCategory).toBe('Low (< 5%)');
    });

    it('calculates higher risk category for patient with diabetes, smoking, and hypertension', () => {
      const highRisk = calculateASCVDScore({
        age: 65,
        sex: 'male',
        totalChol: 240,
        hdl: 35,
        systolicBp: 155,
        onHtnMeds: true,
        isSmoker: true,
        isDiabetic: true,
      });

      expect(highRisk.scorePercent).toBeGreaterThan(20);
      expect(highRisk.riskCategory).toBe('High (≥ 20%)');
    });

    it('calculates low risk for young adult with optimal lipid and BP values', () => {
      const lowRisk = calculateASCVDScore({
        age: 30,
        sex: 'female',
        totalChol: 160,
        hdl: 65,
        systolicBp: 110,
        onHtnMeds: false,
        isSmoker: false,
        isDiabetic: false,
      });

      expect(lowRisk.scorePercent).toBeLessThan(5);
      expect(lowRisk.riskCategory).toBe('Low (< 5%)');
    });
  });

  describe('calculateChads2Vasc', () => {
    it('returns score 0 for low-risk young male without comorbidities', () => {
      const score = calculateChads2Vasc({
        chf: false,
        htn: false,
        age: 45,
        diabetes: false,
        strokeHistory: false,
        vascularDisease: false,
        sex: 'male',
      });
      expect(score).toBe(0);
    });

    it('awards 1 point for female sex', () => {
      const score = calculateChads2Vasc({
        chf: false,
        htn: false,
        age: 45,
        diabetes: false,
        strokeHistory: false,
        vascularDisease: false,
        sex: 'female',
      });
      expect(score).toBe(1);
    });

    it('awards 2 points for age >= 75 and 2 points for prior stroke', () => {
      const score = calculateChads2Vasc({
        chf: false,
        htn: false,
        age: 76,
        diabetes: false,
        strokeHistory: true,
        vascularDisease: false,
        sex: 'male',
      });
      expect(score).toBe(4); // 2 (age >= 75) + 2 (stroke)
    });

    it('accurately accumulates multi-factorial risk points', () => {
      const score = calculateChads2Vasc({
        chf: true, // +1
        htn: true, // +1
        age: 68, // +1 (65-74)
        diabetes: true, // +1
        strokeHistory: true, // +2
        vascularDisease: true, // +1
        sex: 'female', // +1
      });
      expect(score).toBe(8);
    });
  });
});
