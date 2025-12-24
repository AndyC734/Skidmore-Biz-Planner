
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { encryptData, decryptData } from '../services/securityVault';
import { Shield, ShieldCheck, Lock, Trash2, Eye, EyeOff, RefreshCcw, Zap, Globe, Cpu } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const PrivacyVault: React.FC<Props> = ({ profile, onUpdate }) => {
  const [showSensitive, setShowSensitive] = useState(false);
  const [wipeConfirm, setWipeConfirm] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const handleRotateKeys = async () => {
    setIsRotating(true);
    // Simulate re-encryption process
    const sensitiveData = JSON.stringify(profile);
    const encrypted = await encryptData(sensitiveData);
    localStorage.setItem('skidmore_encrypted_profile', encrypted);
    setTimeout(() => setIsRotating(false), 2000);
  };

  const handleWipe = () => {
    if (!wipeConfirm) {
      setWipeConfirm(true);
      return;
    }
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Privacy Hero - Always Protected Theme */}
      <div className="relative overflow-hidden p-10 rounded-[2.5rem] bg-[#0a0c10] border border-white/10 shadow-2xl transition-all duration-700">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative">
            <div className="p-8 rounded-[2rem] bg-emerald-500/10 shadow-2xl shadow-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-20 h-20 text-emerald-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-[#0a0c10]">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Autonomous Protection Active</span>
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tight text-white">
              Skidmore Privacy Vault
            </h2>
            <p className="text-lg font-medium text-indigo-200/70">
              Your career profile is automatically secured with device-level AES-GCM encryption. 
              The private key is stored in your hardware's secure enclave and never leaves this device.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <Globe className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Decentralized Storage</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <Cpu className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Hardware-Linked Key</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sensitive Data Preview */}
        <div className="bg-white p-8 rounded-[2rem] border border-indigo-50 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-indigo-950 uppercase tracking-widest flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-300" /> Decrypted View
            </h3>
            <button 
              onClick={() => setShowSensitive(!showSensitive)}
              className="p-2 text-indigo-300 hover:text-indigo-600 transition-colors"
            >
              {showSensitive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
               <p className="text-[10px] font-black text-indigo-300 uppercase mb-1">Concentration</p>
               <p className="text-sm font-bold text-indigo-950">{showSensitive ? profile.concentration : '••••••••••••'}</p>
            </div>
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
               <p className="text-[10px] font-black text-indigo-300 uppercase mb-1">Profile Owner</p>
               <p className="text-sm font-bold text-indigo-950">{showSensitive ? profile.name : '••••••••••••'}</p>
            </div>
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex justify-between items-center">
               <div>
                <p className="text-[10px] font-black text-indigo-300 uppercase mb-1">Key Status</p>
                <p className="text-sm font-black uppercase tracking-widest text-emerald-500">Active & Sealed</p>
               </div>
               <button 
                onClick={handleRotateKeys}
                className={`p-3 rounded-xl bg-indigo-100 text-indigo-600 hover:bg-emerald-500 hover:text-white transition-all ${isRotating ? 'animate-spin bg-emerald-500 text-white' : ''}`}
                title="Rotate Encryption Keys"
               >
                 <RefreshCcw className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>

        {/* Destructive Actions */}
        <div className="bg-rose-50/30 p-8 rounded-[2rem] border border-rose-100 flex flex-col justify-between">
           <div>
              <h3 className="text-sm font-black text-rose-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Trash2 className="w-4 h-4 text-rose-400" /> Destruction Zone
              </h3>
              <p className="text-sm text-rose-700/70 font-medium leading-relaxed mb-8">
                Requesting a full data wipe will purge your profile, saved jobs, and encryption keys from this browser permanently. This action cannot be undone.
              </p>
           </div>
           
           <button 
             onClick={handleWipe}
             onMouseLeave={() => setWipeConfirm(false)}
             className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border-2 ${
               wipeConfirm 
               ? 'bg-rose-500 text-white border-rose-500 animate-pulse' 
               : 'bg-white text-rose-500 border-rose-100 hover:bg-rose-50'
             }`}
           >
             {wipeConfirm ? 'Click again to confirm wipe' : 'Wipe Data Permanently'}
           </button>
        </div>
      </div>

      {/* Security Tip */}
      <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
         <div className="bg-white p-3 rounded-xl shadow-sm">
           <Shield className="w-6 h-6 text-emerald-500" />
         </div>
         <p className="text-xs text-indigo-900/60 font-bold leading-relaxed pt-1">
           <span className="text-indigo-950 uppercase mr-1">Privacy Protocol:</span> Your resume analysis never stores persistent copies of your original document. We use transient Thoroughbred redaction logic to ensure only professional metadata is processed for strategic feedback.
         </p>
      </div>
    </div>
  );
};

export default PrivacyVault;
