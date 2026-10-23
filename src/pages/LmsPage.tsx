import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLmsStore } from '@/store/lmsStore';
import { Course, Lesson } from '@/types/Lms';
import { LmsStatsHeader } from '@/components/lms/LmsStatsHeader';
import { ContinueLearningBanner } from '@/components/lms/ContinueLearningBanner';
import { LessonRoulette } from '@/components/lms/LessonRoulette';
import { BookCover } from '@/components/lms/BookCover';
import { CourseFormModal } from '@/components/lms/CourseFormModal';
import { BookReader } from '@/components/lms/BookReader';
import { SHELF_PLANK_CLASS } from '@/components/lms/bookStyles';
import { SearchInput } from '@/components/ui/SearchInput';
import { GraduationCap, Plus } from 'lucide-react';

export const LmsPage: React.FC = () => {
    const { courses, lessons, deleteCourse } = useLmsStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [focusLessonId, setFocusLessonId] = useState<string | null>(null);
    const [isCourseModalOpen, setCourseModalOpen] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

    const categories = useMemo(
        () => Array.from(new Set(courses.map(c => c.category).filter(Boolean))),
        [courses]
    );

    const filteredCourses = useMemo(() => {
        let list = courses;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(c => c.title.toLowerCase().includes(q));
        }
        if (categoryFilter) {
            list = list.filter(c => c.category === categoryFilter);
        }
        return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }, [courses, searchQuery, categoryFilter]);

    const continueLearning = useMemo(() => {
        const inProgress = lessons
            .filter(l => l.status === 'in_progress')
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        const lesson = inProgress[0];
        if (!lesson) return null;
        const course = courses.find(c => c.id === lesson.courseId);
        if (!course) return null;
        return { lesson, course };
    }, [lessons, courses]);

    const selectedCourse = selectedCourseId ? courses.find(c => c.id === selectedCourseId) : null;

    const handleOpenCourse = (course: Course) => {
        setSelectedCourseId(course.id);
        setFocusLessonId(null);
    };

    const handleGoToLesson = (course: Course, lesson: Lesson) => {
        setSelectedCourseId(course.id);
        setFocusLessonId(lesson.id);
    };

    const handleResume = () => {
        if (!continueLearning) return;
        handleGoToLesson(continueLearning.course, continueLearning.lesson);
    };

    const handleCreateCourse = () => {
        setCourseToEdit(null);
        setCourseModalOpen(true);
    };

    const handleEditCourse = (course: Course) => {
        setCourseToEdit(course);
        setCourseModalOpen(true);
    };

    const handleDeleteCourse = (course: Course) => {
        if (window.confirm(`Delete "${course.title}" and all its lessons? This cannot be undone.`)) {
            if (selectedCourseId === course.id) setSelectedCourseId(null);
            deleteCourse(course.id);
        }
    };

    if (selectedCourse) {
        return (
            <>
                <BookReader
                    key={selectedCourse.id}
                    course={selectedCourse}
                    lessons={lessons.filter(l => l.courseId === selectedCourse.id)}
                    onBack={() => setSelectedCourseId(null)}
                    onEditCourse={handleEditCourse}
                    onDeleteCourse={handleDeleteCourse}
                    focusLessonId={focusLessonId}
                />
                <AnimatePresence>
                    {isCourseModalOpen && (
                        <CourseFormModal
                            isOpen={isCourseModalOpen}
                            onClose={() => setCourseModalOpen(false)}
                            courseToEdit={courseToEdit}
                        />
                    )}
                </AnimatePresence>
            </>
        );
    }

    return (
        <div className="space-y-5">
            <LmsStatsHeader courses={courses} lessons={lessons} />

            {courses.length > 0 && (
                <LessonRoulette courses={courses} lessons={lessons} onGoToLesson={handleGoToLesson} />
            )}

            <AnimatePresence>
                {continueLearning && (
                    <ContinueLearningBanner
                        course={continueLearning.course}
                        lesson={continueLearning.lesson}
                        onResume={handleResume}
                    />
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search courses…"
                    className="md:max-w-sm"
                />
                <button
                    onClick={handleCreateCourse}
                    className="hidden md:flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white text-xs font-extrabold uppercase tracking-wider px-4 py-2.5 rounded-2xl border-b-4 border-violet-700 shadow-lg shadow-violet-500/30 active:border-b-2 active:translate-y-0.5 transition-all shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    New Course
                </button>
            </div>

            {categories.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        onClick={() => setCategoryFilter(null)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                            categoryFilter === null
                                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md'
                                : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 scale-95 border border-slate-200 dark:border-slate-700'
                        }`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                categoryFilter === cat
                                    ? 'bg-violet-500 text-white shadow-md'
                                    : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 scale-95 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <GraduationCap className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {courses.length === 0 ? 'No courses yet' : 'No courses found'}
                    </h3>
                    <p className="text-slate-500 max-w-md mb-6">
                        {courses.length === 0
                            ? 'Create your first course, then add lessons with embedded Notebook LM resources.'
                            : 'Try adjusting your search or category filter.'}
                    </p>
                    {courses.length === 0 && (
                        <button
                            onClick={handleCreateCourse}
                            className="flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-extrabold uppercase tracking-wider px-6 py-3 rounded-2xl border-b-4 border-violet-700 shadow-lg shadow-violet-500/30 active:border-b-2 active:translate-y-0.5 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            New Course
                        </button>
                    )}
                </div>
            ) : (
                // Bookcase: each course is a book standing on the shelf
                <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-gradient-to-b from-amber-50/70 to-stone-100/80 dark:from-stone-900/70 dark:to-stone-950/70 shadow-inner px-1 sm:px-3 pt-2">
                    <div className="flex flex-wrap">
                        <AnimatePresence>
                            {filteredCourses.map((course, index) => (
                                <motion.div
                                    key={course.id}
                                    className="shrink-0 grow-0 basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 14 }}
                                    transition={{ duration: 0.25, delay: index * 0.04 }}
                                >
                                    <BookCover
                                        course={course}
                                        lessons={lessons.filter(l => l.courseId === course.id)}
                                        onOpen={handleOpenCourse}
                                        onEdit={handleEditCourse}
                                        onDelete={handleDeleteCourse}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {/* Runs the plank to the end of the last row */}
                        <div aria-hidden className="relative min-w-0 flex-1 self-stretch">
                            <div className={SHELF_PLANK_CLASS} />
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile FAB */}
            <button
                onClick={handleCreateCourse}
                className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 md:hidden text-white p-4 rounded-full z-40 bg-violet-500 border-b-4 border-violet-700 shadow-lg shadow-violet-500/30 active:border-b-2 active:translate-y-0.5 transition-all duration-150"
                aria-label="Create new course"
            >
                <div className="relative w-7 h-7 flex items-center justify-center">
                    <GraduationCap className="w-7 h-7" />
                    <div className="absolute -top-1 -right-1 bg-white text-violet-600 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                        <Plus className="w-3 h-3 stroke-[3]" />
                    </div>
                </div>
            </button>

            <AnimatePresence>
                {isCourseModalOpen && (
                    <CourseFormModal
                        isOpen={isCourseModalOpen}
                        onClose={() => setCourseModalOpen(false)}
                        courseToEdit={courseToEdit}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
