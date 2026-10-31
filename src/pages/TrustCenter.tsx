import React from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Cpu, 
  CreditCard, 
  KeyRound, 
  Smartphone, 
  Scan, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Layers,
  Radio,
  FileText
} from 'lucide-react';
import { UserProfile, SecurityScoreBreakdown, SecurityAlert, LanguageCode } from '../types';
import { translations } from '../translations';

interface TrustCenterProps {
  user: UserProfile | null;
  securityScore: SecurityScoreBreakdown | null;
  alerts: SecurityAlert[];
  language: LanguageCode;
  onOpenVault: () => void;
  onOpenScanner: () => void;
  onOpenSimulator: () => void;
  onOpenReport: () => void;
  onOpenBiometrics: () => void;
  onOpenEmergencyLock: () => void;
}

export const TrustCenter: React.FC<TrustCenterProps> = ({
  user,
  securityScore,
  alerts,
  language,
  onOpenVault,
  onOpenScanner,
  onOpenSimulator,
  onOpenReport,
  onOpenBiometrics,
  onOpenEmergencyLock,
}) => {
  const t = translations[language];

  const getScoreColor = (score: number) => {
    if (score >= 90) return { text: 'text-emerald-400', stroke: '#10b981', bg: 'bg-emerald-950/40', border: 'border-emerald-500/40', badge: 'bg-emerald-500/20 text-emerald-300' };
    if (score >= 75) return { text: 'text-cyan-400', stroke: '#06b6d4', bg: 'bg-cyan-950/40', border: 'border-cyan-500/40', badge: 'bg-cyan-500/20 text-cyan-300' };
    if (score >= 60) return { text: 'text-amber-400', stroke: '#f59e0b', bg: 'bg-amber-950/40', border: 'border-amber-500/40', badge: 'bg-amber-500/20 text-amber-300' };
    return { text: 'text-rose-400', stroke: '#ef4444', bg: 'bg-rose-950/40', border: 'border-rose-500/40', badge: 'bg-rose-500/20 text-rose-300' };
  };

  const score = securityScore?.overallScore ?? 75;
  const colors = getScoreColor(score);

  // SVG Circular Gauge calculation
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Security Posture Section with Cyber Command Visual Accent */}
      <div className="relative rounded-2xl overflow-hidden border border-cyan-900/60 bg-gradient-to-r from-[#070d1a] via-[#091428] to-[#060c18] shadow-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Posture Statement & Quick Actions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-[11px] font-mono font-bold tracking-wider uppercase">
                {t.trustHeroBadge}
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                STATUS: {user?.isAccountLocked ? 'EMERGENCY LOCK' : 'ACTIVE DEFENSE'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {t.trustHeroTitle}
            </h1>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              {t.trustHeroDesc}
            </p>

            {/* Tactical Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenVault}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-cyan-950/80"
              >
                <Lock className="w-4 h-4" />
                <span>{t.btnUnlockVault}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onOpenScanner}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-700/50 hover:border-cyan-400 text-cyan-200 rounded-xl text-xs font-semibold tracking-wide transition"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>{t.navScanner}</span>
              </button>

              <button
                onClick={onOpenReport}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold tracking-wide transition"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{t.navReport}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Security Score Circular Gauge */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#162238"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Active Score Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={colors.stroke}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Central Metrics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tighter">
                  {score}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mt-0.5">
                  / 100 POINTS
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono mt-1.5 ${colors.badge}`}>
                  {securityScore?.grade || 'FAIR SECURITY'}
                </span>
              </div>
            </div>

            <p className="text-xs font-mono text-cyan-300/80 mt-2 text-center">
              SAVIOR TRUST INDEX: <span className="text-white font-bold">{score >= 80 ? 'RESILIENT' : 'ATTENTION REQUIRED'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Citizen Emergency Case Reporting Banner */}
      <div className="bg-gradient-to-r from-[#170a0a] via-[#1f1010] to-[#0f172a] border border-rose-600/70 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-950/90 border border-rose-500/80 flex items-center justify-center text-rose-400 shrink-0 shadow-lg">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 text-[10px] font-mono font-bold uppercase animate-pulse">
                  {t.reportIntakeBadge}
                </span>
                <span className="text-xs font-mono text-amber-300 hidden sm:inline">
                  Direct Police & RIB Transmission
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t.reportIntakeTitle}
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {t.reportIntakeSubtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col items-stretch gap-2 shrink-0">
            <button
              onClick={onOpenReport}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-rose-950 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{t.reportTabNew}</span>
            </button>
            <button
              onClick={onOpenReport}
              className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded-xl text-xs font-mono font-medium transition text-center"
            >
              {t.reportTabTrack}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Defense Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Biometric Face Shield */}
        <div 
          onClick={onOpenBiometrics}
          className="bg-[#0b1324] border border-cyan-950 hover:border-cyan-500/50 rounded-xl p-5 cursor-pointer transition group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Scan className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {user?.isFaceEnrolled ? 'ENROLLED' : 'ACTION'}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition">
            1:1 Face Verification
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Liveness-backed facial geometry prevents credential stuffing and impersonation.
          </p>
          <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400">
            <span>Scan Face Geometry</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 2: Financial Protection */}
        <div 
          onClick={onOpenSimulator}
          className="bg-[#0b1324] border border-cyan-950 hover:border-cyan-500/50 rounded-xl p-5 cursor-pointer transition group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              HIGH SHIELD
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-300 transition">
            MoMo & Bank Auth
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Multi-stage cryptographic approval on BK, I&M, MTN MoMo, and Airtel Money.
          </p>
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
            <span>Authorize Transfers</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 3: AI Threat & Scam Scanner */}
        <div 
          onClick={onOpenScanner}
          className="bg-[#0b1324] border border-cyan-950 hover:border-cyan-500/50 rounded-xl p-5 cursor-pointer transition group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
              AI ENGINE
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mb-1 group-hover:text-purple-300 transition">
            Kinyarwanda AI Scanner
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Detects PIN theft SMS ("umubare w'ibanga"), fake job tenders, and phishing URLs.
          </p>
          <div className="flex items-center gap-1 text-[11px] font-mono text-purple-400">
            <span>Analyze Messages</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 4: Secure Vault & Recovery */}
        <div 
          onClick={onOpenVault}
          className="bg-[#0b1324] border border-cyan-950 hover:border-cyan-500/50 rounded-xl p-5 cursor-pointer transition group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              SECURE
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition">
            SAVIOR Secure Vault
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Encrypted profile repository, backup keys, active sessions, and privacy controls.
          </p>
          <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
            <span>Open Vault</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Detailed Score Factors & Live Security Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Score Factors & Improvement Actions */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#0b1324] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Security Score Breakdown</h3>
              </div>
              <span className="text-xs font-mono text-cyan-300">{score}/100 Pts Total</span>
            </div>

            {securityScore && (
              <div className="space-y-3">
                {Object.entries(securityScore.factors).map(([key, factorItem]) => {
                  const item = factorItem as { label: string; score: number; max: number; status: boolean };
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.status ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                          <span className="text-slate-300">{item.label}</span>
                        </div>
                        <span className="font-mono text-slate-400">
                          {item.score} / {item.max} pts
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${item.status ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${(item.score / item.max) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommendations to improve */}
          {securityScore && securityScore.recommendations.length > 0 && (
            <div className="bg-[#0b1324] border border-cyan-900/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Recommended Defensive Upgrades</h3>
              </div>

              <div className="space-y-2.5">
                {securityScore.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 bg-[#070d18] border border-slate-800 hover:border-cyan-700/60 rounded-lg flex items-center justify-between gap-4 transition"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{rec.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                          +{rec.pointsReward} pts
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{rec.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        if (rec.actionKey === 'ENROLL_BIOMETRICS') onOpenBiometrics();
                        else onOpenVault();
                      }}
                      className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/50 text-cyan-300 rounded text-xs font-medium whitespace-nowrap transition"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Security Alerts & Quick Hotlines */}
        <div className="lg:col-span-5 space-y-5">
          {/* Security Alerts List */}
          <div className="bg-[#0b1324] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">Security Alerts & Audit Log</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{alerts.length} Events</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs space-y-1 ${
                    alert.severity === 'CRITICAL' ? 'bg-rose-950/40 border-rose-700/60 text-rose-200' :
                    alert.severity === 'ALERT' ? 'bg-amber-950/40 border-amber-700/60 text-amber-200' :
                    alert.severity === 'WARNING' ? 'bg-yellow-950/30 border-yellow-700/40 text-yellow-200' :
                    'bg-[#070d18] border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{alert.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">{alert.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rwanda Official Hotlines Banner */}
          <div className="bg-gradient-to-br from-[#0c182d] to-[#08101e] border border-cyan-800/40 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Official Rwanda Emergency Hotlines</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-[#070d18] border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">RIB Cyber Hotline</span>
                <span className="text-base font-mono font-bold text-amber-400">166</span>
              </div>
              <div className="p-2.5 bg-[#070d18] border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Police Emergency</span>
                <span className="text-base font-mono font-bold text-emerald-400">112</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Free toll-free dial on all Rwandan networks (MTN, Airtel).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
