import React, { useState, useEffect, useRef } from 'react';
import { Book } from '@/types/Book';
import { useReadingStore } from '@/store/readingStore';
import { supabase } from '@/services/supabase/supabaseClient';
import { X, Upload, Link, BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

interface BookFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookToEdit?: Book | null;
}

type UploadMode = 'url' | 'file';

export const BookFormModal: React.FC<BookFormModalProps> = ({ isOpen, onClose, bookToEdit }) => {
    const { addBook, updateBook } = useReadingStore();

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [totalPages, setTotalPages] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [uploadMode, setUploadMode] = useState<UploadMode>('file');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const isEditing = !!bookToEdit;

    useEffect(() => {
        if (bookToEdit) {
            setTitle(bookToEdit.title);
            setAuthor(bookToEdit.author);
            setTotalPages(String(bookToEdit.totalPages));
            setPdfUrl(bookToEdit.pdfUrl);
            setCoverUrl(bookToEdit.coverUrl || '');
            setUploadMode('url');
        } else {
            setTitle(''); setAuthor(''); setTotalPages('');
            setPdfUrl(''); setCoverUrl('');
            setUploadMode('file');
        }
        setError('');
    }, [bookToEdit, isOpen]);

    const handleFileUpload = async (file: File) => {
        if (!file.type.includes('pdf')) {
            setError('Please select a PDF file.');
            return;
        }
        setUploading(true);
        setUploadProgress(10);
        try {
            const fileName = `${uuidv4()}.pdf`;
            setUploadProgress(30);
            const { data, error: uploadError } = await supabase.storage
                .from('books')
                .upload(fileName, file, { contentType: 'application/pdf', upsert: false });
            setUploadProgress(80);
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('books').getPublicUrl(data.path);
            setPdfUrl(urlData.publicUrl);
            setUploadProgress(100);
        } catch (e: any) {
            setError(`Upload failed: ${e.message}. Make sure you have a public "books" bucket in Supabase Storage.`);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = () => {
        if (!title.trim()) { setError('Title is required.'); return; }
        if (!totalPages || Number(totalPages) < 1) { setError('Total pages must be at least 1.'); return; }
        if (!pdfUrl.trim()) { setError('Please provide or upload a PDF.'); return; }

        const data = {
            title: title.trim(),
            author: author.trim(),
            totalPages: Number(totalPages),
            pdfUrl: pdfUrl.trim(),
            coverUrl: coverUrl.trim(),
            isActive: bookToEdit?.isActive ?? true,
            notes: bookToEdit?.notes ?? '',
            tags: bookToEdit?.tags ?? [],
        };

        if (isEditing) {
            updateBook(bookToEdit!.id, data);
        } else {
            addBook(data);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                style={{ maxHeight: '92dvh' }}
            >
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">
                            {isEditing ? 'Edit Book' : 'Add Book'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                                Title *
                            </label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Clean Code"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                                Author
                            </label>
                            <input
                                value={author}
                                onChange={e => setAuthor(e.target.value)}
                                placeholder="e.g. Robert C. Martin"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                                Total Pages *
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={totalPages}
                                onChange={e => setTotalPages(e.target.value)}
                                placeholder="e.g. 464"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                            />
                        </div>
                    </div>

                    {/* PDF source toggle */}
                    <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                            PDF Source *
                        </label>
                        <div className="flex gap-2 mb-3">
                            {(['file', 'url'] as UploadMode[]).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setUploadMode(mode)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-extrabold border-b-2 transition-all ${
                                        uploadMode === mode
                                            ? 'bg-primary text-white border-primary-dark'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    {mode === 'file' ? <><Upload className="w-4 h-4" /> Upload PDF</> : <><Link className="w-4 h-4" /> PDF URL</>}
                                </button>
                            ))}
                        </div>

                        {uploadMode === 'file' ? (
                            <div>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    className="hidden"
                                    onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                />
                                {pdfUrl ? (
                                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3">
                                        <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex-1 truncate">✓ PDF uploaded</span>
                                        <button
                                            onClick={() => { setPdfUrl(''); if (fileRef.current) fileRef.current.value = ''; }}
                                            className="text-slate-400 hover:text-slate-600 text-xs"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl py-6 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-60"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                                <span className="text-sm text-primary font-bold">Uploading… {uploadProgress}%</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-slate-400" />
                                                <span className="text-sm text-slate-500 font-semibold">Click to upload PDF</span>
                                                <span className="text-[11px] text-slate-400">Requires "books" bucket in Supabase Storage</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <input
                                value={pdfUrl}
                                onChange={e => setPdfUrl(e.target.value)}
                                placeholder="https://… (direct PDF URL)"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                            />
                        )}
                    </div>

                    {/* Cover image */}
                    <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                            Cover Image URL <span className="font-normal normal-case">(optional)</span>
                        </label>
                        <input
                            value={coverUrl}
                            onChange={e => setCoverUrl(e.target.value)}
                            placeholder="https://…/cover.jpg"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-2xl font-extrabold text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={uploading}
                        className="flex-1 py-3 rounded-2xl font-extrabold text-sm text-white bg-primary border-b-4 border-primary-dark shadow-lg shadow-primary/25 active:border-b-2 active:translate-y-0.5 transition-all disabled:opacity-60"
                    >
                        {isEditing ? 'Save Changes' : 'Add Book'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
