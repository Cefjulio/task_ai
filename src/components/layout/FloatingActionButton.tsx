import { Plus, Target, Zap } from 'lucide-react';

interface FloatingActionButtonProps {
    onClick: () => void;
    category?: 'dynamic' | 'random';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, category = 'dynamic' }) => {
    const isRandom = category === 'random';

    return (
        <button
            onClick={onClick}
            className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 xl:right-12 xl:bottom-12 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 focus:outline-none focus:ring-4 group ${isRandom
                    ? 'bg-teal-500 hover:bg-teal-600 focus:ring-teal-500/50 shadow-teal-500/20'
                    : 'bg-primary hover:bg-primary-dark focus:ring-primary/50 shadow-primary/20'
                } hover:-translate-y-1 active:scale-95`}
            aria-label={`Create new ${category} task`}
        >
            <div className="relative">
                {isRandom ? (
                    <Target className="w-8 h-8 transition-transform group-hover:scale-110" />
                ) : (
                    <Zap className="w-8 h-8 transition-transform group-hover:scale-110" />
                )}
                <div className="absolute -top-1 -right-1 bg-white text-slate-900 rounded-full w-5 h-5 flex items-center justify-center border-2 border-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Plus className="w-3 h-3 font-black" />
                </div>
            </div>
        </button>
    );
};
