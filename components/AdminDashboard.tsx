import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../services/api';
import { Candidate, Voter, SystemMetrics, VoteRecord } from '../types';
import { CANDIDATES } from '../constants';
import { 
  Lock, 
  ShieldAlert, 
  Terminal, 
  Activity, 
  Database, 
  Key, 
  Settings, 
  LayoutDashboard, 
  UserCircle, 
  Save, 
  CheckCircle,
  Info,
  History,
  Cpu,
  Link as LinkIcon,
  Clock,
  Hash,
  ShieldCheck
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'VOTERS' | 'EXPLORER' | 'SETTINGS'>('ANALYTICS');
  const [results, setResults] = useState<Candidate[]>([]);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [history, setHistory] = useState<VoteRecord[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newCreds, setNewCreds] = useState({ username: '', password: '' });
  const [updateStatus, setUpdateStatus] = useState(false);

  const COLORS = ['#053c6d', '#10b981', '#ff9933', '#ef4444', '#6366f1'];

  useEffect(() => {
    if (isAdmin) {
      const updateData = async () => {
        setLoading(true);
        try {
          setResults(await api.getResults());
          setVoters(api.getVoters());
          setMetrics(api.getMetrics());
          setLogs(api.getLogs());
          setHistory(await api.getBlockchainHistory());
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };
      updateData();
      const interval = setInterval(updateData, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const current = api.getAdminCredentials();
    if (credentials.username === current.username && credentials.password === current.password) {
      setIsAdmin(true);
      setError('');
      setNewCreds(current);
    } else {
      setError('Invalid system administrator credentials. Access Denied.');
    }
  };

  const handleUpdateCreds = (e: React.FormEvent) => {
    e.preventDefault();
    api.updateAdminCredentials(newCreds);
    setUpdateStatus(true);
    setTimeout(() => setUpdateStatus(false), 3000);
  };

  // ==========================================
  // PHASE 1: THE LOGIN / AUTHENTICATION GATE
  // (This is what you see FIRST)
  // ==========================================
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto mt-10 animate-in fade-in zoom-in-95 duration-500 px-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-[#053c6d] text-white p-12 flex flex-col justify-between">
            <div className="space-y-8">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
                <ShieldAlert size={32} className="text-blue-300" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black tracking-tight leading-none uppercase">Overseer <br/>Access Terminal</h2>
                <p className="text-blue-200/50 text-sm leading-relaxed font-medium">
                  Verify administrative authorization to access the global Decentralized Voting Ledger.
                </p>
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-300">
                <Terminal size={14} /> System Access Note
              </div>
              <p className="text-[11px] text-blue-100/60 leading-relaxed italic">
                Secure encryption layer enabled. All access attempts are timestamped and logged.
              </p>
            </div>
          </div>
          <div className="md:w-1/2 p-12 space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#053c6d]">Authenticate Session</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">National Election Commission</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Database size={18} />
                  </div>
                  <input type="text" value={credentials.username} onChange={(e) => setCredentials({...credentials, username: e.target.value})} className="w-full pl-12 pr-5 py-4 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:bg-white focus:border-[#053c6d] outline-none font-bold text-slate-700 transition-all" placeholder="Enter admin ID" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Key size={18} />
                  </div>
                  <input type="password" value={credentials.password} onChange={(e) => setCredentials({...credentials, password: e.target.value})} className="w-full pl-12 pr-5 py-4 border-2 border-slate-100 bg-slate-50 rounded-2xl focus:bg-white focus:border-[#053c6d] outline-none font-bold text-slate-700 transition-all" placeholder="••••••••" />
                </div>
              </div>
              {error && <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 animate-in shake"><ShieldAlert size={18} /><span className="text-[11px] font-bold uppercase">{error}</span></div>}
              <button className="w-full bg-[#053c6d] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#085091] transition shadow-2xl shadow-blue-900/10 active:scale-95 flex items-center justify-center gap-3"><Lock size={20} /> Authorize Session</button>
            </form>
            <div className="pt-4 border-t border-slate-50 flex flex-col items-center">
              <button type="button" onClick={() => setShowHint(!showHint)} className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-[#053c6d] transition flex items-center gap-1.5"><Info size={12} /> {showHint ? 'Hide Credential Hint' : 'Reveal Default Access (Demo)'}</button>
              {showHint && <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-[10px] font-mono font-bold text-blue-700 animate-in fade-in slide-in-from-top-2 text-center w-full"><p>USER: admin</p><p>PASS: password123</p></div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PHASE 2: THE ACTUAL DASHBOARD (OTHER PAGE)
  // (This is what you see AFTER LOGIN)
  // ==========================================
  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-[#053c6d] tracking-tight">Electoral Oversight Dashboard</h1>
          <p className="text-slate-500 font-medium">
            <span className="inline-flex items-center gap-2 mr-6">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> 
              Blockchain Nodes: <span className="text-[#053c6d] font-black">Connected (5/5)</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div> 
              Security: <span className="text-[#053c6d] font-black">Encrypted</span>
            </span>
          </p>
        </div>
        
        <div className="bg-white p-1.5 rounded-2xl border border-zinc-200 flex gap-1 shadow-sm overflow-x-auto">
          <TabButton active={activeTab === 'ANALYTICS'} onClick={() => setActiveTab('ANALYTICS')} icon={<LayoutDashboard size={16} />} label="Analytics" />
          <TabButton active={activeTab === 'VOTERS'} onClick={() => setActiveTab('VOTERS')} icon={<UserCircle size={16} />} label="Registry" />
          <TabButton active={activeTab === 'EXPLORER'} onClick={() => setActiveTab('EXPLORER')} icon={<History size={16} />} label="Explorer" />
          <TabButton active={activeTab === 'SETTINGS'} onClick={() => setActiveTab('SETTINGS')} icon={<Settings size={16} />} label="Access" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          
          {/* TAB 1: ANALYTICS VIEW */}
          {activeTab === 'ANALYTICS' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {loading && results.length === 0 ? (
                <div className="bg-white p-20 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-[#053c6d] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity size={24} className="text-[#053c6d] animate-pulse" />
                    </div>
                  </div>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Loading Dashboard Data...</p>
                </div>
              ) : (
                <>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <MetricCard label="Total Voters" value={voters.length} color="text-blue-600" />
                 <MetricCard label="Votes Cast" value={results.reduce((a, b) => a + b.votes, 0)} color="text-emerald-600" />
                 <MetricCard label="AI Accuracy" value={`${metrics?.accuracy}%`} color="text-purple-600" />
                 <MetricCard label="Success Rate" value={`${metrics?.successRate.toFixed(1)}%`} color="text-orange-600" />
               </div>

              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-black tracking-tight text-[#053c6d]">Consensus Vote Count <span className="text-slate-400 text-xs font-bold uppercase ml-2 tracking-widest">(On-Chain)</span></h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    <Activity size={12} /> Real-time
                  </div>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} style={{ fontSize: '10px', fill: '#94a3b8' }} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="votes" radius={[12, 12, 0, 0]} barSize={45}>
                        {results.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: BLOCKCHAIN EXPLORER VIEW (LEDGER HISTORY) */}
          {activeTab === 'EXPLORER' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {loading && history.length === 0 ? (
                <div className="bg-white p-20 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-[#053c6d] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <History size={24} className="text-[#053c6d] animate-pulse" />
                    </div>
                  </div>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Loading Blockchain History...</p>
                </div>
              ) : (
              <>
              <div className="bg-[#0b2447] rounded-[2.5rem] p-10 text-white overflow-hidden shadow-2xl relative border border-white/5">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black">LEDGER</div>
                <div className="flex items-center justify-between relative z-10 mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <ShieldCheck size={24} className="text-blue-400" />
                    Blockchain Transaction Explorer
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Live Syncing
                    </span>
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                  {history.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-[2rem]">
                      <Cpu size={48} className="mx-auto text-blue-900 mb-4" />
                      <p className="text-slate-500 font-bold uppercase text-xs">Genesis Block Awaiting Transactions...</p>
                    </div>
                  ) : (
                    history.slice().reverse().map((tx, idx) => (
                      <div key={idx} className="group flex gap-6 animate-in slide-in-from-left-4" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-blue-600 transition-colors">
                            <LinkIcon size={18} className="text-blue-300" />
                          </div>
                          {idx !== history.length - 1 && <div className="w-0.5 flex-grow bg-blue-900/30 my-2"></div>}
                        </div>
                        <div className="flex-grow bg-white/5 border border-white/10 rounded-3xl p-6 transition-all group-hover:bg-white/10 group-hover:border-blue-500/30">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Block ID #{(history.length - idx).toString().padStart(4, '0')}</p>
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                Transaction Confirmed
                              </h4>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-500 flex items-center gap-1.5 justify-end">
                                <Clock size={12} /> {new Date(tx.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1 flex items-center gap-1">
                                <Hash size={10} /> Cryptographic Hash
                              </p>
                              <p className="text-[10px] font-mono text-blue-200 truncate">{tx.voterHash}</p>
                            </div>
                            <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1 flex items-center gap-1">
                                <UserCircle size={10} /> Selection
                              </p>
                              <p className="text-[10px] font-bold text-white uppercase">{CANDIDATES.find(c => c.id === tx.candidateId)?.name || 'OTA'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-8">
                 <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Terminal size={14} /> System Console Traces
                 </h4>
                 <div className="font-mono text-[9px] h-[150px] overflow-y-auto space-y-1 opacity-70 custom-scrollbar">
                    {logs.map((log, i) => (
                      <div key={i} className="text-slate-400">
                        <span className="text-slate-600 mr-2">[{i}]</span>
                        {log}
                      </div>
                    ))}
                 </div>
              </div>
              </>
              )}
            </div>
          )}

          {/* TAB 3: VOTER REGISTRY VIEW */}
          {activeTab === 'VOTERS' && (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-[#053c6d] uppercase tracking-widest">Identity Registry</h3>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                  <Database size={20} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {voters.length === 0 ? (
                  <p className="col-span-2 text-center py-20 text-slate-400 font-bold uppercase">No records found</p>
                ) : (
                  voters.map(v => (
                    <div key={v.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg group">
                      <div className="flex justify-between items-start mb-3">
                        <p className="font-black text-sm text-[#053c6d]">{v.name}</p>
                        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${v.hasVoted ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>{v.hasVoted ? 'Voted' : 'Eligible'}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-tight">EPIC: <span className="text-[#053c6d]">{v.voterId}</span></p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{v.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM SETTINGS (ADMIN ACCESS) VIEW */}
          {activeTab === 'SETTINGS' && (
            <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 animate-in slide-in-from-right-4">
               <div className="max-w-md">
                 <div className="w-16 h-16 bg-blue-50 text-[#053c6d] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
                   <Settings size={28} />
                 </div>
                 <h3 className="text-2xl font-black text-[#053c6d] mb-2 tracking-tight">Access Control Center</h3>
                 <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">Update the primary overseer credentials. New keys take effect for the next authentication session.</p>
                 <form onSubmit={handleUpdateCreds} className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Master Username</label>
                       <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300"><UserCircle size={20} /></div>
                          <input type="text" required value={newCreds.username} onChange={(e) => setNewCreds({...newCreds, username: e.target.value})} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-[#053c6d] focus:bg-white transition-all shadow-inner" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New System Access Key</label>
                       <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300"><Key size={20} /></div>
                          <input type="text" required value={newCreds.password} onChange={(e) => setNewCreds({...newCreds, password: e.target.value})} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-[#053c6d] focus:bg-white transition-all shadow-inner" />
                       </div>
                    </div>
                    <div className="pt-6 flex flex-col items-start gap-4">
                      <button className="bg-[#053c6d] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-[#085091] transition flex items-center gap-2 active:scale-95"><Save size={18} /> Update Authorized Key</button>
                      {updateStatus && <div className="flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-left-2"><CheckCircle size={14} /> Security Protocol Updated Immutably</div>}
                    </div>
                 </form>
               </div>
            </div>
          )}
        </div>

        {/* SIDEBAR OVERVIEW */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100">
             <h3 className="text-lg font-black mb-6 tracking-tight text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-blue-600" /> Security Health
             </h3>
             <div className="space-y-6">
                <HealthItem label="Database Latency" value="14ms" status="OPTIMAL" />
                <HealthItem label="AI Inference Time" value="1.2s" status="STABLE" />
                <HealthItem label="Blockchain Sync" value="99.9%" status="ACTIVE" />
             </div>
           </div>
           <div className="bg-blue-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldAlert size={80} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-2">Emergency Override</p>
              <h4 className="text-lg font-bold mb-4">Ballot Suspension</h4>
              <p className="text-xs text-blue-100/70 leading-relaxed mb-6">Administrators can pause the electoral process immediately in case of physical security breaches.</p>
              <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition">Trigger Emergency Pause</button>
           </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-[#053c6d] text-white shadow-lg shadow-blue-900/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
    {icon}
    <span className="hidden xl:inline">{label}</span>
  </button>
);

const MetricCard = ({ label, value, color }: { label: string; value: any; color: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm text-center">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);

const HealthItem = ({ label, value, status }: { label: string; value: string; status: string }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{status}</span>
  </div>
);

export default AdminDashboard;