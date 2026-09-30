import { describe, it, expect } from 'vitest';
import { calculateAgeAtDate } from '../components/ClinicalTimeline';

describe('Clinical Timeline Milestones', () => {
  describe('calculateAgeAtDate', () => {
    it('calculates age in years and months at the date of milestone', () => {
      const dob = '2000-01-15';
      const eventDate = '2024-07-20';
      const ageStr = calculateAgeAtDate(dob, eventDate);

      expect(ageStr).toBe('Age 24y 6m');
    });

    it('handles year-only event dates e.g. "2018"', () => {
      const dob = '1990-04-10';
      const ageStr = calculateAgeAtDate(dob, '2018');

      expect(ageStr).toBe('Age 28 yrs');
    });

    it('formats infant ages in months for early childhood milestones', () => {
      const dob = '2025-01-10';
      const eventDate = '2025-07-15';
      const ageStr = calculateAgeAtDate(dob, eventDate);

      expect(ageStr).toBe('6 mos old');
    });

    it('returns empty string if event occurred before patient birth date', () => {
      const dob = '2015-05-01';
      const eventDate = '2010-01-01';
      expect(calculateAgeAtDate(dob, eventDate)).toBe('');
    });

    it('returns empty string for invalid date formats', () => {
      expect(calculateAgeAtDate('invalid-dob', '2020-01-01')).toBe('');
      expect(calculateAgeAtDate('2000-01-01', 'not-a-date')).toBe('');
    });
  });
});
