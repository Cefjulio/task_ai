import React, { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Tag } from '@/types/Task';
import { Button } from '@/components/ui/Button';
import { X, Edit2, Trash2, Tag as TagIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ManageTagsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRESET_COLORS = [
    'bg-slate-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500',
    'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
    'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
    'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

export const ManageTagsModal: React.FC<ManageTagsModalProps> = ({ isOpen, onClose }) => {
    const { tags, addTag, updateTag, deleteTag } = useTaskStore();
    
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0]);

    if (!isOpen) return null;

    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
        setName('');
        setColor(PRESET_COLORS[0]);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Tag name is required');
            return;
        }

        if (isEditing && editingId) {
            updateTag(editingId, { name: name.trim(), color });
            toast.success('Tag updated');
        } else {
            // Check for duplicate name
            if (tags.some(t => t.name.toLowerCase() === name.trim().toLowerCase())) {
                toast.error('A tag with this name already exists');
                return;
            }
            addTag({ name: name.trim(), color });
            toast.success('Tag created');
        }
        resetForm();
    };

    const handleEditClick = (tag: Tag) => {
        setIsEditing(true);
        setEditingId(tag.id);
        setName(tag.name);
        setColor(tag.color);
    };

    const handleDeleteClick = (id: string) => {
        if (confirm('Are you sure you want to delete this tag? It will be removed from all tasks.')) {
            deleteTag(id);
            toast.success('Tag deleted');
            if (editingId === id) resetForm();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-slate-900/50 backdrop-blur-sm transition-opacity p-4">
            <div
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200"
                role="dialog"
            >
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <TagIcon className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold dark:text-white">Manage Tags</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                    {/* Form Section */}
                    <form onSubmit={handleSave} className="mb-8 space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {isEditing ? 'Edit Tag' : 'Create New Tag'}
                        </h3>
                        
                        <div>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Tag Name"
                                className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-2">Color</label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={`w-6 h-6 rounded-full transition-transform ${c} ${color === c ? 'ring-2 ring-offset-2 ring-primary scale-110 dark:ring-offset-slate-800' : 'hover:scale-110'}`}
                                        aria-label={`Select color ${c}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" className="flex-1" size="sm">
                                {isEditing ? 'Save Changes' : 'Create'}
                            </Button>
                            {isEditing && (
                                <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* List Section */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Your Tags</h3>
                        {tags.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                No tags created yet.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {tags.map(tag => (
                                    <div key={tag.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${tag.color}`} />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{tag.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEditClick(tag)}
                                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Edit tag"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(tag.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete tag"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
