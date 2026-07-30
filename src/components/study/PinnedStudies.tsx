import React from 'react';
import { StudyItem } from '@/types/StudyItem';
import { Pin, TrendingUp, Video, FileText, Globe, Headphones, PinOff } from 'lucide-react';
import { cn } from '@/components/ui/Button';

const CONTENT_ICONS: Record<string, React.ReactNode> = {
    youtube: <Video className="w-4 h-4 text-red-500" />,
    pdf:     <FileText className="w-4 h-4 text-orange-500" />,
    audio:   <Headphones className="w-4 h-4 text-purple-500" />,
    webpage: <Globe className="w-4 h-4 text-blue-500" />,
};

interface PinnedStudiesProps {
    items: StudyItem[];           // the 2 pinned StudyItem objects
    onUpdateProgress: (item: StudyItem) => void;
    onUnpin: (id: string) => void;
    onStudyNow: (item: StudyItem) => void;
}

const PinnedCard: React.FC<{
    item: StudyItem;
    onUpdateProgress: () => void;
    onUnpin: () => void;
    onStudyNow: () => void;
}> = ({ item, onUpdateProgress, onUnpin, onStudyNow }) => (
    <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 shadow-sm">
        {/* Title row */}
        <div className="flex items-start gap-2 mb-2">
            <div className="shrink-0 mt-0.5">{CONTENT_ICONS[item.contentType]}</div>
            <h4 className="font-black text-slate-800 dark:text-white text-sm leading-tight flex-1 min-w-0 line-clamp-2">
                {item.title}
            </h4>
            <button
                onClick={onUnpin}
                className="shrink-0 p-1 text-amber-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                title="Unpin"
            >
                <PinOff className="w-3.5 h-3.5" />
            </button>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Progress</span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400">{item.completionPercentage}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.completionPercentage}%` }}
                />
            </div>
        </div>

        {/* Last position */}
        {item.lastPageRead && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Last at: <span className="font-bold text-slate-700 dark:text-slate-200">{item.lastPageRead}</span>
            </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
            <button
                onClick={onStudyNow}
                className="flex-1 text-center text-xs font-extrabold text-primary bg-primary/10 hover:bg-primary/20 py-2 rounded-xl transition-colors"
            >
                Study Now
            </button>
            <button
                onClick={onUpdateProgress}
                className="flex-1 flex items-center justify-center gap-1 text-xs font-extrabold text-white bg-amber-500 hover:bg-amber-600 border-b-2 border-amber-700 active:border-b-0 active:translate-y-0.5 py-2 rounded-xl transition-all"
            >
                <TrendingUp className="w-3 h-3" />
                Update
            </button>
        </div>
    </div>
);

export const PinnedStudies: React.FC<PinnedStudiesProps> = ({
    items, onUpdateProgress, onUnpin, onStudyNow,
}) => {
    if (!items.length) return null;

    return (
        <div className="mb-2">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <Pin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Daily Focus
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                    · always-on study items ({items.length}/2)
                </span>
            </div>

            {/* Cards */}
            <div className={cn(
                "flex gap-3",
                items.length === 1 ? "max-w-xs" : "flex-col sm:flex-row"
            )}>
                {items.map(item => (
                    <PinnedCard
                        key={item.id}
                        item={item}
                        onUpdateProgress={() => onUpdateProgress(item)}
                        onUnpin={() => onUnpin(item.id)}
                        onStudyNow={() => onStudyNow(item)}
                    />
                ))}

                {/* Empty slot placeholder */}
                {items.length === 1 && (
                    <div className="flex-1 min-w-0 border-2 border-dashed border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 flex items-center justify-center">
                        <p className="text-[11px] text-slate-400 text-center">
                            Pin one more item<br />from your library below
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
