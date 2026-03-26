import React, { useState } from 'react';
import { Send, Settings2, Zap, Crown } from 'lucide-react';
import { ASPECT_RATIOS, AspectRatio, GenerationResult, MODELS, ModelType } from '../types';
import { generateImage } from '../services/geminiService';

interface TextToImageProps {
  onStart: () => void;
  onSuccess: (result: GenerationResult) => void;
  onError: (error: string) => void;
  isGenerating: boolean;
}

export const TextToImage: React.FC<TextToImageProps> = ({
  onStart,
  onSuccess,
  onError,
  isGenerating,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [selectedModel, setSelectedModel] = useState<ModelType>(MODELS[0].value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    onStart();

    try {
      const imageUrl = await generateImage({
        prompt: prompt.trim(),
        aspectRatio,
        model: selectedModel,
      });

      onSuccess({
        imageUrl,
        prompt: prompt.trim(),
        timestamp: Date.now(),
      });
    } catch (err: any) {
      onError(err.message || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Model Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Model</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODELS.map((model) => (
                <div
                    key={model.value}
                    onClick={() => !isGenerating && setSelectedModel(model.value)}
                    className={`relative p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedModel === model.value
                            ? 'bg-primary-500/10 border-primary-500 ring-1 ring-primary-500'
                            : 'bg-dark-bg border-dark-border hover:border-slate-500'
                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium text-sm ${selectedModel === model.value ? 'text-primary-300' : 'text-slate-200'}`}>
                            {model.label}
                        </span>
                        {model.badge === 'FAST' && <Zap className="w-3.5 h-3.5 text-yellow-400" />}
                        {model.badge === 'QUALITY' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">{model.description}</p>
                </div>
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
          <span>Prompt</span>
          <span className="text-xs text-slate-500">{prompt.length} chars</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A futuristic city with flying cars at sunset, digital art style..."
          className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none h-32 transition-all"
          disabled={isGenerating}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          <span>Aspect Ratio</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.value}
              type="button"
              onClick={() => setAspectRatio(ratio.value)}
              disabled={isGenerating}
              className={`px-2 py-2 text-xs rounded-lg border transition-all ${
                aspectRatio === ratio.value
                  ? 'bg-primary-500/20 border-primary-500 text-primary-200'
                  : 'bg-dark-bg border-dark-border text-slate-400 hover:border-slate-500'
              }`}
            >
              {ratio.label.split(' ')[0]}
              <span className="block opacity-60 text-[10px] mt-0.5">{ratio.value}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isGenerating || !prompt.trim()}
        className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center space-x-2 transition-all duration-200 ${
          isGenerating || !prompt.trim()
            ? 'bg-slate-700 cursor-not-allowed text-slate-400'
            : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-lg shadow-primary-900/20 active:scale-[0.98]'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Dreaming...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Generate Image</span>
          </>
        )}
      </button>
    </form>
  );
};