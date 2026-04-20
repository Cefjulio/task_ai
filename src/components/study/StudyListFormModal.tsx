import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Type, Link, Percent, FileText } from 'lucide-react';
import { StudyItem, StudyContentType } from '@/types/StudyItem';
import { useStudyStore } from '@/store/studyStore';
import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/components/ui/Button';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface StudyListFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemToEdit: StudyItem | null;
}

export const StudyListFormModal: React.FC<StudyListFormModalProps> = ({
    isOpen,
    onClose,
    itemToEdit
}) => {
    const { addStudyItem, updateStudyItem } = useStudyStore();
    const { tags } = useTaskStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [contentType, setContentType] = useState<StudyContentType>('webpage');
    const [contentUrl, setContentUrl] = useState('');
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [lastPageRead, setLastPageRead] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                setTitle(itemToEdit.title);
                setDescription(itemToEdit.description || '');
                setContentType(itemToEdit.contentType);
                setContentUrl(itemToEdit.contentUrl || '');
                setCompletionPercentage(itemToEdit.completionPercentage || 0);
                setLastPageRead(itemToEdit.lastPageRead || '');
                setNotes(itemToEdit.notes || '');
                setSelectedTags(itemToEdit.tags || []);
            } else {
                setTitle('');
                setDescription('');
                setContentType('webpage');
                setContentUrl('');
                setCompletionPercentage(0);
                setLastPageRead('');
                setNotes('');
                setSelectedTags([]);
            }
        }
    }, [isOpen, itemToEdit]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const data = {
            title: title.trim(),
            description,
            contentType,
            contentUrl,
            completionPercentage,
            lastPageRead,
            notes,
            tags: selectedTags,
        };

        if (itemToEdit) {
            updateStudyItem(itemToEdit.id, data);
        } else {
            addStudyItem(data);
        }
        onClose();
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev => 
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    // basic quill text formatting options
    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
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
                            {itemToEdit ? 'Edit item' : 'New Study Item'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        <form id="study-form" onSubmit={handleSave} className="space-y-6">
                            
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                    <Type className="w-4 h-4" /> Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="What are you studying?"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary transition-shadow font-medium"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                        Type
                                    </label>
                                    <select
                                        value={contentType}
                                        onChange={e => setContentType(e.target.value as StudyContentType)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary transition-shadow font-medium appearance-none"
                                    >
                                        <option value="pdf">PDF</option>
                                        <option value="webpage">Webpage</option>
                                        <option value="youtube">YouTube Video</option>
                                        <option value="audio">Audio</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                        <Link className="w-4 h-4" /> URL / Source
                                    </label>
                                    <input
                                        type="text"
                                        value={contentUrl}
                                        onChange={e => setContentUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary transition-shadow font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                        <Percent className="w-4 h-4" /> Completion %
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={completionPercentage}
                                        onChange={e => setCompletionPercentage(parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary transition-shadow font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                        <FileText className="w-4 h-4" /> Page/Timestamp
                                    </label>
                                    <input
                                        type="text"
                                        value={lastPageRead}
                                        onChange={e => setLastPageRead(e.target.value)}
                                        placeholder="e.g. pg 45 or 12:30"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary transition-shadow font-medium"
                                    />
                                </div>
                            </div>

                            <div className="mb-4 text-black">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                    Description
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

                            <div className="mb-4 text-black pt-4">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                    Notes
                                </label>
                                <div className="bg-slate-50 dark:bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[140px]">
                                    <ReactQuill 
                                        theme="snow" 
                                        value={notes} 
                                        onChange={setNotes} 
                                        modules={modules}
                                        className="h-24 dark:text-black"
                                    />
                                </div>
                            </div>

                            {tags.length > 0 && (
                                <div className="pt-4">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                                        Tags
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => {
                                            const isSelected = selectedTags.includes(tag.id);
                                            return (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    onClick={() => toggleTag(tag.id)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                                        isSelected ? "ring-2 ring-offset-1 dark:ring-offset-slate-900 shadow-sm" : "opacity-60 hover:opacity-100"
                                                    )}
                                                    style={{
                                                        backgroundColor: isSelected ? tag.color : `${tag.color}20`,
                                                        color: isSelected ? '#fff' : tag.color,
                                                        borderColor: tag.color
                                                    }}
                                                >
                                                    {tag.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
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
                            form="study-form"
                            disabled={!title.trim()}
                            className="flex items-center gap-2 px-8 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            <Save className="w-4 h-4" />
                            {itemToEdit ? 'Save Changes' : 'Create Item'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
