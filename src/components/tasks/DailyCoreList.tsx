import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { SubStep, Task } from '@/types/Task';
import { useTasks } from '@/hooks/useTasks';
import { useDynamicViewStore } from '@/store/dynamicViewStore';
import { getTaskStatusForDate } from '@/utils/taskHelpers';
import { cn } from '@/components/ui/Button';
import { TaskRow } from './TaskRow';
import { FocusStepRow } from './FocusStepRow';
import { ChevronDown, EyeOff, Target } from 'lucide-react';

/** Slots in the Focus lane — whole tasks and single sub-steps share them. */
export const MAX_FOCUS = 3;

interface DailyCoreListProps {
    /** The day's core tasks after the search / tag filters. */
    tasks: Task[];
    /** The day's core tasks without filters — a Focus pick is deliberate, so filters never hide it. */
    allDue: Task[];
    date: string;
    onEdit: (task: Task) => void;
    emptyMessage: string;
}

/** Daily Core as: a Focus lane (max 3 tasks/steps) → the remaining tasks as compact rows → a collapsed Done list. */
export const DailyCoreList: React.FC<DailyCoreListProps> = ({ tasks, allDue, date, onEdit, emptyMessage }) => {
    const { updateTask, toggleSubStep } = useTasks();
    const focusMode = useDynamicViewStore(s => s.focusMode);
    const [showRest, setShowRest] = useState(false);
    const [showDone, setShowDone] = useState(false);

    const statusOf = (t: Task) => getTaskStatusForDate(t, date);

    // Whole tasks in Focus…
    const focusTasks = allDue.filter(t => t.focusDate === date);
    const focusIds = new Set(focusTasks.map(t => t.id));
    // …and single sub-steps in Focus (a task that is itself in Focus already covers its steps)
    const focusSteps = allDue.flatMap(t =>
        focusIds.has(t.id) ? [] : t.subSteps.filter(s => s.focusDate === date).map(step => ({ task: t, step }))
    );

    const focusCount = focusTasks.length + focusSteps.length;
    const focusDone =
        focusTasks.filter(t => statusOf(t) === 'done').length + focusSteps.filter(f => f.step.status === 'done').length;
    const focusResolved =
        focusCount > 0 &&
        focusTasks.every(t => statusOf(t) !== 'pending') &&
        focusSteps.every(f => f.step.status === 'done');
    const firstOpenFocusId = focusTasks.find(t => statusOf(t) === 'pending')?.id;
    const canAddFocus = focusCount < MAX_FOCUS;

    const rest = tasks.filter(t => !focusIds.has(t.id));
    const pendingRest = rest.filter(t => statusOf(t) === 'pending');
    const doneRest = rest.filter(t => statusOf(t) === 'done');

    // Focus mode: park everything else until the Focus items are finished (or you peek)
    const hideRest = focusMode && focusCount > 0 && !focusResolved && !showRest;

    const withoutStepFocus = (steps: SubStep[]): SubStep[] =>
        steps.map(s => {
            if (s.focusDate !== date) return s;
            const { focusDate, ...plain } = s;
            return plain;
        });

    const toggleFocus = (task: Task) => {
        if (task.focusDate === date) {
            updateTask(task.id, { focusDate: undefined });
            return;
        }
        // Focusing the whole task absorbs any of its own steps that were already in the lane
        const absorbed = task.subSteps.filter(s => s.focusDate === date).length;
        if (focusCount - absorbed < MAX_FOCUS) {
            updateTask(task.id, {
                focusDate: date,
                ...(absorbed > 0 ? { subSteps: withoutStepFocus(task.subSteps) } : {}),
            });
        } else {
            toast.error(`Focus is full — remove one first (max ${MAX_FOCUS})`);
        }
    };

    const setStepFocus = (task: Task, step: SubStep, focused: boolean) => {
        updateTask(task.id, {
            subSteps: task.subSteps.map(s => {
                if (s.id !== step.id) return s;
                if (focused) return { ...s, focusDate: date };
                const { focusDate, ...plain } = s;
                return plain;
            }),
        });
    };

    const toggleStepFocus = (task: Task, step: SubStep) => {
        if (step.focusDate === date) setStepFocus(task, step, false);
        else if (canAddFocus) setStepFocus(task, step, true);
        else toast.error(`Focus is full — remove one first (max ${MAX_FOCUS})`);
    };

    const renderRow = (task: Task, defaultExpanded = false) => (
        <TaskRow
            key={task.id}
            task={task}
            onEdit={onEdit}
            isFocus={focusIds.has(task.id)}
            canAddFocus={canAddFocus}
            onToggleFocus={() => toggleFocus(task)}
            onToggleStepFocus={(step) => toggleStepFocus(task, step)}
            defaultExpanded={defaultExpanded}
        />
    );

    if (tasks.length === 0 && focusCount === 0) {
        return (
            <div className="flex h-full flex-col justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center dark:border-slate-700">
                <p className="font-medium text-slate-500 dark:text-slate-400">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* ── Focus lane ── */}
            <section aria-label="Today's Focus" className="space-y-2.5 rounded-3xl border border-primary/30 bg-primary/5 p-3 dark:bg-primary/10">
                <header className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-extrabold uppercase tracking-widest text-primary">Focus</h3>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {focusDone}/{focusCount || MAX_FOCUS}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5" aria-hidden>
                        {Array.from({ length: MAX_FOCUS }, (_, i) => (
                            <span
                                key={i}
                                className={cn(
                                    'h-2.5 w-2.5 rounded-full border-2',
                                    i < focusDone
                                        ? 'border-emerald-500 bg-emerald-500'
                                        : i < focusCount
                                            ? 'border-primary bg-primary'
                                            : 'border-slate-300 dark:border-slate-600'
                                )}
                            />
                        ))}
                    </div>
                </header>

                {focusCount === 0 ? (
                    <p className="rounded-2xl border border-dashed border-primary/30 px-4 py-5 text-center text-sm text-slate-500 dark:text-slate-400">
                        Pick up to {MAX_FOCUS} tasks — or single sub-steps — to focus on today. Tap the ☆ on a task, or open it and tap the ☆ on a step.
                    </p>
                ) : (
                    <>
                        {/* Work on one at a time: only the first unfinished Focus task starts open */}
                        {focusTasks.map(t => renderRow(t, t.id === firstOpenFocusId))}
                        {focusSteps.map(({ task, step }) => (
                            <FocusStepRow
                                key={`${task.id}:${step.id}`}
                                task={task}
                                step={step}
                                onToggleStep={() => toggleSubStep(task.id, step.id)}
                                onRemove={() => setStepFocus(task, step, false)}
                            />
                        ))}
                    </>
                )}

                {focusResolved && (
                    <p className="px-1 text-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        Focus complete — nice work! 🎉
                    </p>
                )}
            </section>

            {/* ── The rest ── */}
            {hideRest ? (
                <button
                    onClick={() => setShowRest(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-bold text-slate-500 transition-colors hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-400"
                >
                    <EyeOff className="h-4 w-4" />
                    {pendingRest.length} more {pendingRest.length === 1 ? 'task' : 'tasks'} hidden while you focus · Show
                </button>
            ) : (
                <>
                    {pendingRest.length > 0 && (
                        <section className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                                    Core · {pendingRest.length} left
                                </h3>
                                {focusMode && showRest && !focusResolved && (
                                    <button
                                        onClick={() => setShowRest(false)}
                                        className="text-xs font-bold text-slate-400 hover:text-primary"
                                    >
                                        Hide again
                                    </button>
                                )}
                            </div>
                            {pendingRest.map(t => renderRow(t))}
                        </section>
                    )}

                    {doneRest.length > 0 && (
                        <section className="space-y-2">
                            <button
                                onClick={() => setShowDone(v => !v)}
                                aria-expanded={showDone}
                                className="flex w-full items-center gap-2 px-1 text-xs font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <ChevronDown className={cn('h-4 w-4 transition-transform', !showDone && '-rotate-90')} />
                                Done · {doneRest.length}
                            </button>
                            {showDone && doneRest.map(t => renderRow(t))}
                        </section>
                    )}
                </>
            )}
        </div>
    );
};
