import React, { useState } from 'react';
import { analyzeResume } from '../services/geminiService';
import { UserProfile } from '../types';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  profile: UserProfile;
}

const ResumeAnalyzer: React.FC<Props> = ({ profile }) => {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
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

      if (file && mode === 'upload') {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => {
            const result = e.target?.result as string;
            // Strip the Data URL prefix to get raw base64
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
        mode === 'paste' ? textInput : undefined
      );
      setFeedback(result);
    } catch (error) {
      console.error(error);
      setFeedback("Something went wrong analyzing the resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FileText className="mr-2 h-6 w-6 text-emerald-600"/> Resume Review
        </h2>

        {analyzing ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">Analyzing Resume...</h3>
              <p className="text-gray-500">
                Gemini Vision is reviewing your content against {profile.classYear} standards.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 w-full max-w-sm">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                 <span className="text-sm text-gray-500">Input Mode</span>
                 <span className="text-sm font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {mode === 'upload' ? 'File Upload' : 'Text Paste'}
                 </span>
              </div>
              {mode === 'upload' && file && (
                <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-500">File Name</span>
                   <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]" title={file.name}>
                    {file.name}
                   </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              Upload your resume (PDF/Image) or paste the text. I'll review it against {profile.classYear} standards using visual analysis.
            </p>

            <div className="flex space-x-4 mb-6">
              <button 
                onClick={() => setMode('upload')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'upload' ? 'bg-emerald-100 text-emerald-800' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Upload File
              </button>
              <button 
                onClick={() => setMode('paste')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'paste' ? 'bg-emerald-100 text-emerald-800' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Paste Text
              </button>
            </div>

            <div className="mb-6">
              {mode === 'upload' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-black transition-colors">
                  <input 
                    type="file" 
                    id="resume-upload" 
                    className="hidden" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                    <span className="text-sm text-gray-600 font-medium">
                      {file ? file.name : "Click to upload PDF or Image"}
                    </span>
                  </label>
                </div>
              ) : (
                <textarea
                  className="w-full h-48 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-black caret-black text-black focus:outline-none"
                  placeholder="Paste your resume content here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={(!file && !textInput)}
              className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors flex justify-center items-center"
            >
              Analyze Resume
            </button>
          </>
        )}
      </div>

      {feedback && !analyzing && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Check className="mr-2 h-5 w-5 text-emerald-600" /> Feedback
          </h3>
          <div className="prose prose-emerald max-w-none text-gray-700">
            <ReactMarkdown>{feedback}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;