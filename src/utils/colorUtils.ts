/** Hue (0–360) of a #rgb / #rrggbb colour, or null if it can't be parsed. */
export function hueOf(hex: string): number | null {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
    if (!match) return null;

    let digits = match[1];
    if (digits.length === 3) digits = digits.split('').map(c => c + c).join('');

    const value = parseInt(digits, 16);
    const r = ((value >> 16) & 255) / 255;
    const g = ((value >> 8) & 255) / 255;
    const b = (value & 255) / 255;
    const max = Math.max(r, g, b);
    const delta = max - Math.min(r, g, b);
    if (delta === 0) return 0;

    let hue: number;
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;

    return (hue * 60 + 360) % 360;
}

/** Lighten (positive) or darken (negative) a #rgb / #rrggbb colour by a percentage (-100..100). */
export function shadeHex(hex: string, percent: number): string {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
    if (!match) return hex;

    let digits = match[1];
    if (digits.length === 3) digits = digits.split('').map(c => c + c).join('');

    const value = parseInt(digits, 16);
    const target = percent < 0 ? 0 : 255;
    const amount = Math.abs(percent) / 100;
    const channel = (shift: number) => {
        const current = (value >> shift) & 255;
        return Math.round(current + (target - current) * amount);
    };

    return `#${[16, 8, 0].map(shift => channel(shift).toString(16).padStart(2, '0')).join('')}`;
}
