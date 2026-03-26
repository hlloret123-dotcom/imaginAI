import React from 'react';
import { Clock, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { GenerationResult } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  history: GenerationResult[];
  onSelect: (item: GenerationResult) => void;
  onClear: () => void;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  history,
  onSelect,
  onClear,
  onClose
}) => {
  return (
    <div className="flex flex-col h-full bg-dark-card border-r border-dark-border">
       {/* Header */}
       <div className="p-4 border-b border-dark-border flex items-center justify-between shrink-0 h-16">
         <div className="flex items-center gap-2 text-slate-200">
           <Clock className="w-5 h-5 text-primary-400" />
           <span className="font-semibold">History</span>
           <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{history.length}</span>
         </div>
         <div className="flex items-center gap-1">
            {history.length > 0 && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onClear(); }} 
                    className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors group" 
                    title="Clear History"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
            <button 
                onClick={onClose} 
                className="lg:hidden p-2 hover:bg-slate-800 text-slate-400 rounded-lg"
            >
                <X className="w-5 h-5" />
            </button>
         </div>
       </div>

       {/* List */}
       <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center p-4">
                <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mb-3">
                    <ImageIcon className="w-6 h-6 opacity-50" />
                </div>
                <p className="text-sm font-medium text-slate-400">No history yet</p>
                <p className="text-xs mt-1 text-slate-500">Generated images will save here automatically.</p>
            </div>
          ) : (
            history.map((item) => (
                <div 
                    key={item.timestamp} 
                    onClick={() => onSelect(item)}
                    className="group flex gap-3 p-3 rounded-xl bg-dark-bg border border-dark-border hover:border-primary-500/50 cursor-pointer transition-all hover:bg-slate-800/80 active:scale-[0.98]"
                >
                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-black border border-dark-border">
                        <img 
                            src={item.imageUrl} 
                            alt="thumbnail" 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                        />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-xs text-slate-300 line-clamp-2 mb-1.5 font-medium group-hover:text-primary-200 transition-colors leading-relaxed">
                            {item.prompt}
                        </p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <span>{new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            <span>•</span>
                            <span>{new Date(item.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                    </div>
                </div>
            ))
          )}
       </div>
    </div>
  );
};