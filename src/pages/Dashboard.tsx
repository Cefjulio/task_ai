import React, { useState } from 'react';
import { GlobalStats } from '@/components/dashboard/GlobalStats';
import { Tabs, TabType } from '@/components/dashboard/Tabs';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import { DynamicTasksPage } from './DynamicTasksPage';
import { RandomTasksPage } from './RandomTasksPage';
import { CoreTasksPage } from './CoreTasksPage';
import { FloatingActionButton } from '@/components/layout/FloatingActionButton';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { Task } from '@/types/Task';
import { AnimatePresence, motion } from 'framer-motion';
import { MotivationalBanner } from '@/components/dashboard/MotivationalBanner';
import { DateFilter } from '@/components/tasks/DateFilter';
import { Zap, Tags, Plus } from 'lucide-react';
import { ManageTagsModal } from '@/components/tasks/ManageTagsModal';
import { StudyListPage } from './StudyListPage';
import { StudyListFormModal } from '@/components/study/StudyListFormModal';
import { StudyItem } from '@/types/StudyItem';
import { GoalsPage } from './GoalsPage';
import { HealthPage } from './HealthPage';

export const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('goals');
    const [isModalOpen, setModalOpen] = useState(false);
    const [isTagsModalOpen, setTagsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [isStudyModalOpen, setStudyModalOpen] = useState(false);
    const [studyItemToEdit, setStudyItemToEdit] = useState<StudyItem | null>(null);

    const handleStudyEdit = (item: StudyItem) => {
        setStudyItemToEdit(item);
        setStudyModalOpen(true);
    };

    const handleStudyCreate = () => {
        setStudyItemToEdit(null);
        setStudyModalOpen(true);
    };

    const handleEdit = (task: Task) => {
        setTaskToEdit(task);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setTaskToEdit(null);
        setModalOpen(true);
    };

    const currentCategory = activeTab === 'random' ? 'random' : 'dynamic';
    const isCoreTab = activeTab === 'core-tasks';
    const showDateFilter = !isCoreTab && activeTab !== 'study-list' && activeTab !== 'health' && activeTab !== 'goals';
    const showCreateBtn = !isCoreTab && activeTab !== 'health';

    const createLabel =
        activeTab === 'study-list' ? 'New Item' :
        activeTab === 'goals' ? 'New Goal' :
        activeTab === 'random' ? 'New Task' :
        'New Task';

    const createBgClass =
        activeTab === 'study-list' ? 'bg-indigo-500 border-indigo-700 shadow-indigo-500/30' :
        activeTab === 'goals' ? 'bg-violet-500 border-violet-700 shadow-violet-500/30' :
        activeTab === 'random' ? 'bg-orange-500 border-orange-700 shadow-orange-500/30' :
        'bg-primary border-primary-dark shadow-primary/30';

    const handleCreateClick = () => {
        if (activeTab === 'study-list') handleStudyCreate();
        else handleCreate();
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark w-full overflow-x-hidden pb-28 relative transition-colors duration-300">

            {/* Motivational banner */}
            <div className="relative z-30">
                <MotivationalBanner />
            </div>

            {/* Sticky header */}
            <header className="px-4 sm:px-6 md:px-10 xl:px-20 2xl:px-28 pt-4 pb-3 sticky top-0 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl z-20 border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm transition-all duration-300">
                <div className="flex items-center justify-between gap-3">

                    {/* Logo */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-md shadow-primary/30 border-b-4 border-primary-dark">
                            <Zap className="w-5 h-5 text-white fill-current" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
                                Taskify
                            </h1>
                            <p className="text-slate-400 dark:text-slate-500 text-[9px] uppercase tracking-[0.25em] font-bold">Command Center</p>
                        </div>
                    </div>

                    {/* Date filter (center, only on relevant tabs) */}
                    {showDateFilter && (
                        <div className="flex-1 max-w-xs sm:max-w-sm mx-2">
                            <DateFilter />
                        </div>
                    )}

                    {/* Right actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setTagsModalOpen(true)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                            title="Manage Tags"
                        >
                            <Tags className="w-4.5 h-4.5" />
                        </button>
                        <ThemeToggle />

                        {/* Desktop create button */}
                        {showCreateBtn && (
                            <button
                                onClick={handleCreateClick}
                                className={`hidden md:flex items-center gap-2 text-white text-xs font-extrabold uppercase tracking-wider px-4 py-2.5 rounded-2xl border-b-4 shadow-lg transition-all hover:brightness-105 active:border-b-2 active:translate-y-0.5 ${createBgClass}`}
                            >
                                <Plus className="w-4 h-4" />
                                {createLabel}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="px-4 sm:px-6 md:px-10 xl:px-20 2xl:px-28 py-6 space-y-6">
                <GlobalStats activeTab={activeTab as 'dynamic' | 'random'} />
                <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                    >
                        {activeTab === 'goals' && <GoalsPage />}
                        {activeTab === 'dynamic' && <DynamicTasksPage onEdit={handleEdit} />}
                        {activeTab === 'random' && <RandomTasksPage onEdit={handleEdit} />}
                        {activeTab === 'core-tasks' && <CoreTasksPage onEdit={handleEdit} />}
                        {activeTab === 'study-list' && <StudyListPage onEdit={handleStudyEdit} />}
                        {activeTab === 'health' && <HealthPage />}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* FABs */}
            {!isCoreTab && activeTab !== 'study-list' && activeTab !== 'health' && (
                <FloatingActionButton onClick={handleCreate} category={currentCategory as 'dynamic' | 'random'} />
            )}
            {activeTab === 'study-list' && (
                <FloatingActionButton onClick={handleStudyCreate} category="dynamic" />
            )}

            {/* Modals */}
            <TaskFormModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                taskToEdit={taskToEdit}
                defaultCategory={currentCategory}
            />
            <StudyListFormModal
                isOpen={isStudyModalOpen}
                onClose={() => setStudyModalOpen(false)}
                itemToEdit={studyItemToEdit}
            />
            <ManageTagsModal
                isOpen={isTagsModalOpen}
                onClose={() => setTagsModalOpen(false)}
            />
        </div>
    );
};
