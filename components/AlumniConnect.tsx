
import React, { useState, useEffect } from 'react';
import { AlumniProfile, UserProfile, GroundingUrl } from '../types';
import { getAlumniProfiles } from '../services/geminiService';
import { 
  Users, 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  ChevronRight, 
  Sparkles, 
  MessageSquare, 
  X, 
  Linkedin,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Search,
  Mail,
  Copy,
  Info,
  Globe
} from 'lucide-react';

interface Props {
  profile: UserProfile;
}

const COMMON_SKIDMORE_MAJORS = [
  "Management & Business", "Economics", "Psychology", "English", "Political Science", 
  "Art History", "Studio Art", "Computer Science", "Biology", "Environmental Studies"
];

const LOADING_MESSAGES = [
  "Accessing the Thoroughbred Network...",
  "Identifying alumni in your industry...",
  "Verifying LinkedIn profile availability...",
  "Retrieving professional contact protocols...",
  "Finalizing alumni reconnaissance..."
];

const AlumniConnect: React.FC<Props> = ({ profile }) => {
  const [selectedMajor, setSelectedMajor] = useState(profile.concentration);
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [sources, setSources] = useState<GroundingUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [selectedAlum, setSelectedAlum] = useState<AlumniProfile | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailLaunched, setEmailLaunched] = useState(false);

  useEffect(() => {
    fetchAlumni(selectedMajor);
  }, [selectedMajor]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchAlumni = async (major: string) => {
    setLoading(true);
    try {
      const { profiles, sources } = await getAlumniProfiles(major);
      setAlumni(profiles);
      setSources(sources);
    } catch (error) {
      console.error("Error fetching alumni:", error);
    } finally {
      setLoading(false);
    }
  };

  const openInterviewModal = (alum: AlumniProfile) => {
    const message = `Hi ${alum.name.split(' ')[0]},\n\nI hope you're having a great week! My name is ${profile.name} and I'm a ${profile.classYear} at Skidmore studying ${profile.concentration}. \n\nI came across your profile on the Skidmore Career Planner and was really inspired by your career path to becoming a ${alum.currentRole} at ${alum.company}. As I'm preparing for Summer 2026 internship applications, I would love to ask you a few questions about your experience transitioning from Skidmore to the professional world.\n\nWould you be open to a brief 15-minute informational interview sometime in the next two weeks? No worries at all if your schedule is too tight.\n\nBest,\n${profile.name}`;
    
    setDraftMessage(message);
    setSelectedAlum(alum);
    setCopied(false);
    setEmailLaunched(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailUplink = () => {
    if (!selectedAlum?.email) return;
    
    const subject = `Skidmore Student Inquiry: Informational Interview Request - ${profile.name}`;
    const body = draftMessage;
    const mailtoUrl = `mailto:${selectedAlum.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoUrl;
    setEmailLaunched(true);
    setTimeout(() => setEmailLaunched(false), 3000);
  };

  const handleLinkedInDeployment = () => {
    handleCopy();
    if (selectedAlum?.linkedInUrl) {
      window.open(selectedAlum.linkedInUrl, '_blank');
    }
  };

  const getLinkedInStatus = (alum: AlumniProfile) => {
    if (!alum.linkedInUrl || alum.linkedInUrl === "") return 'missing';
    if (alum.isUrlVerified) return 'verified';
    if (alum.linkedInUrl.includes('/search/')) return 'search';
    return 'unverified';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Card */}
      <div className="bg-indigo-950 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-none uppercase italic text-white">Alumni Network</h2>
            </div>
            <p className="text-indigo-200/80 max-w-xl font-medium text-sm leading-relaxed">
              Connect with Skidmore graduates. Our Thoroughbred system provides verified profiles and tactical outreach templates for informational interviews.
            </p>
          </div>

          <div className="w-full md:w-80 bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 block px-2">Focus Industry</label>
            <div className="relative group">
              <select 
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="w-full bg-indigo-900/50 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer transition-all outline-none"
              >
                <option value={profile.concentration}>{profile.concentration}</option>
                {COMMON_SKIDMORE_MAJORS.filter(m => m !== profile.concentration).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-white/50 rounded-[3rem] border-2 border-dashed border-indigo-100 animate-pulse">
          <div className="relative">
             <div className="h-20 w-20 border-4 border-indigo-50 border-t-emerald-500 rounded-full animate-spin"></div>
             <Linkedin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-emerald-500" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-indigo-950 font-black text-xl uppercase tracking-widest">{LOADING_MESSAGES[loadingStep]}</p>
            <p className="text-indigo-400 text-sm font-bold">Scanning for {selectedMajor} graduates...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {alumni.map((alum, idx) => {
            const status = getLinkedInStatus(alum);
            return (
              <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-indigo-50 shadow-xl hover:shadow-2xl hover:border-emerald-100 transition-all group flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-indigo-950 group-hover:text-emerald-600 transition-colors tracking-tight">
                      {alum.name} <span className="text-indigo-300 font-bold ml-1 text-xl">'{alum.classYear.replace("20", "")}</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <GraduationCap className="h-4 w-4 text-emerald-500" />
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em]">{alum.major}</span>
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex flex-col items-end gap-1">
                    {status === 'verified' && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600" title="Direct verified profile link">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Verified Profile</span>
                      </div>
                    )}
                    {status === 'search' && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100 text-amber-600" title="Verified search fallback link">
                        <Search className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Search Result</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6 flex-1 relative z-10">
                  <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-50 shadow-inner">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Briefcase className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-base font-black text-indigo-950 leading-tight">{alum.currentRole}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-6 ml-11">
                      <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">{alum.company} • {alum.location}</span>
                    </div>
                    
                    <div className="space-y-3 mt-6 relative pl-5 border-l-2 border-emerald-500/20">
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Success Track</p>
                      {alum.pathway.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-3 text-xs font-bold text-indigo-900/60">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.3)]"></div>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-indigo-50 p-5 rounded-2xl shadow-sm">
                     <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <span className="text-[9px] font-black text-indigo-950 uppercase tracking-[0.2em]">Strategy Insight</span>
                     </div>
                     <p className="text-sm text-indigo-900/70 leading-relaxed italic font-medium">
                      "{alum.advice}"
                     </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 relative z-10">
                  {/* Connect on LinkedIn Button - Hidden if link is missing */}
                  {status !== 'missing' && alum.linkedInUrl && (
                    <a 
                      href={alum.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-5 text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
                        status === 'verified' 
                        ? 'bg-[#0077b5] hover:bg-[#005c8d] shadow-blue-500/20' 
                        : 'bg-indigo-950 hover:bg-black shadow-indigo-950/20'
                      }`}
                    >
                      <Linkedin className="h-5 w-5 fill-white" />
                      Connect on LinkedIn
                      <ExternalLink className="h-4 w-4 ml-1 opacity-50" />
                    </a>
                  )}
                  
                  <button 
                    onClick={() => openInterviewModal(alum)}
                    className="w-full py-4 bg-white border-2 border-indigo-50 text-indigo-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-indigo-50 hover:border-indigo-100 transition-all active:scale-[0.98]"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Outreach Protocol
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verified Grounding Section for Alumni */}
      {sources.length > 0 && !loading && (
        <div className="bg-white p-8 rounded-[2rem] border border-indigo-50 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Globe className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="text-[10px] font-black text-indigo-900/40 uppercase tracking-[0.2em]">Verified Data Sources (Google Search)</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {sources.map((s, i) => (
              <a 
                key={i} 
                href={s.uri} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group inline-flex items-center px-4 py-2.5 bg-indigo-50/50 hover:bg-emerald-50 rounded-xl border border-indigo-100 hover:border-emerald-200 transition-all"
              >
                <span className="text-[11px] font-bold text-indigo-600 group-hover:text-emerald-700 truncate max-w-[200px]">{s.title}</span>
                <ExternalLink className="w-3 h-3 ml-2 text-indigo-300 group-hover:text-emerald-400 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Networking Modal */}
      {selectedAlum && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-indigo-950/70 backdrop-blur-xl animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden relative flex flex-col max-h-[95vh]">
            
            {/* Modal Header */}
            <div className="bg-indigo-950 px-8 py-6 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
              <button 
                onClick={() => setSelectedAlum(null)}
                className="absolute top-6 right-6 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all z-20"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="bg-emerald-500 p-3.5 rounded-2xl shadow-xl shadow-emerald-500/20">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tight leading-none">Drafting Outreach Email</h3>
                  <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.15em] mt-2">
                    Uplink targeted to {selectedAlum.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Email Fields Simulation */}
            <div className="bg-indigo-50/50 border-b border-indigo-100 p-6 space-y-4">
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest w-16">To:</span>
                  <div className="flex-1 bg-white border border-indigo-100 rounded-xl px-4 py-2 text-sm font-bold text-indigo-950 flex items-center justify-between">
                     {selectedAlum.email || "alumni-alias@skidmore.edu"}
                     {!selectedAlum.email && (
                        /* Fixed: Moved title attribute from Lucide Info icon to wrapping span to fix TypeScript error */
                        <span title="Constructing verified alias...">
                          <Info className="w-3.5 h-3.5 text-amber-500" />
                        </span>
                     )}
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest w-16">Subject:</span>
                  <div className="flex-1 bg-white border border-indigo-100 rounded-xl px-4 py-2 text-sm font-bold text-indigo-950">
                    Skidmore Student Inquiry: Informational Interview Request - {profile.name}
                  </div>
               </div>
            </div>

            {/* Body Area */}
            <div className="p-8 flex-1 overflow-y-auto bg-white">
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-indigo-50 rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <textarea
                    className="relative w-full h-[280px] bg-white border border-indigo-100 rounded-[1.5rem] p-6 text-sm text-indigo-950 font-medium leading-relaxed resize-none focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-inner"
                    value={draftMessage}
                    onChange={(e) => setDraftMessage(e.target.value)}
                    placeholder="Enter message content..."
                  />
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  {/* Primary CTA: SEND EMAIL */}
                  <button
                    onClick={handleEmailUplink}
                    disabled={!selectedAlum.email}
                    className={`group relative w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-4 overflow-hidden ${
                      emailLaunched 
                      ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500 shadow-emerald-500/20' 
                      : 'bg-indigo-950 text-white hover:bg-black shadow-indigo-950/40'
                    } ${!selectedAlum.email ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                  >
                    <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10"></div>
                    {emailLaunched ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 animate-bounce" /> Uplink Successful
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                        Send Email Protocol
                      </>
                    )}
                  </button>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Secondary CTA: LinkedIn */}
                    <button
                      onClick={handleLinkedInDeployment}
                      className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all border-2 ${
                        copied 
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-500' 
                        : 'bg-white text-indigo-950 border-indigo-100 hover:bg-indigo-50'
                      }`}
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Message Copied
                        </>
                      ) : (
                        <>
                          <Linkedin className="w-4 h-4 fill-indigo-950" /> Deploy via LinkedIn
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleCopy}
                      className="flex-1 border-2 border-indigo-100 text-indigo-400 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" /> Just Copy Text
                    </button>
                  </div>
                </div>

                {!selectedAlum.email && (
                  <p className="text-[10px] text-center text-amber-600 font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-2 bg-amber-50 p-3 rounded-xl border border-amber-100">
                    <AlertTriangle className="w-3.5 h-3.5" /> Note: Direct email Constructing. LinkedIn Deployment recommended for initial contact.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Network Expansion Footer */}
      <div className="bg-white border border-indigo-50 p-10 rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -ml-16 -mt-16 group-hover:bg-emerald-100 transition-colors"></div>
        
        <div className="flex items-center gap-6 relative z-10">
           <div className="bg-indigo-950 p-5 rounded-[2rem] shadow-2xl shadow-indigo-950/20 text-white">
             <GraduationCap className="h-8 w-8 text-emerald-400" />
           </div>
           <div>
             <h4 className="text-2xl font-black text-indigo-950 uppercase tracking-tight italic">Expand Your Network</h4>
             <p className="text-sm text-indigo-400 font-bold mt-1 max-w-sm">Access 10,000+ graduates via Handshake's official Thoroughbred Alumni platform.</p>
           </div>
        </div>
        
        <a 
          href="https://skidmore.joinhandshake.com/alumni" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full md:w-auto bg-indigo-950 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-2xl shadow-indigo-950/30 active:scale-95 flex items-center justify-center gap-3 relative z-10"
        >
          Explore Handshake Alumni
          <ExternalLink className="w-4 h-4 text-emerald-400" />
        </a>
      </div>
    </div>
  );
};

export default AlumniConnect;
