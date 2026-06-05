import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Utensils, Droplet, Activity, Heart, Pill, Upload, Plus, Minus } from 'lucide-react';
import { HealthLog, HealthLogType, MealCategory } from '@/types/Health';
import { useHealthStore } from '@/store/healthStore';
import { cn } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface HealthFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    logToEdit: HealthLog | null;
    defaultDate?: string; // YYYY-MM-DD
}

const LOG_TYPES: { type: HealthLogType; label: string; icon: React.ComponentType<any>; colorClass: string; bgClass: string }[] = [
    { type: 'meal', label: 'Meal', icon: Utensils, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10' },
    { type: 'water', label: 'Water', icon: Droplet, colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10' },
    { type: 'exercise', label: 'Exercise', icon: Activity, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10' },
    { type: 'vitals', label: 'Vitals', icon: Heart, colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10' },
    { type: 'medicine', label: 'Medicine', icon: Pill, colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10' }
];

const MEAL_CATEGORIES: { value: MealCategory; label: string; color: string }[] = [
    { value: 'carbs', label: 'Carbs Heavy', color: 'bg-amber-500 border-amber-500 text-white' },
    { value: 'protein', label: 'High Protein', color: 'bg-rose-500 border-rose-500 text-white' },
    { value: 'fat', label: 'Healthy Fats', color: 'bg-yellow-500 border-yellow-500 text-white' },
    { value: 'balanced', label: 'Balanced Meal', color: 'bg-emerald-500 border-emerald-500 text-white' },
    { value: 'other', label: 'Other', color: 'bg-slate-500 border-slate-500 text-white' }
];

export const HealthFormModal: React.FC<HealthFormModalProps> = ({
    isOpen,
    onClose,
    logToEdit,
    defaultDate
}) => {
    const { addHealthLog, updateHealthLog, healthTags } = useHealthStore();

    const [activeType, setActiveType] = useState<HealthLogType>('meal');
    const [loggedAt, setLoggedAt] = useState('');
    const [description, setDescription] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [isCompresing, setIsCompressing] = useState(false);

    // Meal specifics
    const [mealCategory, setMealCategory] = useState<MealCategory>('balanced');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Water specifics
    const [waterAmount, setWaterAmount] = useState<number>(250);

    // Exercise specifics
    const [exerciseDuration, setExerciseDuration] = useState<number>(30);
    const [exerciseIntensity, setExerciseIntensity] = useState<'low' | 'medium' | 'high'>('medium');

    // Vitals specifics
    const [systolic, setSystolic] = useState<string>('');
    const [diastolic, setDiastolic] = useState<string>('');
    const [bloodSugar, setBloodSugar] = useState<string>('');

    // Medicine specifics
    const [medicineName, setMedicineName] = useState('');
    const [medicineDosage, setMedicineDosage] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Setup time
            const now = new Date();
            const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);

            if (logToEdit) {
                setActiveType(logToEdit.type);
                // format ISO date string to YYYY-MM-DDTHH:MM
                const logTime = logToEdit.loggedAt.slice(0, 16);
                setLoggedAt(logTime);
                setDescription(logToEdit.description || '');
                setMediaUrl(logToEdit.mediaUrl || '');
                
                // Meal
                setMealCategory(logToEdit.mealCategory || 'balanced');
                setSelectedTags(logToEdit.tags || []);
                
                // Water
                setWaterAmount(logToEdit.waterAmount || 250);
                
                // Exercise
                setExerciseDuration(logToEdit.exerciseDuration || 30);
                setExerciseIntensity(logToEdit.exerciseIntensity || 'medium');
                
                // Vitals
                setSystolic(logToEdit.systolic?.toString() || '');
                setDiastolic(logToEdit.diastolic?.toString() || '');
                setBloodSugar(logToEdit.bloodSugar?.toString() || '');
                
                // Medicine
                setMedicineName(logToEdit.medicineName || '');
                setMedicineDosage(logToEdit.medicineDosage || '');
            } else {
                setActiveType('meal');
                
                // Use default date if provided
                if (defaultDate) {
                    const todayAtCurrentTime = `${defaultDate}T${localISOTime.split('T')[1]}`;
                    setLoggedAt(todayAtCurrentTime);
                } else {
                    setLoggedAt(localISOTime);
                }
                
                setDescription('');
                setMediaUrl('');
                setMealCategory('balanced');
                setSelectedTags([]);
                setWaterAmount(250);
                setExerciseDuration(30);
                setExerciseIntensity('medium');
                setSystolic('');
                setDiastolic('');
                setBloodSugar('');
                setMedicineName('');
                setMedicineDosage('');
            }
        }
    }, [isOpen, logToEdit, defaultDate]);

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // 0.6 compression
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if image
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            toast.error('Please upload an image or video file.');
            return;
        }

        // Limit video size
        if (file.type.startsWith('video/')) {
            if (file.size > 8 * 1024 * 1024) { // 8MB limit for videos
                toast.error('Video files must be under 8MB.');
                return;
            }
            setIsCompressing(true);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                setMediaUrl(event.target?.result as string);
                setIsCompressing(false);
            };
            reader.onerror = () => {
                toast.error('Failed to read video file.');
                setIsCompressing(false);
            };
            return;
        }

        // Handle image with compression
        setIsCompressing(true);
        try {
            const compressedBase64 = await compressImage(file);
            setMediaUrl(compressedBase64);
        } catch (error) {
            console.error('Compression error:', error);
            toast.error('Failed to process image.');
        } finally {
            setIsCompressing(false);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert loggedAt date string to proper ISO String
        const isoLoggedAt = new Date(loggedAt).toISOString();

        // Base Data
        const baseData: Partial<HealthLog> = {
            type: activeType,
            loggedAt: isoLoggedAt,
            description: description.trim() || undefined,
        };

        if (activeType === 'meal') {
            if (!description.trim()) {
                toast.error('Please describe what you ate.');
                return;
            }
            baseData.mealCategory = mealCategory;
            baseData.tags = selectedTags;
            baseData.mediaUrl = mediaUrl || undefined;
        } else if (activeType === 'water') {
            if (waterAmount <= 0) {
                toast.error('Water amount must be positive.');
                return;
            }
            baseData.waterAmount = waterAmount;
        } else if (activeType === 'exercise') {
            if (!description.trim()) {
                toast.error('Please describe the exercise.');
                return;
            }
            if (exerciseDuration <= 0) {
                toast.error('Duration must be positive.');
                return;
            }
            baseData.exerciseDuration = exerciseDuration;
            baseData.exerciseIntensity = exerciseIntensity;
        } else if (activeType === 'vitals') {
            const parsedSys = systolic ? parseInt(systolic) : undefined;
            const parsedDia = diastolic ? parseInt(diastolic) : undefined;
            const parsedSugar = bloodSugar ? parseInt(bloodSugar) : undefined;

            if (!parsedSys && !parsedDia && !parsedSugar) {
                toast.error('Please input Blood Pressure values or Blood Sugar level.');
                return;
            }

            if ((parsedSys && !parsedDia) || (!parsedSys && parsedDia)) {
                toast.error('Please enter both Systolic and Diastolic blood pressure levels.');
                return;
            }

            baseData.systolic = parsedSys;
            baseData.diastolic = parsedDia;
            baseData.bloodSugar = parsedSugar;
        } else if (activeType === 'medicine') {
            if (!medicineName.trim()) {
                toast.error('Medicine name is required.');
                return;
            }
            baseData.medicineName = medicineName.trim();
            baseData.medicineDosage = medicineDosage.trim() || undefined;
        }

        const logPayload = baseData as Omit<HealthLog, 'id' | 'createdAt' | 'updatedAt'>;

        if (logToEdit) {
            updateHealthLog(logToEdit.id, logPayload);
            toast.success('Log entry updated');
        } else {
            addHealthLog(logPayload);
            toast.success('Log entry added');
        }

        onClose();
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
                >
                    {/* Header */}
                    <div className="flex-none flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                            {logToEdit ? 'Edit Health Log' : 'New Health Log'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mode selector (Only if creating new log) */}
                    {!logToEdit && (
                        <div className="flex-none p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex overflow-x-auto gap-2 scrollbar-none justify-around sm:justify-start">
                            {LOG_TYPES.map(opt => {
                                const Icon = opt.icon;
                                const isActive = activeType === opt.type;
                                return (
                                    <button
                                        key={opt.type}
                                        type="button"
                                        onClick={() => {
                                            setActiveType(opt.type);
                                            // auto default descriptions for water/vitals
                                            if (opt.type === 'water') setDescription('Drank water');
                                            else if (opt.type === 'vitals') setDescription('Measured vitals');
                                            else setDescription('');
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shrink-0",
                                            isActive
                                                ? `${opt.bgClass} ${opt.colorClass} scale-100 ring-1 ring-current`
                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-70 hover:opacity-100 scale-95"
                                        )}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Form Scroll Body */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        <form id="health-form" onSubmit={handleSave} className="space-y-5">
                            
                            {/* Date and Time */}
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                    Log Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={loggedAt}
                                    onChange={e => setLoggedAt(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-shadow font-medium outline-none"
                                    required
                                />
                            </div>

                            {/* TYPE SPECIFIC FIELDS */}

                            {/* 1. Meal Fields */}
                            {activeType === 'meal' && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                            What did you eat?
                                        </label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="e.g. Scrambled eggs with whole-wheat toast"
                                            className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500 transition-shadow font-medium outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                            Nutritional Category
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {MEAL_CATEGORIES.map(opt => {
                                                const isSel = mealCategory === opt.value;
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setMealCategory(opt.value)}
                                                        className={cn(
                                                            "px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex-1 text-center",
                                                            isSel
                                                                ? opt.color
                                                                : "bg-transparent text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                                        )}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Upload media */}
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                            Upload Photo or Video
                                        </label>
                                        <div className="relative group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*,video/*"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {mediaUrl ? (
                                                <div className="w-full relative rounded-xl overflow-hidden shadow-inner max-h-48 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                                                    {mediaUrl.startsWith('data:video/') || mediaUrl.endsWith('.mp4') ? (
                                                        <video src={mediaUrl} controls className="max-h-48 max-w-full rounded-xl" />
                                                    ) : (
                                                        <img src={mediaUrl} alt="Meal preview" className="object-cover max-h-48 max-w-full rounded-xl" />
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            setMediaUrl('');
                                                        }}
                                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                                    <Upload className="w-8 h-8 group-hover:scale-105 transition-transform" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">
                                                        {isCompresing ? 'Processing file...' : 'Choose media file'}
                                                    </span>
                                                    <span className="text-[10px] opacity-65">Supports Images & small Videos</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Custom Meal Tags */}
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                            Tags / Impact Categories
                                        </label>
                                        {healthTags.length === 0 ? (
                                            <p className="text-[11px] text-slate-400">
                                                No health tags created yet. Use the 🏷️ Manage Tags button on the dashboard to create tags.
                                            </p>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {healthTags.map(tag => {
                                                    const isSel = selectedTags.includes(tag.id);
                                                    return (
                                                        <button
                                                            key={tag.id}
                                                            type="button"
                                                            onClick={() => toggleTag(tag.id)}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-2",
                                                                isSel
                                                                    ? `${tag.color} text-white border-transparent shadow-sm scale-100`
                                                                    : "bg-transparent opacity-60 hover:opacity-100 scale-95 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                                                            )}
                                                        >
                                                            {!isSel && <div className={cn("w-2 h-2 rounded-full inline-block mr-1.5", tag.color)} />}
                                                            {tag.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 2. Water Fields */}
                            {activeType === 'water' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center justify-center p-6 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100/30 dark:border-blue-900/30">
                                        <Droplet className="w-16 h-16 text-blue-500 fill-blue-500/20 mb-4 animate-bounce" style={{ animationDuration: '3s' }} />
                                        <div className="flex items-center gap-6">
                                            <button
                                                type="button"
                                                onClick={() => setWaterAmount(prev => Math.max(50, prev - 50))}
                                                className="w-10 h-10 rounded-full border-2 border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                                                {waterAmount} <span className="text-lg font-bold text-slate-400">ml</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setWaterAmount(prev => prev + 50)}
                                                className="w-10 h-10 rounded-full border-2 border-blue-500 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                            Quick Presets
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[250, 350, 500, 750].map(amount => (
                                                <button
                                                    key={amount}
                                                    type="button"
                                                    onClick={() => setWaterAmount(amount)}
                                                    className={cn(
                                                        "py-2 px-1 rounded-xl text-xs font-bold border transition-colors",
                                                        waterAmount === amount
                                                            ? "bg-blue-500 border-blue-500 text-white"
                                                            : "bg-transparent text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                                                    )}
                                                >
                                                    {amount} ml
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. Exercise Fields */}
                            {activeType === 'exercise' && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                            Activity Name / Description
                                        </label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="e.g. Cardio on Treadmill, Yoga session"
                                            className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500 transition-shadow font-medium outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                            Duration (Minutes)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={exerciseDuration}
                                            onChange={e => setExerciseDuration(parseInt(e.target.value) || 0)}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-shadow font-medium outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                            Intensity
                                        </label>
                                        <div className="flex gap-2">
                                            {['low', 'medium', 'high'].map(intensity => (
                                                <button
                                                    key={intensity}
                                                    type="button"
                                                    onClick={() => setExerciseIntensity(intensity as any)}
                                                    className={cn(
                                                        "flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors",
                                                        exerciseIntensity === intensity
                                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                                            : "bg-transparent text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                                                    )}
                                                >
                                                    {intensity}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 4. Vitals Fields */}
                            {activeType === 'vitals' && (
                                <div className="space-y-5">
                                    <div>
                                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                                            Blood Pressure (mmHg)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                                    Systolic (Upper)
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 120"
                                                    value={systolic}
                                                    onChange={e => setSystolic(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-shadow font-medium outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                                    Diastolic (Lower)
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 80"
                                                    value={diastolic}
                                                    onChange={e => setDiastolic(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-shadow font-medium outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                            Blood Sugar / Glucose (mg/dL)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 95"
                                            value={bloodSugar}
                                            onChange={e => setBloodSugar(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-shadow font-medium outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* 5. Medicine Fields */}
                            {activeType === 'medicine' && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                            Medicine Name
                                        </label>
                                        <input
                                            type="text"
                                            value={medicineName}
                                            onChange={e => setMedicineName(e.target.value)}
                                            placeholder="e.g. Metformin, Losartan"
                                            className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-shadow font-medium outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                                            Dosage / Details
                                        </label>
                                        <input
                                            type="text"
                                            value={medicineDosage}
                                            onChange={e => setMedicineDosage(e.target.value)}
                                            placeholder="e.g. 500mg, 1 tablet"
                                            className="w-full bg-slate-50 dark:bg-slate-950 border-0 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500 transition-shadow font-medium outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>

                    {/* Footer */}
                    <div className="flex-none p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="health-form"
                            disabled={isCompresing}
                            className="flex items-center gap-2 px-8 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-rose-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            <Save className="w-4 h-4" />
                            {logToEdit ? 'Save Changes' : 'Add Entry'}
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};
