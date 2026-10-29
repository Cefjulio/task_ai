import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/taskStore';
import { useStudyStore } from '@/store/studyStore';
import { useLmsStore } from '@/store/lmsStore';
import { useDailyStore } from '@/store/dailyStore';
import { useNavStore } from '@/store/navStore';
import { useHydrated } from '@/hooks/useHydrated';
import { StudyItem } from '@/types/StudyItem';
import { buildReminderDisplays } from '@/utils/reminderDisplay';
import { SNOOZE_MS, isSnoozed, resolveReminder, resolveStudy, todayStr } from '@/utils/dailyLogic';
import { celebrate, celebrateMilestone } from '@/utils/celebrate';
import { dailyFx } from '@/utils/dailyFx';
import { DailyReminderModal } from './DailyReminderModal';
import { DailyStudyModal } from './DailyStudyModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const isStudyItemDone = (item: StudyItem) => item.status === 'reviewed' || item.status === 'completed';
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Decides what the daily modals should be doing: today's goal/plan reminder first, then today's two study picks.
 * Everything it decides is saved through the daily store, so it survives reloads and (once synced) devices.
 */
export const DailyOrchestrator: React.FC = () => {
    const goals = useTaskStore(s => s.goals);
    const plans = useTaskStore(s => s.plans);
    const studyItems = useStudyStore(s => s.studyItems);
    const markStudyItemStatus = useStudyStore(s => s.markStudyItemStatus);
    const courses = useLmsStore(s => s.courses);
    const lessons = useLmsStore(s => s.lessons);
    const setLessonStatus = useLmsStore(s => s.setLessonStatus);

    const reminderState = useDailyStore(s => s.reminder);
    const studyState = useDailyStore(s => s.study);
    const setReminder = useDailyStore(s => s.setReminder);
    const setStudy = useDailyStore(s => s.setStudy);
    const acknowledge = useDailyStore(s => s.acknowledge);
    const snoozeStudy = useDailyStore(s => s.snoozeStudy);

    // Wait for every store to finish loading — otherwise empty lists would make us pick the wrong things
    const hydrated = [
        useHydrated(useTaskStore),
        useHydrated(useStudyStore),
        useHydrated(useLmsStore),
        useHydrated(useDailyStore),
    ].every(Boolean);

    // A clock that also notices midnight, a finished snooze, and the tab coming back to the foreground
    const [today, setToday] = useState(todayStr);
    const [now, setNow] = useState(Date.now);
    useEffect(() => {
        const refresh = () => { setToday(todayStr()); setNow(Date.now()); };
        const interval = window.setInterval(refresh, 30_000);
        document.addEventListener('visibilitychange', refresh);
        return () => {
            window.clearInterval(interval);
            document.removeEventListener('visibilitychange', refresh);
        };
    }, []);
    useEffect(() => {
        const until = studyState.snoozedUntil;
        if (!until || until <= Date.now()) return undefined;
        const timer = window.setTimeout(() => setNow(Date.now()), until - Date.now() + 100);
        return () => window.clearTimeout(timer);
    }, [studyState.snoozedUntil]);

    // ── Daily reminder (goal / plan) ──
    const displays = useMemo(() => buildReminderDisplays(goals, plans), [goals, plans]);
    const reminder = useMemo(
        () => (hydrated ? resolveReminder(reminderState, displays, today) : null),
        [hydrated, reminderState, displays, today]
    );
    useEffect(() => {
        if (reminder && !same(reminder.state, reminderState)) setReminder(reminder.state);
    }, [reminder, reminderState, setReminder]);

    // ── Daily study (one Study Roulette item + one LMS lesson) ──
    const lessonPool = useMemo(() => lessons.filter(l => courses.some(c => c.id === l.courseId)), [lessons, courses]);
    const study = useMemo(
        () => (hydrated
            ? resolveStudy(studyState, studyItems, lessonPool, isStudyItemDone, l => l.status === 'completed', today)
            : null),
        [hydrated, studyState, studyItems, lessonPool, today]
    );
    useEffect(() => {
        if (study && !same(study.state, studyState)) setStudy(study.state);
    }, [study, studyState, setStudy]);

    const rouletteItem = study?.rouletteId ? studyItems.find(i => i.id === study.rouletteId) ?? null : null;
    const lesson = study?.lessonId ? lessonPool.find(l => l.id === study.lessonId) ?? null : null;
    const course = lesson ? courses.find(c => c.id === lesson.courseId) ?? null : null;
    const rouletteDone = rouletteItem ? isStudyItemDone(rouletteItem) : false;
    const lessonDone = lesson ? lesson.status === 'completed' : false;
    const pending = (rouletteItem && !rouletteDone ? 1 : 0) + (lesson && !lessonDone ? 1 : 0);

    const reminderToShow = reminder?.show ?? null;
    const studyEligible = hydrated && !reminderToShow && pending > 0 && !isSnoozed(studyState, now);

    // Once opened, the study modal stays open (even after the last item is done) until the user closes it
    const [studyOpen, setStudyOpen] = useState(false);
    useEffect(() => {
        if (studyEligible) setStudyOpen(true);
    }, [studyEligible]);

    // ── Handlers ──
    const handleAcknowledge = () => {
        if (!reminderToShow) return;
        const finishedRound = acknowledge(reminderToShow.key, today, displays.map(d => d.key));
        if (finishedRound) celebrateMilestone("You've been through every goal & plan — a fresh round starts tomorrow! 🔄");
    };

    const handleSnooze = () => {
        const until = Date.now() + SNOOZE_MS;
        snoozeStudy(until);
        setNow(Date.now());
        setStudyOpen(false);
        dailyFx.snoozed();
        toast(`Snoozed — back at ${format(until, 'h:mm a')} 😴`, { duration: 3500 });
    };

    const finishedDay = () => celebrateMilestone("Today's study is done — see you tomorrow! 🎓");

    const completeRoulette = (origin: HTMLElement) => {
        if (!rouletteItem) return;
        markStudyItemStatus(rouletteItem.id, 'reviewed');
        celebrate('task', origin);
        if (!lesson || lessonDone) finishedDay();
    };

    const completeLesson = (origin: HTMLElement) => {
        if (!lesson) return;
        setLessonStatus(lesson.id, 'completed');
        celebrate('task', origin);
        if (!rouletteItem || rouletteDone) finishedDay();
    };

    const openInBook = () => {
        if (!lesson) return;
        useNavStore.getState().go({ tab: 'study-list', studySubTab: 'lms', courseId: lesson.courseId, lessonId: lesson.id });
        setStudyOpen(false);
    };

    const showStudy = studyOpen && !reminderToShow && (rouletteItem || lesson);

    return (
        <AnimatePresence mode="wait">
            {reminderToShow ? (
                <DailyReminderModal
                    key={`reminder:${reminderToShow.key}`}
                    item={reminderToShow}
                    index={reminderState.acknowledged.length + 1}
                    total={displays.length}
                    onAcknowledge={handleAcknowledge}
                />
            ) : showStudy ? (
                <DailyStudyModal
                    key="study"
                    rouletteItem={rouletteItem}
                    rouletteDone={rouletteDone}
                    lesson={lesson}
                    lessonDone={lessonDone}
                    course={course}
                    onCompleteRoulette={completeRoulette}
                    onUndoRoulette={() => rouletteItem && markStudyItemStatus(rouletteItem.id, 'pending')}
                    onCompleteLesson={completeLesson}
                    onUndoLesson={() => lesson && setLessonStatus(lesson.id, 'not_started')}
                    onOpenInBook={openInBook}
                    onSnooze={handleSnooze}
                    onClose={() => setStudyOpen(false)}
                />
            ) : null}
        </AnimatePresence>
    );
};
