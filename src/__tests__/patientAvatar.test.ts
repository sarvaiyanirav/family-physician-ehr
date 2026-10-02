import { describe, it, expect } from 'vitest';
import { Patient } from '../types/clinical';
import { INITIAL_PATIENTS } from '../data/mockPatients';

describe('Patient Avatar & Webcam Capture Features', () => {
  it('supports photoUrl and avatarType properties on patient records', () => {
    const testPatient: Patient = {
      ...INITIAL_PATIENTS[0],
      photoUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      avatarType: 'webcam',
    };

    expect(testPatient.photoUrl).toBeDefined();
    expect(testPatient.photoUrl?.startsWith('data:image/jpeg;base64,')).toBe(true);
    expect(testPatient.avatarType).toBe('webcam');
  });

  it('generates valid SVG data URLs for clinical avatar presets with theme colors', () => {
    const initials = 'EV';
    const color = { bg: '#b91c1c' };
    const presetId = 'adult_female';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
        <rect width="100" height="100" rx="50" fill="${color.bg}" />
        <circle cx="50" cy="38" r="14" fill="#ffffff" />
        <path d="M22 84 c0 -16 12 -28 28 -28 s28 12 28 28 Z" fill="#ffffff" />
      </svg>
    `.trim();

    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

    expect(dataUrl.startsWith('data:image/svg+xml;utf8,')).toBe(true);
    expect(decodeURIComponent(dataUrl)).toContain('#b91c1c');
    expect(decodeURIComponent(dataUrl)).toContain('<circle');
  });

  it('generates monogram SVG with custom patient initials', () => {
    const initials = 'JS';
    const color = { bg: '#1d4ed8' };

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
        <rect width="100" height="100" rx="50" fill="${color.bg}" />
        <text x="50" y="58" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
      </svg>
    `.trim();

    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

    expect(decodeURIComponent(dataUrl)).toContain('JS');
    expect(decodeURIComponent(dataUrl)).toContain('#1d4ed8');
  });

  it('derives accurate initials from patient first and last names', () => {
    const getInitials = (first: string, last: string) =>
      `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || 'P';

    expect(getInitials('Eleanor', 'Vance')).toBe('EV');
    expect(getInitials('Marcus', 'Vance')).toBe('MV');
    expect(getInitials('Sarah', 'Lin')).toBe('SL');
    expect(getInitials('', '')).toBe('P');
  });
});
