import type { Goal } from '@/types/Goal';
import type { Plan } from '@/types/Plan';
import { stripHtml } from '@/utils/htmlUtils';
import { PLAN_COLOR, goalColorHex } from '@/utils/goalColors';

/** A goal or a plan, shaped for the banner and the daily reminder modal. */
export interface ReminderDisplay {
    key: string; // "goal:<id>" | "plan:<id>"
    kind: 'goal' | 'plan';
    id: string;
    emoji: string;
    title: string;
    /** Rich-text HTML (goal description or plan body); may be empty. */
    html: string;
    /** Plain-text snippet for compact places like the banner. */
    snippet: string;
    color: string; // hex
    targetDate?: string;
}

const snippetOf = (html: string, max = 150): string => {
    const text = stripHtml(html).replace(/\s+/g, ' ').trim();
    return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
};

export const displayFromGoal = (goal: Goal): ReminderDisplay => ({
    key: `goal:${goal.id}`,
    kind: 'goal',
    id: goal.id,
    emoji: goal.emoji || '🎯',
    title: goal.title,
    html: goal.description ?? '',
    snippet: snippetOf(goal.description ?? ''),
    color: goalColorHex(goal.color),
    targetDate: goal.targetDate,
});

export const displayFromPlan = (plan: Plan): ReminderDisplay => ({
    key: `plan:${plan.id}`,
    kind: 'plan',
    id: plan.id,
    emoji: '📝',
    title: plan.title,
    html: plan.content ?? '',
    snippet: snippetOf(plan.content ?? ''),
    color: PLAN_COLOR,
});

/** Active goals first, then every plan — the pool for both the banner and the daily reminder. */
export const buildReminderDisplays = (goals: Goal[], plans: Plan[]): ReminderDisplay[] => [
    ...goals.filter(g => g.status === 'active').map(displayFromGoal),
    ...plans.map(displayFromPlan),
];
