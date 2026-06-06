import React, { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useHealthStore } from '@/store/healthStore';
import { Button } from '@/components/ui/Button';
import { Play, Square, Settings, Check, Bell, BellOff, Volume2, VolumeX, Flame, Hourglass, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const FastingCard: React.FC = () => {
    const { fastingState, updateFastingConfig, startFast, stopFast, resetFast, soundEnabled, toggleSound } = useSettingsStore();
    const { addHealthLog } = useHealthStore();

    const { fastingHours, eatingHours, activeFastStart, lastFastEnd } = fastingState;

    const [isEditingConfig, setIsEditingConfig] = useState(false);
    const [tempFastHours, setTempFastHours] = useState(fastingHours);
    const [tempEatHours, setTempEatHours] = useState(eatingHours);

    // Timer display states
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [isFastTargetReached, setIsFastTargetReached] = useState(false);
    const [isEatTargetReached, setIsEatTargetReached] = useState(false);

    // Notification states
    const [systemNotificationsEnabled, setSystemNotificationsEnabled] = useState(false);

    // Refs to avoid double-notifying
    const hasNotifiedFastEnd = useRef(false);
    const hasNotifiedEatEnd = useRef(false);

    // Play a gentle beep using Web Audio API
    const playChime = () => {
        if (!soundEnabled) return;
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            
            // Double note chime
            const playNote = (freq: number, start: number, duration: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(start);
                osc.stop(start + duration);
            };

            playNote(523.25, ctx.currentTime, 0.4); // C5
            playNote(659.25, ctx.currentTime + 0.15, 0.5); // E5
        } catch (e) {
            console.error('Audio chime failed:', e);
        }
    };

    // Check notification permission on mount
    useEffect(() => {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                setSystemNotificationsEnabled(true);
            }
        }
    }, []);

    // Request notification permission
    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            toast.error('System notifications are not supported by this browser.');
            return;
        }
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setSystemNotificationsEnabled(true);
                toast.success('System notifications enabled!');
                new Notification('Taskify Health', {
                    body: 'You will receive notifications for your fasting and eating milestones.',
                    icon: '/favicon.ico'
                });
            } else {
                setSystemNotificationsEnabled(false);
                toast.error('Permission denied for system notifications.');
            }
        } catch (e) {
            console.error('Notification permission request error:', e);
        }
    };

    // Main timer interval loop
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();

            // 1. FASTING MODE ACTIVE
            if (activeFastStart) {
                const startTime = new Date(activeFastStart).getTime();
                const diffMs = Math.max(0, now - startTime);
                const diffSec = Math.floor(diffMs / 1000);
                setElapsedSeconds(diffSec);

                const targetSec = fastingHours * 3600;
                const remainSec = Math.max(0, targetSec - diffSec);
                setRemainingSeconds(remainSec);

                // Check target reached
                if (diffSec >= targetSec) {
                    setIsFastTargetReached(true);
                    if (!hasNotifiedFastEnd.current) {
                        hasNotifiedFastEnd.current = true;
                        playChime();
                        toast.success(`🎉 You achieved your ${fastingHours}-hour fasting goal!`, { duration: 8000 });
                        if (systemNotificationsEnabled) {
                            new Notification('Fasting Goal Reached! 🎉', {
                                body: `Congratulations! You have completed your ${fastingHours}-hour fast. You can now stop the timer to log it.`,
                                requireInteraction: true
                            });
                        }
                    }
                } else {
                    setIsFastTargetReached(false);
                }
                hasNotifiedEatEnd.current = false;
            } 
            
            // 2. EATING MODE ACTIVE (Fasting not active, lastFastEnd exists)
            else if (lastFastEnd) {
                const endTime = new Date(lastFastEnd).getTime();
                const targetEndMs = endTime + eatingHours * 3600 * 1000;
                const remainMs = Math.max(0, targetEndMs - now);
                const remainSec = Math.floor(remainMs / 1000);
                setRemainingSeconds(remainSec);

                if (remainSec <= 0) {
                    setIsEatTargetReached(true);
                    if (!hasNotifiedEatEnd.current) {
                        hasNotifiedEatEnd.current = true;
                        playChime();
                        toast.error(`⏳ Eating window complete! Ready to start fasting?`, { duration: 8000 });
                        if (systemNotificationsEnabled) {
                            new Notification('Fasting Window Starting! ⏳', {
                                body: `Your ${eatingHours}-hour eating window is over. It is time to start your next fast.`,
                                requireInteraction: true
                            });
                        }
                    }
                } else {
                    setIsEatTargetReached(false);
                }
                hasNotifiedFastEnd.current = false;
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activeFastStart, lastFastEnd, fastingHours, eatingHours, systemNotificationsEnabled, soundEnabled]);

    // Handle Config changes
    const handleSaveConfig = () => {
        if (tempFastHours + tempEatHours !== 24) {
            toast.error('Fast and Eat hours must sum to 24 hours!');
            return;
        }
        updateFastingConfig(tempFastHours, tempEatHours);
        setIsEditingConfig(false);
        toast.success(`Fasting cycle updated to ${tempFastHours}:${tempEatHours}!`);
    };

    const handleQuickPreset = (fast: number, eat: number) => {
        setTempFastHours(fast);
        setTempEatHours(eat);
    };

    // Format seconds to HH:MM:SS
    const formatTime = (totalSec: number) => {
        const hrs = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Handle timer actions
    const handleStartFast = () => {
        startFast();
        hasNotifiedFastEnd.current = false;
        toast.success('Fasting started! Keep hydrated! 💧');
    };

    const handleStopFast = () => {
        const durationMin = stopFast();
        if (durationMin !== null && durationMin > 0) {
            const hrs = Math.floor(durationMin / 60);
            const mins = durationMin % 60;
            const timeDesc = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

            // Log it
            addHealthLog({
                type: 'fast',
                loggedAt: new Date().toISOString(),
                fastingDuration: durationMin,
                description: `Fasted for ${timeDesc} (Target: ${fastingHours}h)`
            });
            toast.success(`Fasting session of ${timeDesc} logged successfully!`);
        } else {
            toast.error('Fasting session was too short to log.');
        }
        hasNotifiedFastEnd.current = false;
    };

    const handleResetFast = () => {
        if (window.confirm('Are you sure you want to reset the current fast/eat cycle state?')) {
            resetFast();
            toast.success('Fasting state reset.');
        }
    };

    // Circle progress calculation
    const radius = 70;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    
    let progressPercentage = 0;
    if (activeFastStart) {
        progressPercentage = Math.min(100, (elapsedSeconds / (fastingHours * 3600)) * 100);
    } else if (lastFastEnd) {
        const totalEatSec = eatingHours * 3600;
        progressPercentage = Math.min(100, (remainingSeconds / totalEatSec) * 100);
    }
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Header / Config controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${activeFastStart ? 'text-amber-500 fill-amber-500/10 animate-pulse' : 'text-slate-400'}`} />
                    <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                        Fasting Tracker
                    </h2>
                </div>
                
                <div className="flex items-center gap-1">
                    <button
                        onClick={toggleSound}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                        title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
                    >
                        {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={systemNotificationsEnabled ? () => setSystemNotificationsEnabled(false) : requestNotificationPermission}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                        title={systemNotificationsEnabled ? 'Disable System Notifications' : 'Enable System Notifications'}
                    >
                        {systemNotificationsEnabled ? <Bell className="w-4 h-4 text-rose-500" /> : <BellOff className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setIsEditingConfig(!isEditingConfig)}
                        className={`p-1.5 rounded-lg transition-colors ${isEditingConfig ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/30' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Editing settings view */}
            {isEditingConfig ? (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Fasting Ratio Settings</h3>
                    
                    {/* Presets */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { f: 16, e: 8, label: '16:8 Standard' },
                            { f: 18, e: 6, label: '18:6 Intermediate' },
                            { f: 20, e: 4, label: '20:4 Warrior' }
                        ].map(({ f, e, label }) => (
                            <button
                                key={label}
                                onClick={() => handleQuickPreset(f, e)}
                                className={`text-[10px] font-black py-2 px-1 rounded-xl border transition-all ${
                                    tempFastHours === f
                                        ? 'bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-500/10'
                                        : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Sliders */}
                    <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300">
                                <span>Fasting Target:</span>
                                <span className="text-rose-500">{tempFastHours} Hours</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="23"
                                value={tempFastHours}
                                onChange={(e) => {
                                    const fast = Number(e.target.value);
                                    setTempFastHours(fast);
                                    setTempEatHours(24 - fast);
                                }}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300">
                                <span>Eating Window:</span>
                                <span className="text-emerald-500">{tempEatHours} Hours</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="23"
                                value={tempEatHours}
                                onChange={(e) => {
                                    const eat = Number(e.target.value);
                                    setTempEatHours(eat);
                                    setTempFastHours(24 - eat);
                                }}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setIsEditingConfig(false)}
                            variant="outline"
                            className="flex-1 text-xs border-slate-200 dark:border-slate-800 py-1.5"
                            size="sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveConfig}
                            className="flex-1 text-xs bg-rose-500 hover:bg-rose-600 text-white py-1.5"
                            size="sm"
                        >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Save Config
                        </Button>
                    </div>
                </div>
            ) : (
                /* Timer ring display */
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative flex items-center justify-center">
                        <svg className="w-40 h-40 transform -rotate-90">
                            {/* Background Track */}
                            <circle
                                cx="80"
                                cy="80"
                                r={radius}
                                stroke="currentColor"
                                className="text-slate-100 dark:text-slate-800"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                            />
                            {/* Active Progress */}
                            <circle
                                cx="80"
                                cy="80"
                                r={radius}
                                stroke="currentColor"
                                className={`transition-all duration-500 ${
                                    activeFastStart 
                                        ? isFastTargetReached ? 'text-amber-500' : 'text-rose-500'
                                        : isEatTargetReached ? 'text-rose-400' : 'text-emerald-500'
                                }`}
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                fill="transparent"
                            />
                        </svg>

                        {/* Text inside the ring */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                {activeFastStart ? 'FASTING' : 'EATING'}
                            </span>
                            <span className="text-2xl font-black text-slate-800 dark:text-white font-mono tracking-tight my-0.5">
                                {activeFastStart ? formatTime(elapsedSeconds) : (lastFastEnd ? formatTime(remainingSeconds) : '00:00:00')}
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                Ratio {fastingHours}:{eatingHours}
                            </span>
                        </div>
                    </div>

                    {/* Target and Info labels */}
                    <div className="text-center space-y-1 w-full px-4">
                        {activeFastStart ? (
                            <>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {isFastTargetReached ? (
                                        <span className="text-amber-500 font-extrabold">🎉 Target Completed!</span>
                                    ) : (
                                        <span>Goal: {fastingHours} hours fast</span>
                                    )}
                                </p>
                                {!isFastTargetReached && (
                                    <p className="text-[10px] font-semibold text-slate-400 flex items-center justify-center gap-1">
                                        <Hourglass className="w-3 h-3 text-rose-500" />
                                        {formatTime(remainingSeconds)} remaining
                                    </p>
                                )}
                            </>
                        ) : lastFastEnd ? (
                            <>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {isEatTargetReached ? (
                                        <span className="text-rose-500 font-extrabold">⏳ Start your fast!</span>
                                    ) : (
                                        <span>Eating window: {eatingHours} hours</span>
                                    )}
                                </p>
                                {!isEatTargetReached && (
                                    <p className="text-[10px] font-semibold text-slate-400 flex items-center justify-center gap-1">
                                        Next fast starts in {formatTime(remainingSeconds)}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-xs font-bold text-slate-400">
                                Start your first fasting session to activate the cycle.
                            </p>
                        )}
                    </div>

                    {/* Timer Controls */}
                    <div className="flex items-center gap-2 w-full pt-2">
                        {activeFastStart ? (
                            <Button
                                onClick={handleStopFast}
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/10 text-xs font-black uppercase tracking-wider"
                                size="sm"
                            >
                                <Square className="w-3.5 h-3.5 mr-2 fill-white" />
                                Stop & Log Fast
                            </Button>
                        ) : (
                            <Button
                                onClick={handleStartFast}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10 text-xs font-black uppercase tracking-wider"
                                size="sm"
                            >
                                <Play className="w-3.5 h-3.5 mr-2 fill-white" />
                                Start Fasting
                            </Button>
                        )}

                        {/* Reset button */}
                        {(activeFastStart || lastFastEnd) && (
                            <button
                                onClick={handleResetFast}
                                className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0"
                                title="Reset fasting stats"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};
export default FastingCard;
