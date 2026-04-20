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
import { Target, Zap, Tags } from 'lucide-react';
import { ManageTagsModal } from '@/components/tasks/ManageTagsModal';
import { StudyListPage } from './StudyListPage';
import { StudyListFormModal } from '@/components/study/StudyListFormModal';
import { StudyItem } from '@/types/StudyItem';

export const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('dynamic');
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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 w-full overflow-hidden pb-24 relative transition-colors duration-300">
            <div className="relative z-30">
                <MotivationalBanner />
            </div>

            <header className="px-6 md:px-12 xl:px-24 2xl:px-32 pt-6 pb-6 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl z-20 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all duration-300">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
                            <span className="text-white font-extrabold text-2xl tracking-tighter">T/</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white leading-tight">Taskify</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] items-center uppercase tracking-[0.2em] font-bold opacity-80">Command Center</p>
                        </div>
                    </div>

                    {!isCoreTab && activeTab !== 'study-list' && (
                        <div className="w-full max-w-lg lg:flex-1">
                            <DateFilter />
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setTagsModalOpen(true)}
                            className="p-2.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center shrink-0"
                            title="Manage Tags"
                        >
                            <Tags className="w-5 h-5" />
                        </button>
                        <ThemeToggle />
                        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                        {!isCoreTab && (
                            <div className="hidden xl:flex items-center gap-3">
                                {activeTab === 'study-list' ? (
                                    <button
                                        onClick={handleStudyCreate}
                                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <Zap className="w-3.5 h-3.5" />
                                        New Study Item
                                    </button>
                                ) : activeTab === 'dynamic' ? (
                                    <button
                                        onClick={handleCreate}
                                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <Zap className="w-3.5 h-3.5" />
                                        New Dynamic Task
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleCreate}
                                        className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        <Target className="w-3.5 h-3.5" />
                                        New Random Task
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="px-6 md:px-12 xl:px-24 2xl:px-32 py-10 space-y-10">
                <GlobalStats activeTab={activeTab as 'dynamic' | 'random'} />
                <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'dynamic' && <DynamicTasksPage onEdit={handleEdit} />}
                        {activeTab === 'random' && <RandomTasksPage onEdit={handleEdit} />}
                        {activeTab === 'core-tasks' && <CoreTasksPage onEdit={handleEdit} />}
                        {activeTab === 'study-list' && <StudyListPage onEdit={handleStudyEdit} />}
                    </motion.div>
                </AnimatePresence>
            </main>

            {!isCoreTab && activeTab !== 'study-list' && (
                <FloatingActionButton onClick={handleCreate} category={currentCategory as 'dynamic' | 'random'} />
            )}

            {activeTab === 'study-list' && (
                <FloatingActionButton onClick={handleStudyCreate} category="dynamic" />
            )}

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
