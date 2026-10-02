import { contrast, hexToHsl, hexToOklch, hexToRgb, oklchToHex, parseHex, wcagGrade } from './convert';

describe('parseHex', () => {
  it('normalizes 6-digit hex with or without #, any case', () => {
    expect(parseHex('#3182F6')).toBe('#3182f6');
    expect(parseHex('3182f6')).toBe('#3182f6');
    expect(parseHex('  #3182f6 ')).toBe('#3182f6');
  });

  it('expands 3-digit shorthand', () => {
    expect(parseHex('#38f')).toBe('#3388ff');
  });

  it('rejects anything else', () => {
    for (const bad of ['', '#', '#3182f', '#3182f6a', 'blue', '#ggg']) {
      expect(parseHex(bad)).toBeNull();
    }
  });
});

describe('hexToRgb', () => {
  it('reads 0-255 channels', () => {
    expect(hexToRgb('#3182f6')).toEqual([49, 130, 246]);
  });
});

describe('hexToOklch', () => {
  it('matches the Notion reference for Toss Blue #3182f6', () => {
    const { l, c, h } = hexToOklch('#3182f6');
    expect(l).toBeCloseTo(62.01, 1);
    expect(c).toBeCloseTo(0.1906, 3);
    expect(h).toBeCloseTo(258.2, 0);
  });

  it('reads white and black at the ends of the lightness axis', () => {
    expect(hexToOklch('#ffffff').l).toBeCloseTo(100, 1);
    expect(hexToOklch('#000000').l).toBeCloseTo(0, 1);
    expect(hexToOklch('#ffffff').c).toBeLessThan(0.0001);
  });
});

describe('hexToHsl', () => {
  it('matches the Notion reference for #3182f6', () => {
    const { h, s, l } = hexToHsl('#3182f6');
    expect(h).toBeCloseTo(215.3, 1);
    expect(s).toBeCloseTo(91.6, 1);
    expect(l).toBeCloseTo(57.8, 1);
  });
});

describe('oklchToHex', () => {
  it('round-trips an in-gamut color', () => {
    const { l, c, h } = hexToOklch('#3182f6');
    expect(oklchToHex(l, c, h)).toBe('#3182f6');
  });

  it('clips out-of-gamut chroma while keeping lightness and hue', () => {
    const hex = oklchToHex(70, 0.4, 145);
    expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    const back = hexToOklch(hex);
    expect(back.l).toBeCloseTo(70, 0);
    expect(back.h).toBeCloseTo(145, 0);
    expect(back.c).toBeLessThan(0.4);
  });
});

describe('contrast', () => {
  it('matches the Notion WCAG numbers for Toss grey on white', () => {
    expect(contrast('#8b95a1', '#ffffff')).toBeCloseTo(3.04, 2);
    expect(contrast('#6b7684', '#ffffff')).toBeCloseTo(4.62, 2);
    expect(contrast('#4e5968', '#ffffff')).toBeCloseTo(7.11, 2);
  });

  it('is symmetric and 21 for black on white', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 5);
  });
});

describe('wcagGrade', () => {
  it('uses the 3 / 4.5 / 7 thresholds', () => {
    expect(wcagGrade(2.99)).toBe('fail');
    expect(wcagGrade(3)).toBe('AA-large');
    expect(wcagGrade(4.49)).toBe('AA-large');
    expect(wcagGrade(4.5)).toBe('AA');
    expect(wcagGrade(7)).toBe('AAA');
  });
});
