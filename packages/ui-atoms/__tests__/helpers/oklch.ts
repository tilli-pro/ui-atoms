/** Colour maths for the stylesheet tests: parse an `oklch()` value, test it against sRGB, measure contrast. */
export interface Oklch {
  l: number;
  c: number;
  h: number;
}

const VALUE = /^oklch\((\d*\.?\d+) (\d*\.?\d+) (\d*\.?\d+)\)$/;
const decimals = (text: string) => text.split(".")[1]?.length ?? 0;

/**
 * Parses a token value written to the package standard: `oklch(L C H)` with lightness
 * 0 to 1, at most four decimals of lightness and chroma, and at most two of hue.
 * Returns `undefined` for anything else.
 */
export function parseStandardOklch(value: string): Oklch | undefined {
  const match = VALUE.exec(value.trim());
  if (!match) return;
  const [, l = "", c = "", h = ""] = match;
  if (decimals(l) > 4 || decimals(c) > 4 || decimals(h) > 2) return;
  if (Number(l) > 1) return;
  return { l: Number(l), c: Number(c), h: Number(h) };
}

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

/** Whether the colour exists in sRGB, so that its hex form is exact. */
export function inSrgb(color: Oklch): boolean {
  return toLinearSrgb(color).every((x) => x >= -1e-4 && x <= 1 + 1e-4);
}

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const encode = (x: number) =>
  x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;

export function toHex(color: Oklch): string {
  return `#${toLinearSrgb(color)
    .map((x) =>
      Math.round(encode(clamp(x)) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

function luminance(color: Oklch): number {
  const [r = 0, g = 0, b = 0] = toLinearSrgb(color).map(clamp);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio. */
export function contrast(a: Oklch, b: Oklch): number {
  const [hi = 0, lo = 0] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
