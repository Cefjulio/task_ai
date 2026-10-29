const TAILWIND_HEX: Record<string, string> = {
    violet: '#8b5cf6',
    blue: '#3b82f6',
    cyan: '#06b6d4',
    teal: '#14b8a6',
    emerald: '#10b981',
    amber: '#f59e0b',
    orange: '#f97316',
    rose: '#f43f5e',
    pink: '#ec4899',
    indigo: '#6366f1',
};

export const PLAN_COLOR = '#6366f1';

/** Goals store a Tailwind class ("bg-violet-500"); gradients need an actual colour. */
export function goalColorHex(tailwindClass?: string): string {
    const match = /bg-([a-z]+)-\d+/.exec(tailwindClass ?? '');
    return (match && TAILWIND_HEX[match[1]]) || TAILWIND_HEX.violet;
}
