'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Send, Image as ImageIcon, Download, Share2, History, 
  Settings, Wand2, Loader2, X, ChevronDown, Trash2,
  Sparkles, Palette, Maximize, Zap
} from 'lucide-react';

// Types
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  params: GenerationParams;
}

interface GenerationParams {
  width: number;
  height: number;
  style: string;
  quality: string;
  seed?: number;
}

// Constants
const ASPECT_RATIOS = [
  { name: '1:1', width: 1024, height: 1024 },
  { name: '4:3', width: 1024, height: 768 },
  { name: '3:4', width: 768, height: 1024 },
  { name: '16:9', width: 1024, height: 576 },
  { name: '9:16', width: 576, height: 1024 },
];

const STYLES = [
  { id: 'default', name: '默认', icon: Sparkles },
  { id: 'anime', name: '动漫', icon: Palette },
  { id: 'realistic', name: '写实', icon: Maximize },
  { id: 'artistic', name: '艺术', icon: Wand2 },
  { id: 'cyberpunk', name: '赛博朋克', icon: Zap },
];

const QUALITIES = [
  { id: 'standard', name: '标准', desc: '快速生成' },
  { id: 'high', name: '高清', desc: '更高质量' },
  { id: 'ultra', name: '超清', desc: '最佳效果' },
];

// Mock API call - Replace with actual Doubao API
async function generateImageAPI(
  prompt: string,
  params: GenerationParams,
  imageFile?: File
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock image URL (placeholder)
  // In production, replace with actual Doubao Seedream API call
  const width = params.width;
  const height = params.height;
  const seed = params.seed || Math.floor(Math.random() * 10000);
  
  // Using picsum for demo - replace with actual API
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

export default function Home() {
  // State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  
  // Params
  const [params, setParams] = useState<GenerationParams>({
    width: 1024,
    height: 1024,
    style: 'default',
    quality: 'high',
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai-image-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGeneratedImages(parsed);
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('ai-image-history', JSON.stringify(generatedImages));
  }, [generatedImages]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const imageUrl = await generateImageAPI(prompt, params, uploadedImage || undefined);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt: prompt.trim(),
        timestamp: Date.now(),
        params: { ...params },
      };
      
      setGeneratedImages(prev => [newImage, ...prev]);
      setCurrentImage(newImage);
      setPrompt('');
      setUploadedImage(null);
      setUploadedImagePreview(null);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async (image: GeneratedImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI 生成的图像',
          text: image.prompt,
          url: image.url,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(image.url);
      alert('链接已复制到剪贴板');
    }
  };

  const clearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      setGeneratedImages([]);
      setCurrentImage(null);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - History */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 lg:relative lg:transform-none ${
          showHistory ? 'translate-x-0' : '-translate-x-full lg:hidden'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">历史记录</span>
            </div>
            <div className="flex items-center gap-1">
              {generatedImages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="清空历史"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {generatedImages.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无历史记录</p>
              </div>
            ) : (
              generatedImages.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImage(image)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    currentImage?.id === image.id
                      ? 'bg-white shadow-md ring-1 ring-gray-200'
                      : 'hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-16 h-16 object-cover rounded-lg bg-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 line-clamp-2 mb-1">
                        {image.prompt}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(image.timestamp)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="hidden lg:flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <History className="w-4 h-4" />
              <span className="text-sm">历史</span>
            </button>
          </div>
          
          <h1 className="text-lg font-semibold text-gray-800">AI 图像生成器</h1>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-b border-gray-100 bg-gray-50/50 animate-fade-in">
            <div className="p-4 space-y-4">
              {/* Aspect Ratio */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">画面比例</label>
                <div className="flex flex-wrap gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.name}
                      onClick={() => setParams(p => ({ ...p, width: ratio.width, height: ratio.height }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        params.width === ratio.width && params.height === ratio.height
                          ? 'bg-gray-900 text-white'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {ratio.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Style */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">风格</label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((style) => {
                    const Icon = style.icon;
                    return (
                      <button
                        key={style.id}
                        onClick={() => setParams(p => ({ ...p, style: style.id }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          params.style === style.id
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {style.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Quality */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">质量</label>
                <div className="flex flex-wrap gap-2">
                  {QUALITIES.map((quality) => (
                    <button
                      key={quality.id}
                      onClick={() => setParams(p => ({ ...p, quality: quality.id }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        params.quality === quality.id
                          ? 'bg-gray-900 text-white'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {quality.name}
                      <span className="ml-1 text-xs opacity-70">({quality.desc})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Display Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {currentImage ? (
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="bg-gray-100 rounded-2xl overflow-hidden mb-4">
                <img
                  src={currentImage.url}
                  alt={currentImage.prompt}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              </div>
              
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-800 mb-2">{currentImage.prompt}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">{currentImage.params.width}×{currentImage.params.height}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">{STYLES.find(s => s.id === currentImage.params.style)?.name}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">{formatTime(currentImage.timestamp)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(currentImage)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="下载"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare(currentImage)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="分享"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Wand2 className="w-10 h-10" />
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">开始创作</p>
              <p className="text-sm">输入描述，生成你的第一张 AI 图像</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Uploaded Image Preview */}
            {uploadedImagePreview && (
              <div className="mb-3 flex items-center gap-2">
                <div className="relative">
                  <img
                    src={uploadedImagePreview}
                    alt="Uploaded"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setUploadedImagePreview(null);
                    }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">参考图已上传</span>
              </div>
            )}
            
            <div className="relative flex items-end gap-2 bg-gray-50 rounded-2xl p-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-colors flex-shrink-0"
                title="上传图片（图生图）"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="描述你想要生成的图像..."
                className="flex-1 bg-transparent border-0 resize-none py-3 px-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 min-h-[44px] max-h-[200px]"
                rows={1}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
              
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mt-2 text-center">
              按 Enter 发送，Shift + Enter 换行 · 当前: {params.width}×{params.height} · {STYLES.find(s => s.id === params.style)?.name}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
