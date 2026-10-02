import { FAMILIES, STEPS, generatePalette } from './generate';
import { toDesignTokens } from './tokens';

describe('toDesignTokens', () => {
  const palette = generatePalette('#3182f6');

  it('describes the source primary and anchor', () => {
    expect(toDesignTokens(palette).$description).toBe('Color Math · primary #3182f6 · anchor 500');
  });

  it('emits a W3C color token for every mode × family × step', () => {
    const tokens = toDesignTokens(palette);
    for (const mode of ['light', 'dark'] as const) {
      expect(Object.keys(tokens[mode])).toEqual([...FAMILIES]);
      for (const family of FAMILIES) {
        expect(Object.keys(tokens[mode][family])).toEqual([...STEPS]);
        STEPS.forEach((step, i) => {
          expect(tokens[mode][family][step]).toEqual({ $type: 'color', $value: palette[mode][family][i] });
        });
      }
    }
  });

  it('writes whatever scale it is given, including edited chips', () => {
    const gray = [...palette.light.gray];
    gray[1] = '#123456';
    const edited = { ...palette, light: { ...palette.light, gray } };
    expect(toDesignTokens(edited).light.gray['100'].$value).toBe('#123456');
  });
});
