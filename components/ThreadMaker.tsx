import React, { useState } from 'react';
import { generateThread } from '../services/geminiService';
import { Layers, Copy, BrainCircuit } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const ThreadMaker: React.FC = () => {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [thread, setThread] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [psychologyMode, setPsychologyMode] = useState(true);

  const handleGenerate = async () => {
    if (!text) return;
    setLoading(true);
    const parts = await generateThread(text, psychologyMode);
    setThread(parts);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 border-b border-zinc-200 pb-4">
            <h2 className="text-xl font-semibold text-zinc-900">{t('thread.title')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-4">
             <div className="bg-white border border-zinc-300 rounded-md p-1 shadow-sm">
                <div className="px-3 py-2 border-b border-zinc-100 flex justify-between items-center">
                    <span className="text-xs font-mono text-zinc-500">{t('thread.source')}</span>
                </div>
                <textarea
                    className="w-full p-3 h-64 text-sm text-zinc-800 focus:outline-none resize-none bg-transparent"
                    placeholder={t('thread.placeholder')}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>

             {/* Psychology Mode Toggle */}
             <div 
                onClick={() => setPsychologyMode(!psychologyMode)}
                className={`cursor-pointer p-3 rounded-md border flex items-center gap-3 transition-colors ${psychologyMode ? 'bg-purple-50 border-purple-200' : 'bg-white border-zinc-200'}`}
             >
                 <div className={`p-1.5 rounded ${psychologyMode ? 'bg-purple-100 text-purple-600' : 'bg-zinc-100 text-zinc-400'}`}>
                     <BrainCircuit size={16} />
                 </div>
                 <div className="flex-1">
                     <div className="text-xs font-bold text-zinc-800 font-mono">{t('thread.psychology')}</div>
                     <div className="text-[10px] text-zinc-500">{t('thread.psychology_desc')}</div>
                 </div>
                 <div className={`w-3 h-3 rounded-full border ${psychologyMode ? 'bg-purple-500 border-purple-500' : 'bg-transparent border-zinc-300'}`}></div>
             </div>
            
             <button
                onClick={handleGenerate}
                disabled={loading || text.length < 50}
                className="w-full py-2 bg-zinc-900 hover:bg-black text-white text-sm font-medium rounded-md shadow-sm transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
                {loading ? t('thread.processing') : t('thread.split_btn')}
            </button>
        </div>

        <div className="md:col-span-7">
             {!thread.length ? (
                 <div className="h-full border-2 border-dashed border-zinc-200 rounded-md flex flex-col items-center justify-center text-zinc-400 min-h-[300px]">
                     <Layers size={32} className="mb-3 opacity-20" />
                     <p className="text-sm font-mono">{t('thread.no_output')}</p>
                 </div>
             ) : (
                <div className="relative ltr:pl-6 rtl:pr-6 space-y-6 ltr:before:left-0 rtl:before:right-0 before:absolute before:top-2 before:bottom-2 before:w-px before:bg-zinc-200">
                    {thread.map((part, idx) => (
                        <div key={idx} className="relative animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="absolute ltr:-left-[29px] rtl:-right-[29px] top-4 w-3 h-3 rounded-full bg-white border-2 border-orange-500 z-10"></div>
                            
                            <div className="bg-white border border-zinc-200 rounded-md p-4 shadow-sm hover:border-zinc-300 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-mono text-zinc-400 uppercase">{t('thread.tweet_label')}_{String(idx + 1).padStart(2, '0')}</span>
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(part)}
                                        className="text-zinc-400 hover:text-orange-600 transition-colors"
                                    >
                                        <Copy size={12} />
                                    </button>
                                </div>
                                <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">{part}</p>
                                
                                <div className="mt-3 pt-2 border-t border-zinc-50 flex items-center justify-end">
                                    <span className={`text-[10px] font-mono ${part.length > 280 ? 'text-red-500' : 'text-zinc-400'}`}>
                                        {part.length} / 280
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             )}
        </div>
      </div>
    </div>
  );
};