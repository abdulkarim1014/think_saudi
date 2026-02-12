import React, { useState } from 'react';
import { analyzeWritingStyle } from '../services/geminiService';
import { Fingerprint, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { UserStyle } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface StyleDNAProps {
    onSaveStyle: (style: UserStyle) => void;
    currentStyle: UserStyle | null;
}

export const StyleDNA: React.FC<StyleDNAProps> = ({ onSaveStyle, currentStyle }) => {
    const { t } = useLanguage();
    const [samples, setSamples] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<{ description: string; traits: string[] } | null>(null);

    const handleAnalyze = async () => {
        if (samples.length < 50) return;
        setLoading(true);
        const result = await analyzeWritingStyle(samples);
        setAnalysis(result);
        setLoading(false);
    };

    const handleSave = () => {
        if (!analysis) return;
        onSaveStyle({
            id: Date.now().toString(),
            name: 'Personal Brand DNA',
            description: analysis.description,
            traits: analysis.traits
        });
        setSamples('');
        setAnalysis(null);
    };

    return (
        <div className="max-w-3xl mx-auto pt-6">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-zinc-900 text-white rounded-xl mb-4 shadow-lg shadow-orange-500/20">
                    <Fingerprint size={32} />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">{t('dna.title')}</h2>
                <p className="text-zinc-500 max-w-md mx-auto">
                    {t('dna.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Column */}
                <div className="space-y-4">
                    <div className="bg-white border border-zinc-200 rounded-lg p-1 shadow-sm">
                        <textarea
                            className="w-full h-64 p-4 text-sm bg-transparent resize-none focus:outline-none"
                            placeholder={t('dna.placeholder')}
                            value={samples}
                            onChange={(e) => setSamples(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || samples.length < 50}
                        className="w-full py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? t('dna.analyzing') : t('dna.analyze_btn')}
                        {!loading && <Search size={16} />}
                    </button>
                </div>

                {/* Analysis Result Column */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 flex flex-col justify-center">
                    {!analysis && !currentStyle ? (
                        <div className="text-center text-zinc-400">
                            <Fingerprint size={48} className="mx-auto mb-4 opacity-10" />
                            <p className="text-sm font-mono">{t('dna.waiting')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 uppercase font-mono mb-2 flex items-center gap-2">
                                    <CheckCircle size={14} className="text-green-600" />
                                    {t('dna.extracted')}
                                </h3>
                                <p className="text-zinc-700 text-sm leading-relaxed border-l-2 border-orange-500 pl-3">
                                    {analysis ? analysis.description : currentStyle?.description}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-zinc-500 uppercase font-mono mb-3">{t('dna.traits')}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(analysis ? analysis.traits : currentStyle?.traits || []).map((trait, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-white border border-zinc-200 rounded text-xs text-zinc-600 font-mono shadow-sm">
                                            {trait}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {analysis && (
                                <button
                                    onClick={handleSave}
                                    className="w-full py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 transition-colors mt-auto"
                                >
                                    {t('dna.save')}
                                </button>
                            )}
                            
                            {!analysis && currentStyle && (
                                <div className="mt-auto pt-4 border-t border-zinc-200">
                                    <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 p-2 rounded">
                                        <CheckCircle size={16} />
                                        <span>{t('dna.active')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};