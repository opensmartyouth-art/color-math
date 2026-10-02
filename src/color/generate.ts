// Palette generator. Every constant comes from the Notion 「Color 관계」 study
// (08 · 생성기), measured across 14 shipped design systems.
import { hexToOklch, oklchToHex } from './convert';

export const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
export const FAMILIES = ['primary', 'gray', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const;

export type Step = (typeof STEPS)[number];
export type Family = (typeof FAMILIES)[number];
export type Mode = 'light' | 'dark';
export type Scale = Record<Family, string[]>;

export type Palette = {
  primary: string;
  anchor: Step;
  torsion: number; // primary hue rotation, degrees per step
  light: Scale;
  dark: Scale;
};

// 02 · lightness ladder (okL median of 10-step systems)
const LADDER = [98.5, 90.2, 81.9, 73.6, 65.3, 57.0, 48.4, 39.8, 31.2, 22.6];
// 03 · chroma arcs (max = 1.0)
const PRIMARY_ARC = [0.081, 0.252, 0.427, 0.625, 0.833, 0.932, 0.924, 0.797, 0.605, 0.407];
const NEUTRAL_ARC = [0.03, 0.332, 0.563, 0.746, 0.874, 0.949, 0.98, 0.891, 0.766, 0.598];
// 01 · gray hue (median of 14 systems) and default tint ("tinted")
const GRAY_HUE = 263.3;
const GRAY_TINT = 0.018;
// 05 · semantic hues, 03 · hue torsion per step
const SEMANTIC = {
  red: { hue: 26.7, torsion: 0.9 },
  orange: { hue: 49.3, torsion: -4.32 },
  yellow: { hue: 90.9, torsion: -2.21 },
  green: { hue: 154.7, torsion: -0.19 },
  blue: { hue: 259.1, torsion: 1.44 },
  purple: { hue: 303.1, torsion: -0.67 },
} as const;
// 04 · okL_light + okL_dark ≈ 122.4
const DARK_LIFT = 122.4;
const SEMANTIC_ANCHOR = 5; // semantic hues are measured at step 500

function anchorIndex(l: number): number {
  let nearest = 0;
  LADDER.forEach((step, i) => {
    if (Math.abs(step - l) < Math.abs(LADDER[nearest] - l)) nearest = i;
  });
  return nearest === 4 || nearest === 6 ? SEMANTIC_ANCHOR : nearest;
}

// Torsion for any hue: circular linear interpolation between the six measured families.
function torsionFor(hue: number): number {
  const points = Object.values(SEMANTIC);
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const span = (b.hue - a.hue + 360) % 360;
    const offset = (hue - a.hue + 360) % 360;
    if (offset <= span) return a.torsion + ((b.torsion - a.torsion) * offset) / span;
  }
  return 0; // unreachable: the six points cover the full circle
}

// Anchor step takes the input lightness; each side is linearly re-interpolated.
function primaryLadder(l: number, anchor: number): number[] {
  return LADDER.map((_, i) => {
    if (i < anchor) return LADDER[0] + ((l - LADDER[0]) * i) / anchor;
    if (i > anchor) return l + ((LADDER[9] - l) * (i - anchor)) / (9 - anchor);
    return l;
  });
}

export function generatePalette(primary: string): Palette {
  const input = hexToOklch(primary);
  const anchor = anchorIndex(input.l);
  const torsion = torsionFor(input.h);
  const peak = input.c / PRIMARY_ARC[anchor]; // chroma budget shared with semantic colors
  const ladder = primaryLadder(input.l, anchor);

  const light = {
    primary: LADDER.map((_, i) =>
      i === anchor ? primary : oklchToHex(ladder[i], peak * PRIMARY_ARC[i], input.h + torsion * (i - anchor)),
    ),
    gray: LADDER.map((l, i) => oklchToHex(l, GRAY_TINT * NEUTRAL_ARC[i], GRAY_HUE)),
  } as Scale;
  for (const [family, { hue, torsion: k }] of Object.entries(SEMANTIC)) {
    light[family as Family] = LADDER.map((l, i) =>
      oklchToHex(l, peak * PRIMARY_ARC[i], hue + k * (i - SEMANTIC_ANCHOR)),
    );
  }

  const dark = {} as Scale;
  for (const family of FAMILIES) {
    dark[family] = light[family].map((hex) => {
      const { l, c, h } = hexToOklch(hex);
      return oklchToHex(Math.min(97, Math.max(6, DARK_LIFT - l)), c, h);
    });
  }

  return { primary, anchor: STEPS[anchor], torsion, light, dark };
}
