import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Lock, 
  Globe, 
  Cpu, 
  FileText, 
  CreditCard, 
  Building2, 
  UserCheck, 
  Bot,
  AlertTriangle,
  Menu,
  X,
  Radio
} from 'lucide-react';
import { UserProfile, LanguageCode, SecurityScoreBreakdown } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserProfile | null;
  securityScore: SecurityScoreBreakdown | null;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  onOpenEmergencyLock: () => void;
  onOpenRecovery: () => void;
  onChangeRole: (role: UserProfile['role']) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  securityScore,
  language,
  setLanguage,
  onOpenEmergencyLock,
  onOpenRecovery,
  onChangeRole,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const t = translations[language];

  const navItems = [
    { id: 'trust-center', label: t.navTrustCenter, icon: Shield },
    { id: 'vault', label: t.navVault, icon: Lock },
    { id: 'scanner', label: t.navScanner, icon: Cpu },
    { id: 'simulator', label: t.navSimulator, icon: CreditCard },
    { id: 'report', label: t.navReport, icon: FileText },
    { id: 'official', label: t.navOfficial, icon: Building2 },
    { id: 'admin', label: t.navAdmin, icon: Radio },
    { id: 'ai-chat', label: t.navAIAdvisor, icon: Bot },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
    if (score >= 75) return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';
    if (score >= 60) return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
    return 'text-rose-400 bg-rose-950/60 border-rose-500/40';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070d18]/95 backdrop-blur-md border-b border-cyan-900/30 text-white">
      {/* Top emergency / notice ticker */}
      {user?.isAccountLocked ? (
        <div className="bg-rose-950/90 border-b border-rose-600/50 px-4 py-2 text-rose-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="font-bold tracking-wider">{t.emergencyLockedBanner}</span>
          </div>
          <button
            onClick={onOpenRecovery}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold uppercase tracking-wider transition"
          >
            {t.btnStartRecovery}
          </button>
        </div>
      ) : (
        <div className="bg-[#0b1324] border-b border-cyan-950/80 px-4 py-1 text-slate-400 text-[11px] font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-cyan-300 font-semibold">SAVIOR DEFENSIVE SHIELD ACTIVE</span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400">{t.simulatedNotice}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400 hidden sm:inline">Kigali Cyber Forensics Node: <span className="text-emerald-400 font-mono">197.243.12.84</span></span>
            <span className="text-amber-400/90 font-medium">{t.helplineRIB}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentTab('trust-center')}
          >
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-950/50 group-hover:border-cyan-400 transition">
              <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#070d18]"></div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-widest text-lg bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  SAVIOR
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                  RWANDA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans tracking-wide">
                AI Cybercrime Defense Platform
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right utility buttons */}
          <div className="flex items-center gap-2">
            {/* Score Badge */}
            {securityScore && (
              <div 
                onClick={() => setCurrentTab('trust-center')}
                className={`cursor-pointer hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-bold transition hover:opacity-90 ${getScoreColor(securityScore.overallScore)}`}
                title="Your SAVIOR Security Score"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{securityScore.overallScore}/100</span>
              </div>
            )}

            {/* Language Selector */}
            <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-md p-0.5 text-xs font-mono">
              {(['en', 'rw', 'fr', 'sw'] as LanguageCode[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded transition uppercase ${
                    language === lang 
                      ? 'bg-cyan-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={lang === 'sw' ? 'Kiswahili' : lang === 'rw' ? 'Ikinyarwanda' : lang === 'fr' ? 'Français' : 'English'}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-md text-xs text-slate-200 font-medium transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Role:</span>
                <span className="font-mono text-cyan-300 font-semibold">{user?.role || 'CITIZEN'}</span>
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#0b1324] border border-cyan-900/50 rounded-lg shadow-xl shadow-black/80 py-1 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                    Select Persona Mode
                  </div>
                  {[
                    { role: 'CITIZEN', label: 'Citizen (Mugisha)', desc: 'Standard vault & reporting' },
                    { role: 'INVESTIGATOR', label: 'RIB Officer', desc: 'Case dockets & evidence' },
                    { role: 'SECURITY_ANALYST', label: 'RNP Cyber Police', desc: 'Emergency response units' },
                    { role: 'SYSTEM_ADMIN', label: 'SOC Admin', desc: 'mutendela12@gmail.com' },
                  ].map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        onChangeRole(r.role as UserProfile['role']);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition flex flex-col ${
                        user?.role === r.role ? 'bg-cyan-950/60 text-cyan-300' : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="font-semibold">{r.label}</span>
                      <span className="text-[10px] text-slate-400">{r.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Emergency Lock Trigger Button */}
            {!user?.isAccountLocked ? (
              <button
                id="emergency-lock-btn"
                onClick={onOpenEmergencyLock}
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 hover:text-rose-100 rounded-md text-xs font-semibold tracking-wide transition shadow-sm"
                title="Lock My Account Immediately"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden xl:inline">{t.btnEmergencyLock}</span>
              </button>
            ) : (
              <button
                onClick={onOpenRecovery}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 rounded-md text-xs font-semibold transition"
              >
                <span>{t.btnStartRecovery}</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-md hover:bg-slate-800/60 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-800/80 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
