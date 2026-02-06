import React from 'react';
import { AppView } from '../types';
import { LayoutDashboard, UserCheck, Search, ShieldCheck, LogOut, ChevronDown, Globe } from 'lucide-react';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, isAuthenticated, onLogout }) => {
  return (
    <header className="w-full flex flex-col">
      {/* Official Government Banner */}
      <div className="bg-[#0b2447] text-white py-1 px-4 text-[10px] md:text-xs flex justify-between items-center font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-blue-400" /> Official Blockchain Voter Portal
          </span>
          <span className="hidden md:inline text-blue-200">|</span>
          <span className="hidden md:inline">Government of Smart City</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-blue-300 transition-colors uppercase">Skip to Main Content</button>
          <div className="flex items-center gap-1 border-l border-blue-800 pl-4">
            <Globe size={12} />
            <span className="uppercase">English</span>
            <ChevronDown size={12} />
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white border-b border-zinc-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => setView(AppView.LANDING)}
          >
            <div className="bg-[#053c6d] text-white p-2.5 rounded-lg shadow-md">
              <ShieldCheck size={28} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl text-[#053c6d] leading-none tracking-tight">VOTER<span className="text-[#ff9933]">PORTAL</span></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Election Commission Services</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            <NavButton 
              active={currentView === AppView.LANDING} 
              onClick={() => setView(AppView.LANDING)}
              icon={<LayoutDashboard size={18} />}
              label="Dashboard" 
            />
            <NavButton 
              active={currentView === AppView.REGISTRATION} 
              onClick={() => setView(AppView.REGISTRATION)}
              icon={<UserCheck size={18} />}
              label="E-Enrollment" 
            />
            <NavButton 
              active={currentView === AppView.SEARCH} 
              onClick={() => setView(AppView.SEARCH)}
              icon={<Search size={18} />}
              label="Search Registry" 
            />
            <NavButton 
              active={currentView === AppView.ADMIN} 
              onClick={() => setView(AppView.ADMIN)}
              icon={<ShieldCheck size={18} />}
              label="Admin Console" 
            />
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#053c6d] font-bold border-2 border-white shadow-sm">
                  JD
                </div>
                <button 
                  onClick={onLogout}
                  className="bg-red-50 text-red-700 p-2.5 rounded-xl hover:bg-red-100 transition shadow-sm border border-red-100"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setView(AppView.AUTHENTICATION)}
                className="bg-[#053c6d] hover:bg-[#085091] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/10 flex items-center gap-2"
              >
                Authenticate Identity <ChevronDown size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all relative ${
      active ? 'text-[#053c6d] bg-blue-50' : 'text-slate-500 hover:text-[#053c6d] hover:bg-zinc-50'
    }`}
  >
    {icon}
    {label}
    {active && <div className="absolute bottom-0 left-5 right-5 h-0.5 bg-[#053c6d] rounded-full" />}
  </button>
);

export default Header;