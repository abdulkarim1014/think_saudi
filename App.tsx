import React, { useState, useEffect } from 'react';
import { TweetGen } from './components/TweetGen';
import { UserStyle } from './types';
import { LanguageProvider } from './contexts/LanguageContext';
import { Palette, Ban, ShieldCheck, Lock, EyeOff, ServerOff, X, Heart, Gift } from 'lucide-react';

const BACKGROUNDS: BackgroundOption[] = [
  { 
    id: 'default', 
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1920&auto=format&fit=crop', 
    name: 'جبال ضبابية',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=150&auto=format&fit=crop'
  },
  { 
    id: 'forest', 
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1920&auto=format&fit=crop', 
    name: 'غابة خضراء',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=150&auto=format&fit=crop'
  },
  { 
    id: 'stars', 
    url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1920&auto=format&fit=crop', 
    name: 'سماء الليل',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=150&auto=format&fit=crop'
  },
  { 
    id: 'none', 
    url: null, 
    name: 'بدون خلفية',
    thumbnail: '' 
  },
];

interface BackgroundOption {
  id: string;
  url: string | null;
  name: string;
  thumbnail?: string;
}

const MainApp: React.FC = () => {
  const [userStyle, setUserStyle] = useState<UserStyle | null>(null);
  const [currentBg, setCurrentBg] = useState<BackgroundOption>(BACKGROUNDS[0]);
  const [isBgMenuOpen, setIsBgMenuOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const handleBgChange = (bg: BackgroundOption) => {
      setCurrentBg(bg);
      setIsBgMenuOpen(false);
  };

  return (
    <LanguageProvider>
        {currentBg.url && (
            <img 
                src={currentBg.url}
                alt="Background"
                className="fixed inset-0 w-full h-full object-cover z-0 transition-opacity duration-700 ease-in-out"
                fetchPriority="high"
            />
        )}
        
        {currentBg.url && (
            <div className="fixed inset-0 bg-black/10 z-0 pointer-events-none"></div>
        )}

        <div 
            className={`min-h-screen flex flex-col items-center justify-center p-4 relative z-10`}
            style={{ backgroundColor: currentBg.url ? 'transparent' : '#f4f4f5' }}
        >
          <div className="fixed top-4 left-4 z-40">
              <button 
                onClick={() => setIsBgMenuOpen(!isBgMenuOpen)}
                className="p-3 bg-white/80 backdrop-blur-md hover:bg-white text-zinc-700 rounded-full shadow-lg border border-white/20 transition-all active:scale-95"
                title="تغيير الخلفية"
              >
                  <Palette size={20} />
              </button>

              {isBgMenuOpen && (
                  <div className="absolute top-12 left-0 bg-white rounded-2xl p-3 shadow-2xl w-48 border border-zinc-100 animate-in fade-in slide-in-from-top-2 z-50">
                      <h4 className="text-xs font-bold text-zinc-500 mb-2 px-1">اختر الخلفية</h4>
                      <div className="grid grid-cols-2 gap-2">
                          {BACKGROUNDS.map(bg => (
                              <button 
                                key={bg.id}
                                onClick={() => handleBgChange(bg)}
                                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${currentBg.id === bg.id ? 'border-zinc-900 scale-95' : 'border-transparent'}`}
                              >
                                  {bg.url ? <img src={bg.thumbnail} alt={bg.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400"><Ban size={20} /></div>}
                                  <div className="absolute inset-x-0 bottom-0 bg-black/40 text-[8px] text-white text-center py-0.5 truncate px-1">{bg.name}</div>
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </div>

          <main className="w-full max-w-2xl z-10">
            <TweetGen userStyle={userStyle} focusMode={false} toggleFocusMode={() => {}} />
          </main>

          <footer className="mt-12 mb-6 w-full max-w-2xl z-10 flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center items-center gap-4 bg-black/20 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/10 shadow-lg">
                <p className={`font-bold text-sm tracking-wide opacity-90 select-none ${currentBg.url ? 'text-white' : 'text-zinc-600'}`}>تفكير_سعودي SA</p>
                <div className={`hidden sm:block w-px h-4 ${currentBg.url ? 'bg-white/30' : 'bg-zinc-400/30'}`}></div>
                <button onClick={() => setIsPrivacyOpen(true)} className={`flex items-center gap-1.5 text-xs font-medium hover:underline ${currentBg.url ? 'text-white/80' : 'text-zinc-500'}`}><ShieldCheck size={14} /> <span>الخصوصية</span></button>
                 <div className={`hidden sm:block w-px h-4 ${currentBg.url ? 'bg-white/30' : 'bg-zinc-400/30'}`}></div>
                <button onClick={() => setIsSupportOpen(true)} className={`flex items-center gap-1.5 text-xs font-medium hover:underline group ${currentBg.url ? 'text-white/80' : 'text-zinc-500'}`}><Heart size={14} className="group-hover:text-red-500" /> <span>دعم التطوير</span></button>
            </div>
          </footer>

          {isSupportOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSupportOpen(false)}></div>
                <div className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl animate-in zoom-in-95">
                    <button onClick={() => setIsSupportOpen(false)} className="absolute top-4 left-4 p-2 bg-zinc-100 rounded-full text-zinc-500 hover:bg-zinc-200 transition-colors"><X size={18} /></button>
                    <div className="flex justify-center mb-6"><div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500"><Gift size={32} /></div></div>
                    <h2 className="text-xl font-black text-center text-zinc-900 mb-2">هل أعجبتك الأدوات؟</h2>
                    <p className="text-center text-zinc-500 text-sm mb-8 leading-relaxed">دعمك البسيط يساعدنا في تغطية تكاليف التطوير والاستمرار في تقديم ميزات جديدة لخدمة المحتوى العربي.</p>
                    <div className="flex flex-col items-center gap-4">
                        <a href="https://www.buymeacoffee.com/Abdulkarim_1" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105 active:scale-95">
                            <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=Abdulkarim_1&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy Me A Coffee" className="h-12 shadow-md rounded-xl" />
                        </a>
                        <p className="text-[10px] text-zinc-400">شكراً لكونك جزءاً من رحلتنا ❤️</p>
                    </div>
                </div>
            </div>
          )}

          {isPrivacyOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsPrivacyOpen(false)}></div>
                <div className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl animate-in zoom-in-95">
                    <button onClick={() => setIsPrivacyOpen(false)} className="absolute top-4 left-4 p-2 bg-zinc-100 rounded-full text-zinc-500 hover:bg-zinc-200 transition-colors"><X size={18} /></button>
                    <div className="flex justify-center mb-6"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Lock size={32} /></div></div>
                    <h2 className="text-xl font-black text-center text-zinc-900 mb-2">أنت في أمان تام</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                            <ServerOff size={20} className="mt-1" />
                            <div><h3 className="font-bold text-sm mb-1">بيانات مجهولة</h3><p className="text-xs text-zinc-500">لا يتم تخزين التغريدات أو البيانات الشخصية على خوادمنا.</p></div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                            <EyeOff size={20} className="mt-1" />
                            <div><h3 className="font-bold text-sm mb-1">خصوصية كاملة</h3><p className="text-xs text-zinc-500">نحن لا نعرف من أنت، ولا ماذا تغرد.</p></div>
                        </div>
                    </div>
                    <button onClick={() => setIsPrivacyOpen(false)} className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl mt-8 hover:bg-black transition-colors">فهمت ذلك، شكراً</button>
                </div>
            </div>
          )}
        </div>
    </LanguageProvider>
  );
};

export default MainApp;