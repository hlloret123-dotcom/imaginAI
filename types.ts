export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export type ModelType = 'gemini-2.5-flash-image' | 'imagen-4.0-ultra-generate-001';

export const MODELS: { value: ModelType; label: string; description: string; badge?: 'FAST' | 'QUALITY' }[] = [
  {
    value: 'gemini-2.5-flash-image',
    label: 'Gemini 2.5 Flash',
    description: 'Versatile, fast, and follows complex prompts.',
    badge: 'FAST'
  },
  {
    value: 'imagen-4.0-ultra-generate-001',
    label: 'Imagen Ultra',
    description: 'Superior photorealism and detail (up to 2K).',
    badge: 'QUALITY'
  }
];

export interface GenerateState {
  prompt: string;
  aspectRatio: AspectRatio;
  sourceImage?: string; // Base64 string for image-to-image
  sourceMimeType?: string;
}

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

export interface ServiceError {
  message: string;
}

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '4:3', label: 'Landscape (4:3)' },
  { value: '3:4', label: 'Portrait (3:4)' },
  { value: '16:9', label: 'Widescreen (16:9)' },
  { value: '9:16', label: 'Mobile (9:16)' },
];