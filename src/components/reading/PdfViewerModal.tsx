import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Book, BookAssignment } from '@/types/Book';
import { X, ChevronLeft, ChevronRight, CheckCircle, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/Button';

// Use CDN worker so no separate file copy is needed
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerModalProps {
    book: Book;
    assignment: BookAssignment;
    onComplete: () => void;
    onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
    book, assignment, onComplete, onClose,
}) => {
    const [currentPage, setCurrentPage] = useState(assignment.startPage);
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState(1.0);
    const [loading, setLoading] = useState(true);

    const totalAssigned = assignment.endPage - assignment.startPage + 1;
    const pagesRead = Math.max(0, currentPage - assignment.startPage);
    const progress = Math.min(100, Math.round((pagesRead / totalAssigned) * 100));
    const isOnLastAssignedPage = currentPage >= assignment.endPage;

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
    }, []);

    const prevPage = () => setCurrentPage(p => Math.max(1, p - 1));
    const nextPage = () => setCurrentPage(p => Math.min(book.totalPages, p + 1));

    return (
        <div className="fixed inset-0 z-[80] bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={onClose}
                        className="shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                        <h2 className="font-black text-white text-sm truncate">{book.title}</h2>
                        <p className="text-slate-400 text-[11px]">
                            Today's goal: pages {assignment.startPage}–{assignment.endPage}
                            {assignment.isExtra && <span className="text-primary ml-1">· extra</span>}
                        </p>
                    </div>
                </div>

                {/* Zoom controls */}
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Zoom out"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-slate-400 text-xs w-10 text-center tabular-nums">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={() => setScale(s => Math.min(2.5, s + 0.1))}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Zoom in"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setScale(1.0)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Reset zoom"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-slate-800 shrink-0">
                <motion.div
                    className="h-full bg-gradient-to-r from-primary to-cyan-400"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                />
            </div>

            {/* PDF viewport */}
            <div className="flex-1 overflow-auto flex justify-center bg-slate-950 p-4">
                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">Loading PDF…</p>
                        </div>
                    </div>
                )}
                <Document
                    file={book.pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={() => setLoading(false)}
                    loading=""
                    className={cn('flex justify-center', loading && 'hidden')}
                >
                    <Page
                        pageNumber={currentPage}
                        scale={scale}
                        className="shadow-2xl"
                        renderTextLayer
                        renderAnnotationLayer
                    />
                </Document>
            </div>

            {/* Footer navigation */}
            <div className="shrink-0 bg-slate-900 border-t border-slate-800 px-4 py-3">
                <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
                    {/* Prev */}
                    <button
                        onClick={prevPage}
                        disabled={currentPage <= 1}
                        className="flex items-center gap-1 px-4 py-2.5 rounded-2xl font-bold text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-b-2 border-slate-700 active:border-b-0 active:translate-y-0.5"
                    >
                        <ChevronLeft className="w-4 h-4" /> Prev
                    </button>

                    {/* Page counter */}
                    <div className="text-center">
                        <div className="text-white font-black text-lg tabular-nums">
                            {currentPage} <span className="text-slate-500 font-normal text-sm">/ {numPages || book.totalPages}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                            Goal: {assignment.startPage}–{assignment.endPage} · {pagesRead}/{totalAssigned} read
                        </div>
                    </div>

                    {/* Next / Complete */}
                    {isOnLastAssignedPage && !assignment.completedAt ? (
                        <button
                            onClick={onComplete}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-extrabold text-sm bg-emerald-500 text-white border-b-2 border-emerald-700 active:border-b-0 active:translate-y-0.5 shadow-lg shadow-emerald-500/25 transition-all"
                        >
                            <CheckCircle className="w-4 h-4" /> Done!
                        </button>
                    ) : (
                        <button
                            onClick={nextPage}
                            disabled={currentPage >= book.totalPages}
                            className="flex items-center gap-1 px-4 py-2.5 rounded-2xl font-bold text-sm bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-b-2 border-primary-dark active:border-b-0 active:translate-y-0.5"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Assignment mini progress bar */}
                <div className="mt-2 max-w-2xl mx-auto">
                    <div className="flex gap-0.5">
                        {Array.from({ length: totalAssigned }, (_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'flex-1 h-1.5 rounded-full transition-colors duration-300',
                                    i < pagesRead ? 'bg-primary' : 'bg-slate-700'
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
