
import React, { useState } from 'react';
import { analyzeResume, generateSpeech, redactSensitiveInfo } from '../services/geminiService';
import { playRawAudio } from '../services/audioHelper';
import { UserProfile } from '../types';
import { Upload, FileText, Check, Loader2, Volume2, ShieldCheck, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  profile: UserProfile;
}

const ResumeAnalyzer: React.FC<Props> = ({ profile }) => {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [protecting, setProtecting] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file && !textInput) return;
    setAnalyzing(true);
    setFeedback('');

    try {
      let fileBase64 = undefined;
      let mimeType = undefined;
      let targetText = textInput;

      // STEP 1: AI DATA PROTECTION
      setProtecting(true);
      if (mode === 'paste' && textInput) {
        targetText = await redactSensitiveInfo(textInput);
        setTextInput(targetText); // Update UI to show redacted version
      }
      setProtecting(false);

      if (file && mode === 'upload') {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => {
            const result = e.target?.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
        });
        reader.readAsDataURL(file);
        fileBase64 = await base64Promise;
        mimeType = file.type;
      }

      const result = await analyzeResume(
        profile,
        fileBase64,
        mimeType,
        mode === 'paste' ? targetText : undefined
      );
      setFeedback(result);
    } catch (error) {
      console.error(error);
      setFeedback("Something went wrong analyzing the resume. Please try again.");
    } finally {
      setAnalyzing(false);
      setProtecting(false);
    }
  };

  const handleSpeak = async () => {
    if (speaking || !feedback) return;
    setSpeaking(true);
    try {
      const audioBase64 = await generateSpeech(feedback.substring(0, 1000));
      await playRawAudio(audioBase64);
    } catch (error) {
      console.error("Speech failed", error);
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-indigo-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16"></div>
        
        <h2 className="text-3xl font-black text-indigo-950 mb-6 flex items-center italic uppercase tracking-tight">
            <div className="bg-indigo-950 p-3 rounded-2xl mr-4 shadow-lg">
              <FileText className="h-6 w-6 text-emerald-400"/>
            </div>
            Resume Review
        </h2>

        {analyzing ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-8">
            <div className="relative">
               <div className="h-24 w-24 border-8 border-indigo-50 border-t-emerald-500 rounded-full animate-spin"></div>
               {protecting && (
                 <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                   <ShieldCheck className="h-8 w-8 text-emerald-600" />
                 </div>
               )}
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-black text-indigo-950 uppercase tracking-widest">
                {protecting ? 'Privacy Shield Active' : 'Analyzing Layout'}
              </h3>
              <p className="text-indigo-400 font-bold max-w-sm mx-auto">
                {protecting 
                  ? "Gemini is intelligently redacting your PII (phone, email) before analysis..."
                  : `Evaluating your experience against ${profile.classYear} recruiting benchmarks.`}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 flex items-center gap-4 mb-8">
               <ShieldCheck className="w-5 h-5 text-emerald-600" />
               <p className="text-xs text-indigo-900 font-bold">
                 <span className="uppercase text-[10px] tracking-widest text-emerald-700 mr-2">Automatic Protection:</span>
                 Sensitive data will be scrubbed before processing.
               </p>
            </div>

            <div className="flex space-x-2 mb-8 bg-indigo-50/50 p-1.5 rounded-2xl w-fit">
              <button 
                onClick={() => setMode('upload')}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'upload' ? 'bg-white text-indigo-950 shadow-md' : 'text-indigo-400 hover:text-indigo-600'}`}
              >
                Upload Document
              </button>
              <button 
                onClick={() => setMode('paste')}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'paste' ? 'bg-white text-indigo-950 shadow-md' : 'text-indigo-400 hover:text-indigo-600'}`}
              >
                Paste Content
              </button>
            </div>

            <div className="mb-8">
              {mode === 'upload' ? (
                <div className="border-4 border-dashed border-indigo-50 rounded-[2rem] p-12 text-center hover:border-emerald-200 transition-all group bg-indigo-50/10">
                  <input 
                    type="file" 
                    id="resume-upload" 
                    className="hidden" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="bg-white p-5 rounded-[1.5rem] shadow-xl group-hover:scale-110 transition-transform mb-6 border border-indigo-50">
                      <Upload className="h-8 w-8 text-indigo-300" />
                    </div>
                    <span className="text-base font-black text-indigo-950 uppercase tracking-widest">
                      {file ? file.name : "Select Resume PDF/IMG"}
                    </span>
                    <p className="text-xs text-indigo-300 font-bold mt-2">Max 5MB. Visual analysis supported.</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <textarea
                    className="w-full h-64 bg-indigo-50/30 border-2 border-indigo-50 rounded-[2rem] p-8 text-sm text-indigo-950 font-bold leading-relaxed focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"
                    placeholder="Paste your professional experience summary here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <div className="absolute top-4 right-4 text-[10px] font-black text-indigo-200 uppercase tracking-widest">
                    AI Redaction Enabled
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={(!file && !textInput)}
              className="w-full bg-indigo-950 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-2xl shadow-indigo-950/20 active:scale-95 disabled:opacity-50 flex justify-center items-center gap-3"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Analyze with Privacy Guard
            </button>
          </>
        )}
      </div>

      {feedback && !analyzing && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-emerald-100 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
          
          <button 
            onClick={handleSpeak}
            disabled={speaking}
            className={`absolute top-8 right-8 p-3 rounded-2xl border transition-all hover:scale-110 ${speaking ? 'bg-emerald-50 text-emerald-600 border-emerald-200 animate-pulse' : 'bg-indigo-50 text-indigo-300 border-indigo-100'}`}
          >
            <Volume2 className="w-6 h-6" />
          </button>
          
          <h3 className="text-2xl font-black text-indigo-950 mb-8 flex items-center italic uppercase tracking-tight">
            <Check className="mr-3 h-6 w-6 text-emerald-500" /> Improvement Strategy
          </h3>
          
          <div className="prose prose-indigo max-w-none text-indigo-900/80 font-medium leading-relaxed
            prose-headings:text-indigo-950 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest prose-headings:mt-8 prose-headings:mb-4
            prose-li:marker:text-emerald-500 prose-li:my-1 prose-ul:my-4 prose-p:my-2">
            <ReactMarkdown>{feedback}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
