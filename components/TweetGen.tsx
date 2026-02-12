import React, { useState, useEffect, useRef } from 'react';
import { analyzeTweetDraft, findMatchingMeme, generateSocialImage } from '../services/geminiService';
import { Copy, Loader2, Sparkles, Fingerprint, Wand2, ArrowUp, Twitter, ExternalLink, Image as ImageIcon, PenTool, MessageCircle, RefreshCw, Download, Palette, Info, AlertTriangle } from 'lucide-react';
import { UserStyle, TweetMode, TweetAnalysis } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TweetGenProps {
    userStyle: UserStyle | null;
    toggleFocusMode: () => void;
    focusMode: boolean;
}

export const TweetGen: React.FC<TweetGenProps> = ({ userStyle }) => {
  const { t } = useLanguage();
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState<TweetMode>('TWEET');
  
  const [analysis, setAnalysis] = useState<TweetAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [memes, setMemes] = useState<string[]>([]);
  const [loadingMemes, setLoadingMemes] = useState(false);
  
  const [customMeme, setCustomMeme] = useState<string | null>(null);
  const [loadingCustomMeme, setLoadingCustomMeme] = useState(false);
  const [showImageNotice, setShowImageNotice] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const steps = ['gen.step_1', 'gen.step_2', 'gen.step_3', 'gen.step_4'] as const;

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [draft]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
        setLoadingStep(0);
        interval = setInterval(() => {
            setLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async () => {
    if (!draft) return;
    setLoading(true);
    setAnalysis(null);
    setError(null);
    setMemes([]);
    setCustomMeme(null);
    setShowImageNotice(false);
    
    try {
        const result = await analyzeTweetDraft(draft, mode, userStyle?.description);
        setAnalysis(result);
    } catch(e: any) {
        if (e.message === 'QUOTA_EXCEEDED') {
            setError('تم تجاوز الحصة المجانية للطلبات. يرجى الانتظار دقيقة قبل المحاولة مرة أخرى.');
        } else {
            setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
        }
    } finally {
        setLoading(false);
    }
  };

  const handleOpenPinterest = () => {
      if (!analysis) return;
      const queryText = analysis.memeKeywordsArabic || analysis.reactionSearchQuery || "رياكشن مضحك";
      const query = encodeURIComponent(queryText);
      const url = `https://www.pinterest.com/search/pins/?q=${query}`;
      window.open(url, '_blank');
  };

  const handleFetchMemes = async () => {
      if (!analysis) return;
      setLoadingMemes(true);
      setError(null);
      try {
          const query = analysis.reactionSearchQuery || "funny meme";
          const images = await findMatchingMeme(query);
          setMemes(images);
      } catch(e: any) {
          if (e.message === 'QUOTA_EXCEEDED') {
              setError('تجاوزت حصة البحث. يرجى المحاولة لاحقاً.');
          }
      } finally {
          setLoadingMemes(false);
      }
  };

  const handleGenerateCustomMeme = async () => {
      if (!analysis) return;
      setLoadingCustomMeme(true);
      setError(null);
      try {
          const prompt = `Expressive reaction image: ${analysis.reactionSearchQuery || 'laughing'}`;
          const url = await generateSocialImage(prompt, analysis.memeCaption);
          setCustomMeme(url);
      } catch(e: any) {
          if (e.message === 'QUOTA_EXCEEDED') {
              setError('تم تجاوز حصة توليد الصور. يرجى الانتظار 60 ثانية.');
          } else {
              setError('لم نتمكن من توليد الصورة حالياً.');
          }
      } finally {
          setLoadingCustomMeme(false);
      }
  };

  const openTwitterIntent = () => {
      if (!analysis) return;
      
      if (customMeme) {
          const link = document.createElement('a');
          link.href = customMeme;
          link.download = `X-Flow-Meme-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setShowImageNotice(true);
          setTimeout(() => setShowImageNotice(false), 8000);
      }

      let finalTweet = analysis.improvedVersion.trim();
      if (mode !== 'REPLY' && analysis.hashtags && analysis.hashtags.length > 0) {
          finalTweet += `\n${analysis.hashtags.join(' ')}`;
      }
      const text = encodeURIComponent(finalTweet);
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="mx-auto max-w-2xl transition-all duration-300">
        
        {error && (
            <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                            <AlertTriangle size={20} />
                        </div>
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                </div>
            </div>
        )}

        <div className={`
            rounded-[2.5rem] p-1 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border transition-all duration-500 relative group
            ${mode === 'REPLY' ? 'bg-gradient-to-br from-blue-50 to-white border-blue-100' : 'bg-white border-zinc-100'}
        `}>
            <div className="bg-white/50 backdrop-blur-xl rounded-[2.3rem] p-6 h-full">

                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mb-6">
                    <div className="bg-zinc-100/80 p-1.5 rounded-2xl flex gap-1 w-full sm:w-auto">
                        <button 
                            onClick={() => setMode('TWEET')}
                            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'TWEET' ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-200'}`}
                        >
                            <PenTool size={14} />
                            <span>تغريدة جديدة</span>
                        </button>
                        <button 
                            onClick={() => setMode('REPLY')}
                            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'REPLY' ? 'bg-blue-500 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-200'}`}
                        >
                            <MessageCircle size={14} />
                            <span>رد على تغريدة</span>
                        </button>
                    </div>

                    {userStyle ? (
                        <div className="flex items-center gap-2 pl-2 sm:pl-0 self-end sm:self-auto">
                             <div className="flex flex-col items-end">
                                 <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">{t('gen.style_detected')}</span>
                                 <span className="text-xs font-bold text-zinc-900 leading-none">{userStyle.name}</span>
                             </div>
                             <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                                <Fingerprint size={16} />
                             </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 opacity-50 self-end sm:self-auto">
                            <span className="text-[9px] text-zinc-400 font-bold uppercase">كشف تلقائي</span>
                            <Sparkles size={14} className="text-zinc-400" />
                        </div>
                    )}
                </div>

                <div className={`relative rounded-2xl transition-colors duration-300 ${mode === 'REPLY' ? 'bg-blue-50/50 p-2' : ''}`}>
                    <textarea
                        ref={textareaRef}
                        className="w-full min-h-[120px] max-h-[400px] resize-none outline-none text-xl font-medium text-zinc-800 bg-transparent py-2 px-2 placeholder:text-zinc-300"
                        placeholder={mode === 'TWEET' ? t('gen.placeholder') : "الصق نص التغريدة هنا..."}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        dir="auto"
                    />
                </div>

                <div className="flex items-center justify-between mt-4 pt-2">
                    <div className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-zinc-50 text-zinc-400 uppercase">
                        {mode === 'TWEET' ? 'وضع: صناعة محتوى' : 'وضع: تفاعل وردود'}
                    </div>
                    <button 
                        onClick={handleAnalyze}
                        disabled={!draft || loading}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${loading ? 'bg-zinc-100 cursor-wait' : (mode === 'REPLY' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-black text-white hover:bg-zinc-800')} disabled:opacity-50`}
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : <ArrowUp size={24} strokeWidth={2.5} />}
                    </button>
                </div>
            </div>
        </div>

        {loading && (
             <div className="flex flex-col items-center justify-center mt-8 space-y-3">
                <div className="bg-white/80 backdrop-blur-md px-6 py-2.5 rounded-full flex items-center gap-3 border border-zinc-200/50 shadow-sm relative overflow-hidden">
                    <Sparkles className="animate-pulse text-indigo-500" size={16} />
                    <span className="text-sm font-medium text-zinc-600 animate-pulse min-w-[200px] text-center">{t(steps[loadingStep])}</span>
                </div>
            </div>
        )}

        {!loading && analysis && (
            <div className="mt-8 animate-in slide-in-from-bottom-8 duration-500">
                <div className={`bg-white rounded-[2rem] shadow-xl border p-8 ${mode === 'REPLY' ? 'border-blue-100' : 'border-zinc-100'}`}>
                    
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100">
                                <Wand2 size={14} className="text-zinc-500" />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-zinc-400 uppercase">AI Score</div>
                                <div className="text-sm font-black text-zinc-900">{analysis.score}/100</div>
                            </div>
                        </div>
                        <div className="flex gap-2 relative">
                            <button 
                                onClick={openTwitterIntent} 
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 ${mode === 'REPLY' ? 'bg-blue-500 text-white shadow-blue-200' : 'bg-black text-white shadow-zinc-200'}`}
                            >
                                <Twitter size={14} fill="currentColor" />
                                {customMeme ? 'نشر (مع الصورة)' : 'نشر على X'}
                            </button>
                            
                            {showImageNotice && (
                                <div className="absolute top-12 right-0 bg-zinc-900 text-white text-[10px] px-4 py-2 rounded-xl shadow-2xl z-50 w-48 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                                    <Info size={12} className="mt-0.5 text-blue-400 shrink-0" />
                                    <span>تم تحميل الصورة تلقائياً، قم بإرفاقها يدوياً.</span>
                                </div>
                            )}

                            <button onClick={() => navigator.clipboard.writeText(analysis.improvedVersion)} className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors">
                                <Copy size={18} />
                            </button>
                        </div>
                    </div>
                    
                    <p className="text-xl font-medium text-zinc-800 leading-relaxed dir-auto">{analysis.improvedVersion.trim()}</p>

                    <div className="pt-6 border-t border-zinc-100 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ImageIcon size={16} className="text-zinc-400" />
                                <span className="text-sm font-bold text-zinc-700">ميمز ورياكشنات عربية مقترحة:</span>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <button onClick={handleFetchMemes} disabled={loadingMemes} className="py-3 px-4 bg-zinc-900 text-white hover:bg-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
                                    {loadingMemes ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                    <span className="text-xs font-bold">جلب ميمز (Giphy)</span>
                                </button>

                                <button onClick={handleGenerateCustomMeme} disabled={loadingCustomMeme} className="py-3 px-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md">
                                    {loadingCustomMeme ? <Loader2 size={14} className="animate-spin" /> : <Palette size={14} />}
                                    <span className="text-xs font-bold">صناعة ميم (AI)</span>
                                </button>

                                <button onClick={handleOpenPinterest} className="py-3 px-4 bg-zinc-50 hover:bg-white border border-zinc-200 rounded-xl transition-all group flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">P</div>
                                    <span className="text-xs font-bold text-zinc-600 group-hover:text-red-600">البحث في Pinterest</span>
                                </button>
                            </div>

                            {customMeme && (
                                <div className="mt-4 animate-in zoom-in duration-500">
                                    <div className="relative group aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border border-zinc-200 shadow-2xl bg-white">
                                        <img src={customMeme} alt="Custom AI Meme" className="w-full h-full object-cover" />
                                        {analysis.memeCaption && (
                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-md p-4 flex items-center justify-center text-center">
                                                <p className="text-white font-bold text-lg leading-tight">{analysis.memeCaption}</p>
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = customMeme;
                                                    link.download = `meme-${Date.now()}.jpg`;
                                                    link.click();
                                                }}
                                                className="p-3 bg-white text-black rounded-full shadow-xl hover:scale-110 transition-transform"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!loadingMemes && memes.length > 0 && !customMeme && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in duration-500">
                                    {memes.slice(0, 4).map((url, i) => (
                                        <div key={i} className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 cursor-pointer" onClick={() => window.open(url, '_blank')}>
                                            <img src={url} alt="Meme" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink className="text-white" size={20} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};