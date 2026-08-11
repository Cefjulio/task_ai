import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Link as LinkIcon } from 'lucide-react';
import { Lesson } from '@/types/Lms';
import { useLmsStore } from '@/store/lmsStore';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface LessonFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    lessonToEdit: Lesson | null;
}

export const LessonFormModal: React.FC<LessonFormModalProps> = ({ isOpen, onClose, courseId, lessonToEdit }) => {
    const { addLesson, updateLesson } = useLmsStore();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [resourceUrl, setResourceUrl] = useState('');

    const isEditing = !!lessonToEdit;
    // Quill needs non-empty HTML to consider the field "filled" — strip tags to check for real text.
    const titleIsEmpty = title.replace(/<(.|\n)*?>/g, '').trim().length === 0;

    useEffect(() => {
        if (isOpen) {
            if (lessonToEdit) {
                setTitle(lessonToEdit.title);
                setContent(lessonToEdit.content || '');
                setResourceUrl(lessonToEdit.resourceUrl || '');
            } else {
                setTitle('');
                setContent('');
                setResourceUrl('');
            }
        }
    }, [isOpen, lessonToEdit]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (titleIsEmpty) return;

        const data = {
            title,
            content,
            resourceUrl: resourceUrl.trim(),
        };

        if (lessonToEdit) {
            updateLesson(lessonToEdit.id, data);
        } else {
            addLesson({ ...data, courseId });
        }
        onClose();
    };

    const titleModules = {
        toolbar: [['bold', 'italic', 'underline'], ['clean']],
    };
    const contentModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['clean'],
        ],
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
                            {isEditing ? 'Edit Lesson' : 'New Lesson'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        <form id="lesson-form" onSubmit={handleSave} className="space-y-6">
                            {/* Title (rich text) */}
                            <div className="mb-4 text-black">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider block">
                                    Title
                                </label>
                                <div className="bg-slate-50 dark:bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                                    <ReactQuill
                                        theme="snow"
                                        value={title}
                                        onChange={setTitle}
                                        modules={titleModules}
                                        placeholder="What's this lesson about?"
                                        className="dark:text-black"
                                    />
                                </div>
                            </div>

                            {/* Resource URL */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                    <LinkIcon className="w-4 h-4" /> Gemini NotebookLM Link
                                </label>
                                <input
                                    type="text"
                                    value={resourceUrl}
                                    onChange={e => setResourceUrl(e.target.value)}
                                    placeholder="https://notebooklm.google.com/notebook/..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500 transition-shadow font-medium"
                                />
                            </div>

                            {/* Content (rich text) */}
                            <div className="mb-4 text-black pt-4">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider block">
                                    Notes <span className="font-normal normal-case text-slate-400">(optional)</span>
                                </label>
                                <div className="bg-slate-50 dark:bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[140px]">
                                    <ReactQuill
                                        theme="snow"
                                        value={content}
                                        onChange={setContent}
                                        modules={contentModules}
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
                            form="lesson-form"
                            disabled={titleIsEmpty}
                            className="flex items-center gap-2 px-8 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            <Save className="w-4 h-4" />
                            {isEditing ? 'Save Changes' : 'Add Lesson'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
