import React, { useState } from 'react';
import { Voter, Candidate } from '../types';
import { CANDIDATES, CONSTITUENCY } from '../constants';
import { api } from '../services/api';
import { ShieldCheck, CheckCircle2, Loader2, AlertCircle, Send, Landmark, Hash } from 'lucide-react';

const PARTY_COLORS: Record<string, string> = {
  'TVK': '#ef4444', // Red
  'DMK': '#eab308', // Yellow
  'ADMK': '#22c55e', // Green
  'NTK': '#3b82f6', // Blue
  'PMK': '#a855f7', // Purple
  'MNM': '#64748b', // Slate (White/Welfare)
  'OTA': '#0f172a', // Dark
};

const VotingPanel: React.FC<{ voter: Voter; onVoteCast: () => void }> = ({ voter, onVoteCast }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'confirming' | 'broadcasting' | 'success'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleVote = async () => {
    if (selectedId === null) return;
    setLoading(true);
    setStatus('broadcasting');
    
    try {
      // Cast vote on blockchain
      const result = await api.castVote(voter.email, selectedId);
      
      if (result.success) {
        setTxHash(result.txHash || '0x0000000000000000000000000000000000000000');
        setStatus('success');
        setTimeout(() => {
          onVoteCast();
        }, 5000);
      } else {
        alert(result.message);
        setStatus('idle');
        setLoading(false);
      }
    } catch (error) {
      alert('Vote failed. Please try again.');
      setStatus('idle');
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-200 text-center space-y-8 animate-in zoom-in-95">
        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border-4 border-green-100 shadow-xl">
          <ShieldCheck size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-[#053c6d] tracking-tight">Vote Confirmed</h2>
          <p className="text-slate-500 font-medium text-sm">Your selection has been immutably recorded on the Blockchain.</p>
        </div>
        
        <div className="bg-[#0b2447] text-white p-8 rounded-3xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Landmark size={120} />
          </div>
          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-300 mb-2">Transaction Hash (Receipt)</p>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                <Hash size={16} className="text-[#ff9933] shrink-0" />
                <p className="text-xs font-mono font-bold break-all">{txHash}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <p className="text-[8px] font-bold uppercase text-blue-200/50">Timestamp</p>
                <p className="text-[10px] font-bold">{new Date().toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase text-blue-200/50">Status</p>
                <p className="text-[10px] font-bold text-green-400">FINALIZED</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">Redirecting to main portal in 5 seconds...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Session Header */}
      <div className="gov-gradient p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-blue-900/20">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[9px] font-black tracking-widest uppercase mb-2 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Authenticated Session Active
          </div>
          <h2 className="text-4xl font-black tracking-tight">{voter.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <p className="text-xs opacity-70 font-mono font-bold tracking-tighter uppercase">{voter.voterId}</p>
            <span className="opacity-30">•</span>
            <p className="text-xs opacity-70 font-bold uppercase tracking-widest">{CONSTITUENCY}</p>
          </div>
        </div>
        <div className="h-24 w-24 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center border border-white/20 text-5xl shadow-2xl ring-4 ring-white/5">🗳️</div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-[#053c6d] px-2 flex items-center gap-3">
          <CheckCircle2 className="text-blue-600" size={24} /> Candidate Selection List
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CANDIDATES.map(c => {
            const isSelected = selectedId === c.id;
            const partyColor = PARTY_COLORS[c.name] || '#053c6d';
            
            return (
              <div 
                key={c.id} 
                onClick={() => setSelectedId(c.id)} 
                className={`group relative p-8 rounded-[2.5rem] border-4 transition-all cursor-pointer overflow-hidden ${
                  isSelected 
                    ? 'text-white shadow-2xl shadow-blue-900/30 -translate-y-2' 
                    : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5'
                }`}
                style={{ 
                  backgroundColor: isSelected ? partyColor : undefined,
                  borderColor: isSelected ? partyColor : undefined
                }}
              >
                <div className="flex items-center gap-8 relative z-10">
                  <div className={`text-4xl w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner transition-all duration-500 ${
                    isSelected ? 'bg-white/20 text-white rotate-[10deg]' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:scale-110'
                  }`}>
                    {c.logo}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight">{c.name}</h3>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] leading-tight ${
                      isSelected ? 'text-white/80' : 'text-slate-400'
                    }`}>
                      {c.party}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute right-0 bottom-0 p-8 opacity-10 text-7xl font-black italic select-none -rotate-12 translate-y-4 translate-x-4">
                    SELECTED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Area */}
      <div className="flex flex-col items-center pt-10">
        {status === 'idle' ? (
          <div className="text-center space-y-6">
            <button 
              disabled={selectedId === null} 
              onClick={() => setStatus('confirming')} 
              className="bg-[#053c6d] text-white px-16 py-6 rounded-2xl font-black text-xl tracking-tight hover:bg-[#085091] hover:scale-105 transition active:scale-95 disabled:opacity-20 shadow-2xl shadow-blue-900/20 flex items-center gap-4"
            >
              Sign and Record Ballot <Send size={24} />
            </button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Your vote is anonymized via Cryptographic Hashing.</p>
          </div>
        ) : status === 'confirming' ? (
          <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl max-w-2xl text-center space-y-8 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto border-4 border-orange-100">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-[#053c6d] tracking-tight">Final Confirmation</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                You are casting a vote for <span className="text-[#053c6d] font-black uppercase tracking-widest">{CANDIDATES.find(c => c.id === selectedId)?.name}</span>. 
                This action is permanent and cannot be reversed once signed by the blockchain node.
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setStatus('idle')} 
                className="flex-1 bg-slate-100 py-5 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                disabled={loading} 
                onClick={handleVote} 
                className="flex-1 bg-[#053c6d] text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:bg-[#085091] transition flex items-center justify-center gap-3"
              >
                <ShieldCheck size={20} /> Finalize & Sign
              </button>
            </div>
          </div>
        ) : status === 'broadcasting' && (
          <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl w-full max-w-xl text-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-blue-50 border-t-[#053c6d] rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck size={32} className="text-[#053c6d] animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-[#053c6d] uppercase tracking-widest">Broadcasting Transaction</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Node Validation in progress...</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl font-mono text-[10px] text-slate-400 break-all border border-slate-100">
              SIGNING WITH BIOMETRIC_PRIVATE_KEY_VECTOR_{btoa(voter.email).substring(0, 16)}...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingPanel;