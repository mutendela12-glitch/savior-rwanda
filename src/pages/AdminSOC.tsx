import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  MapPin, 
  Activity, 
  Cpu, 
  Server, 
  Lock, 
  Users,
  RefreshCw,
  Zap,
  Globe,
  Bell,
  Download,
  Filter,
  CheckCircle2,
  Terminal,
  Layers,
  Clock
} from 'lucide-react';
import { RwandaThreatMapDistrict, LanguageCode, SecurityAlert } from '../types';
import { translations } from '../translations';
import { RwandaDigitalMap } from '../components/RwandaDigitalMap';
import { NetworkTrafficMonitor } from '../components/NetworkTrafficMonitor';
import { CyberAttackMonitor } from '../components/CyberAttackMonitor';
import { AiThreatDetectionMatrix } from '../components/AiThreatDetectionMatrix';

interface AdminSOCProps {
  language: LanguageCode;
}

export const AdminSOC: React.FC<AdminSOCProps> = ({ language }) => {
  const [districts, setDistricts] = useState<RwandaThreatMapDistrict[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<RwandaThreatMapDistrict | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSocTab, setActiveSocTab] = useState<'MAP' | 'TRAFFIC' | 'ATTACKS' | 'AI_MATRIX' | 'INTEL'>('MAP');
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const t = translations[language];

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/threat-map').then((res) => (res.ok ? res.json() : [])),
      fetch('/api/alerts').then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([districtData, alertData]) => {
        setDistricts(districtData);
        if (districtData.length > 0) setSelectedDistrict(districtData[0]);
        setAlerts(alertData);
      })
      .catch((err) => console.error('Failed to load SOC telemetry:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleExportIncidentReport = () => {
    setExportNotice('Generating cryptographically signed Rwanda SOC Dossier (PDF/SHA-256)...');
    setTimeout(() => {
      setExportNotice('Rwanda National Cyber Defense Incident Dossier [SAV-SOC-2026.bin] downloaded successfully.');
      setTimeout(() => setExportNotice(null), 5000);
    }, 1500);
  };

  const getThreatColor = (level: RwandaThreatMapDistrict['threatLevel']) => {
    switch (level) {
      case 'HIGH':
        return 'text-rose-400 bg-rose-950/60 border-rose-600';
      case 'ELEVATED':
        return 'text-amber-400 bg-amber-950/60 border-amber-600';
      case 'MODERATE':
        return 'text-yellow-400 bg-yellow-950/60 border-yellow-600';
      case 'LOW':
      default:
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-600';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* High-Tech SOC Command Header Bar */}
      <div className="bg-gradient-to-r from-[#070e1e] via-[#09152b] to-[#070e1e] border border-cyan-500/50 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#030712] border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-xl shadow-cyan-950">
              <Radio className="w-8 h-8 animate-pulse text-cyan-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-mono text-white tracking-wider">
                  SAVIOR NATIONAL CYBER DEFENSE SOC
                </h1>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500 flex items-center gap-1.5 shadow-sm shadow-emerald-950">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  DEFCON 4 • ACTIVE SHIELD
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Rwanda National Security Operations Center • Integrated Telecom, BNR & Police Telemetry
              </p>
            </div>
          </div>

          {/* Quick SOC Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportIncidentReport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs text-slate-200 font-mono transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export SOC Incident Dossier</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#040813] border border-cyan-900 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>UTC+2 (Kigali Time)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export notification toast */}
      {exportNotice && (
        <div className="p-3 bg-cyan-950/90 border border-cyan-400 rounded-xl text-xs font-mono text-cyan-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Primary Aggregate Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#070e1e] border border-cyan-900/60 rounded-xl space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono uppercase">Monitored Sectors</span>
            <MapPin className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black font-mono text-white">30 Districts</span>
          <span className="text-[10px] text-emerald-400 font-mono block">100% Nationwide Optical Grid</span>
        </div>

        <div className="p-4 bg-[#070e1e] border border-cyan-900/60 rounded-xl space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono uppercase">Autonomous Mitigations</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black font-mono text-cyan-300">14,892 Probes</span>
          <span className="text-[10px] text-cyan-400 font-mono block">99.98% Edge Drop Success</span>
        </div>

        <div className="p-4 bg-[#070e1e] border border-cyan-900/60 rounded-xl space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono uppercase">Biometric Match Rate</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black font-mono text-emerald-400">99.8% Liveness</span>
          <span className="text-[10px] text-slate-400 font-mono block">Zero Spoof Breaches</span>
        </div>

        <div className="p-4 bg-[#070e1e] border border-cyan-900/60 rounded-xl space-y-1 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono uppercase">MoMo Fraud Containment</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black font-mono text-amber-300">&lt; 1.2s Triangulation</span>
          <span className="text-[10px] text-amber-400 font-mono block">Rapid Police/RIB Dispatch</span>
        </div>
      </div>

      {/* SOC Subsystem Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#050b17] border border-cyan-900/60 rounded-2xl">
        <button
          onClick={() => setActiveSocTab('MAP')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
            activeSocTab === 'MAP'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Interactive Rwanda Digital Map</span>
        </button>

        <button
          onClick={() => setActiveSocTab('TRAFFIC')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
            activeSocTab === 'TRAFFIC'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Network Traffic Monitor</span>
        </button>

        <button
          onClick={() => setActiveSocTab('ATTACKS')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
            activeSocTab === 'ATTACKS'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Real-time Cyberattacks Feed</span>
        </button>

        <button
          onClick={() => setActiveSocTab('AI_MATRIX')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
            activeSocTab === 'AI_MATRIX'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>AI Threat Heuristics Matrix</span>
        </button>

        <button
          onClick={() => setActiveSocTab('INTEL')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition ${
            activeSocTab === 'INTEL'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Threat Intelligence & Advisories</span>
        </button>
      </div>

      {/* Main Tab Content Display */}
      {activeSocTab === 'MAP' && (
        <div className="space-y-6">
          {/* Interactive Digital Vector Map of Rwanda */}
          <RwandaDigitalMap
            districts={districts}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={(d) => setSelectedDistrict(d)}
            language={language}
          />

          {/* District Focus & Telemetry Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Selected District Deep Dive Card */}
            <div className="lg:col-span-8 bg-[#070e1e] border border-cyan-900/60 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold font-mono text-white">
                    {selectedDistrict ? `${selectedDistrict.name} District Telemetry Focus` : 'Regional Threat Matrix'}
                  </h3>
                </div>
                {selectedDistrict && (
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${getThreatColor(selectedDistrict.threatLevel)}`}>
                    {selectedDistrict.threatLevel} RISK
                  </span>
                )}
              </div>

              {selectedDistrict ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#0a1428] border border-slate-800 rounded-xl space-y-1 font-mono text-xs">
                    <span className="text-[10px] text-slate-400 block">JURISDICTION PROVINCE</span>
                    <span className="text-base font-bold text-white block">{selectedDistrict.province}</span>
                    <span className="text-[10px] text-cyan-400">Optical node active</span>
                  </div>

                  <div className="p-4 bg-[#0a1428] border border-slate-800 rounded-xl space-y-1 font-mono text-xs">
                    <span className="text-[10px] text-slate-400 block">ACTIVE MITIGATED THREATS</span>
                    <span className="text-base font-bold text-rose-400 block">{selectedDistrict.activeThreatsCount} Incidents</span>
                    <span className="text-[10px] text-slate-400">Reported Scams: {selectedDistrict.reportedScamsCount}</span>
                  </div>

                  <div className="p-4 bg-[#0a1428] border border-slate-800 rounded-xl space-y-1 font-mono text-xs">
                    <span className="text-[10px] text-slate-400 block">PRIMARY FRAUD VECTORS</span>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {selectedDistrict.topCategories.map((c, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-cyan-200 border border-slate-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-mono">Select a district node from the tactical map above.</p>
              )}

              {/* District List Grid for Quick Selection */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono text-slate-400 block uppercase">
                  All 30 Districts Nationwide Grid:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {districts.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDistrict(d)}
                      className={`p-2 rounded-xl text-left border transition text-xs font-mono ${
                        selectedDistrict?.id === d.id
                          ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950 font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <span className="block truncate">{d.name}</span>
                      <span className={`text-[9px] font-normal ${
                        d.threatLevel === 'HIGH' ? 'text-rose-400' : 'text-slate-500'
                      }`}>
                        {d.threatLevel}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Core Subsystem Telemetry Details */}
            <div className="lg:col-span-4 bg-[#070e1e] border border-cyan-900/60 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Server className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold font-mono text-white">National Core Health</h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#0a1428] border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Fiber Primary Ring:</span>
                    <span className="text-emerald-400 font-bold">100% OPERATIONAL</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Kigali - Musanze - Rubavu - Huye loop</span>
                </div>

                <div className="p-3 bg-[#0a1428] border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">BNR Interbank Switch:</span>
                    <span className="text-emerald-400 font-bold">SECURE (HSM ACTIVE)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">ISO 8583 end-to-end encrypted</span>
                </div>

                <div className="p-3 bg-[#0a1428] border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">MTN / Airtel USSD API:</span>
                    <span className="text-cyan-300 font-bold">MONITORED (0.01% Jitter)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Zero unauthenticated cashout breaches</span>
                </div>

                <div className="p-3 bg-[#0a1428] border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Police & RIB Command Sync:</span>
                    <span className="text-emerald-400 font-bold">LIVE (197.243.12.84)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Cellular suspect triangulation enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Network Traffic Monitor Tab */}
      {activeSocTab === 'TRAFFIC' && (
        <NetworkTrafficMonitor language={language} />
      )}

      {/* Cyberattacks Live Feed Tab */}
      {activeSocTab === 'ATTACKS' && (
        <CyberAttackMonitor language={language} />
      )}

      {/* AI Threat Detection Matrix Tab */}
      {activeSocTab === 'AI_MATRIX' && (
        <AiThreatDetectionMatrix language={language} />
      )}

      {/* Threat Intelligence Bulletins Tab */}
      {activeSocTab === 'INTEL' && (
        <div className="bg-[#070e1e] border border-cyan-900/60 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono text-white tracking-wider">
                  RWANDA CERT & NCSA THREAT INTELLIGENCE FEED
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Official Security Directives & Urgent Protection Advisories
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
              National CSIRT Protocol
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#0a1428] border-l-4 border-rose-500 border-y border-r border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-rose-400 uppercase">
                  [CRITICAL] NCSA-ADV-2026-08: SYNTHETIC MOMO REVERSAL CALLS
                </span>
                <span className="text-[10px] font-mono text-slate-500">Issued: Today, 08:30 CAT</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                Threat actors are placing deceptive voice calls pretending to be MTN or Airtel agents claiming an incorrect money transfer. Under no circumstances should users enter their MoMo PIN to "reverse" funds. Official agents will never request your PIN or SMS confirmation code.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-300 pt-1">
                <span>Action: Enforce SAVIOR 3-Stage Biometric Face Authorization on all transfers &gt; 200,000 RWF.</span>
              </div>
            </div>

            <div className="p-4 bg-[#0a1428] border-l-4 border-amber-500 border-y border-r border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-amber-400 uppercase">
                  [HIGH] RW-CSIRT-2026-04: WHATSAPP ACCOUNT HIJACKING VIA 6-DIGIT VERIFICATION
                </span>
                <span className="text-[10px] font-mono text-slate-500">Issued: Yesterday, 14:15 CAT</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                Syndicates in Kigali are hijacking WhatsApp accounts by requesting verification codes under the guise of church, wedding, or SACCO groups. Enable Two-Step Verification with a custom PIN immediately.
              </p>
            </div>

            <div className="p-4 bg-[#0a1428] border-l-4 border-cyan-500 border-y border-r border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-cyan-400 uppercase">
                  [NOTICE] BNR-REG-2026-01: MANDATORY DIGITAL FRAUD REPORTING
                </span>
                <span className="text-[10px] font-mono text-slate-500">Issued: 3 days ago</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                All commercial banks and Payment Service Providers (PSPs) in Rwanda are required to integrate digital incident seals and expedite immediate account freezing upon citizen notification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
