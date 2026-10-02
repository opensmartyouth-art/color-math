// Palette → W3C Design Tokens (DTCG) JSON, light and dark in one file.
import { FAMILIES, STEPS, type Family, type Mode, type Palette, type Step } from './generate';

type ColorToken = { $type: 'color'; $value: string };
export type DesignTokens = { $description: string } & Record<Mode, Record<Family, Record<Step, ColorToken>>>;

export function toDesignTokens(palette: Pick<Palette, 'primary' | 'anchor' | 'light' | 'dark'>): DesignTokens {
  const mode = (scale: Palette['light']) =>
    Object.fromEntries(
      FAMILIES.map((family) => [
        family,
        Object.fromEntries(STEPS.map((step, i) => [step, { $type: 'color', $value: scale[family][i] }])),
      ]),
    ) as Record<Family, Record<Step, ColorToken>>;

  return {
    $description: `Color Math · primary ${palette.primary} · anchor ${palette.anchor}`,
    light: mode(palette.light),
    dark: mode(palette.dark),
  };
}
