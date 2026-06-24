import React from 'react';
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
            className={`fixed bottom-6 right-5 sm:bottom-8 sm:right-8 md:hidden text-white p-4 rounded-full z-40 focus:outline-none group transition-all duration-150 ${
                isRandom
                    ? 'bg-orange-500 border-b-4 border-orange-700 shadow-lg shadow-orange-500/30 active:border-b-2 active:translate-y-0.5'
                    : 'bg-primary border-b-4 border-primary-dark shadow-lg shadow-primary/30 active:border-b-2 active:translate-y-0.5'
            }`}
            aria-label={`Create new ${category} task`}
        >
            <div className="relative w-7 h-7 flex items-center justify-center">
                {isRandom ? (
                    <Target className="w-7 h-7" />
                ) : (
                    <Zap className="w-7 h-7 fill-current" />
                )}
                <div className="absolute -top-1 -right-1 bg-white text-primary rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    <Plus className="w-3 h-3 stroke-[3]" />
                </div>
            </div>
        </button>
    );
};
