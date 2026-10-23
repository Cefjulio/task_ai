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
