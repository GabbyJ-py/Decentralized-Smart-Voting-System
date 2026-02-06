import React, { useState } from 'react';
import { api } from '../services/api';
import { Voter } from '../types';
import { CONSTITUENCY } from '../constants';
import { Search, UserCheck, ShieldCheck, HelpCircle, FileText, Download, CheckCircle2, Fingerprint, User } from 'lucide-react';

const VoterSearch: React.FC<{ onRegisterClick?: () => void }> = ({ onRegisterClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [idType, setIdType] = useState<'VOTER_ID' | 'AADHAAR'>('VOTER_ID');
  const [results, setResults] = useState<Voter[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  // Format Aadhaar with dashes (XXXX-XXXX-XXXX)
  const formatAadhaar = (value: string): string => {
    const cleaned = value.replace(/[^0-9X]/g, '');
    const truncated = cleaned.substring(0, 12);
    const parts = [];
    for (let i = 0; i < truncated.length; i += 4) {
      parts.push(truncated.substring(i, i + 4));
    }
    return parts.join('-');
  };

  // Format Voter ID (VOTE123456 - 4 letters + 6 digits)
  const formatVoterId = (value: string): string => {
    const cleaned = value.replace(/[^A-Z0-9]/g, '');
    const letters = cleaned.substring(0, 4).replace(/[^A-Z]/g, '');
    const numbers = cleaned.substring(4, 10).replace(/[^0-9]/g, '');
    return letters + numbers;
  };

  // Validate input based on ID type
  const validateInput = (value: string): boolean => {
    if (idType === 'AADHAAR') {
      const cleaned = value.replace(/-/g, '');
      return cleaned.length === 12 && /^[0-9X]{12}$/.test(cleaned);
    } else {
      return value.length === 10 && /^[A-Z]{4}[0-9]{6}$/.test(value);
    }
  };

  // Handle input change with formatting
  const handleInputChange = (value: string) => {
    if (idType === 'AADHAAR') {
      setSearchQuery(formatAadhaar(value.toUpperCase()));
    } else {
      setSearchQuery(formatVoterId(value.toUpperCase()));
    }
    setError('');
  };

  // Handle ID type change
  const handleIdTypeChange = (type: 'VOTER_ID' | 'AADHAAR') => {
    setIdType(type);
    setSearchQuery('');
    setError('');
    setSearched(false);
    setResults([]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    // Validate input format
    if (!validateInput(searchQuery)) {
      if (idType === 'AADHAAR') {
        setError('Invalid Aadhaar format. Must be 12 digits (XXXX-XXXX-XXXX)');
      } else {
        setError('Invalid Voter ID format. Must be 4 letters followed by 6 digits (e.g., VOTE123456)');
      }
      return;
    }
    
    setIsSearching(true);
    setSearched(true);
    setError('');
    const data = await api.searchVotersById(searchQuery);
    setResults(data);
    setIsSearching(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-10">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-2">
            <ShieldCheck size={14} /> Official National E-Roll
          </div>
          <h2 className="text-4xl font-black text-[#053c6d] tracking-tight">Voter Information Search</h2>
          <p className="text-slate-500 font-medium mt-2 max-w-xl">
            Access your registered details and check your polling eligibility status in the <span className="text-[#053c6d] font-bold">{CONSTITUENCY}</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white px-5 py-3 rounded-xl border-2 border-slate-100 text-sm font-bold text-slate-600 hover:border-blue-200 transition">
            <HelpCircle size={18} /> How it works
          </button>
        </div>
      </div>

      {/* Search Input Section */}
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-400">
          <Search size={120} />
        </div>
        
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto space-y-8 relative z-10">
          {/* ID Type Selection */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Select ID Type</label>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => handleIdTypeChange('VOTER_ID')}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                  idType === 'VOTER_ID'
                    ? 'bg-blue-50 border-[#053c6d] text-[#053c6d]'
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                {idType === 'VOTER_ID' && <CheckCircle2 size={16} />}
                Voter ID (EPIC)
              </button>
              <button
                type="button"
                onClick={() => handleIdTypeChange('AADHAAR')}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                  idType === 'AADHAAR'
                    ? 'bg-blue-50 border-[#053c6d] text-[#053c6d]'
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                {idType === 'AADHAAR' && <CheckCircle2 size={16} />}
                Aadhaar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-600 text-center">Enter your unique identity identifier below:</p>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                  {idType === 'VOTER_ID' ? <User size={20} /> : <Fingerprint size={20} />}
                </div>
                <input 
                  type="text" 
                  autoFocus
                  className={`w-full pl-14 pr-6 py-5 border-2 rounded-2xl outline-none text-lg font-bold transition-all placeholder:text-slate-300 shadow-inner ${
                    error 
                      ? 'bg-red-50 border-red-300 focus:border-red-500' 
                      : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-700'
                  }`}
                  placeholder={idType === 'VOTER_ID' ? 'VOTE123456' : 'XXXX-XXXX-XXXX'}
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={!searchQuery}
                className="bg-[#053c6d] text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-[#085091] transition shadow-xl shadow-blue-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Search size={22} /> Search Registry
              </button>
            </div>
            {error && (
              <p className="text-red-600 text-sm font-bold text-center animate-in slide-in-from-top-1">
                {error}
              </p>
            )}
          </div>
          
          <div className="flex justify-center gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-green-500" /> SECURE QUERY</span>
            <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-green-500" /> REAL-TIME MYSQL SYNC</span>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="pt-4">
        {isSearching ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Querying National Database...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#053c6d] flex items-center gap-2 px-2">
              <UserCheck size={20} /> Verified Record Found ({results.length})
            </h3>
            {results.map((voter) => (
              <div key={voter.id} className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in slide-in-from-bottom-4 transition-all hover:shadow-lg hover:border-blue-100">
                <div className="flex gap-8 items-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-[#053c6d] font-black text-3xl border border-blue-100">
                    {voter.name.charAt(0)}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-black text-3xl text-[#053c6d] tracking-tight">{voter.name}</h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">EPIC:</span>
                        <span className="text-xs font-mono font-bold text-blue-700">{voter.voterId}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aadhaar:</span>
                        <span className="text-xs font-mono font-bold text-blue-700">XXXX-XXXX-{voter.aadhaar.slice(-4)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                      <span className="bg-[#ff9933] w-2 h-2 rounded-full"></span> {CONSTITUENCY}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center md:items-end gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-10">
                  <div className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${
                    voter.hasVoted 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {voter.hasVoted ? (
                      <><ShieldCheck size={16} /> Ballot Cast</>
                    ) : (
                      <><UserCheck size={16} /> Eligible to Vote</>
                    )}
                  </div>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-widest transition group">
                    <Download size={14} className="group-hover:translate-y-0.5 transition" /> Official E-Roll Entry
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : searched && (
          <div className="py-24 text-center space-y-6 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-inner">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search size={40} />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-black text-slate-500">Record Not Found</p>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">The requested identity key does not exist in our current digital registry for {CONSTITUENCY}.</p>
            </div>
            <button 
              onClick={onRegisterClick}
              className="bg-[#053c6d] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-[#085091] transition"
            >
              Register as New Voter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoterSearch;