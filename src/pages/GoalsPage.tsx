import React, { useState, useEffect } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Goal, GoalStatus } from '@/types/Goal';
import { Plan } from '@/types/Plan';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Plus, Pencil, Trash2, CheckCircle2, Archive,
    RotateCcw, X, Calendar, Layers, Lightbulb, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { cn } from '@/components/ui/Button';

// ── Preset colors & emojis ──────────────────────────────────────────────────
const PRESET_COLORS = [
    { value: 'bg-violet-500', label: 'Violet' },
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-cyan-500', label: 'Cyan' },
    { value: 'bg-teal-500', label: 'Teal' },
    { value: 'bg-emerald-500', label: 'Emerald' },
    { value: 'bg-amber-500', label: 'Amber' },
    { value: 'bg-orange-500', label: 'Orange' },
    { value: 'bg-rose-500', label: 'Rose' },
    { value: 'bg-pink-500', label: 'Pink' },
    { value: 'bg-indigo-500', label: 'Indigo' },
];

const PRESET_EMOJIS = [
    '🎯', '🚀', '💡', '📚', '💪', '🌟', '🏆', '✨', '🔥', '🌱',
    '💰', '🎨', '🏋️', '🧠', '❤️', '🎵', '🌍', '🤝', '⚡', '🛡️',
];

