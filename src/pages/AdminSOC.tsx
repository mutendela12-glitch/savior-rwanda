import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Activity, 
  Cpu, 
  Server, 
  Lock, 
  Users,
  RefreshCw
} from 'lucide-react';
import { RwandaThreatMapDistrict, LanguageCode } from '../types';
import { translations } from '../translations';

interface AdminSOCProps {
  language: LanguageCode;
}

export const AdminSOC: React.FC<AdminSOCProps> = ({ language }) => {
  const [districts, setDistricts] = useState<RwandaThreatMapDistrict[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<RwandaThreatMapDistrict | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    fetch('/api/admin/threat-map')
      .then(res => res.json())
      .then(data => {
        setDistricts(data);
        if (data.length > 0) setSelectedDistrict(data[0]);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const getThreatColor = (level: RwandaThreatMapDistrict['threatLevel']) => {
    switch (level) {
      case 'HIGH': return 'text-rose-400 bg-rose-950/60 border-rose-600';
      case 'ELEVATED': return 'text-amber-400 bg-amber-950/60 border-amber-600';
      case 'MODERATE': return 'text-yellow-400 bg-yellow-950/60 border-yellow-600';
      case 'LOW': default: return 'text-emerald-400 bg-emerald-950/60 border-emerald-600';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0b1324] border border-cyan-900/60 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/90 border border-cyan-500/60 flex items-center justify-center text-cyan-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  SAVIOR Global Security Operations Center (SOC)
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  SYSTEM ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Administrator Command: <span className="text-cyan-300">mutendela12@gmail.com</span> • Rwanda National Telemetry
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0b1324] border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Monitored Sectors</span>
            <MapPin className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-white">30 Districts</span>
          <span className="text-[10px] text-emerald-400 font-mono block">100% Nationwide Coverage</span>
        </div>

        <div className="p-4 bg-[#0b1324] border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Active Threat Mitigation</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-rose-400">217 Threats</span>
          <span className="text-[10px] text-rose-300 font-mono block">Flagged in last 24h</span>
        </div>

        <div className="p-4 bg-[#0b1324] border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Biometric Integrity Rate</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-emerald-400">99.8% Match</span>
          <span className="text-[10px] text-slate-400 font-mono block">Zero False Positives</span>
        </div>

        <div className="p-4 bg-[#0b1324] border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Protected Transactions</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-extrabold font-mono text-cyan-300">4,892 Simulated</span>
          <span className="text-[10px] text-cyan-400 font-mono block">Multi-tier verified</span>
        </div>
      </div>

      {/* Rwanda District Threat Map & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District Threat Grid */}
        <div className="lg:col-span-8 bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Rwanda Regional Cyber Threat Heatmap</h3>
            </div>
            <span className="text-xs font-mono text-cyan-400">Live Telemetry Feed</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {districts.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDistrict(d)}
                className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                  selectedDistrict?.id === d.id
                    ? 'bg-cyan-950/60 border-cyan-500 shadow-lg shadow-cyan-950'
                    : 'bg-[#070d18] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{d.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{d.province}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getThreatColor(d.threatLevel)}`}>
                    {d.threatLevel} RISK
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <span className="text-slate-400">Active Threats: <span className="text-rose-300 font-bold">{d.activeThreatsCount}</span></span>
                  <span className="text-slate-400">Reports: <span className="text-white font-bold">{d.reportedScamsCount}</span></span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {d.topCategories.map((c, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 font-mono">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected District Deep Dive */}
        <div className="lg:col-span-4 space-y-5">
          {selectedDistrict ? (
            <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase block">District Telemetry Focus</span>
                <h3 className="text-lg font-bold text-white">{selectedDistrict.name} District</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedDistrict.province}</p>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400">CURRENT THREAT LEVEL:</span>
                  <span className={`font-bold block text-sm ${
                    selectedDistrict.threatLevel === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {selectedDistrict.threatLevel} PRIORITY RESPONSE
                  </span>
                </div>

                <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400">PRIMARY ATTACK VECTORS:</span>
                  <ul className="list-disc list-inside text-slate-200 space-y-0.5">
                    {selectedDistrict.topCategories.map((cat, idx) => (
                      <li key={idx}>{cat}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400">INCIDENT DOCKETS FILED:</span>
                  <span className="text-base font-bold text-cyan-300 block">
                    {selectedDistrict.reportedScamsCount} Cases
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 bg-[#0b1324] border border-slate-800 rounded-2xl">
              Select a district to view telemetry
            </div>
          )}

          {/* System Diagnostic Status */}
          <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-5 space-y-2 text-xs font-mono">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>SAVIOR Engine Core Status</span>
            </h4>
            <div className="space-y-1 text-slate-400">
              <p>• Server Cluster: <span className="text-emerald-400">Kigali Fiber Core 01</span></p>
              <p>• AI Model: <span className="text-cyan-400">Gemini 3.7 Flash</span></p>
              <p>• Encryption: <span className="text-cyan-300">AES-256-GCM / SHA-256</span></p>
              <p>• Port: <span className="text-slate-300">3000 (Internal Ingress)</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
