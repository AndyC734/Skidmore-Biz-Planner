
import React, { useState, useEffect } from 'react';
import { UserProfile, InternshipPlan } from '../types';
import { generateInternshipPlan, getQuickTip, generateSpeech } from '../services/geminiService';
import { playRawAudio } from '../services/audioHelper';
import { Loader2, Calendar, CheckCircle2, Briefcase, Sparkles, Volume2 } from 'lucide-react';

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
      <div className="bg-emerald-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden transition-all duration-500">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
                 <h1 className="text-2xl font-bold mb-1">Career Strategy & Coaching</h1>
                 <p className="text-emerald-200 text-sm mb-4">Your personalized roadmap for {profile.classYear}.</p>
            </div>
            {plan && (
              <button 
                onClick={() => handleSpeak(`${plan.summary}. Coach tip: ${quickTip}`)}
                className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all ${speaking ? 'animate-pulse' : ''}`}
                title="Listen to Strategy"
                disabled={speaking}
              >
                <Volume2 className={`w-5 h-5 ${speaking ? 'text-yellow-400' : 'text-white'}`} />
              </button>
            )}
          </div>
         
          <p className="opacity-90 max-w-2xl min-h-[1.5em] font-light">
            {loading 
              ? `Designing a ${profile.classYear} strategy for ${profile.concentration}...` 
              : plan?.summary}
          </p>
          <div className={`mt-4 inline-flex items-center bg-emerald-800/50 px-3 py-1 rounded-full text-sm border border-emerald-700 transition-opacity duration-500 ${loading ? 'opacity-70' : 'opacity-100'}`}>
             <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
             <span className="mr-2 font-semibold">Coach's Quick Tip:</span>
             {loading ? (
               <span className="animate-pulse bg-emerald-700/50 w-24 h-4 rounded ml-1 inline-block"></span>
             ) : (
               `"${quickTip}"`
             )}
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-yellow-400 rounded-full opacity-10 blur-2xl"></div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6 py-12">
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
          <div className="text-center space-y-2 max-w-md">
              <h3 className="text-xl font-semibold text-gray-800">Consulting Gemini 3.0 Pro...</h3>
              <p className="text-gray-500">
                Thinking deeply about your <strong>{profile.classYear}</strong> strategy for <strong>{profile.concentration}</strong>.
              </p>
              <div className="text-xs text-gray-400 bg-gray-100 inline-block px-2 py-1 rounded border border-gray-200">
                Allocated Thinking Budget: 32k tokens
              </div>
          </div>
        </div>
      ) : plan ? (
        <>
          <section className="animate-fade-in" style={{animationDelay: '0.1s'}}>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Briefcase className="mr-2 h-5 w-5 text-emerald-600" /> Recommended Roles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plan.suggestedTitles.map((title, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                  <span className="font-semibold text-gray-800">{title}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="animate-fade-in" style={{animationDelay: '0.2s'}}>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-emerald-600" /> Your {profile.classYear} Roadmap
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {plan.timeline.map((item, idx) => (
                <div key={idx} className={`p-6 border-b border-gray-100 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="md:w-1/4">
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-full mb-2">
                        {item.week}
                      </span>
                      <h3 className="text-lg font-bold text-emerald-900">{item.focus}</h3>
                    </div>
                    <div className="md:w-3/4">
                      <ul className="space-y-2 mb-3">
                        {(item.tasks || []).map((task, tIdx) => (
                          <li key={tIdx} className="flex items-start text-gray-700 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex gap-2 items-start">
                        <span className="font-bold">Pro Tip:</span> {item.tips}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="animate-fade-in" style={{animationDelay: '0.3s'}}>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600" /> Immediate Actions (Skidmore Specific)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.actionSteps.map((step, idx) => (
                <div key={idx} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-gray-800 font-medium">{step}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="text-red-500 text-center py-10">
            Failed to load plan. Please refresh.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
