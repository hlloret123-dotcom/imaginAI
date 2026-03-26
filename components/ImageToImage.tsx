import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { ASPECT_RATIOS, AspectRatio, GenerationResult } from '../types';
import { generateImage } from '../services/geminiService';

interface ImageToImageProps {
  onStart: () => void;
  onSuccess: (result: GenerationResult) => void;
  onError: (error: string) => void;
  isGenerating: boolean;
}

export const ImageToImage: React.FC<ImageToImageProps> = ({
  onStart,
  onSuccess,
  onError,
  isGenerating,
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        onError("File size too large. Please upload an image under 5MB.");
        return;
    }

    if (!file.type.startsWith('image/')) {
        onError("Invalid file type. Please upload an image (PNG, JPG, WebP).");
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage(result);
      setMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if the related target (where we are going) is still inside the current target
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setMimeType(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !selectedImage) return;

    onStart();

    try {
      // Remove data:image/xxx;base64, prefix for the API
      const base64Data = selectedImage.split(',')[1];

      const imageUrl = await generateImage({
        prompt: prompt.trim(),
        aspectRatio,
        model: 'gemini-2.5-flash-image',
        referenceImage: base64Data,
        mimeType: mimeType || 'image/png'
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
      
      {/* Image Uploader */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Reference Image</label>
        
        {!selectedImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group duration-200 ease-in-out ${
                isDragging 
                  ? 'border-primary-500 bg-primary-500/10 scale-[1.01] shadow-lg shadow-primary-500/10' 
                  : 'border-dark-border hover:border-primary-500/50 hover:bg-dark-card/50'
              }`}
          >
            <div className={`p-4 rounded-full mb-4 transition-transform duration-300 ${
                isDragging ? 'bg-primary-500/20 scale-110' : 'bg-slate-800 group-hover:bg-primary-900/30 group-hover:scale-105'
            }`}>
               <UploadCloud className={`w-8 h-8 transition-colors duration-300 ${
                   isDragging ? 'text-primary-400' : 'text-slate-400 group-hover:text-primary-400'
               }`} />
            </div>
            <h3 className={`text-base font-medium mb-1 transition-colors duration-300 ${
                isDragging ? 'text-primary-300' : 'text-slate-200'
            }`}>
                {isDragging ? 'Drop image now' : 'Upload Reference Image'}
            </h3>
            <p className={`text-sm text-center transition-colors duration-300 ${
                isDragging ? 'text-primary-400/70' : 'text-slate-400'
            }`}>
                Drag & drop or click to select
            </p>
            <p className="text-xs text-slate-500 mt-2">Supports JPG, PNG, WebP (Max 5MB)</p>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-dark-border group">
            <img 
              src={selectedImage} 
              alt="Reference" 
              className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            <button
              type="button"
              onClick={clearImage}
              disabled={isGenerating}
              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-white bg-primary-500/80 px-2 py-0.5 rounded backdrop-blur-md">
                        Reference
                    </span>
                    <span className="text-xs text-slate-300 truncate max-w-[200px]">
                        Image uploaded
                    </span>
                </div>
            </div>
          </div>
        )}
        <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
          <span>Instructions</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe how to change the image. E.g., 'Turn this into a sketch', 'Add fireworks in the sky'..."
          className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none h-24 transition-all"
          disabled={isGenerating}
        />
      </div>

      <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Output Aspect Ratio</label>
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
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isGenerating || !prompt.trim() || !selectedImage}
        className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center space-x-2 transition-all duration-200 ${
          isGenerating || !prompt.trim() || !selectedImage
            ? 'bg-slate-700 cursor-not-allowed text-slate-400'
            : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-lg shadow-primary-900/20 active:scale-[0.98]'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Transforming...</span>
          </>
        ) : (
          <>
            <ImageIcon className="w-5 h-5" />
            <span>Generate Variation</span>
          </>
        )}
      </button>
    </form>
  );
};