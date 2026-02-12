import React, { useState } from 'react';
import { generateBio } from '../services/geminiService';
import { User, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const BioOptimizer: React.FC = () => {
  const { t, language } = useLanguage();
  const [info, setInfo] = useState('');
  const [niche, setNiche] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!info) return;
    setLoading(true);
    const bio = await generateBio(info, niche);
    setResult(bio);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto pt-4">
       <div className="text-center mb-8">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3 border border-zinc-200">
                <User className="text-zinc-600" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">{t('bio.title')}</h2>
            <p className="text-sm text-zinc-500 font-light mt-1">{t('bio.subtitle')}</p>
       </div>

       <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 space-y-5 border-b border-zinc-100">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-1.5 uppercase">{t('bio.info_label')}</label>
                        <textarea
                            className="w-full p-3 rounded-md border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none h-24 resize-none"
                            placeholder={t('bio.info_placeholder')}
                            value={info}
                            onChange={(e) => setInfo(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-zinc-500 mb-1.5 uppercase">{t('bio.niche_label')}</label>
                         <input
                            type="text"
                            className="w-full p-3 rounded-md border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all outline-none"
                            placeholder={t('bio.niche_placeholder')}
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-zinc-50 px-6 py-4 flex justify-between items-center">
                 <button
                    onClick={handleGenerate}
                    disabled={loading || !info}
                    className="ml-auto bg-zinc-900 hover:bg-black text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {loading && <RefreshCw className="animate-spin" size={14} />}
                    <span>{t('bio.generate')}</span>
                    {!loading && <ArrowLeft size={14} className={language === 'ar' ? 'rotate-0' : 'rotate-180'} />}
                </button>
            </div>
       </div>

       {result && (
           <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-orange-50 border border-orange-100 rounded-lg p-5">
                   <div className="flex items-center gap-2 mb-3 text-orange-800">
                       <CheckCircle2 size={16} />
                       <span className="text-xs font-mono uppercase font-semibold">{t('bio.recommended')}</span>
                   </div>
                   <p className="text-zinc-900 font-medium text-lg leading-relaxed text-center dir-auto bg-white p-4 rounded border border-orange-100/50 shadow-sm">
                       {result}
                   </p>
                   <button 
                        onClick={() => navigator.clipboard.writeText(result)}
                        className="mt-3 text-xs text-orange-600 font-medium hover:text-orange-800 transition-colors w-full text-center py-2 hover:bg-orange-100 rounded"
                    >
                        {t('bio.copy')}
                    </button>
               </div>
           </div>
       )}
    </div>
  );
};