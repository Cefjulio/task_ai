import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Tag as TagIcon } from 'lucide-react';

interface TagFilterProps {
    selectedTagIds: string[];
    onChange: (ids: string[]) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({ selectedTagIds, onChange }) => {
    const { tags } = useTaskStore();

    if (tags.length === 0) return null;

    const toggleTag = (id: string) => {
        if (selectedTagIds.includes(id)) {
            onChange(selectedTagIds.filter(tId => tId !== id));
        } else {
            onChange([...selectedTagIds, id]);
        }
    };

    return (
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 pt-1 -mx-2 px-2">
            <div className="flex items-center gap-1.5 shrink-0 text-slate-400 mr-1">
                <TagIcon className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Tags</span>
            </div>
            
            {tags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                    <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border flex items-center gap-1.5 ${
                            isSelected 
                                ? `${tag.color} text-white border-transparent shadow-md scale-105` 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                    >
                        {!isSelected && <div className={`w-2 h-2 rounded-full ${tag.color}`}></div>}
                        {tag.name}
                    </button>
                );
            })}
            
            {selectedTagIds.length > 0 && (
                <button
                    onClick={() => onChange([])}
                    className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
                >
                    Clear
                </button>
            )}
        </div>
    );
};
