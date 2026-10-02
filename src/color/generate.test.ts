import { contrast, hexToOklch, hexToRgb } from './convert';
import { FAMILIES, generatePalette } from './generate';

// Notion 「08 · 생성기」 example output for #3182f6 (Toss Blue).
const NOTION_LIGHT = {
  primary: '#f6fbff #cee5ff #a5ceff #7db6ff #549cff #3182f6 #1762d3 #1046a5 #0d2e72 #071842',
  gray: '#fafafa #dcdfe3 #c0c4cb #a5aab3 #8b909b #727882 #595f6a #424751 #2d3138 #191c21',
  red: '#fff8f8 #ffd2cf #f8aea8 #ef8880 #e55e57 #d03733 #b11215 #8a0003 #610402 #3a0502',
  green: '#f2fef5 #c5e9d0 #96d5ab #5fc186 #00ac62 #008f50 #00723e #00562d #003c1d #00230f',
  yellow: '#fcfbee #e6e0b9 #d3c582 #c2a83d #ac8d00 #917400 #755b00 #5a4300 #402d00 #271900',
} as const;
const NOTION_DARK = {
  primary: '#1c1f22 #203246 #21456e #215799 #206ac8 #2b7df0 #619eff #99bfff #ccdeff #f0f5ff',
  gray: '#1f1f1f #313336 #46494f #5b6068 #737882 #8a909b #a4abb7 #c0c6d2 #dde2eb #f1f5fd',
} as const;

// Notion constants are rounded to 3 decimals, so allow 1/255 per channel.
function maxChannelDiff(a: string, b: string): number {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return Math.max(...x.map((v, i) => Math.abs(v - y[i])));
}

describe('generatePalette(#3182f6) against the Notion example', () => {
  const palette = generatePalette('#3182f6');

  it('anchors at 500 with +1.43°/step hue torsion', () => {
    expect(palette.anchor).toBe('500');
    expect(palette.torsion).toBeCloseTo(1.43, 2);
  });

  it('keeps the input hex untouched in the anchor chip', () => {
    expect(palette.light.primary[5]).toBe('#3182f6');
  });

  it.each(Object.entries(NOTION_LIGHT))('light %s matches within 1/255', (family, row) => {
    const got = palette.light[family as keyof typeof NOTION_LIGHT];
    row.split(' ').forEach((want, i) => expect(maxChannelDiff(got[i], want), `${family}-${i}`).toBeLessThanOrEqual(1));
  });

  it.each(Object.entries(NOTION_DARK))('dark %s matches within 1/255', (family, row) => {
    const got = palette.dark[family as keyof typeof NOTION_DARK];
    row.split(' ').forEach((want, i) => expect(maxChannelDiff(got[i], want), `${family}-${i}`).toBeLessThanOrEqual(1));
  });

  it('reproduces the gray contrast-on-white ladder', () => {
    const want = [1.04, 1.34, 1.75, 2.33, 3.2, 4.44, 6.42, 9.33, 13.06, 17.08];
    palette.light.gray.forEach((hex, i) => expect(contrast(hex, '#ffffff')).toBeCloseTo(want[i], 1));
  });
});

describe('generatePalette edge inputs', () => {
  it.each(['#ff6600', '#06c755', '#000000', '#ffffff', '#808080', '#e60023', '#ffff00'])(
    '%s yields 8 families × 10 valid hex chips with monotone primary lightness',
    (input) => {
      const { light, dark } = generatePalette(input);
      for (const mode of [light, dark]) {
        expect(Object.keys(mode)).toEqual([...FAMILIES]);
        for (const family of FAMILIES) {
          expect(mode[family]).toHaveLength(10);
          mode[family].forEach((hex) => expect(hex).toMatch(/^#[0-9a-f]{6}$/));
        }
      }
      const lightL = light.primary.map((hex) => hexToOklch(hex).l);
      const darkL = dark.primary.map((hex) => hexToOklch(hex).l);
      lightL.slice(1).forEach((l, i) => expect(l).toBeLessThanOrEqual(lightL[i] + 1e-9));
      darkL.slice(1).forEach((l, i) => expect(l).toBeGreaterThanOrEqual(darkL[i] - 1e-9));
    },
  );

  it('anchors very light and very dark inputs at the ends without breaking the ladder', () => {
    expect(generatePalette('#ffffff').anchor).toBe('50');
    expect(generatePalette('#000000').anchor).toBe('900');
    expect(generatePalette('#ffffff').light.primary[0]).toBe('#ffffff');
    expect(generatePalette('#000000').light.primary[9]).toBe('#000000');
  });

  it('does not snap to 500 when the nearest step is 300 (Daangn carrot)', () => {
    expect(generatePalette('#ff6600').anchor).toBe('300');
  });
});

describe('hue torsion', () => {
  it('interpolates across the 0° wrap between purple (−0.67) and red (+0.90)', () => {
    const { torsion } = generatePalette('#e60023'); // okH 25.5°, just before red's 26.7°
    expect(torsion).toBeGreaterThan(0.8);
    expect(torsion).toBeLessThan(0.9);
    const magenta = generatePalette('#ff00aa').torsion; // okH ≈ 350°, between purple and red
    expect(magenta).toBeGreaterThan(-0.67);
    expect(magenta).toBeLessThan(0.9);
  });

  it('turns orange toward red and blue toward purple as steps darken', () => {
    const { light } = generatePalette('#3182f6');
    const hue = (hex: string) => hexToOklch(hex).h;
    expect(hue(light.orange[8])).toBeLessThan(hue(light.orange[2]));
    expect(hue(light.blue[8])).toBeGreaterThan(hue(light.blue[2]));
  });
});
