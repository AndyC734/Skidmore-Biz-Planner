import React, { useState } from 'react';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import ChatBot from './components/ChatBot';
import Tools from './components/Tools';
import JobFinder from './components/JobFinder';
import { UserProfile } from './types';
import { LayoutDashboard, MessageSquare, FileText, Search, GraduationCap, Briefcase } from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'jobs' | 'chat' | 'resume' | 'tools'>('dashboard');

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-900 p-3 rounded-full">
              <GraduationCap className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Skidmore Biz Planner</h1>
          <p className="text-gray-600">Your AI-powered class-year internship roadmap.</p>
        </div>
        <OnboardingForm onComplete={setProfile} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar / Mobile Nav */}
      <aside className="fixed bottom-0 w-full md:relative md:w-64 md:h-screen bg-emerald-900 text-emerald-100 flex md:flex-col justify-between z-50">
        <div className="p-6 hidden md:block">
           <div className="flex items-center gap-2 mb-6">
             <GraduationCap className="w-8 h-8 text-yellow-400" />
             <span className="font-bold text-white text-lg tracking-tight">BizPlanner</span>
           </div>
           <p className="text-xs text-emerald-300 uppercase tracking-wider font-semibold mb-2">Your Space</p>
        </div>
        
        <nav className="flex-1 flex md:flex-col justify-around md:justify-start px-2 md:px-4 gap-1 md:gap-2 overflow-x-auto md:overflow-visible py-2 md:py-0">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center p-3 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-emerald-800 text-white shadow-md' : 'hover:bg-emerald-800/50'}`}
          >
            <LayoutDashboard className="w-5 h-5 md:mr-3" />
            <span className="hidden md:block">Strategy Plan</span>
          </button>

           <button 
            onClick={() => setCurrentView('jobs')}
            className={`flex items-center p-3 rounded-lg transition-colors ${currentView === 'jobs' ? 'bg-emerald-800 text-white shadow-md' : 'hover:bg-emerald-800/50'}`}
          >
            <Briefcase className="w-5 h-5 md:mr-3" />
            <span className="hidden md:block">Find Jobs</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('tools')}
            className={`flex items-center p-3 rounded-lg transition-colors ${currentView === 'tools' ? 'bg-emerald-800 text-white shadow-md' : 'hover:bg-emerald-800/50'}`}
          >
            <Search className="w-5 h-5 md:mr-3" />
            <span className="hidden md:block">Research Tools</span>
          </button>

          <button 
            onClick={() => setCurrentView('resume')}
            className={`flex items-center p-3 rounded-lg transition-colors ${currentView === 'resume' ? 'bg-emerald-800 text-white shadow-md' : 'hover:bg-emerald-800/50'}`}
          >
            <FileText className="w-5 h-5 md:mr-3" />
            <span className="hidden md:block">Resume Check</span>
          </button>

          <button 
            onClick={() => setCurrentView('chat')}
            className={`flex items-center p-3 rounded-lg transition-colors ${currentView === 'chat' ? 'bg-emerald-800 text-white shadow-md' : 'hover:bg-emerald-800/50'}`}
          >
            <MessageSquare className="w-5 h-5 md:mr-3" />
            <span className="hidden md:block">Coach Chat</span>
          </button>
        </nav>

        <div className="hidden md:block p-6 text-xs text-emerald-400/60">
          Powered by Gemini 3.0 Pro & Flash
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-20 md:mb-0 h-screen">
        <div className="max-w-5xl mx-auto">
          {currentView === 'dashboard' && <Dashboard profile={profile} />}
          {currentView === 'jobs' && <JobFinder profile={profile} />}
          {currentView === 'tools' && <Tools profile={profile} />}
          {currentView === 'resume' && <ResumeAnalyzer profile={profile} />}
          {currentView === 'chat' && <ChatBot />}
        </div>
      </main>
    </div>
  );
};

export default App;