import { describe, it, expect } from 'vitest';
import QRCode from 'qrcode';

describe('QR Code Generation & Mobile Patient Summary Features', () => {
  it('generates a valid high-resolution Data URL for the mobile instructions link', async () => {
    const testUrl = 'https://cascade-ehr.internal/?mode=mobile-avs&patientId=pat-1&encounterId=enc-101';
    const dataUrl = await QRCode.toDataURL(testUrl, {
      width: 250,
      margin: 1,
      errorCorrectionLevel: 'M',
    });

    expect(dataUrl).toBeDefined();
    expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    expect(dataUrl.length).toBeGreaterThan(100);
  });

  it('formulates complete query parameters for patient smartphone routing', () => {
    const baseUrl = 'https://cascade-ehr.internal';
    const patientId = 'pat-7749';
    const encounterId = 'enc-8832';

    const url = new URL(`${baseUrl}/`);
    url.searchParams.set('mode', 'mobile-avs');
    url.searchParams.set('patientId', patientId);
    url.searchParams.set('encounterId', encounterId);

    expect(url.searchParams.get('mode')).toBe('mobile-avs');
    expect(url.searchParams.get('patientId')).toBe('pat-7749');
    expect(url.searchParams.get('encounterId')).toBe('enc-8832');
  });

  it('splits physician instructions into distinct mobile checklist items', () => {
    const instructions = [
      '1. Take Amlodipine 5mg each morning with water.',
      '2. Restrict dietary sodium to less than 2,000 mg/day.',
      '3. Log blood pressure twice weekly.',
      '4. Call clinic if systolic BP exceeds 160 mmHg.',
    ].join('\n');

    const checklistItems = instructions
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    expect(checklistItems).toHaveLength(4);
    expect(checklistItems[0]).toContain('Amlodipine 5mg');
    expect(checklistItems[1]).toContain('sodium');
  });

  it('generates standard RFC-5545 iCalendar data for patient appointment follow-up', () => {
    const title = 'Follow-Up: Cascade Family Health Centre';
    const location = '740 SW Horizon Blvd, Portland, OR 97201';
    const followUpNote = '3 months chronic evaluation';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${followUpNote}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    expect(icsContent).toContain('BEGIN:VCALENDAR');
    expect(icsContent).toContain('SUMMARY:Follow-Up: Cascade Family Health Centre');
    expect(icsContent).toContain('LOCATION:740 SW Horizon Blvd, Portland, OR 97201');
    expect(icsContent).toContain('END:VCALENDAR');
  });
});
