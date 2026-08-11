import React from 'react';
import { Course, Lesson } from '@/types/Lms';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { QuillContent } from '@/components/ui/QuillContent';
import { Pencil, Trash2, BookOpen } from 'lucide-react';

interface CourseCardProps {
    course: Course;
    lessons: Lesson[];
    onOpen: (course: Course) => void;
    onEdit: (course: Course) => void;
    onDelete: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, lessons, onOpen, onEdit, onDelete }) => {
    const total = lessons.length;
    const completed = lessons.filter(l => l.status === 'completed').length;
    const inProgress = lessons.filter(l => l.status === 'in_progress').length;
    const progress = total > 0 ? Math.round(((completed + inProgress * 0.5) / total) * 100) : 0;

    const accent = course.color || '#8b5cf6';

    return (
        <div
            onClick={() => onOpen(course)}
            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-4"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                        style={{ backgroundColor: `${accent}20` }}
                    >
                        {course.emoji || '📚'}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-black text-slate-900 dark:text-white truncate">{course.title}</h3>
                        {course.category && (
                            <span
                                className="inline-block mt-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                style={{ backgroundColor: `${accent}18`, color: accent }}
                            >
                                {course.category}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(course); }}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit course"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(course); }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete course"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {course.description && (
                <QuillContent
                    html={course.description}
                    className="!p-0 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 [&_p]:m-0"
                />
            )}

            <div className="mt-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {total} {total === 1 ? 'lesson' : 'lessons'}
                    </span>
                    <span>{progress}%</span>
                </div>
                <ProgressBar progress={progress} colorClass="bg-violet-500" />
            </div>
        </div>
    );
};
