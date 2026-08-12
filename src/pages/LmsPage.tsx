import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLmsStore } from '@/store/lmsStore';
import { Course, Lesson } from '@/types/Lms';
import { LmsStatsHeader } from '@/components/lms/LmsStatsHeader';
import { ContinueLearningBanner } from '@/components/lms/ContinueLearningBanner';
import { LessonRoulette } from '@/components/lms/LessonRoulette';
import { CourseCard } from '@/components/lms/CourseCard';
import { CourseFormModal } from '@/components/lms/CourseFormModal';
import { CourseDetailView } from '@/components/lms/CourseDetailView';
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
                <CourseDetailView
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence>
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                            >
                                <CourseCard
                                    course={course}
                                    lessons={lessons.filter(l => l.courseId === course.id)}
                                    onOpen={handleOpenCourse}
                                    onEdit={handleEditCourse}
                                    onDelete={handleDeleteCourse}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
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
