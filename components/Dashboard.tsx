
import React, { useState, useEffect } from 'react';
import { UserProfile, InternshipPlan } from '../types';
import { generateInternshipPlan, getQuickTip, generateSpeech } from '../services/geminiService';
import { playRawAudio } from '../services/audioHelper';
import { Loader2, Calendar, CheckCircle2, Briefcase, Sparkles, Volume2, Shield, Zap } from 'lucide-react';

interface Props {
  profile: UserProfile;
}

const Dashboard: React.FC<Props> = ({ profile }) => {
  const [plan, setPlan] = useState<InternshipPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickTip, setQuickTip] = useState<string>("");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const generatedPlan = await generateInternshipPlan(profile);
        setPlan(generatedPlan);
        const tip = await getQuickTip(profile.interests);
        setQuickTip(tip);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const handleSpeak = async (text: string) => {
    if (speaking) return;
    setSpeaking(true);
    try {
      const audioBase64 = await generateSpeech(text);
      await playRawAudio(audioBase64);
    } catch (error) {
      console.error("Speech failed", error);
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Skidhelper Header */}
      <div className="bg-[#0a0c10] text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden transition-all duration-500 border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mr-48 -mt-48"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
                <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                    <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Skidhelper</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Deployment Protocol for {profile.classYear}</p>
                    </div>
                </div>
            </div>
            {plan && (
              <button 
                onClick={() => handleSpeak(`${plan.summary}. Strategic Insight: ${quickTip}`)}
                className={`p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${speaking ? 'animate-pulse text-emerald-400 border-emerald-500/30' : 'text-white'}`}
                title="Audio Briefing"
                disabled={speaking}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </div>
         
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="md:col-span-2 space-y-4">
               <p className="text-emerald-50/70 text-lg font-bold leading-relaxed">
                {loading 
                  ? "Initializing Skidhelper strategic matrix..." 
                  : plan?.summary}
               </p>
               <div className="flex flex-wrap gap-3 pt-4">
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40">
                     TARGET: {profile.concentration}
                  </div>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40">
                     LOCATION: {profile.preferredCities}
                  </div>
               </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4">
                  <Zap className="w-5 h-5 text-emerald-400 animate-bounce" />
               </div>
               <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3">Strategic Insight</h4>
               <p className="text-sm font-bold text-white leading-relaxed">
                  {loading ? "Calibrating..." : `"${quickTip}"`}
               </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-8 py-20">
          <div className="relative">
             <div className="h-20 w-20 border-8 border-indigo-50 border-t-emerald-500 rounded-full animate-spin"></div>
             <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-500" />
          </div>
          <div className="text-center space-y-3">
              <h3 className="text-2xl font-black text-indigo-950 uppercase tracking-[0.2em]">Consulting Skidhelper Matrix</h3>
              <p className="text-indigo-400 font-bold max-w-sm mx-auto">
                Running high-fidelity simulations for your <strong>{profile.concentration}</strong> career path.
              </p>
          </div>
        </div>
      ) : plan ? (
        <>
          <section className="animate-fade-in space-y-6" style={{animationDelay: '0.1s'}}>
            <h2 className="text-sm font-black text-indigo-950 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-6 h-px bg-indigo-200"></div> Optimized Roles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plan.suggestedTitles.map((title, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-indigo-50 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group">
                  <div className="bg-indigo-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                     <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="font-black text-indigo-950 uppercase tracking-tight text-lg leading-tight block">{title}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="animate-fade-in space-y-6" style={{animationDelay: '0.2s'}}>
            <h2 className="text-sm font-black text-indigo-950 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-6 h-px bg-indigo-200"></div> Mission Timeline
            </h2>
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-indigo-50 overflow-hidden">
              {plan.timeline.map((item, idx) => (
                <div key={idx} className={`p-8 md:p-10 border-b border-indigo-50 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-indigo-50/20'}`}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
                    <div className="md:w-1/3">
                      <div className="inline-block px-4 py-2 bg-indigo-950 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl mb-4 shadow-lg">
                        {item.week}
                      </div>
                      <h3 className="text-2xl font-black text-indigo-950 tracking-tight leading-none uppercase italic">{item.focus}</h3>
                    </div>
                    <div className="md:w-2/3 space-y-6">
                      <ul className="space-y-4">
                        {(item.tasks || []).map((task, tIdx) => (
                          <li key={tIdx} className="flex items-start text-indigo-900/70 font-bold text-sm">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                      <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10 flex gap-4 items-start">
                        <div className="bg-white p-2 rounded-xl shadow-sm">
                           <Zap className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-sm text-indigo-950 font-bold leading-relaxed italic">
                           {item.tips}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="animate-fade-in space-y-6" style={{animationDelay: '0.3s'}}>
            <h2 className="text-sm font-black text-indigo-950 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-6 h-px bg-indigo-200"></div> Critical Action Items
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plan.actionSteps.map((step, idx) => (
                <div key={idx} className="bg-[#0a0c10] p-8 rounded-[2rem] border border-white/5 shadow-2xl group transition-all hover:border-emerald-500/30">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                     <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Objective</span>
                  </div>
                  <p className="text-white font-bold leading-relaxed text-lg">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="text-rose-500 text-center py-20 bg-rose-50 rounded-3xl border border-rose-100 font-black uppercase tracking-widest">
            ERROR: MISSION PROTOCOL DECRYPTION FAILED. REFRESH UPLINK.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