// ── Status badge helper ──────────────────────────────────────────────────────
const statusConfig: Record<GoalStatus, { label: string; classes: string }> = {
    active:    { label: 'Active',    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
    completed: { label: 'Completed', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
    archived:  { label: 'Archived',  classes: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
};

// ── GoalFormModal ─────────────────────────────────────────────────────────────
interface GoalFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalToEdit?: Goal | null;
}

const GoalFormModal: React.FC<GoalFormModalProps> = ({ isOpen, onClose, goalToEdit }) => {
    const { addGoal, updateGoal, tasks, linkTasksToGoal } = useTaskStore();

    const [title, setTitle]           = useState(goalToEdit?.title ?? '');
    const [description, setDescription] = useState(goalToEdit?.description ?? '');
    const [color, setColor]           = useState(goalToEdit?.color ?? PRESET_COLORS[0].value);
    const [emoji, setEmoji]           = useState(goalToEdit?.emoji ?? PRESET_EMOJIS[0]);
    const [targetDate, setTargetDate] = useState(goalToEdit?.targetDate ?? '');
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

    const dynamicTasks = tasks.filter(t => t.category === 'dynamic');

    useEffect(() => {
        if (isOpen) {
            setTitle(goalToEdit?.title ?? '');
            setDescription(goalToEdit?.description ?? '');
            setColor(goalToEdit?.color ?? PRESET_COLORS[0].value);
            setEmoji(goalToEdit?.emoji ?? PRESET_EMOJIS[0]);
            setTargetDate(goalToEdit?.targetDate ?? '');
            setSelectedTaskIds(goalToEdit ? tasks.filter(t => t.goalId === goalToEdit.id).map(t => t.id) : []);
        }
    }, [isOpen, goalToEdit, tasks]);

    const quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { toast.error('Goal title is required'); return; }

        let goalId = goalToEdit?.id;
        if (goalToEdit) {
            updateGoal(goalToEdit.id, {
                title: title.trim(), description: description.trim(), color, emoji,
                targetDate: targetDate || undefined,
            });
            toast.success('Goal updated!');
        } else {
            goalId = addGoal({
                title: title.trim(), description: description.trim(), color, emoji,
                status: 'active', targetDate: targetDate || undefined,
            });
            toast.success('Goal created! 🎯');
        }

        // Link/Unlink tasks
        if (goalId) {
            linkTasksToGoal(goalId, selectedTaskIds);
        }

        onClose();
    };

    const toggleTaskSelection = (taskId: string) => {
        setSelectedTaskIds(prev =>
            prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        {goalToEdit ? 'Edit Goal' : 'New Goal'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
                    {/* Emoji + Title row */}
                    <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 shrink-0 rounded-2xl ${color} flex items-center justify-center text-2xl shadow-md`}>
                            {emoji}
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                            <input
                                autoFocus
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Get fit by summer"
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm font-semibold"
                            />
                        </div>
                    </div>

                    {/* Emoji picker */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_EMOJIS.map(e => (
                                <button
                                    key={e} type="button" onClick={() => setEmoji(e)}
                                    className={`w-9 h-9 rounded-xl text-lg transition-all flex items-center justify-center ${
                                        emoji === e
                                            ? 'bg-primary/15 ring-2 ring-primary scale-110'
                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color picker */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c.value} type="button" onClick={() => setColor(c.value)}
                                    className={`w-7 h-7 rounded-full transition-transform ${c.value} ${
                                        color === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110 dark:ring-offset-slate-900' : 'hover:scale-110'
                                    }`}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="text-black">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Description <span className="normal-case font-normal text-slate-400">(optional)</span>
                        </label>
                        <div className="bg-slate-50 dark:bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[140px]">
                            <ReactQuill 
                                theme="snow" 
                                value={description} 
                                onChange={setDescription} 
                                modules={quillModules}
                                className="h-24 dark:text-black"
                            />
                        </div>
                    </div>

                    {/* Task Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Associated Dynamic Tasks
                        </label>
                        <div className="max-h-48 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl p-2 space-y-1 custom-scrollbar">
                            {dynamicTasks.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-4">No dynamic tasks available</p>
                            ) : (
                                dynamicTasks.map(t => {
                                    const isSelected = selectedTaskIds.includes(t.id);
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => toggleTaskSelection(t.id)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between",
                                                isSelected 
                                                    ? "bg-primary/10 text-primary font-bold" 
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                            )}
                                        >
                                            <span className="truncate">{t.title}</span>
                                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Target date */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Target Date <span className="normal-case font-normal text-slate-400">(optional)</span>
                        </label>
                        <input
                            type="date"
                            value={targetDate}
                            onChange={e => setTargetDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {goalToEdit ? 'Save Changes' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── GoalCard ──────────────────────────────────────────────────────────────────
interface GoalCardProps {
    goal: Goal;
    taskCount: number;
    onEdit: (goal: Goal) => void;
    onDelete: (goal: Goal) => void;
    onStatusChange: (goal: Goal, status: GoalStatus) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, taskCount, onEdit, onDelete, onStatusChange }) => {
    const status = statusConfig[goal.status];
    const isArchived = goal.status === 'archived';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden ${isArchived ? 'opacity-60' : ''}`}
        >
            {/* Color accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${goal.color} opacity-80`} />

            <div className="p-6 pt-7">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl ${goal.color} flex items-center justify-center text-2xl shadow-md shrink-0`}>
                            {goal.emoji}
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{goal.title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${status.classes}`}>
                                {status.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {goal.description && (
                    <div 
                        className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3 prose prose-sm dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: goal.description }}
                    />
                )}

                {/* Meta row */}
                <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mb-4">
                    <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        {taskCount} task{taskCount !== 1 ? 's' : ''}
                    </span>
                    {goal.targetDate && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(goal.targetDate + 'T00:00:00'), 'MMM d, yyyy')}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={() => onEdit(goal)} title="Edit"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>

                    {goal.status !== 'completed' && (
                        <button onClick={() => onStatusChange(goal, 'completed')} title="Mark completed"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                        </button>
                    )}

                    {goal.status !== 'archived' && (
                        <button onClick={() => onStatusChange(goal, 'archived')} title="Archive"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                            <Archive className="w-3.5 h-3.5" /> Archive
                        </button>
                    )}

                    {goal.status === 'archived' && (
                        <button onClick={() => onStatusChange(goal, 'active')} title="Restore"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                            <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                    )}

                    <button onClick={() => onDelete(goal)} title="Delete"
                        className="ml-auto p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// ── PlanCard ──────────────────────────────────────────────────────────────────
interface PlanCardProps {
    plan: Plan;
    onEdit: (plan: Plan) => void;
    onDelete: (plan: Plan) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onEdit, onDelete }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm hover:shadow-md transition-all group"
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.title}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(plan)} className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(plan)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div 
                className="text-sm text-slate-600 dark:text-slate-400 prose prose-sm dark:prose-invert max-w-none line-clamp-4"
                dangerouslySetInnerHTML={{ __html: plan.content }}
            />
            <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                    Last updated {format(new Date(plan.updatedAt), 'MMM d, h:mm a')}
                </span>
            </div>
        </motion.div>
    );
};

// ── PlanFormModal ─────────────────────────────────────────────────────────────
interface PlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    planToEdit?: Plan | null;
}

