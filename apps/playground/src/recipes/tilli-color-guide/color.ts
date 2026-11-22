/**
 * OKLCH is the source of truth for every colour in the guide; hex is derived from it here,
 * never the other way round. Values are written with at most four decimals of lightness
 * and chroma and two of hue, which is enough to land on one exact 8-bit sRGB colour.
 */
export interface Oklch {
  /** Lightness, 0 to 1. */
  l: number;
  /** Chroma, 0 to about 0.4. */
  c: number;
  /** Hue in degrees. */
  h: number;
}

export const oklch = (l: number, c: number, h: number): Oklch => ({ l, c, h });

const trim = (value: number, decimals: number) =>
  String(Number(value.toFixed(decimals)));

/** The CSS form, e.g. `oklch(0.5502 0.2319 266.12)`. */
export function formatOklch({ l, c, h }: Oklch): string {
  return `oklch(${trim(l, 4)} ${trim(c, 4)} ${trim(h, 2)})`;
}

/** Linear-light sRGB channels, unclamped, so out-of-gamut values are visible. */
function toLinearSrgb({ l, c, h }: Oklch): [number, number, number] {
  const hue = (h * Math.PI) / 180;
  const a = c * Math.cos(hue);
  const b = c * Math.sin(hue);
  const lp = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mp = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sp = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp,
    -1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp,
    -0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp,
  ];
}

const GAMUT_TOLERANCE = 1e-4;

/** Whether the colour exists in sRGB, i.e. its hex is exact and not a clipped stand-in. */
export function inSrgb(color: Oklch): boolean {
  return toLinearSrgb(color).every(
    (channel) => channel >= -GAMUT_TOLERANCE && channel <= 1 + GAMUT_TOLERANCE,
  );
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const encode = (channel: number) =>
  channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;

export function toHex(color: Oklch): string {
  return `#${toLinearSrgb(color)
    .map((channel) =>
      Math.round(encode(clamp(channel)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function luminance(color: Oklch): number {
  const [r, g, b] = toLinearSrgb(color).map(clamp) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two colours, 1 to 21. */
export function contrast(a: Oklch, b: Oklch): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}
