import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import { Task, TaskPriority, TaskFrequency } from '@/types/Task';
import { useTaskStore } from '@/store/taskStore';
import { useTasks } from '@/hooks/useTasks';
import { X, Target, Zap, Shuffle, Star, AlignLeft, Tag, Repeat } from 'lucide-react';
import toast from 'react-hot-toast';
import { isQuillEmpty, parseListItems, toQuillBulletList } from '@/utils/htmlUtils';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskToEdit?: Task | null;
    defaultCategory?: 'dynamic' | 'random';
}

// Quill toolbar configs
const TOOLBAR_FULL = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
];
const TOOLBAR_LIST = [
    [{ list: 'bullet' }, { list: 'ordered' }],
    ['bold', 'italic'],
    ['clean'],
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, taskToEdit, defaultCategory = 'dynamic' }) => {
    const { addTask, updateTask } = useTasks();
    const { tags, goals } = useTaskStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subStepsHtml, setSubStepsHtml] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('secondary');
    const [category, setCategory] = useState<'dynamic' | 'random'>(defaultCategory);
    const [frequency, setFrequency] = useState<TaskFrequency | undefined>(undefined);
    const [frequencyInterval, setFrequencyInterval] = useState<number>(1);
    const [weekDays, setWeekDays] = useState<number[]>([]);
    const [weekInterval, setWeekInterval] = useState<number>(1);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedGoalId, setSelectedGoalId] = useState<string>('');

    const days = [
        { label: 'S', value: 0 }, { label: 'M', value: 1 }, { label: 'T', value: 2 },
        { label: 'W', value: 3 }, { label: 'T', value: 4 }, { label: 'F', value: 5 },
        { label: 'S', value: 6 },
    ];

    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description || '');
            setPriority(taskToEdit.priority);
            setCategory(taskToEdit.category);
            setFrequency(taskToEdit.frequency);
            setFrequencyInterval(taskToEdit.frequencyInterval || 1);
            setWeekDays(taskToEdit.weekDays || []);
            setWeekInterval(taskToEdit.weekInterval || 1);
            setSubStepsHtml(
                taskToEdit.subSteps.length > 0
                    ? toQuillBulletList(taskToEdit.subSteps.map(s => s.text))
                    : ''
            );
            setSelectedTags(taskToEdit.tags || []);
            setSelectedGoalId(taskToEdit.goalId || '');
        } else {
            setTitle('');
            setDescription('');
            setCategory(defaultCategory);
            setPriority(defaultCategory === 'dynamic' ? 'primary' : 'middle');
            setFrequency(undefined);
            setFrequencyInterval(1);
            setWeekDays([]);
            setWeekInterval(1);
            setSubStepsHtml('');
            setSelectedTags([]);
            setSelectedGoalId('');
        }
    }, [taskToEdit, isOpen, defaultCategory]);

    if (!isOpen) return null;

    const toggleDay = (day: number) => {
        setWeekDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };
    const toggleTag = (tagId: string) => {
        setSelectedTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (priority === 'primary' && frequency === 'weekly' && weekDays.length === 0) {
            toast.error('Please select at least one day');
            return;
        }

        // Parse sub-steps: extract each <li> text → sub-step item
        const parsedSubSteps = parseListItems(subStepsHtml).map(text => {
            const existing = taskToEdit?.subSteps.find(s => s.text === text);
            return existing ?? { id: crypto.randomUUID(), text, status: 'pending' as const };
        });

        const descriptionValue = isQuillEmpty(description) ? '' : description;

        if (taskToEdit) {
            updateTask(taskToEdit.id, {
                title,
                description: descriptionValue,
                priority,
                category,
                tags: selectedTags,
                goalId: selectedGoalId || undefined,
                subSteps: parsedSubSteps,
                frequency: priority === 'primary' ? frequency : undefined,
                frequencyInterval: priority === 'primary' && frequency === 'every_x_days' ? frequencyInterval : undefined,
                weekDays: priority === 'primary' && frequency === 'weekly' ? weekDays : undefined,
                weekInterval: priority === 'primary' && frequency === 'weekly' ? weekInterval : undefined,
            });
            toast.success('Task updated!');
        } else {
            addTask({
                title,
                description: descriptionValue,
                priority,
                category,
                tags: selectedTags,
                goalId: selectedGoalId || undefined,
                subSteps: parsedSubSteps,
                frequency: priority === 'primary' ? (frequency || 'daily') : undefined,
                frequencyInterval: priority === 'primary' && frequency === 'every_x_days' ? frequencyInterval : 1,
                weekDays: priority === 'primary' && frequency === 'weekly' ? weekDays : [],
                weekInterval: priority === 'primary' && frequency === 'weekly' ? weekInterval : 1,
            });
            toast.success('Task created! 🎉');
        }
        onClose();
    };

    const priorityOptions = category === 'dynamic'
        ? [
            { value: 'primary',   label: 'Primary',   icon: <Star className="w-3.5 h-3.5" />,     activeBg: 'bg-amber-500 border-amber-600 text-white',  inactiveBg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-500' },
            { value: 'secondary', label: 'Secondary',  icon: <Zap className="w-3.5 h-3.5" />,      activeBg: 'bg-primary border-primary-dark text-white',  inactiveBg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-primary' },
            { value: 'tertiary',  label: 'Tertiary',   icon: <AlignLeft className="w-3.5 h-3.5" />, activeBg: 'bg-slate-500 border-slate-600 text-white',   inactiveBg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400' },
        ]
        : [
            { value: 'high',   label: 'High',   icon: <Star className="w-3.5 h-3.5" />,     activeBg: 'bg-rose-500 border-rose-600 text-white',     inactiveBg: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-500' },
            { value: 'middle', label: 'Middle',  icon: <Zap className="w-3.5 h-3.5" />,      activeBg: 'bg-orange-500 border-orange-600 text-white',  inactiveBg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-500' },
            { value: 'low',    label: 'Low',     icon: <Shuffle className="w-3.5 h-3.5" />,  activeBg: 'bg-slate-500 border-slate-600 text-white',   inactiveBg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400' },
        ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-lg sm:mx-4 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
                style={{ maxHeight: '92dvh' }}
                role="dialog"
                aria-modal="true"
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
                            <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                            {taskToEdit ? 'Edit Task' : 'New Task'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <div className="modal-body-scroll flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar">

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Task Title</label>
                        <input
                            autoFocus
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-base"
                            placeholder="e.g. Read 10 pages"
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Priority</label>
                        <div className="grid grid-cols-3 gap-2">
                            {priorityOptions.map((p) => {
                                const isActive = priority === p.value;
                                return (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() => setPriority(p.value as TaskPriority)}
                                        className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl text-xs font-extrabold border-2 border-b-4 transition-all duration-150 ${isActive ? `${p.activeBg} scale-105 shadow-md` : p.inactiveBg}`}
                                    >
                                        {p.icon}
                                        <span>{p.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Frequency (primary only) */}
                    {priority === 'primary' && (
                        <div className="p-3.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-2xl space-y-3">
                            <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary dark:text-primary-light">
                                <Repeat className="w-3.5 h-3.5" /> Frequency
                            </label>
                            <select
                                value={frequency || 'daily'}
                                onChange={e => setFrequency(e.target.value as TaskFrequency)}
                                className="w-full rounded-xl border-2 border-primary/20 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="daily">Every Day</option>
                                <option value="every_x_days">Every X Days</option>
                                <option value="weekly">Specific Days / Weekly</option>
                            </select>
                            {frequency === 'every_x_days' && (
                                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                                    <input
                                        type="number" min="1" value={frequencyInterval}
                                        onChange={e => setFrequencyInterval(parseInt(e.target.value) || 1)}
                                        className="w-20 rounded-xl border-2 border-primary/20 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <span className="text-sm font-semibold text-slate-500">days between</span>
                                </div>
                            )}
                            {frequency === 'weekly' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                                    <div>
                                        <p className="text-xs font-bold text-primary/70 mb-2 uppercase tracking-wider">Repeat on</p>
                                        <div className="flex justify-between gap-1">
                                            {days.map(day => (
                                                <button
                                                    key={day.value} type="button" onClick={() => toggleDay(day.value)}
                                                    className={`w-9 h-9 rounded-full text-xs font-extrabold border-b-4 transition-all ${weekDays.includes(day.value) ? 'bg-primary border-primary-dark text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 hover:border-primary/40'}`}
                                                >
                                                    {day.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <select
                                        value={weekInterval} onChange={e => setWeekInterval(parseInt(e.target.value))}
                                        className="w-full rounded-xl border-2 border-primary/20 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value={1}>Every week</option>
                                        <option value={2}>Every other week</option>
                                        <option value={3}>Every 3 weeks</option>
                                        <option value={4}>Every 4 weeks</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Goal selector */}
                    {goals.filter(g => g.status === 'active').length > 0 && (
                        <div>
                            <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                                <Target className="w-3.5 h-3.5 text-primary" /> Goal
                                <span className="text-slate-300 dark:text-slate-600 font-normal normal-case tracking-normal text-xs">optional</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => setSelectedGoalId('')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 border-b-4 transition-all ${!selectedGoalId ? 'bg-slate-700 border-slate-800 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                                    None
                                </button>
                                {goals.filter(g => g.status === 'active').map(goal => (
                                    <button key={goal.id} type="button" onClick={() => setSelectedGoalId(goal.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 border-b-4 flex items-center gap-1.5 transition-all ${selectedGoalId === goal.id ? `${goal.color} text-white shadow-sm` : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                        <span>{goal.emoji}</span><span>{goal.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div>
                            <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                                <Tag className="w-3.5 h-3.5" /> Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => {
                                    const isSelected = selectedTags.includes(tag.id);
                                    return (
                                        <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 border-b-4 transition-all ${isSelected ? `${tag.color} text-white` : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                            {tag.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Description — rich text */}
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                            Description <span className="text-slate-300 dark:text-slate-600 font-normal normal-case tracking-normal">optional</span>
                        </label>
                        <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <ReactQuill
                                theme="snow"
                                value={description}
                                onChange={setDescription}
                                modules={{ toolbar: TOOLBAR_FULL }}
                                placeholder="Any extra context… supports bold, color, lists…"
                            />
                        </div>
                    </div>

                    {/* Sub-steps — rich list editor */}
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                            Sub-steps <span className="text-slate-300 dark:text-slate-600 font-normal normal-case tracking-normal">use bullet list, one per item</span>
                        </label>
                        <div className="ql-editor-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <ReactQuill
                                theme="snow"
                                value={subStepsHtml}
                                onChange={setSubStepsHtml}
                                modules={{ toolbar: TOOLBAR_LIST }}
                                placeholder="• Step 1   • Step 2   • Step 3…"
                            />
                        </div>
                    </div>

                    <div className="h-1" />
                </div>

                {/* ── Sticky footer ── */}
                <div className="shrink-0 px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-3xl">
                    <div className="flex gap-3">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 h-12 rounded-2xl border-2 border-b-4 border-slate-200 dark:border-slate-700 font-extrabold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:border-b-2 active:translate-y-0.5"
                        >
                            Cancel
                        </button>
                        <button
                            type="button" onClick={handleSubmit}
                            className="flex-[2] h-12 rounded-2xl bg-primary border-b-4 border-primary-dark text-white font-extrabold hover:brightness-105 transition-all active:border-b-2 active:translate-y-0.5 shadow-lg shadow-primary/30"
                        >
                            {taskToEdit ? 'Save Changes' : 'Create Task ✓'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