const PlanFormModal: React.FC<PlanFormModalProps> = ({ isOpen, onClose, planToEdit }) => {
    const { addPlan, updatePlan } = useTaskStore();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    React.useEffect(() => {
        if (isOpen) {
            setTitle(planToEdit?.title ?? '');
            setContent(planToEdit?.content ?? '');
        }
    }, [isOpen, planToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (planToEdit) {
            updatePlan(planToEdit.id, { title: title.trim(), content });
            toast.success('Plan updated');
        } else {
            addPlan({ title: title.trim(), content });
            toast.success('New plan saved!');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        {planToEdit ? 'Edit Plan' : 'New Plan/Idea'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="What's the idea?"
                            className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary transition-all font-semibold"
                            required
                        />
                    </div>
                    <div className="text-black">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Content</label>
                        <div className="bg-slate-50 dark:bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[300px]">
                            <ReactQuill 
                                theme="snow" 
                                value={content} 
                                onChange={setContent} 
                                className="h-64 dark:text-black"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="flex items-center gap-2 px-8 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-primary/20">
                            <Save className="w-4 h-4" />
                            {planToEdit ? 'Update Plan' : 'Save Plan'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// ── GoalsPage ─────────────────────────────────────────────────────────────────
export const GoalsPage: React.FC = () => {
    const { goals, tasks, plans, updateGoal, deleteGoal, deletePlan } = useTaskStore();

    const [isFormOpen, setFormOpen]     = useState(false);
    const [goalToEdit, setGoalToEdit]   = useState<Goal | null>(null);
    const [filterStatus, setFilterStatus] = useState<GoalStatus | 'all'>('all');

    const [isPlanModalOpen, setPlanModalOpen] = useState(false);
    const [planToEdit, setPlanToEdit] = useState<Plan | null>(null);

    const taskCountForGoal = (goalId: string) =>
        tasks.filter(t => t.goalId === goalId).length;

    const filtered = goals.filter(g => filterStatus === 'all' || g.status === filterStatus);

    const handleEdit = (goal: Goal) => { setGoalToEdit(goal); setFormOpen(true); };
    const handleCreate = () => { setGoalToEdit(null); setFormOpen(true); };

    const handleDelete = (goal: Goal) => {
        if (window.confirm(`Delete "${goal.title}"? This will also unlink it from all tasks.`)) {
            deleteGoal(goal.id);
            toast.success('Goal deleted');
        }
    };

    const handleCreatePlan = () => { setPlanToEdit(null); setPlanModalOpen(true); };
    const handleEditPlan = (plan: Plan) => { setPlanToEdit(plan); setPlanModalOpen(true); };
    const handleDeletePlan = (plan: Plan) => {
        if (window.confirm(`Delete plan "${plan.title}"?`)) {
            deletePlan(plan.id);
            toast.success('Plan deleted');
        }
    };

    const handleStatusChange = (goal: Goal, status: GoalStatus) => {
        updateGoal(goal.id, { status });
        toast.success(`Goal marked as ${status}`);
    };

    const stats = {
        active:    goals.filter(g => g.status === 'active').length,
        completed: goals.filter(g => g.status === 'completed').length,
        archived:  goals.filter(g => g.status === 'archived').length,
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Goals & Plans</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {stats.active} active goals · {plans.length} notes & ideas
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCreatePlan}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0"
                    >
                        <Lightbulb className="w-4 h-4" />
                        New Plan
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        New Goal
                    </button>
                </div>
            </div>

            {/* Status filter pills */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'active', 'completed', 'archived'] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                            filterStatus === s
                                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        {s === 'all' ? `All (${goals.length})` : `${s[0].toUpperCase() + s.slice(1)} (${stats[s as GoalStatus]})`}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-5 text-4xl">
                        🎯
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">No goals yet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
                        Goals help you connect your daily tasks to what truly matters to you.
                    </p>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4" /> Create your first goal
                    </button>
                </div>
            ) : (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filtered.map(goal => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                taskCount={taskCountForGoal(goal.id)}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Plans Section */}
            <div className="pt-12 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Plans & Ideas</h2>
                    </div>
                </div>

                {plans.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500 dark:text-slate-400">No plans or ideas saved yet. Start capturing your thoughts!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {plans.map(plan => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    onEdit={handleEditPlan}
                                    onDelete={handleDeletePlan}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <GoalFormModal isOpen={isFormOpen} onClose={() => setFormOpen(false)} goalToEdit={goalToEdit} />
            <PlanFormModal isOpen={isPlanModalOpen} onClose={() => setPlanModalOpen(false)} planToEdit={planToEdit} />
        </div>
    );
};
