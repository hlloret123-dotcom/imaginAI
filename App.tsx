import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Type, Github, History, Menu } from 'lucide-react';
import { TextToImage } from './components/TextToImage';
import { ImageToImage } from './components/ImageToImage';
import { ResultDisplay } from './components/ResultDisplay';
import { HistorySidebar } from './components/HistorySidebar';
import { GenerateState, GenerationResult } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text-to-image' | 'image-to-image'>('text-to-image');
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Load history from local storage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('imaginai_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('imaginai_history', JSON.stringify(history));
  }, [history]);

  const handleGenerationStart = () => {
    setIsGenerating(true);
    setError(null);
    setGenerationResult(null);
  };

  const handleGenerationSuccess = (result: GenerationResult) => {
    setIsGenerating(false);
    setGenerationResult(result);
    // Add to history
    setHistory(prev => [result, ...prev]);
    // Optionally open sidebar to show it's saved, or just keep as is
  };

  const handleGenerationError = (errorMessage: string) => {
    setIsGenerating(false);
    setError(errorMessage);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your history?")) {
        setHistory([]);
    }
  };

  const handleSelectHistoryItem = (item: GenerationResult) => {
    setGenerationResult(item);
    // On mobile, close sidebar after selection
    if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-dark-bg text-slate-200 selection:bg-primary-500 selection:text-white overflow-hidden">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-bg/80 backdrop-blur-md z-50 shrink-0 h-16">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg transition-colors ${isSidebarOpen ? 'bg-primary-500/10 text-primary-400' : 'hover:bg-slate-800 text-slate-400'}`}
                title="Toggle History"
            >
                {isSidebarOpen ? <History className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-primary-400 to-indigo-600 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden sm:block">
                ImaginAI
                </h1>
            </div>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Gemini 2.5 & Imagen 4
          </div>
        </div>
      </header>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar */}
        <div 
            className={`
                fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-0 lg:border-none'}
                lg:h-full
            `}
            style={{ 
                // Force layout recalculation for transition on desktop
                marginTop: window.innerWidth < 1024 ? '64px' : '0' 
            }}
        >
           <div className={`h-full w-80 ${isSidebarOpen ? 'block' : 'lg:hidden'} ${!isSidebarOpen && 'hidden'}`}>
                <HistorySidebar 
                    isOpen={isSidebarOpen}
                    history={history}
                    onSelect={handleSelectHistoryItem}
                    onClear={handleClearHistory}
                    onClose={() => setIsSidebarOpen(false)}
                />
           </div>
        </div>
        
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
                style={{ top: '64px' }}
            />
        )}

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* Left Column: Controls */}
                <div className="xl:col-span-5 space-y-6">
                    
                    {/* Tab Switcher */}
                    <div className="bg-dark-card p-1 rounded-xl border border-dark-border flex">
                    <button
                        onClick={() => setActiveTab('text-to-image')}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === 'text-to-image'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <Type className="w-4 h-4" />
                        <span>Text to Image</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('image-to-image')}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === 'image-to-image'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        <span>Image to Image</span>
                    </button>
                    </div>

                    {/* Input Forms */}
                    <div className="bg-dark-card rounded-2xl border border-dark-border shadow-xl overflow-hidden relative">
                    {isGenerating && (
                        <div className="absolute inset-0 z-10 bg-dark-card/50 backdrop-blur-[2px] flex items-center justify-center">
                        {/* Overlay to prevent interaction during generation */}
                        </div>
                    )}
                    
                    <div className="p-6">
                        {activeTab === 'text-to-image' ? (
                        <TextToImage 
                            onStart={handleGenerationStart}
                            onSuccess={handleGenerationSuccess}
                            onError={handleGenerationError}
                            isGenerating={isGenerating}
                        />
                        ) : (
                        <ImageToImage 
                            onStart={handleGenerationStart}
                            onSuccess={handleGenerationSuccess}
                            onError={handleGenerationError}
                            isGenerating={isGenerating}
                        />
                        )}
                    </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl flex items-start gap-3 text-sm animate-fade-in">
                        <div className="mt-0.5">⚠️</div>
                        <div>{error}</div>
                    </div>
                    )}
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 px-4 py-3 rounded-xl text-xs">
                    <strong className="block mb-1 text-blue-100">Tips:</strong>
                    {activeTab === 'text-to-image' 
                        ? "Describe the style, lighting, and mood. Example: 'A cyberpunk city street at night, neon lights, rain, photorealistic, 8k'"
                        : "Upload a reference image and describe what you want to change or add. Example: 'Make it look like a van gogh painting'"
                    }
                    </div>

                </div>

                {/* Right Column: Results */}
                <div className="xl:col-span-7">
                    <ResultDisplay 
                        result={generationResult} 
                        isGenerating={isGenerating} 
                    />
                </div>

                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;