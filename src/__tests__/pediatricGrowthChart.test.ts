import { describe, it, expect } from 'vitest';
import {
  CDC_BOYS_HEIGHT,
  CDC_GIRLS_HEIGHT,
  CDC_BOYS_WEIGHT,
  CDC_GIRLS_WEIGHT,
  CDC_BOYS_BMI,
  CDC_GIRLS_BMI,
  estimatePercentile,
} from '../components/PediatricGrowthChart';

describe('Pediatric Growth Standards & Percentile Curves', () => {
  it('contains complete CDC growth datasets from age 2 to 18 years', () => {
    expect(CDC_BOYS_HEIGHT.length).toBeGreaterThanOrEqual(16);
    expect(CDC_GIRLS_HEIGHT.length).toBeGreaterThanOrEqual(16);
    expect(CDC_BOYS_WEIGHT.length).toBeGreaterThanOrEqual(16);
    expect(CDC_GIRLS_WEIGHT.length).toBeGreaterThanOrEqual(16);
    expect(CDC_BOYS_BMI.length).toBeGreaterThanOrEqual(16);
    expect(CDC_GIRLS_BMI.length).toBeGreaterThanOrEqual(16);
  });

  it('ensures monotonic progression of percentiles (p5 < p25 < p50 < p75 < p95)', () => {
    CDC_BOYS_HEIGHT.forEach((curve) => {
      expect(curve.p5).toBeLessThan(curve.p25);
      expect(curve.p25).toBeLessThan(curve.p50);
      expect(curve.p50).toBeLessThan(curve.p75);
      expect(curve.p75).toBeLessThan(curve.p95);
    });
  });

  describe('estimatePercentile', () => {
    const age8BoyHeightRef = CDC_BOYS_HEIGHT.find((c) => c.ageYears === 8)!;

    it('classifies height below 5th percentile as Low', () => {
      const result = estimatePercentile(age8BoyHeightRef.p5 - 2, age8BoyHeightRef);
      expect(result.label).toBe('< 5th percentile');
      expect(result.category).toBe('Low');
    });

    it('classifies height in 25th - 75th percentile as Optimal Median', () => {
      const result = estimatePercentile(age8BoyHeightRef.p50, age8BoyHeightRef);
      expect(result.label).toBe('25th - 75th percentile');
      expect(result.category).toBe('Optimal Median');
    });

    it('classifies height above 95th percentile as Elevated', () => {
      const result = estimatePercentile(age8BoyHeightRef.p95 + 3, age8BoyHeightRef);
      expect(result.label).toBe('> 95th percentile');
      expect(result.category).toBe('Elevated');
    });

    it('classifies height between 5th and 25th as Normal Low', () => {
      const result = estimatePercentile((age8BoyHeightRef.p5 + age8BoyHeightRef.p25) / 2, age8BoyHeightRef);
      expect(result.label).toBe('5th - 25th percentile');
      expect(result.category).toBe('Normal Low');
    });
  });
});
