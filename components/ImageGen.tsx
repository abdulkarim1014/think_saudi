import React, { useState } from 'react';
import { generateSocialImage } from '../services/geminiService';
import { Image as ImageIcon, Download, Loader2, Wand2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ImageGen: React.FC = () => {
  const { t } = useLanguage();
  const [visualPrompt, setVisualPrompt] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!visualPrompt) return;
    setLoading(true);
    const result = await generateSocialImage(visualPrompt, quoteText);
    setImageUrl(result);
    setLoading(false);
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `x-flow-visual-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-6">
       <div className="text-center mb-8">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-200">
                <ImageIcon className="text-zinc-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">{t('img.title')}</h2>
            <p className="text-sm text-zinc-500 font-light mt-1">{t('img.subtitle')}</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
                <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-1.5 uppercase">{t('img.prompt_label')}</label>
                        <textarea
                            className="w-full p-3 rounded-md border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none resize-none h-24"
                            placeholder={t('img.prompt_placeholder')}
                            value={visualPrompt}
                            onChange={(e) => setVisualPrompt(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-1.5 uppercase">{t('img.quote_label')}</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-md border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            placeholder={t('img.quote_placeholder')}
                            value={quoteText}
                            onChange={(e) => setQuoteText(e.target.value)}
                        />
                    </div>
                    
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !visualPrompt}
                        className="w-full bg-zinc-900 hover:bg-black text-white py-3 rounded-md text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                        <span>{loading ? t('img.generating') : t('img.generate')}</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-center">
                {!imageUrl ? (
                    <div className="w-full aspect-square border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50">
                        <ImageIcon size={32} className="opacity-20 mb-2" />
                        <span className="text-xs font-mono">Preview</span>
                    </div>
                ) : (
                    <div className="w-full flex flex-col gap-3 animate-in fade-in zoom-in duration-500">
                        <div className="aspect-square rounded-lg overflow-hidden border border-zinc-200 shadow-lg bg-white relative group">
                            <img src={imageUrl} alt="Generated" className="w-full h-full object-contain" />
                        </div>
                        <button 
                            onClick={handleDownload}
                            className="w-full py-2 bg-white border border-zinc-200 text-zinc-700 font-medium rounded-md hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Download size={16} />
                            {t('img.download')}
                        </button>
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};