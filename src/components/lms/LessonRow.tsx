import React, { useState } from 'react';
import { Lesson, LessonStatus } from '@/types/Lms';
import { QuillContent } from '@/components/ui/QuillContent';
import { cn } from '@/components/ui/Button';
import {
    ChevronDown, ChevronUp, Pencil, Trash2, ArrowUp, ArrowDown,
    ExternalLink, Eye, EyeOff, CircleDashed, CircleDot, CheckCircle2,
} from 'lucide-react';

interface LessonRowProps {
    lesson: Lesson;
    index: number;
    isFirst: boolean;
    isLast: boolean;
    onEdit: (lesson: Lesson) => void;
    onDelete: (lesson: Lesson) => void;
    onReorder: (id: string, direction: 'up' | 'down') => void;
    onSetStatus: (id: string, status: LessonStatus) => void;
    forceExpanded?: boolean;
}

const STATUS_META: Record<LessonStatus, { label: string; color: string; icon: React.ReactNode }> = {
    not_started: { label: 'Not Started', color: '#94a3b8', icon: <CircleDashed className="w-3.5 h-3.5" /> },
    in_progress: { label: 'In Progress', color: '#f59e0b', icon: <CircleDot className="w-3.5 h-3.5" /> },
    completed: { label: 'Completed', color: '#10b981', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

export const LessonRow: React.FC<LessonRowProps> = ({
    lesson, index, isFirst, isLast, onEdit, onDelete, onReorder, onSetStatus, forceExpanded,
}) => {
    const [expanded, setExpanded] = useState(!!forceExpanded);
    const [showEmbed, setShowEmbed] = useState(false);
    const meta = STATUS_META[lesson.status];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header row */}
            <div
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none"
                onClick={() => setExpanded(v => !v)}
            >
                <span className="text-xs font-black text-slate-300 dark:text-slate-600 w-5 shrink-0 text-center">
                    {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                    <QuillContent html={lesson.title} className="!p-0 text-sm font-bold text-slate-800 dark:text-slate-100 [&_p]:m-0 truncate" />
                </div>

                <span
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shrink-0"
                    style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                >
                    {meta.icon}
                    {meta.label}
                </span>

                <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => onReorder(lesson.id, 'up')}
                        disabled={isFirst}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-25 disabled:hover:text-slate-400 rounded-lg transition-colors"
                        title="Move up"
                    >
                        <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onReorder(lesson.id, 'down')}
                        disabled={isLast}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-25 disabled:hover:text-slate-400 rounded-lg transition-colors"
                        title="Move down"
                    >
                        <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onEdit(lesson)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit lesson"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(lesson)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete lesson"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setExpanded(v => !v)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                    >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Expanded body */}
            {expanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <span
                        className="sm:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider"
                        style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                    >
                        {meta.icon}
                        {meta.label}
                    </span>

                    {lesson.content && (
                        <QuillContent html={lesson.content} className="!p-0 text-sm text-slate-600 dark:text-slate-300" />
                    )}

                    {/* Resource panel */}
                    {lesson.resourceUrl && (
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <a
                                    href={lesson.resourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white text-xs font-extrabold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Open in Notebook LM
                                </a>
                                <button
                                    onClick={() => setShowEmbed(v => !v)}
                                    className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {showEmbed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    {showEmbed ? 'Hide preview' : 'Try inline preview'}
                                </button>
                            </div>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                NotebookLM often blocks embedding, so the button above is the reliable way in — the inline preview is a bonus that may show blank.
                            </p>
                            {showEmbed && (
                                <iframe
                                    src={lesson.resourceUrl}
                                    className="w-full h-96 rounded-xl border border-slate-200 dark:border-slate-700 bg-white"
                                    title={`Resource for lesson ${index + 1}`}
                                />
                            )}
                        </div>
                    )}

                    {/* Status control */}
                    <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Progress</p>
                        <div className="flex gap-2">
                            {(Object.keys(STATUS_META) as LessonStatus[]).map(s => (
                                <button
                                    key={s}
                                    onClick={() => onSetStatus(lesson.id, s)}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2',
                                        lesson.status === s ? 'text-white shadow-md' : 'bg-transparent opacity-60 hover:opacity-90'
                                    )}
                                    style={{
                                        backgroundColor: lesson.status === s ? STATUS_META[s].color : `${STATUS_META[s].color}18`,
                                        borderColor: STATUS_META[s].color,
                                        color: lesson.status === s ? '#fff' : STATUS_META[s].color,
                                    }}
                                >
                                    {STATUS_META[s].icon}
                                    {STATUS_META[s].label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
