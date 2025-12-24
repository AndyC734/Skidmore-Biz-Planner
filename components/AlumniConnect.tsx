
import React, { useState, useEffect } from 'react';
import { AlumniProfile, UserProfile } from '../types';
import { getAlumniProfiles } from '../services/geminiService';
import { 
  Users, 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  ChevronRight, 
  Loader2, 
  Sparkles, 
  MessageSquare, 
  X, 
  Copy, 
  Check, 
  Linkedin,
  Send,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface Props {
  profile: UserProfile;
}

const COMMON_SKIDMORE_MAJORS = [
  "Management & Business", "Economics", "Psychology", "English", "Political Science", 
  "Art History", "Studio Art", "Computer Science", "Biology", "Environmental Studies"
];

const AlumniConnect: React.FC<Props> = ({ profile }) => {
  const [selectedMajor, setSelectedMajor] = useState(profile.concentration);
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlum, setSelectedAlum] = useState<AlumniProfile | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAlumni(selectedMajor);
  }, [selectedMajor]);

  const fetchAlumni = async (major: string) => {
    setLoading(true);
    try {
      const data = await getAlumniProfiles(major);
      setAlumni(data);
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
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Card */}
      <div className="bg-indigo-950 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-none uppercase italic">Alumni Network</h2>
            </div>
            <p className="text-indigo-200/80 max-w-xl font-medium text-sm leading-relaxed">
              Unlock the Skidmore connection. Connect with graduates who have successfully navigated the pathways you're exploring today.
            </p>
          </div>

          <div className="w-full md:w-80 bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 block px-2">Filter by Concentration</label>
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
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="h-16 w-16 border-4 border-indigo-50 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-indigo-950 font-black text-lg uppercase tracking-widest">Modeling Pathways...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {alumni.map((alum, idx) => (
            <div key={idx} className="bg-white rounded-[2rem] p-8 border border-indigo-50 shadow-xl hover:shadow-2xl hover:border-emerald-100 transition-all group flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl"></div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-indigo-950 group-hover:text-emerald-600 transition-colors tracking-tight">
                    {alum.name} <span className="text-indigo-300 font-bold ml-1 text-xl">'{alum.classYear.replace("20", "")}</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <GraduationCap className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em]">{alum.major}</span>
                  </div>
                </div>
                <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" />
                    {alum.skidmoreConnection}
                  </span>
                </div>
              </div>

              <div className="space-y-6 flex-1 relative z-10">
                <div className="bg-indigo-50/50 p-5 rounded-[1.5rem] border border-indigo-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-emerald-600" />
                    <span className="text-base font-black text-indigo-950">{alum.currentRole}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-400">{alum.company} • {alum.location}</span>
                  </div>
                  
                  <div className="space-y-3 mt-6 relative pl-5 border-l-2 border-emerald-100">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Career Journey</p>
                    {alum.pathway.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-3 text-xs font-bold text-indigo-900/60">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-200"></div>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-indigo-50 p-5 rounded-2xl shadow-sm">
                   <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span className="text-[9px] font-black text-indigo-950 uppercase tracking-[0.2em]">Coach Tip: Advice for {profile.classYear}s</span>
                   </div>
                   <p className="text-sm text-indigo-900/70 leading-relaxed italic font-medium">
                    "{alum.advice}"
                   </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 relative z-10">
                <button 
                  onClick={() => openInterviewModal(alum)}
                  className="flex-1 py-4 bg-indigo-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                >
                  <MessageSquare className="h-4 w-4" />
                  Informational Interview
                </button>
                {alum.linkedInUrl && (
                  <a 
                    href={alum.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-4 bg-white border-2 border-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all active:scale-95"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Profile
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REFINED MODAL */}
      {selectedAlum && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-indigo-950/60 backdrop-blur-lg animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-indigo-950 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
              <button 
                onClick={() => setSelectedAlum(null)}
                className="absolute top-8 right-8 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="bg-emerald-500 p-4 rounded-2xl shadow-xl shadow-emerald-500/20">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tight">Networking Draft</h3>
                  <p className="text-xs text-emerald-400 font-bold tracking-[0.1em] mt-1">
                    FOR: {selectedAlum.name} • {selectedAlum.company}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 md:p-10 flex-1 overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-2 text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                     <MessageSquare className="w-4 h-4" />
                     Informational Interview Request
                   </div>
                   <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">
                     Ready to Customize
                   </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-indigo-50 rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <textarea
                    className="relative w-full h-[320px] bg-white border border-indigo-100 rounded-[1.5rem] p-6 text-sm text-indigo-950 font-bold leading-relaxed resize-none focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
                    value={draftMessage}
                    onChange={(e) => setDraftMessage(e.target.value)}
                    placeholder="Type your message here..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleCopy}
                    className="flex-[2] flex items-center justify-center gap-3 bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-emerald-400 shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" /> Message Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" /> Copy to Clipboard
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedAlum(null)}
                    className="flex-1 border-2 border-indigo-100 text-indigo-950 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all"
                  >
                    Close
                  </button>
                </div>

                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50 flex items-start gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-indigo-50">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-950 uppercase tracking-widest mb-1">Coach Pro Tip</p>
                    <p className="text-xs text-indigo-400 font-bold leading-normal">
                      Copy this text and paste it directly into a Handshake message or LinkedIn InMail. Personalize the bracketed sections if you've done specific research on their company!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATED LINKS FOOTER */}
      <div className="bg-white border border-indigo-50 p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -ml-16 -mt-16 group-hover:bg-emerald-100 transition-colors"></div>
        
        <div className="flex items-center gap-5 relative z-10">
           <div className="bg-indigo-950 p-4 rounded-2xl shadow-xl shadow-indigo-950/10">
             <GraduationCap className="h-7 w-7 text-emerald-400" />
           </div>
           <div>
             <h4 className="text-xl font-black text-indigo-950 uppercase tracking-tight">Expand Your Network</h4>
             <p className="text-sm text-indigo-400 font-bold">Find thousands of actual graduates on the Handshake Alumni tab.</p>
           </div>
        </div>
        
        <a 
          href="https://skidmore.joinhandshake.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full md:w-auto bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 relative z-10"
        >
          Open Handshake
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default AlumniConnect;
