import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  AlertTriangle, 
  Zap, 
  Lock, 
  Filter, 
  CheckCircle2, 
  ExternalLink,
  Flame,
  Globe,
  RefreshCw,
  Terminal,
  Cpu
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../translations';

interface CyberAttackMonitorProps {
  language: LanguageCode;
}

interface AttackEvent {
  id: string;
  timestamp: string;
  threatType: string;
  sourceIp: string;
  originGeo: string;
  targetAsset: string;
  targetDistrict: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'NEUTRALIZED' | 'ISOLATING' | 'HONEYPOT_TRAPPED';
  mitigationDetail: string;
}

export const CyberAttackMonitor: React.FC<CyberAttackMonitorProps> = ({ language }) => {
  const t = translations[language];
  const [attacksBlockedCount, setAttacksBlockedCount] = useState(14892);
  const [activeThreatProbes, setActiveThreatProbes] = useState(7);
  const [selectedEvent, setSelectedEvent] = useState<AttackEvent | null>(null);
  const [activeCountermeasure, setActiveCountermeasure] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [attackFeed, setAttackFeed] = useState<AttackEvent[]>([
    {
      id: 'EVT-9041',
      timestamp: 'Just now',
      threatType: 'Distributed MoMo USSD Reversal Probe',
      sourceIp: '185.220.101.45',
      originGeo: 'Tor Relay / External Exit Node',
      targetAsset: 'MTN Mobile Money Open Gateway',
      targetDistrict: 'Gasabo (Kigali)',
      severity: 'CRITICAL',
      status: 'NEUTRALIZED',
      mitigationDetail: 'Rate-limiting triggered: 1,500 req/s drop. IP range automatically blacklisted.',
    },
    {
      id: 'EVT-9040',
      timestamp: '18s ago',
      threatType: 'Punycode Irembo Spoof Phishing Domain',
      sourceIp: '194.38.20.11',
      originGeo: 'Frankfurt Ingress Proxy',
      targetAsset: 'Citizen Single-Sign-On Portal',
      targetDistrict: 'Nyarugenge (Kigali)',
      severity: 'HIGH',
      status: 'NEUTRALIZED',
      mitigationDetail: 'National DNS Sinkhole engaged. Rwanda CERT takedown dispatch issued.',
    },
    {
      id: 'EVT-9039',
      timestamp: '42s ago',
      threatType: 'Coordinated SIM Swap API Brute Force',
      sourceIp: '102.134.44.18',
      originGeo: 'Cross-Border Cellular Gateway',
      targetAsset: 'Airtel Money HSS Substation',
      targetDistrict: 'Rubavu',
      severity: 'HIGH',
      status: 'HONEYPOT_TRAPPED',
      mitigationDetail: 'Rerouted to synthetic honeypot decoy. Forensic IMSI fingerprint logged.',
    },
    {
      id: 'EVT-9038',
      timestamp: '1m ago',
      threatType: 'Bank Interbank Switch Timing Attack',
      sourceIp: '197.243.2.89',
      originGeo: 'Compromised Micro-ISP Subnet',
      targetAsset: 'BNR Financial Settlement Switch',
      targetDistrict: 'Nyarugenge',
      severity: 'CRITICAL',
      status: 'NEUTRALIZED',
      mitigationDetail: 'Hardware Security Module (HSM) rejected unaligned nonce. Session terminated.',
    },
    {
      id: 'EVT-9037',
      timestamp: '2m ago',
      threatType: 'Malicious Android APK Reverse Shell',
      sourceIp: '45.154.255.8',
      originGeo: 'Offshore Bulletproof Host',
      targetAsset: 'Mobile Banking Endpoints',
      targetDistrict: 'Musanze',
      severity: 'MEDIUM',
      status: 'NEUTRALIZED',
      mitigationDetail: 'SAVIOR Sandbox hash match: Trojan.Dropper.MoMo. Blacklist deployed nationwide.',
    },
  ]);

  // Live incoming event generator
  useEffect(() => {
    const interval = setInterval(() => {
      setAttacksBlockedCount((prev) => prev + 1);

      const threatTemplates = [
        { type: 'Automated MoMo PIN Spray', asset: 'MTN USSD API Core', dist: 'Gasabo', geo: 'Botnet Cluster', sev: 'HIGH' as const },
        { type: 'Phishing SMS Gateway Injection', asset: 'Telecom SMPP Relay', dist: 'Kicukiro', geo: 'Spoofed Aggregator', sev: 'HIGH' as const },
        { type: 'DNS Hijack Probe on .RW TLD', asset: 'RICTA Root DNS Node', dist: 'Nyarugenge', geo: 'External Scanner', sev: 'MEDIUM' as const },
        { type: 'Ransomware C2 Heartbeat Scan', asset: 'Healthcare Fiber Terminal', dist: 'Huye', geo: 'Unknown Ingress', sev: 'CRITICAL' as const },
      ];

      const chosen = threatTemplates[Math.floor(Math.random() * threatTemplates.length)];
      const newEvt: AttackEvent = {
        id: `EVT-${Math.floor(9042 + Math.random() * 900)}`,
        timestamp: 'Just now',
        threatType: chosen.type,
        sourceIp: `${Math.floor(100 + Math.random() * 90)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(1 + Math.random() * 254)}`,
        originGeo: chosen.geo,
        targetAsset: chosen.asset,
        targetDistrict: chosen.dist,
        severity: chosen.sev,
        status: 'NEUTRALIZED',
        mitigationDetail: 'Autonomous heuristic mitigation completed via SAVIOR Edge Shield.',
      };

      setAttackFeed((prev) => [newEvt, ...prev.slice(0, 9)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleExecuteCountermeasure = (actionKey: string, label: string) => {
    setActiveCountermeasure(actionKey);
    setActionNotice(`Executing command: [${label}]... Synchronizing with NCSA and Rwanda CERT.`);

    setTimeout(() => {
      setActiveCountermeasure(null);
      setActionNotice(`Success: ${label} successfully activated across all 30 Rwanda district gateways.`);
      setTimeout(() => setActionNotice(null), 5000);
    }, 1200);
  };

  return (
    <div className="bg-[#070e1e] border border-cyan-900/60 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-mono text-white tracking-wider">
                REAL-TIME CYBERATTACK MONITORING & MITIGATION
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                AUTONOMOUS DEFENSE ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Live Threat Interception Feed & National CERT Incident Response Console
            </p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block">Attacks Neutralized Today</span>
            <span className="text-xl font-extrabold text-cyan-300">{attacksBlockedCount.toLocaleString()}</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block">Active Honeypot Traps</span>
            <span className="text-xl font-extrabold text-emerald-400">12</span>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-3 bg-cyan-950/80 border border-cyan-500 rounded-xl text-xs font-mono text-cyan-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Live Threat Feed Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>LIVE INTERCEPT STREAM (INCOMING THREAT VECTORS)</span>
          </span>
          <span className="text-[11px] text-slate-500">Auto-refresh: 4.5s</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#040813]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#091224] text-slate-400 border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">EVENT ID</th>
                <th className="py-2.5 px-3">THREAT VECTOR</th>
                <th className="py-2.5 px-3">SOURCE IP / ORIGIN</th>
                <th className="py-2.5 px-3">TARGET ASSET & DISTRICT</th>
                <th className="py-2.5 px-3">SEVERITY</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {attackFeed.map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`hover:bg-cyan-950/30 cursor-pointer transition ${
                    selectedEvent?.id === evt.id ? 'bg-cyan-950/50 border-l-2 border-cyan-400' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-cyan-400 font-bold whitespace-nowrap">{evt.id}</td>
                  <td className="py-2.5 px-3 text-white font-medium">{evt.threatType}</td>
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    <span className="text-slate-200">{evt.sourceIp}</span>
                    <span className="block text-[10px] text-slate-500">{evt.originGeo}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-slate-200">{evt.targetAsset}</span>
                    <span className="block text-[10px] text-cyan-400">{evt.targetDistrict}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                      evt.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border-rose-600'
                        : evt.severity === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border-amber-600'
                        : 'bg-yellow-950 text-yellow-300 border-yellow-600'
                    }`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700 flex items-center gap-1 w-fit">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{evt.status}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(evt);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Attack Detail Drawer (if open) */}
      {selectedEvent && (
        <div className="p-4 bg-[#09152b] border border-cyan-500/60 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase">Incident Forensic Docket: {selectedEvent.id}</span>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block">THREAT CLASSIFICATION</span>
              <span className="text-white font-bold">{selectedEvent.threatType}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">SOURCE ATTRIBUTION</span>
              <span className="text-rose-300">{selectedEvent.sourceIp} ({selectedEvent.originGeo})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">TARGET JURISDICTION</span>
              <span className="text-cyan-300">{selectedEvent.targetAsset} • {selectedEvent.targetDistrict}</span>
            </div>
          </div>

          <div className="p-2.5 bg-[#040813] border border-slate-800 rounded-lg text-slate-300 text-[11px]">
            <span className="text-cyan-400 font-bold">AUTOMATED MITIGATION LOG: </span>
            {selectedEvent.mitigationDetail}
          </div>
        </div>
      )}

      {/* Tactical Countermeasures Bar */}
      <div className="space-y-3 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>NCSA / POLICE REAL-TIME COUNTERMEASURES</span>
          </h4>
          <span className="text-[10px] font-mono text-emerald-400">SOC LEVEL 1 PRIVILEGE ACTIVE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleExecuteCountermeasure('BGP_FILTER', 'Autonomous BGP Drop Filter')}
            disabled={Boolean(activeCountermeasure)}
            className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">Deploy BGP Filter</span>
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-[10px] text-slate-400">Null-route malicious CIDR blocks at international edge.</p>
          </button>

          <button
            onClick={() => handleExecuteCountermeasure('USSD_RATE', 'Telecom MoMo Rate Limiter')}
            disabled={Boolean(activeCountermeasure)}
            className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-amber-300">MoMo USSD Shield</span>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400">Throttles automated cashout attempts across MTN & Airtel.</p>
          </button>

          <button
            onClick={() => handleExecuteCountermeasure('DNS_SINKHOLE', 'National DNS Sinkhole')}
            disabled={Boolean(activeCountermeasure)}
            className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-emerald-300">Activate DNS Sinkhole</span>
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-400">Reroute phishing queries to NCSA educational warning page.</p>
          </button>

          <button
            onClick={() => handleExecuteCountermeasure('CITIZEN_ALERT', 'Rwanda CERT Broadcast')}
            disabled={Boolean(activeCountermeasure)}
            className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-rose-500 text-left transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white group-hover:text-rose-300">Push CERT Advisory</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-[10px] text-slate-400">Dispatches priority alert to SAVIOR apps & telecom SMS hubs.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
