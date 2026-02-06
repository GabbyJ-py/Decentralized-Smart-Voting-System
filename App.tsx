import React, { useState, Suspense } from 'react';
import { AppView, Voter } from './types';
import Header from './components/Header';
import VoterRegistration from './components/VoterRegistration';
import VoterAuthentication from './components/VoterAuthentication';
import VotingPanel from './components/VotingPanel';
import AdminDashboard from './components/AdminDashboard';
import VoterSearch from './components/VoterSearch';
import { UserPlus, Search, Fingerprint, History, Info, ExternalLink, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANDING);
  const [authenticatedVoter, setAuthenticatedVoter] = useState<Voter | null>(null);

  const handleAuthSuccess = (voter: Voter) => {
    setAuthenticatedVoter(voter);
    setCurrentView(AppView.VOTING);
  };

  const resetSession = () => {
    setAuthenticatedVoter(null);
    setCurrentView(AppView.LANDING);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header 
        currentView={currentView} 
        setView={setCurrentView} 
        isAuthenticated={!!authenticatedVoter}
        onLogout={resetSession}
      />

      <main className="flex-grow">
        <Suspense fallback={<div className="p-20 text-center text-slate-400 font-bold">Initializing Portal Systems...</div>}>
          {currentView === AppView.LANDING && (
            <div className="animate-in fade-in duration-700">
              {/* Hero Section */}
              <div className="gov-gradient py-16 text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
                
                <div className="container mx-auto px-4 relative z-10">
                  <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-white/20">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Centralized Voter Services Portal
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                      Strengthening Democracy through <br/>
                      <span className="text-[#ff9933]">Blockchain</span> & <span className="text-[#10b981]">AI Identity</span>
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl leading-relaxed mb-10 opacity-90">
                      The next generation of voting infrastructure. Transparent, immutable, and secured with Deep Learning biometric verification for 100% election integrity.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={() => setCurrentView(AppView.AUTHENTICATION)}
                        className="bg-[#ff9933] hover:bg-[#e68a00] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-orange-900/20 transition transform hover:-translate-y-1"
                      >
                        Enter Voting Chamber
                      </button>
                      <button 
                        onClick={() => setCurrentView(AppView.REGISTRATION)}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm px-8 py-4 rounded-xl font-bold text-lg transition"
                      >
                        New Registration
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Services Grid */}
              <div className="container mx-auto px-4 -mt-12 mb-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ServiceCard 
                    icon={<UserPlus className="text-blue-600" />} 
                    title="E-Enrollment" 
                    description="Register yourself as a new voter with biometric capture."
                    onClick={() => setCurrentView(AppView.REGISTRATION)}
                  />
                  <ServiceCard 
                    icon={<Search className="text-orange-600" />} 
                    title="Search E-Roll" 
                    description="Verify your name and details in the official voter list."
                    onClick={() => setCurrentView(AppView.SEARCH)}
                  />
                  <ServiceCard 
                    icon={<Fingerprint className="text-emerald-600" />} 
                    title="AI Auth Check" 
                    description="Test your facial vector matching for seamless voting."
                    onClick={() => setCurrentView(AppView.AUTHENTICATION)}
                  />
                  <ServiceCard 
                    icon={<History className="text-purple-600" />} 
                    title="Ledger History" 
                    description="View historical voter participation metrics on-chain."
                    onClick={() => setCurrentView(AppView.ADMIN)}
                  />
                </div>
              </div>

              {/* Information Section */}
              <div className="container mx-auto px-4 pb-20 grid md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-8">
                  <h2 className="text-3xl font-black text-[#053c6d] tracking-tight border-b-4 border-blue-100 inline-block pb-2">Latest Notifications</h2>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group flex gap-6">
                        <div className="hidden sm:flex flex-col items-center justify-center bg-slate-50 p-4 rounded-xl text-slate-400 font-bold w-20">
                          <span className="text-xs uppercase">Oct</span>
                          <span className="text-2xl text-[#053c6d]">{12 + i}</span>
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-lg group-hover:text-blue-700 transition">Security Update: New FaceNet-v3 Model Deployed</h4>
                          <p className="text-slate-500 text-sm mt-1">Enhancing verification accuracy for low-light conditions and diverse facial features across the cyber district.</p>
                          <button className="mt-4 text-blue-600 font-bold text-xs uppercase flex items-center gap-1">Read Official Press Release <ExternalLink size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-8">
                  <h2 className="text-3xl font-black text-[#053c6d] tracking-tight border-b-4 border-blue-100 inline-block pb-2">Resources</h2>
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 space-y-4">
                      <ResourceLink label="How to vote with AI verification" />
                      <ResourceLink label="Understanding Blockchain storage" />
                      <ResourceLink label="Privacy & Biometric Data Policy" />
                      <ResourceLink label="EPIC Card Download Guide" />
                    </div>
                    <div className="bg-blue-50 p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Info size={20} className="text-blue-600" />
                        <span className="font-bold text-blue-900">Need Assistance?</span>
                      </div>
                      <p className="text-sm text-blue-700 leading-relaxed mb-4">Our national helpline is active 24/7 for technical support regarding the SmartVote platform.</p>
                      <button className="w-full bg-[#053c6d] text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20">Call 1950</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === AppView.REGISTRATION && (
            <div className="container mx-auto px-4 py-12">
              <VoterRegistration onComplete={() => setCurrentView(AppView.LANDING)} />
            </div>
          )}

          {currentView === AppView.AUTHENTICATION && (
            <div className="container mx-auto px-4 py-12">
              <VoterAuthentication onAuthSuccess={handleAuthSuccess} />
            </div>
          )}

          {currentView === AppView.VOTING && authenticatedVoter && (
            <div className="container mx-auto px-4 py-12">
              <VotingPanel voter={authenticatedVoter} onVoteCast={resetSession} />
            </div>
          )}

          {currentView === AppView.ADMIN && (
            <div className="container mx-auto px-4 py-12">
              <AdminDashboard />
            </div>
          )}

          {currentView === AppView.SEARCH && (
            <div className="container mx-auto px-4 py-12">
              <VoterSearch onRegisterClick={() => setCurrentView(AppView.REGISTRATION)} />
            </div>
          )}

        </Suspense>
      </main>

      <footer className="bg-[#0b2447] text-white border-t border-white/5 py-16 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <ShieldCheck size={28} className="text-[#ff9933]" />
                <span className="font-black text-2xl tracking-tighter uppercase">SmartVote</span>
              </div>
              <p className="text-blue-200/60 text-sm leading-relaxed">
                Empowering citizens through transparent, technology-driven election processes. A joint initiative for secure democracy.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">General Links</h4>
              <ul className="space-y-3 text-blue-200/60 text-sm">
                <li><a href="#" className="hover:text-white transition">About the Portal</a></li>
                <li><a href="#" className="hover:text-white transition">Voter Education</a></li>
                <li><a href="#" className="hover:text-white transition">Electoral Laws</a></li>
                <li><a href="#" className="hover:text-white transition">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Media Presence</h4>
              <ul className="space-y-3 text-blue-200/60 text-sm">
                <li><a href="#" className="hover:text-white transition">Press Releases</a></li>
                <li><a href="#" className="hover:text-white transition">Video Gallery</a></li>
                <li><a href="#" className="hover:text-white transition">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Connect</h4>
              <p className="text-blue-200/60 text-sm mb-4">Election Commission Office, Cyber City - 01</p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition cursor-pointer">X</div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition cursor-pointer">FB</div>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 text-center">
            <p className="text-blue-200/40 text-xs font-medium tracking-widest uppercase">
              Final Year Academic Project &copy; {new Date().getFullYear()} - MINISTRY OF DIGITAL GOVERNANCE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ServiceCard: React.FC<{ icon: React.ReactNode; title: string; description: string; onClick: () => void }> = ({ icon, title, description, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-900/10 transition transform hover:-translate-y-2 cursor-pointer group"
  >
    <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-500">
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 28 }) : icon}
    </div>
    <h3 className="text-xl font-extrabold text-[#053c6d] mb-3">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed mb-6">{description}</p>
    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider group-hover:gap-4 transition-all">
      Proceed Service <span className="text-xl">→</span>
    </div>
  </div>
);

const ResourceLink: React.FC<{ label: string }> = ({ label }) => (
  <a href="#" className="flex items-center justify-between text-slate-600 hover:text-blue-700 transition p-3 hover:bg-slate-50 rounded-xl group">
    <span className="font-semibold text-sm">{label}</span>
    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition" />
  </a>
);

export default App;