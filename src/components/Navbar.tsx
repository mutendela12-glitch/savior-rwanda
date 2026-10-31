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
  Radio,
  Crosshair,
  MapPin,
  Car,
  LogOut
} from 'lucide-react';
import { UserProfile, LanguageCode, SecurityScoreBreakdown } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  portalMode: 'CITIZEN' | 'POLICE_RIB';
  setPortalMode: (mode: 'CITIZEN' | 'POLICE_RIB') => void;
  user: UserProfile | null;
  securityScore: SecurityScoreBreakdown | null;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  onOpenEmergencyLock: () => void;
  onOpenRecovery: () => void;
  onChangeRole: (role: UserProfile['role']) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  portalMode,
  setPortalMode,
  user,
  securityScore,
  language,
  setLanguage,
  onOpenEmergencyLock,
  onOpenRecovery,
  onChangeRole,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const t = translations[language];

  // Citizen Navigation Items
  const citizenNavItems = [
    { id: 'trust-center', label: t.navTrustCenter, icon: Shield },
    { 
      id: 'report', 
      label: t.navReport, 
      icon: FileText,
      isEmergency: true 
    },
    { id: 'scanner', label: t.navScanner, icon: Cpu },
    { id: 'simulator', label: t.navSimulator, icon: CreditCard },
    { id: 'vault', label: t.navVault, icon: Lock },
    { id: 'ai-chat', label: t.navAIAdvisor, icon: Bot },
  ];

  // Police & RIB Command Navigation Items
  const policeNavItems = [
    { id: 'official', label: t.navTacticalGPS, icon: Building2 },
    { id: 'report', label: t.navCaseQueue, icon: FileText },
    { id: 'admin', label: t.navAdmin, icon: Radio },
    { id: 'ai-chat', label: t.navForensicAI, icon: Bot },
  ];

  const currentNavItems = portalMode === 'CITIZEN' ? citizenNavItems : policeNavItems;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40';
    if (score >= 75) return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';
    if (score >= 60) return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
    return 'text-rose-400 bg-rose-950/60 border-rose-500/40';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070d18]/95 backdrop-blur-md border-b border-cyan-900/30 text-white shadow-xl">
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
            <span className="text-cyan-300 font-semibold">SAVIOR CYBER DEFENSE NETWORK</span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400">{t.simulatedNotice}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400 hidden sm:inline">Kigali Forensic GPS Hub: <span className="text-emerald-400 font-mono">197.243.12.84</span></span>
            <span className="text-amber-400/90 font-medium">{t.helplineRIB} | 112</span>
          </div>
        </div>
      )}

      {/* DUAL PORTAL SWITCHER BAR */}
      <div className="bg-[#050914] border-b border-slate-800/80 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Portal Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0b1324] border border-cyan-900/40 rounded-xl w-full sm:w-auto">
            {/* Citizen Portal Switch */}
            <button
              onClick={() => {
                setPortalMode('CITIZEN');
                if (currentTab === 'official' || currentTab === 'admin') {
                  setCurrentTab('trust-center');
                }
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                portalMode === 'CITIZEN'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-cyan-300" />
              <span>{t.portalCitizen}</span>
              <span className="hidden md:inline text-[10px] text-cyan-200/80 font-normal">
                ({t.portalCitizenSub})
              </span>
            </button>

            {/* Police & RIB Portal Switch */}
            <button
              onClick={() => {
                setPortalMode('POLICE_RIB');
                setCurrentTab('official');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                portalMode === 'POLICE_RIB'
                  ? 'bg-gradient-to-r from-amber-600 to-rose-700 text-white shadow-md shadow-rose-950 border border-amber-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.portalPoliceRib}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-700 font-bold ml-1 animate-pulse">
                {t.portalPoliceRibBadge}
              </span>
            </button>
          </div>

          {/* Active Mode Notice */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            {portalMode === 'CITIZEN' ? (
              <span className="text-cyan-300">
                {t.citizenModeNotice}
              </span>
            ) : (
              <span className="text-amber-300 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{t.policeModeNotice}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentTab(portalMode === 'CITIZEN' ? 'trust-center' : 'official')}
          >
            <div className={`relative w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition ${
              portalMode === 'CITIZEN'
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 group-hover:border-cyan-400'
                : 'bg-gradient-to-br from-amber-500/20 to-rose-600/30 border border-amber-500/50 group-hover:border-amber-400'
            }`}>
              {portalMode === 'CITIZEN' ? (
                <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              ) : (
                <Building2 className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              )}
              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#070d18] ${
                portalMode === 'CITIZEN' ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
              }`}></div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-widest text-lg bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  SAVIOR
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border ${
                  portalMode === 'CITIZEN'
                    ? 'bg-cyan-950/80 border-cyan-800/60 text-cyan-300'
                    : 'bg-amber-950/80 border-amber-700/80 text-amber-300'
                }`}>
                  {portalMode === 'CITIZEN' ? 'CITIZEN SHIELD' : 'POLICE & RIB'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans tracking-wide">
                {portalMode === 'CITIZEN' ? 'Rwanda Cybercrime Defense' : 'Law Enforcement Command & GPS'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? portalMode === 'CITIZEN'
                        ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                        : 'bg-amber-950/70 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-950'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${
                    isActive ? (portalMode === 'CITIZEN' ? 'text-cyan-400' : 'text-amber-400') : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right utility buttons */}
          <div className="flex items-center gap-2">
            {/* Score Badge (for Citizen Mode) */}
            {portalMode === 'CITIZEN' && securityScore && (
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
                    {t.selectPersonaMode}
                  </div>
                  {[
                    { role: 'CITIZEN', label: t.roleCitizen, desc: t.roleCitizenDesc },
                    { role: 'INVESTIGATOR', label: t.roleInvestigator, desc: t.roleInvestigatorDesc },
                    { role: 'SECURITY_ANALYST', label: t.rolePolice, desc: t.rolePoliceDesc },
                    { role: 'SYSTEM_ADMIN', label: t.roleAdmin, desc: t.roleAdminDesc },
                  ].map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        onChangeRole(r.role as UserProfile['role']);
                        setRoleDropdownOpen(false);
                        if (r.role === 'INVESTIGATOR' || r.role === 'SECURITY_ANALYST') {
                          setPortalMode('POLICE_RIB');
                          setCurrentTab('official');
                        } else if (r.role === 'CITIZEN') {
                          setPortalMode('CITIZEN');
                          setCurrentTab('trust-center');
                        }
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition flex flex-col ${
                        user?.role === r.role ? 'bg-cyan-950/60 text-cyan-300' : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="font-semibold">{r.label}</span>
                      <span className="text-[10px] text-slate-400">{r.desc}</span>
                    </button>
                  ))}

                  {/* Sign Out in Dropdown */}
                  {onLogout && (
                    <div className="pt-1 mt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/50 flex items-center gap-2 transition"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span className="font-semibold">
                          {t.signOut}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Direct Sign Out Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/50 rounded-md text-xs text-slate-300 hover:text-rose-200 transition"
                title={t.signOut}
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400" />
                <span className="hidden xl:inline">{t.signOut}</span>
              </button>
            )}

            {/* Emergency Lock Trigger Button */}
            {!user?.isAccountLocked && (
              <button
                onClick={onOpenEmergencyLock}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/60 text-rose-300 rounded-md text-xs font-mono font-bold transition"
                title="Instantly freeze all sessions and transactions"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden xl:inline">{t.btnEmergencyLock}</span>
                <span className="xl:hidden">Lock</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#070d18] border-b border-cyan-900/40 px-4 pt-2 pb-4 space-y-2">
          {/* Portal Switcher in Mobile */}
          <div className="flex items-center gap-2 p-1 bg-[#0b1324] border border-slate-800 rounded-lg mb-2">
            <button
              onClick={() => {
                setPortalMode('CITIZEN');
                setCurrentTab('trust-center');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded ${
                portalMode === 'CITIZEN' ? 'bg-cyan-600 text-white' : 'text-slate-400'
              }`}
            >
              {t.portalCitizen}
            </button>
            <button
              onClick={() => {
                setPortalMode('POLICE_RIB');
                setCurrentTab('official');
                setMobileMenuOpen(false);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded ${
                portalMode === 'POLICE_RIB' ? 'bg-amber-600 text-white' : 'text-slate-400'
              }`}
            >
              {t.portalPoliceRib}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {onLogout && (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-2 px-3 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>{t.signOut}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
