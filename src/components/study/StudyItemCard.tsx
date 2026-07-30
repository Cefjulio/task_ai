import React, { useState } from 'react';
import { StudyItem } from '@/types/StudyItem';
import { useStudyStore } from '@/store/studyStore';
import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/components/ui/Button';
import { Edit2, ExternalLink, Video, FileText, Globe, Headphones, RotateCcw, CheckCircle, Play, Trash2, Pin, PinOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuillContent } from '@/components/ui/QuillContent';

interface StudyItemCardProps {
    item: StudyItem;
    onEdit: (item: StudyItem) => void;
    onDelete?: (item: StudyItem) => void;
    onStudyNow?: (item: StudyItem) => void;
    onTogglePin?: (item: StudyItem) => void;
    isActive?: boolean;
    isPinned?: boolean;
    canPin?: boolean; // false when already 2 pinned and this one isn't pinned
}

const PRIORITY_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    high:   { label: 'High',   bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-600 dark:text-red-400',    dot: 'bg-red-500' },
    medium: { label: 'Medium', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
    low:    { label: 'Low',    bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
};

export const StudyItemCard: React.FC<StudyItemCardProps> = ({
    item, onEdit, onDelete, onStudyNow, onTogglePin, isActive, isPinned, canPin = true,
}) => {
    const { markStudyItemStatus } = useStudyStore();
    const { tags } = useTaskStore();
    const [expanded, setExpanded] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Support both 'reviewed' (new) and 'completed' (legacy) as the "done" state
    const isReviewed = item.status === 'reviewed' || item.status === 'completed';
    const priority = item.priority || 'medium';
    const priorityStyle = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.medium;

    const renderContentIcon = () => {
        switch (item.contentType) {
            case 'youtube': return <Video className="w-5 h-5 text-red-500" />;
            case 'pdf': return <FileText className="w-5 h-5 text-orange-500" />;
            case 'audio': return <Headphones className="w-5 h-5 text-purple-500" />;
            case 'webpage': return <Globe className="w-5 h-5 text-blue-500" />;
            default: return null;
        }
    };

    const toggleStatus = (e: React.MouseEvent) => {
        e.stopPropagation();
        markStudyItemStatus(item.id, isReviewed ? 'pending' : 'reviewed');
    };

    const getEmbedUrl = (url: string, type: string) => {
        if (!url) return '';
        if (type === 'youtube') {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            const videoId = (match && match[2].length === 11) ? match[2] : null;
            return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
        }
        return url;
    };

    return (
        <div 
            onClick={() => setExpanded(!expanded)}
            className={cn(
                "group relative bg-white dark:bg-slate-900 border overflow-hidden p-5 transition-all duration-300 shadow-sm cursor-pointer",
                expanded ? "rounded-2xl" : "rounded-xl hover:-translate-y-1 hover:shadow-md",
                isActive
                    ? "border-primary/50 ring-2 ring-primary/30 ring-offset-2 dark:ring-offset-slate-950"
                    : "border-slate-200 dark:border-slate-800",
                isReviewed && "bg-slate-50 dark:bg-slate-900/50 border-teal-200 dark:border-teal-900/50 opacity-80"
            )}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        {renderContentIcon()}
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                            {item.title}
                        </h3>
                        {isPinned && (
                            <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                <Pin className="w-2.5 h-2.5" /> Pinned
                            </span>
                        )}
                    </div>

                    {/* Priority badge + tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {/* Priority badge */}
                        <span className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                            priorityStyle.bg, priorityStyle.text
                        )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", priorityStyle.dot)} />
                            {priorityStyle.label}
                        </span>

                        {/* Tags */}
                        {item.tags.map(tagId => {
                            const tag = tags.find(t => t.id === tagId);
                            if (!tag) return null;
                            return (
                                <span 
                                    key={tagId} 
                                    className={cn(
                                        "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                                        tag.color, "bg-opacity-10",
                                        tag.color.replace('bg-', 'text-')
                                    )}
                                >
                                    {tag.name}
                                </span>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1 mt-1 text-right">
                    <div className="inline-flex flex-col items-end bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                            {item.completionPercentage}%
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            Page: {item.lastPageRead || '—'}
                        </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-1 mt-2">
                        {/* Study Now */}
                        {onStudyNow && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onStudyNow(item); }}
                                className={cn(
                                    "flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-extrabold transition-colors",
                                    isActive
                                        ? "bg-primary text-white"
                                        : "bg-primary/10 text-primary hover:bg-primary/20"
                                )}
                                title="Study This Now"
                            >
                                <Play className="w-3 h-3" />
                                {isActive ? 'Active' : 'Study'}
                            </button>
                        )}

                        {/* Pin / Unpin */}
                        {onTogglePin && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onTogglePin(item); }}
                                disabled={!canPin && !isPinned}
                                className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    isPinned
                                        ? "text-amber-500 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100"
                                        : canPin
                                            ? "text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                            : "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                )}
                                title={isPinned ? 'Unpin' : canPin ? 'Pin as daily focus' : 'Already 2 items pinned'}
                            >
                                {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                            </button>
                        )}

                        {/* Edit */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete with inline confirm */}
                        {onDelete && (
                            confirmDelete ? (
                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => { onDelete(item); setConfirmDelete(false); }}
                                        className="px-2 py-1.5 rounded-lg text-xs font-extrabold bg-red-500 text-white hover:bg-red-600 transition-colors"
                                    >
                                        Delete?
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(false)}
                                        className="px-2 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )
                        )}

                        {/* Reviewed / Pending toggle */}
                        <button
                            onClick={toggleStatus}
                            className={cn(
                                "p-1.5 rounded-lg transition-colors flex flex-row items-center gap-1 px-2 text-xs font-bold",
                                isReviewed
                                    ? "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                                    : "bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50"
                            )}
                            title={isReviewed ? 'Mark as Pending' : 'Mark as Reviewed'}
                        >
                            {isReviewed ? (
                                <>
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Pending</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>Reviewed</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        {item.description && (
                            <QuillContent html={item.description} className="mb-4 text-sm text-slate-600 dark:text-slate-300" />
                        )}

                        {item.contentUrl && (
                            <div className="mb-5 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 w-full">
                                {item.contentType === 'youtube' ? (
                                    <iframe 
                                        width="100%" 
                                        height="315" 
                                        src={getEmbedUrl(item.contentUrl, item.contentType)} 
                                        title="YouTube video player" 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        className="block"
                                    />
                                ) : item.contentType === 'audio' ? (
                                    <div className="p-4 flex items-center justify-center">
                                        <audio controls src={item.contentUrl} className="w-full max-w-md" />
                                    </div>
                                ) : (
                                    <div className="p-4 text-sm flex items-center justify-between">
                                        <span className="text-slate-500 truncate max-w-[80%]">{item.contentUrl}</span>
                                        <a href={item.contentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline font-semibold" onClick={e => e.stopPropagation()}>
                                            Open <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {item.notes && (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Notes</h4>
                                <QuillContent html={item.notes} className="text-sm text-slate-600 dark:text-slate-300 bg-yellow-50/50 dark:bg-yellow-900/10 p-3 rounded-lg" />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
