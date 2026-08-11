import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Type, Tag as TagIcon } from 'lucide-react';
import { Course } from '@/types/Lms';
import { useLmsStore } from '@/store/lmsStore';
import { cn } from '@/components/ui/Button';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface CourseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseToEdit: Course | null;
}

const COLOR_SWATCHES = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
const EMOJI_QUICK_PICKS = ['📚', '🎓', '💡', '🧠', '🚀', '💻', '🔬', '🎨'];

export const CourseFormModal: React.FC<CourseFormModalProps> = ({ isOpen, onClose, courseToEdit }) => {
    const { addCourse, updateCourse } = useLmsStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [color, setColor] = useState(COLOR_SWATCHES[0]);
    const [emoji, setEmoji] = useState(EMOJI_QUICK_PICKS[0]);

    const isEditing = !!courseToEdit;

    useEffect(() => {
        if (isOpen) {
            if (courseToEdit) {
                setTitle(courseToEdit.title);
                setDescription(courseToEdit.description || '');
                setCategory(courseToEdit.category || '');
                setColor(courseToEdit.color || COLOR_SWATCHES[0]);
                setEmoji(courseToEdit.emoji || EMOJI_QUICK_PICKS[0]);
            } else {
                setTitle('');
                setDescription('');
                setCategory('');
                setColor(COLOR_SWATCHES[0]);
                setEmoji(EMOJI_QUICK_PICKS[0]);
            }
        }
    }, [isOpen, courseToEdit]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const data = {
            title: title.trim(),
            description,
            category: category.trim(),
            color,
            emoji,
        };

        if (courseToEdit) {
            updateCourse(courseToEdit.id, data);
        } else {
            addCourse(data);
        }
        onClose();
    };

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
        ],
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="flex-none flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                            {isEditing ? 'Edit Course' : 'New Course'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        <form id="course-form" onSubmit={handleSave} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                    <Type className="w-4 h-4" /> Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Machine Learning Fundamentals"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500 transition-shadow font-medium"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                    <TagIcon className="w-4 h-4" /> Category <span className="font-normal normal-case">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    placeholder="e.g. Data Science"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500 transition-shadow font-medium"
                                />
                            </div>

                            {/* Emoji */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider block">
                                    Icon
                                </label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {EMOJI_QUICK_PICKS.map(e => (
                                        <button
                                            key={e}
                                            type="button"
                                            onClick={() => setEmoji(e)}
                                            className={cn(
                                                'w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all border-2',
                                                emoji === e
                                                    ? 'border-violet-500 bg-violet-500/10 scale-105'
                                                    : 'border-transparent bg-slate-100 dark:bg-slate-800 opacity-70 hover:opacity-100'
                                            )}
                                        >
                                            {e}
                                        </button>
                                    ))}
                                    <input
                                        type="text"
                                        value={emoji}
                                        onChange={e => setEmoji(e.target.value.slice(0, 2))}
                                        className="w-14 h-10 bg-slate-50 dark:bg-slate-950 border-0 rounded-xl text-center text-lg focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                            </div>

                            {/* Color */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider block">
                                    Accent Color
                                </label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {COLOR_SWATCHES.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={cn(
                                                'w-9 h-9 rounded-full transition-all border-2',
                                                color === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent opacity-80 hover:opacity-100'
                                            )}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-4 text-black">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                    Description <span className="font-normal normal-case text-slate-400">(optional)</span>
                                </label>
                                <div className="bg-slate-50 dark:bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[140px]">
                                    <ReactQuill
                                        theme="snow"
                                        value={description}
                                        onChange={setDescription}
                                        modules={modules}
                                        className="h-24 dark:text-black"
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="flex-none p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="course-form"
                            disabled={!title.trim()}
                            className="flex items-center gap-2 px-8 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            <Save className="w-4 h-4" />
                            {isEditing ? 'Save Changes' : 'Create Course'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
