import React, { useState } from 'react';
import { StudyListPage } from './StudyListPage';
import { LmsPage } from './LmsPage';
import { StudyListFormModal } from '@/components/study/StudyListFormModal';
import { StudyItem } from '@/types/StudyItem';
import { cn } from '@/components/ui/Button';
import { Dices, GraduationCap, Plus } from 'lucide-react';

type StudySubTab = 'roulette' | 'lms';

export const StudyHubPage: React.FC = () => {
    const [subTab, setSubTab] = useState<StudySubTab>('roulette');
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

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => setSubTab('roulette')}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-extrabold transition-all border-b-4',
                            subTab === 'roulette'
                                ? 'bg-white dark:bg-slate-800 shadow-md border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                                : 'bg-slate-100/70 dark:bg-slate-800/50 border-transparent text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800'
                        )}
                    >
                        <Dices className="w-4 h-4" />
                        Study Roulette
                    </button>
                    <button
                        onClick={() => setSubTab('lms')}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-extrabold transition-all border-b-4',
                            subTab === 'lms'
                                ? 'bg-white dark:bg-slate-800 shadow-md border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400'
                                : 'bg-slate-100/70 dark:bg-slate-800/50 border-transparent text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800'
                        )}
                    >
                        <GraduationCap className="w-4 h-4" />
                        LMS
                    </button>
                </div>

                {subTab === 'roulette' && (
                    <button
                        onClick={handleStudyCreate}
                        className="hidden md:flex items-center gap-2 text-white text-xs font-extrabold uppercase tracking-wider px-4 py-2.5 rounded-2xl border-b-4 shadow-lg transition-all hover:brightness-105 active:border-b-2 active:translate-y-0.5 bg-indigo-500 border-indigo-700 shadow-indigo-500/30"
                    >
                        <Plus className="w-4 h-4" />
                        New Item
                    </button>
                )}
            </div>

            {subTab === 'roulette' ? (
                <>
                    <StudyListPage onEdit={handleStudyEdit} />

                    {/* Mobile FAB */}
                    <button
                        onClick={handleStudyCreate}
                        className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 md:hidden text-white p-4 rounded-full z-40 bg-indigo-500 border-b-4 border-indigo-700 shadow-lg shadow-indigo-500/30 active:border-b-2 active:translate-y-0.5 transition-all duration-150"
                        aria-label="Create new study item"
                    >
                        <div className="relative w-7 h-7 flex items-center justify-center">
                            <Dices className="w-7 h-7" />
                            <div className="absolute -top-1 -right-1 bg-white text-indigo-600 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                                <Plus className="w-3 h-3 stroke-[3]" />
                            </div>
                        </div>
                    </button>

                    <StudyListFormModal
                        isOpen={isStudyModalOpen}
                        onClose={() => setStudyModalOpen(false)}
                        itemToEdit={studyItemToEdit}
                    />
                </>
            ) : (
                <LmsPage />
            )}
        </div>
    );
};
