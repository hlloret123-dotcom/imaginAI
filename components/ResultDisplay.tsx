import React from 'react';
import { Download, ExternalLink, Sparkles } from 'lucide-react';
import { GenerationResult } from '../types';

interface ResultDisplayProps {
  result: GenerationResult | null;
  isGenerating: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isGenerating }) => {
  if (isGenerating) {
    return (
      <div className="h-full min-h-[500px] bg-dark-card rounded-2xl border border-dark-border flex flex-col items-center justify-center p-8 relative overflow-hidden">
         {/* Animated Background */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
         <div className="absolute w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
         
         <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 relative">
                 <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                 <div className="absolute inset-4 bg-dark-bg rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary-400 animate-pulse" />
                 </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white mb-2">Creating Masterpiece</h3>
                <p className="text-slate-400 max-w-xs mx-auto">Gemini is processing your request. This typically takes 5-10 seconds.</p>
            </div>
         </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full min-h-[500px] bg-dark-card/50 rounded-2xl border-2 border-dashed border-dark-border flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-slate-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">Ready to Imagine</h3>
        <p className="text-slate-500 max-w-sm">
          Your generated images will appear here. Try describing a scene or uploading a reference image to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden shadow-2xl animate-fade-in">
      <div className="p-1 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-dark-border flex justify-between items-center px-4 h-12">
         <span className="text-xs font-mono text-slate-500">GENERATED_OUTPUT</span>
         <div className="flex space-x-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
         </div>
      </div>
      
      <div className="relative group">
        <img 
          src={result.imageUrl} 
          alt={result.prompt} 
          className="w-full h-auto max-h-[700px] object-contain bg-black/40"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
           <p className="text-white font-medium line-clamp-2 mb-4 drop-shadow-md">{result.prompt}</p>
           <div className="flex gap-3">
             <a 
                href={result.imageUrl} 
                download={`imaginai-${result.timestamp}.png`}
                className="flex-1 bg-white text-slate-900 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
             >
                <Download className="w-4 h-4" />
                Download
             </a>
             <a 
                href={result.imageUrl} 
                target="_blank" 
                rel="noreferrer"
                className="bg-white/10 backdrop-blur-md text-white px-4 py-2.5 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
             >
                <ExternalLink className="w-4 h-4" />
             </a>
           </div>
        </div>
      </div>

      <div className="p-6 bg-dark-card">
        <div className="flex items-start justify-between gap-4">
             <div>
                 <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Prompt</h4>
                 <p className="text-slate-300 text-sm leading-relaxed">{result.prompt}</p>
             </div>
        </div>
      </div>
    </div>
  );
};