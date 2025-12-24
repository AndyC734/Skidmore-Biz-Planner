
import React, { useState, useEffect } from 'react';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import ChatBot from './components/ChatBot';
import Tools from './components/Tools';
import JobFinder from './components/JobFinder';
import AlumniConnect from './components/AlumniConnect';
import PrivacyVault from './components/PrivacyVault';
import { UserProfile } from './types';
import { encryptData, decryptData } from './services/securityVault';
import { LayoutDashboard, MessageSquare, FileText, Search, GraduationCap, Briefcase, Users, Shield, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'jobs' | 'chat' | 'resume' | 'tools' | 'alumni' | 'privacy'>('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const loadStoredProfile = async () => {
      const vaultMeta = localStorage.getItem('skidmore_vault_meta');
      const storedData = localStorage.getItem('skidmore_encrypted_profile');
      
      if (vaultMeta && storedData) {
        try {
          const decrypted = await decryptData(storedData);
          setProfile(JSON.parse(decrypted));
        } catch (e) {
          console.error("Failed to decrypt stored profile", e);
        }
      }
      setIsInitializing(false);
    };
    loadStoredProfile();
  }, []);

  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    // Automatically protect the data immediately
    const sensitiveData = JSON.stringify(newProfile);
    const encrypted = await encryptData(sensitiveData);
    
    localStorage.setItem('skidmore_encrypted_profile', encrypted);
    localStorage.setItem('skidmore_vault_meta', 'encrypted');
    
    setProfile(newProfile);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <p className="text-emerald-400 font-black uppercase tracking-[0.3em] text-xs">Authenticating Vault...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-900 p-3 rounded-full">
              <GraduationCap className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Skidmore Career Planner</h1>
          <p className="text-gray-600">Your AI-powered class-year internship roadmap.</p>
        </div>
        <OnboardingForm onComplete={handleOnboardingComplete} />
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
             <span className="font-bold text-white text-lg tracking-tight italic">CareerPlanner</span>
           </div>
           <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-black mb-6">Coach Menu</p>
        </div>
        
        <nav className="flex-1 flex md:flex-col justify-around md:justify-start px-2 md:px-4 gap-1 md:gap-2 overflow-x-auto md:overflow-visible py-2 md:py-0">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center p-3 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-800/50'}`}
          >
            <LayoutDashboard className="w-5 h-5 md:mr-3" />
            <span className="hidden md:block text-sm font-bold">Strategy</span>
          </button>

           <button 
            onClick={() => setCurrentView('jobs')}
            className={`flex items-center p-3 rounded-xl transition-all ${currentView === 'jobs' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-800/50'}`}
          >
            <Briefcase className="w-5 h-5 md:mr-3" />
            <span className="hidden md:block text-sm font-bold">Scout</span>
          </button>

          <button 
            onClick={() => setCurrentView('alumni')}
            className={`flex items-center p-3 rounded-xl transition-all ${currentView === 'alumni' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-800/50'}`}
          >
            <Users className="w-5 h-5 md:mr-3" />
            <span className="hidden md:block text-sm font-bold">Alumni</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('tools')}
            className={`flex items-center p-3 rounded-xl transition-all ${currentView === 'tools' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-800/50'}`}
          >
            <Search className="w-5 h-5 md:mr-3" />
            <span className="hidden md:block text-sm font-bold">Research</span>
          </button>

          <button 
            onClick={() => setCurrentView('resume')}
            className={`flex items-center p-3 rounded-xl transition-all ${currentView === 'resume' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-800/50'}`}
          >
            <FileText className="w-5 h-5 md:mr-3" />
            <span className="hidden md:block text-sm font-bold">Resume</span>
          </button>

          <button 
            onClick={() => setCurrentView('chat')}
            className={`flex items-center p-3 rounded-xl transition-all ${currentView === 'chat' ? 'bg-emerald-800 text-white shadow-lg' : 'hover:bg-emerald-800/50'}`}
          >
            <MessageSquare className="w-5 h-5 md:mr-3" />
            <span className="hidden md:block text-sm font-bold">Coach</span>
          </button>

          <div className="md:mt-8 md:pt-8 md:border-t md:border-emerald-800/50">
            <button 
              onClick={() => setCurrentView('privacy')}
              className={`flex items-center p-3 rounded-xl transition-all w-full ${currentView === 'privacy' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-400 hover:text-white hover:bg-emerald-800/50'}`}
            >
              <Shield className="w-5 h-5 md:mr-3" />
              <span className="hidden md:block text-sm font-bold">Privacy Vault</span>
            </button>
          </div>
        </nav>

        <div className="hidden md:block p-6 text-[10px] text-emerald-400/40 font-black uppercase tracking-widest">
          Nov 2025 Release
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto mb-20 md:mb-0 h-screen bg-indigo-50/20">
        <div className="max-w-5xl mx-auto">
          {currentView === 'dashboard' && <Dashboard profile={profile} />}
          {currentView === 'jobs' && <JobFinder profile={profile} />}
          {currentView === 'alumni' && <AlumniConnect profile={profile} />}
          {currentView === 'tools' && <Tools profile={profile} />}
          {currentView === 'resume' && <ResumeAnalyzer profile={profile} />}
          {currentView === 'chat' && <ChatBot />}
          {currentView === 'privacy' && <PrivacyVault profile={profile} onUpdate={setProfile} />}
        </div>
      </main>
    </div>
  );
};

export default App;
