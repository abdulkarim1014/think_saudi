import React, { useState, useEffect } from 'react';
import { Plus, ArrowUpRight, Clock, CalendarDays, Filter, TrendingUp, Sparkles } from 'lucide-react';
import { generatePlanIdeas, fetchTrendingTopics } from '../services/geminiService';
import { TaskCard, UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
    onCompose: (initialText?: string) => void;
    userProfile: UserProfile | null;
    onConnect: () => void;
}

const ActivityHeatmap = () => {
    const weeks = 12;
    const days = 7;
    // Less random, more aesthetically pleasing pattern
    const data = Array.from({ length: weeks * days }, () => Math.random() > 0.7 ? (Math.random() > 0.5 ? 2 : 1) : 0);

    const getColor = (level: number) => {
        switch(level) {
            case 1: return 'bg-zinc-200';
            case 2: return 'bg-zinc-800';
            default: return 'bg-zinc-100';
        }
    };

    return (
        <div className="flex gap-1.5 dir-ltr">
            {Array.from({ length: weeks }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1.5">
                    {Array.from({ length: days }).map((_, dayIndex) => (
                        <div 
                            key={dayIndex} 
                            className={`w-2.5 h-2.5 rounded-sm transition-colors duration-500 ${getColor(data[weekIndex * 7 + dayIndex])}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ onCompose, userProfile, onConnect }) => {
  const { t } = useLanguage();
  const [niche, setNiche] = useState('Tech');
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [trends, setTrends] = useState<string[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);

  useEffect(() => {
    if (userProfile && niche) {
        handleFetchTrends();
    }
  }, [userProfile]);

  const handleFetchTrends = async () => {
    setLoadingTrends(true);
    const topics = await fetchTrendingTopics(niche);
    setTrends(topics);
    setLoadingTrends(false);
  }

  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    const ideas = await generatePlanIdeas(niche);
    const newTasks: TaskCard[] = ideas.map((idea, index) => ({
      id: Date.now().toString() + index,
      title: idea.title,
      category: idea.category as any,
      type: idea.type as any,
      description: idea.description,
      status: 'pending',
      date: 'Auto',
      progress: 0
    }));
    setTasks(prev => [...newTasks, ...prev]);
    setLoadingPlan(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 pt-4">
      
      {/* Header Section: Welcome + Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                {userProfile ? t('dash.ready') : t('dash.start')}
            </h1>
            <p className="text-zinc-500 mt-2 text-lg font-light">
                {userProfile ? t('dash.desc_user') : t('dash.desc_guest')}
            </p>
        </div>
        <div className="flex gap-3">
             {userProfile ? (
                 <>
                    <button onClick={handleFetchTrends} className="px-5 py-3 rounded-xl bg-white border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors">
                        {t('dash.refresh')}
                    </button>
                    <button onClick={() => onCompose()} className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-black transition-all shadow-lg shadow-zinc-200 flex items-center gap-2">
                        <Plus size={18} />
                        {t('dash.new_draft')}
                    </button>
                 </>
             ) : (
                <button onClick={onConnect} className="px-6 py-3 rounded-xl bg-zinc-900 text-white font-bold hover:bg-black transition-all shadow-lg shadow-zinc-200">
                    {t('dash.connect')}
                </button>
             )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1: Trends (Clean List) */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-6 text-zinc-400 uppercase tracking-wider text-xs font-bold">
                  <TrendingUp size={14} />
                  <span>{t('dash.trend_radar')}</span>
              </div>
              
              <div className="flex-1 space-y-4">
                  {loadingTrends ? (
                      <div className="animate-pulse space-y-3">
                          <div className="h-6 bg-zinc-100 rounded w-3/4"></div>
                          <div className="h-6 bg-zinc-100 rounded w-1/2"></div>
                      </div>
                  ) : trends.length > 0 ? (
                      trends.slice(0, 3).map((trend, i) => (
                          <div key={i} onClick={() => onCompose(trend)} className="group cursor-pointer">
                              <div className="flex items-center justify-between">
                                  <span className="font-medium text-zinc-800 text-lg group-hover:text-blue-600 transition-colors">#{trend}</span>
                                  <ArrowUpRight size={16} className="text-zinc-300 group-hover:text-blue-600 transition-colors" />
                              </div>
                              <div className="h-px bg-zinc-50 mt-3 w-full" />
                          </div>
                      ))
                  ) : (
                      <div className="text-zinc-400 text-sm py-4">{t('dash.no_trends')}</div>
                  )}
              </div>
          </div>

          {/* Column 2 & 3: Combined Insights (Heatmap + Simple Funnel) */}
          <div className="md:col-span-2 bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100 flex flex-col md:flex-row gap-8 items-center justify-around">
                {/* Heatmap */}
                <div className="flex flex-col items-center">
                    <div className="mb-4 text-center">
                        <div className="text-zinc-900 font-bold text-sm">{t('dash.activity_map')}</div>
                        <div className="text-zinc-400 text-[10px] uppercase tracking-wide">Last 3 Months</div>
                    </div>
                    <ActivityHeatmap />
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px h-32 bg-zinc-200"></div>

                {/* Simplified Funnel (Just Numbers) */}
                <div className="flex flex-col gap-6 w-full md:w-auto">
                     <div className="flex items-center justify-between md:justify-start gap-4">
                        <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-blue-500">
                             <Filter size={16} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-zinc-900">12.5K</div>
                            <div className="text-xs text-zinc-400">{t('dash.funnel_imp')}</div>
                        </div>
                     </div>
                     <div className="flex items-center justify-between md:justify-start gap-4">
                        <div className="p-2 bg-white rounded-lg border border-zinc-100 shadow-sm text-indigo-500">
                             <Sparkles size={16} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-zinc-900">9.6%</div>
                            <div className="text-xs text-zinc-400">{t('dash.funnel_eng')}</div>
                        </div>
                     </div>
                </div>
          </div>
      </div>

      {/* Content Plan - Simple Cards */}
      <div>
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-zinc-400 uppercase tracking-wider text-xs font-bold">
                  <CalendarDays size={14} />
                  <span>{t('dash.content_plan')}</span>
              </div>
              <div className="flex gap-2">
                 <input 
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="bg-transparent text-right text-xs font-medium text-zinc-500 focus:text-zinc-900 outline-none w-24 border-b border-transparent focus:border-zinc-300 transition-all placeholder:text-zinc-300"
                    placeholder={t('dash.niche_placeholder')}
                 />
                 <button onClick={handleGeneratePlan} disabled={loadingPlan} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                     <Clock size={16} className={loadingPlan ? "animate-spin" : ""} />
                 </button>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.length === 0 && (
                  <div className="col-span-full border-2 border-dashed border-zinc-100 rounded-2xl p-8 text-center text-zinc-400 text-sm">
                      {t('dash.start')}
                  </div>
              )}
              {tasks.map((task) => (
                  <div key={task.id} className="bg-white p-5 rounded-2xl border border-zinc-100 hover:border-zinc-300 transition-all cursor-pointer group shadow-sm" onClick={() => onCompose(task.description)}>
                      <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${task.category === 'High' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                              {task.type}
                          </span>
                          <ArrowUpRight size={14} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                      </div>
                      <h3 className="font-bold text-zinc-800 mb-1 line-clamp-1">{task.title}</h3>
                      <p className="text-xs text-zinc-500 line-clamp-2">{task.description}</p>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};