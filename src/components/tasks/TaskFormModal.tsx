import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskFrequency } from '@/types/Task';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskToEdit?: Task | null;
    defaultCategory?: 'dynamic' | 'random';
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, taskToEdit, defaultCategory = 'dynamic' }) => {
    const { addTask, updateTask } = useTasks();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('secondary');
    const [category, setCategory] = useState<'dynamic' | 'random'>(defaultCategory);
    const [frequency, setFrequency] = useState<TaskFrequency | undefined>(undefined);
    const [frequencyInterval, setFrequencyInterval] = useState<number>(1);
    const [weekDays, setWeekDays] = useState<number[]>([]);
    const [weekInterval, setWeekInterval] = useState<number>(1);
    const [subStepsText, setSubStepsText] = useState('');

    const days = [
        { label: 'S', value: 0 },
        { label: 'M', value: 1 },
        { label: 'T', value: 2 },
        { label: 'W', value: 3 },
        { label: 'T', value: 4 },
        { label: 'F', value: 5 },
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
            setSubStepsText(taskToEdit.subSteps.map(s => s.text).join('\n'));
        } else {
            setTitle('');
            setDescription('');
            setCategory(defaultCategory);
            setPriority(defaultCategory === 'dynamic' ? 'primary' : 'middle');
            setFrequency(undefined);
            setFrequencyInterval(1);
            setWeekDays([]);
            setWeekInterval(1);
            setSubStepsText('');
        }
    }, [taskToEdit, isOpen, defaultCategory]);

    if (!isOpen) return null;

    const toggleDay = (day: number) => {
        setWeekDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        const finalPriority = priority;

        if (finalPriority === 'primary' && frequency === 'weekly' && weekDays.length === 0) {
            toast.error('Please select at least one day');
            return;
        }

        // Parse sub-steps from multiline text
        const parsedSubSteps = subStepsText
            .split('\n')
            .map(t => t.trim())
            .filter(t => t.length > 0)
            .map(text => ({ id: crypto.randomUUID(), text, status: 'pending' as const }));

        if (taskToEdit) {
            updateTask(taskToEdit.id, {
                title,
                description,
                priority: finalPriority,
                category,
                frequency: finalPriority === 'primary' ? frequency : undefined,
                frequencyInterval: finalPriority === 'primary' && frequency === 'every_x_days' ? frequencyInterval : undefined,
                weekDays: finalPriority === 'primary' && frequency === 'weekly' ? weekDays : undefined,
                weekInterval: finalPriority === 'primary' && frequency === 'weekly' ? weekInterval : undefined,
            });
            toast.success('Task Updated');
        } else {
            addTask({
                title,
                description,
                priority: finalPriority,
                category,
                subSteps: parsedSubSteps,
                frequency: finalPriority === 'primary' ? (frequency || 'daily') : undefined,
                frequencyInterval: finalPriority === 'primary' && frequency === 'every_x_days' ? frequencyInterval : 1,
                weekDays: finalPriority === 'primary' && frequency === 'weekly' ? weekDays : [],
                weekInterval: finalPriority === 'primary' && frequency === 'weekly' ? weekInterval : 1,
            });
            toast.success('Task Created');
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-slate-900/50 backdrop-blur-sm transition-opacity p-4">
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200"
                role="dialog"
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-semibold dark:text-white">
                        {taskToEdit ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                        <input
                            autoFocus
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Read 10 pages"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none h-20"
                            placeholder="Any extra context..."
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {(category === 'dynamic'
                            ? ['primary', 'secondary', 'tertiary']
                            : ['high', 'middle', 'low']
                        ).map((p) => (
                            <div
                                key={p}
                                onClick={() => setPriority(p as TaskPriority)}
                                className={`text-center py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300 border shadow-sm ${priority === p
                                    ? 'border-primary bg-primary/10 text-primary-dark dark:text-primary scale-105'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <span className="capitalize">{p}</span>
                            </div>
                        ))}
                    </div>

                    {priority === 'primary' && (
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-primary-dark dark:text-primary-light mb-1.5 opacity-70">Frequency</label>
                                <select
                                    value={frequency || 'daily'}
                                    onChange={e => setFrequency(e.target.value as TaskFrequency)}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="daily">Every Day</option>
                                    <option value="every_x_days">Every X Days</option>
                                    <option value="weekly">Specific Days / Weekly</option>
                                </select>
                            </div>

                            {frequency === 'every_x_days' && (
                                <div className="pt-1 animate-in fade-in slide-in-from-top-1">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-primary-dark dark:text-primary-light mb-1.5 opacity-70">Every how many days?</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            value={frequencyInterval}
                                            onChange={e => setFrequencyInterval(parseInt(e.target.value) || 1)}
                                            className="w-20 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                                        />
                                        <span className="text-sm text-slate-500 font-medium">days</span>
                                    </div>
                                </div>
                            )}

                            {frequency === 'weekly' && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-primary-dark dark:text-primary-light mb-2 opacity-70">Repeat on</label>
                                        <div className="flex justify-between gap-1">
                                            {days.map(day => (
                                                <button
                                                    key={day.value}
                                                    type="button"
                                                    onClick={() => toggleDay(day.value)}
                                                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all border ${weekDays.includes(day.value)
                                                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                                        }`}
                                                >
                                                    {day.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-1">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-primary-dark dark:text-primary-light mb-1.5 opacity-70">Repeat every</label>
                                        <select
                                            value={weekInterval}
                                            onChange={e => setWeekInterval(parseInt(e.target.value))}
                                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            <option value={1}>Every week</option>
                                            <option value={2}>Every other week</option>
                                            <option value={3}>Every 3 weeks</option>
                                            <option value={4}>Every 4 weeks</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!taskToEdit && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sub-steps <span className="text-slate-400 font-normal">(One per line)</span></label>
                            <textarea
                                value={subStepsText}
                                onChange={e => setSubStepsText(e.target.value)}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none h-24 text-sm"
                                placeholder="Step 1&#10;Step 2&#10;Step 3..."
                            />
                        </div>
                    )}

                    <div className="pt-4">
                        <Button type="submit" className="w-full">
                            {taskToEdit ? 'Save Changes' : 'Create Task'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
