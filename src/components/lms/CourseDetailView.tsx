import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Course, Lesson, LessonStatus } from '@/types/Lms';
import { useLmsStore } from '@/store/lmsStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { QuillContent } from '@/components/ui/QuillContent';
import { LessonRow } from './LessonRow';
import { LessonFormModal } from './LessonFormModal';
import { ArrowLeft, Pencil, Trash2, Plus, BookOpen, Info } from 'lucide-react';

interface CourseDetailViewProps {
    course: Course;
    lessons: Lesson[];
    onBack: () => void;
    onEditCourse: (course: Course) => void;
    onDeleteCourse: (course: Course) => void;
    focusLessonId?: string | null;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
    course, lessons, onBack, onEditCourse, onDeleteCourse, focusLessonId,
}) => {
    const { deleteLesson, reorderLesson, setLessonStatus } = useLmsStore();
    const [isLessonModalOpen, setLessonModalOpen] = useState(false);
    const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);

    const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
    const total = sortedLessons.length;
    const completed = sortedLessons.filter(l => l.status === 'completed').length;
    const inProgress = sortedLessons.filter(l => l.status === 'in_progress').length;
    const progress = total > 0 ? Math.round(((completed + inProgress * 0.5) / total) * 100) : 0;
    const accent = course.color || '#8b5cf6';

    const handleAddLesson = () => {
        setLessonToEdit(null);
        setLessonModalOpen(true);
    };

    const handleEditLesson = (lesson: Lesson) => {
        setLessonToEdit(lesson);
        setLessonModalOpen(true);
    };

    const handleDeleteLesson = (lesson: Lesson) => {
        const plainTitle = lesson.title.replace(/<(.|\n)*?>/g, '').trim() || 'this lesson';
        if (window.confirm(`Delete "${plainTitle}"? This cannot be undone.`)) {
            deleteLesson(lesson.id);
        }
    };

    const handleReorder = (id: string, direction: 'up' | 'down') => reorderLesson(id, direction);
    const handleSetStatus = (id: string, status: LessonStatus) => setLessonStatus(id, status);

    return (
        <div className="space-y-5">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to courses
            </button>

            {/* Course header */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                            style={{ backgroundColor: `${accent}20` }}
                        >
                            {course.emoji || '📚'}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">{course.title}</h2>
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
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => onEditCourse(course)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                            title="Edit course"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDeleteCourse(course)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            title="Delete course"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {course.description && (
                    <QuillContent html={course.description} className="!p-0 text-sm text-slate-600 dark:text-slate-300" />
                )}

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {completed}/{total} lessons complete
                        </span>
                        <span>{progress}%</span>
                    </div>
                    <ProgressBar progress={progress} colorClass="bg-violet-500" />
                </div>
            </div>

            {/* Lessons */}
            <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Lessons</h3>
                <button
                    onClick={handleAddLesson}
                    className="flex items-center gap-1.5 bg-violet-500 hover:bg-violet-600 text-white text-xs font-extrabold uppercase tracking-wider px-4 py-2 rounded-xl transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Lesson
                </button>
            </div>

            {sortedLessons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Info className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No lessons yet</h3>
                    <p className="text-slate-500 text-sm max-w-sm">Add your first lesson and embed a Notebook LM resource to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedLessons.map((lesson, index) => (
                        <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            index={index}
                            isFirst={index === 0}
                            isLast={index === sortedLessons.length - 1}
                            onEdit={handleEditLesson}
                            onDelete={handleDeleteLesson}
                            onReorder={handleReorder}
                            onSetStatus={handleSetStatus}
                            forceExpanded={lesson.id === focusLessonId}
                        />
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isLessonModalOpen && (
                    <LessonFormModal
                        isOpen={isLessonModalOpen}
                        onClose={() => setLessonModalOpen(false)}
                        courseId={course.id}
                        lessonToEdit={lessonToEdit}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
