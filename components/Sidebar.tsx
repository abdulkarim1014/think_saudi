import React, { useState } from 'react';
import { PenTool, Fingerprint, LogOut, Loader2, Search, Lock, Zap } from 'lucide-react';
import { NavItem, ToolId, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentTool: ToolId;
  onNavigate: (tool: ToolId) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  focusMode: boolean;
  userProfile: UserProfile | null;
  onConnect: (handle: string) => void;
  onDisconnect: () => void;
  isConnecting: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    currentTool, 
    onNavigate, 
    isOpen, 
    setIsOpen, 
    focusMode,
    userProfile,
    onConnect,
    onDisconnect,
    isConnecting
}) => {
  const [handleInput, setHandleInput] = useState('');
  const { t, language, setLanguage } = useLanguage();

  const navItems: NavItem[] = [
    { id: ToolId.STYLE_DNA, label: t('nav.style_dna'), icon: <Fingerprint size={18} /> },
    { id: ToolId.TWEET_GEN, label: t('nav.tweet_gen'), icon: <PenTool size={18} /> },
  ];

  if (focusMode && !isOpen) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`
        fixed md:relative z-30
        h-screen w-64 bg-white/80 ltr:border-r rtl:border-l border-zinc-100 backdrop-blur-xl
        transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : (focusMode ? (language === 'ar' ? 'translate-x-full' : '-translate-x-full') : (language === 'ar' ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0'))}
        ${focusMode ? 'hidden md:flex absolute' : ''} 
      `}>
        {/* Minimal Header */}
        <div className="p-8 pb-6 text-center md:text-start">
          <div className="flex items-center gap-2 text-zinc-900 justify-center md:justify-start">
            <Zap size={24} className="text-orange-600 fill-current" />
            <h1 className="text-2xl font-black tracking-tighter">X-FLOW</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-2 font-medium">أدوات صناع المحتوى</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-4 text-sm font-bold rounded-2xl transition-all duration-200
                ${currentTool === item.id 
                  ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-200' 
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}
              `}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-4">
           {/* Language */}
           <div className="flex justify-center gap-4 text-[10px] font-medium text-zinc-400">
                <button onClick={() => setLanguage('ar')} className={language === 'ar' ? 'text-zinc-900 font-bold' : 'hover:text-zinc-600'}>العربية</button>
                <span>|</span>
                <button onClick={() => setLanguage('en')} className={language === 'en' ? 'text-zinc-900 font-bold' : 'hover:text-zinc-600'}>English</button>
           </div>

          {!userProfile ? (
              <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="@username"
                        value={handleInput}
                        onChange={(e) => setHandleInput(e.target.value)}
                        className="w-full text-xs p-2 bg-white rounded-lg border border-zinc-200 focus:border-zinc-400 outline-none transition-all"
                    />
                    <button 
                        onClick={() => handleInput && onConnect(handleInput)}
                        disabled={isConnecting || !handleInput}
                        className="bg-zinc-900 text-white rounded-lg p-2 hover:bg-black transition-colors disabled:opacity-50"
                    >
                    {isConnecting ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                    </button>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-[9px] text-zinc-400">
                    <Lock size={10} />
                    <span>{t('nav.safe_note')}</span>
                </div>
              </div>
          ) : (
              <div className="flex items-center gap-3 p-2 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <img src={userProfile.avatarUrl} alt="" className="w-9 h-9 rounded-full bg-zinc-200 object-cover" />
                  <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-zinc-900 truncate">{userProfile.name}</h4>
                      <div className="text-[10px] text-zinc-500 truncate">@{userProfile.handle.replace('@', '')}</div>
                  </div>
                  <button onClick={onDisconnect} className="text-zinc-400 hover:text-red-500 transition-colors p-1">
                      <LogOut size={16} />
                  </button>
              </div>
          )}
        </div>
      </aside>
    </>
  );
};