import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Radio, 
  MapPin, 
  Car, 
  Crosshair, 
  ShieldAlert, 
  Zap, 
  RefreshCw, 
  Wifi, 
  Signal, 
  Layers, 
  ZoomIn, 
  ZoomOut,
  Clock,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { CybercrimeReport, LanguageCode } from '../types';
import { translations } from '../translations';

interface GpsSuspectRadarProps {
  report: CybercrimeReport;
  language: LanguageCode;
  onFastAction: (actionType: 'FREEZE_MOMO' | 'FREEZE_BANK' | 'IMSI_LOCK' | 'DISPATCH_PATROL' | 'EXPEDITE_WARRANT' | 'RESOLVED_RAPID') => void;
  onRefreshTelemetry: () => void;
  isActionLoading?: boolean;
}

export const GpsSuspectRadar: React.FC<GpsSuspectRadarProps> = ({
  report,
  language,
  onFastAction,
  onRefreshTelemetry,
  isActionLoading = false,
}) => {
  const t = translations[language];
  const [zoomLevel, setZoomLevel] = useState<'KIGALI' | 'MICRO' | 'RWANDA'>('MICRO');
  const [mapStyle, setMapStyle] = useState<'TACTICAL_DARK' | 'SATELLITE_GRID'>('TACTICAL_DARK');
  const [isPinging, setIsPinging] = useState(false);
  const [pingPulse, setPingPulse] = useState(0);

  const suspectLoc = report.suspectLocation || {
    lat: -1.9542,
    lng: 30.1082,
    district: 'Gasabo',
    sector: 'Remera',
    cellTower: 'MTN-KGL-REM-04 (Kisimenti)',
    ipAddress: '105.178.33.91',
    isp: 'MTN Rwandacell 5G',
    accuracyMeters: 35,
    signalStrengthDbm: -66,
    lastActiveTime: 'Just now',
    isLivePinging: true,
    deviceModel: 'Cellular Terminal in Sector',
    approximateAddress: 'Remera Sector, Gasabo District',
    trackingMethod: 'TELECOM_CELL_TRIANGULATION' as const,
  };

  const patrol = report.assignedPatrolUnit;

  // Auto ping effect every 5 seconds for live simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setPingPulse(p => (p + 1) % 100);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleManualPing = async () => {
    setIsPinging(true);
    await onRefreshTelemetry();
    setTimeout(() => setIsPinging(false), 600);
  };

  // SVG Coordinate mapping helpers for Rwanda & Kigali
  // Center roughly at Kigali: Lat -1.950, Lng 30.080
  const centerLat = zoomLevel === 'RWANDA' ? -1.9403 : suspectLoc.lat;
  const centerLng = zoomLevel === 'RWANDA' ? 29.8739 : suspectLoc.lng;
  const scale = zoomLevel === 'MICRO' ? 16000 : zoomLevel === 'KIGALI' ? 8000 : 1800;

  const toSvgX = (lng: number) => {
    return 300 + (lng - centerLng) * scale;
  };
  const toSvgY = (lat: number) => {
    // Invert latitude because SVG Y goes downward
    return 200 - (lat - centerLat) * scale;
  };

  const suspectSvgX = toSvgX(suspectLoc.lng);
  const suspectSvgY = toSvgY(suspectLoc.lat);

  const patrolSvgX = patrol ? toSvgX(patrol.currentLng) : suspectSvgX - 90;
  const patrolSvgY = patrol ? toSvgY(patrol.currentLat) : suspectSvgY + 70;

  // 3 Nearby Telecom Base Transceiver Stations (BTS) for cell triangulation
  const towers = [
    { id: 'TOW-01', name: 'MTN-KGL-REM-04', lat: suspectLoc.lat + 0.004, lng: suspectLoc.lng - 0.005, rssi: -62 },
    { id: 'TOW-02', name: 'AIR-KGL-KMR-02', lat: suspectLoc.lat - 0.003, lng: suspectLoc.lng - 0.006, rssi: -69 },
    { id: 'TOW-03', name: 'MTN-KGL-SONA-01', lat: suspectLoc.lat + 0.001, lng: suspectLoc.lng + 0.007, rssi: -73 },
  ];

  return (
    <div className="bg-[#070d18] border border-cyan-900/60 rounded-2xl overflow-hidden shadow-2xl space-y-0">
      {/* Top Telemetry Bar */}
      <div className="bg-[#0b1324] border-b border-cyan-950 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block animate-ping absolute -top-0.5 -left-0.5"></span>
            <span className="w-3 h-3 rounded-full bg-rose-600 inline-block relative border border-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                LIVE GPS SUSPECT RADAR & TRIANGULATION
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 font-bold">
                ACTIVE GSM PING
              </span>
            </div>
            <p className="text-[11px] text-cyan-400 font-mono">
              Target Docket: <span className="text-white font-bold">{report.trackingId}</span> | Sector: {suspectLoc.sector}, {suspectLoc.district}
            </p>
          </div>
        </div>

        {/* Action Controls & Map Style */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex text-[11px] font-mono">
            <button
              onClick={() => setZoomLevel('MICRO')}
              className={`px-2.5 py-1 rounded transition ${zoomLevel === 'MICRO' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Sector (1:500)
            </button>
            <button
              onClick={() => setZoomLevel('KIGALI')}
              className={`px-2.5 py-1 rounded transition ${zoomLevel === 'KIGALI' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Kigali Metro
            </button>
            <button
              onClick={() => setZoomLevel('RWANDA')}
              className={`px-2.5 py-1 rounded transition ${zoomLevel === 'RWANDA' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              National Grid
            </button>
          </div>

          <button
            onClick={handleManualPing}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-mono font-bold transition"
            title="Force immediate GSM tower triangulation re-ping"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Pinging...' : 'Ping Telemetry'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Radar Map Canvas */}
      <div className="relative w-full h-[360px] sm:h-[400px] bg-[#030712] overflow-hidden select-none">
        {/* Radar Background Grid Lines */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.25)" />
              <stop offset="70%" stopColor="rgba(6, 182, 212, 0.05)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
            </radialGradient>
            <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14, 165, 233, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid Pattern */}
          <rect width="100%" height="100%" fill="url(#tacticalGrid)" />

          {/* Concentric Radar Rings centered on target */}
          <circle cx={suspectSvgX} cy={suspectSvgY} r="45" fill="none" stroke="rgba(239, 68, 68, 0.25)" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx={suspectSvgX} cy={suspectSvgY} r="95" fill="none" stroke="rgba(239, 68, 68, 0.18)" strokeWidth="1" />
          <circle cx={suspectSvgX} cy={suspectSvgY} r="160" fill="none" stroke="rgba(6, 182, 212, 0.12)" strokeWidth="1" strokeDasharray="4,4" />
          <circle cx={suspectSvgX} cy={suspectSvgY} r="240" fill="none" stroke="rgba(6, 182, 212, 0.08)" strokeWidth="1" />

          {/* Pulsing Concentric Radar Wave */}
          <circle 
            cx={suspectSvgX} 
            cy={suspectSvgY} 
            r={(pingPulse % 50) * 4.5} 
            fill="none" 
            stroke="rgba(239, 68, 68, 0.4)" 
            strokeWidth="1.5"
            style={{ opacity: 1 - (pingPulse % 50) / 50 }}
          />

          {/* Triangulation Beam Lines from 3 Telecom Towers to Suspect */}
          {towers.map((t, idx) => {
            const tx = toSvgX(t.lng);
            const ty = toSvgY(t.lat);
            return (
              <g key={t.id}>
                {/* Triangulation Line */}
                <line 
                  x1={tx} 
                  y1={ty} 
                  x2={suspectSvgX} 
                  y2={suspectSvgY} 
                  stroke="rgba(6, 182, 212, 0.4)" 
                  strokeWidth="1.5" 
                  strokeDasharray="4,4" 
                />
                {/* Tower Node */}
                <circle cx={tx} cy={ty} r="5" fill="#0891b2" stroke="#67e8f9" strokeWidth="1.5" />
                <text x={tx + 8} y={ty + 4} fill="#67e8f9" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  🗼 {t.name}
                </text>
              </g>
            );
          })}

          {/* Vector Line between Patrol Unit and Suspect */}
          {patrol && (
            <g>
              <line 
                x1={patrolSvgX} 
                y1={patrolSvgY} 
                x2={suspectSvgX} 
                y2={suspectSvgY} 
                stroke="#f59e0b" 
                strokeWidth="2" 
                strokeDasharray="6,4" 
              />
              {/* Intercept Distance Label */}
              <rect 
                x={(patrolSvgX + suspectSvgX) / 2 - 45} 
                y={(patrolSvgY + suspectSvgY) / 2 - 12} 
                width="90" 
                height="18" 
                rx="4" 
                fill="#0f172a" 
                stroke="#f59e0b" 
                strokeWidth="1" 
              />
              <text 
                x={(patrolSvgX + suspectSvgX) / 2} 
                y={(patrolSvgY + suspectSvgY) / 2 + 1} 
                textAnchor="middle" 
                fill="#fde68a" 
                fontSize="9" 
                fontFamily="monospace" 
                fontWeight="bold"
              >
                ETA: {patrol.etaMinutes} MINS
              </text>
            </g>
          )}

          {/* Sector Landmark Labels (Gasabo / Remera / Kicukiro / Downtown) */}
          <text x={toSvgX(30.0619)} y={toSvgY(-1.9441)} fill="rgba(148, 163, 184, 0.5)" fontSize="11" fontFamily="monospace">
            Kacyiru (Govt District)
          </text>
          <text x={toSvgX(30.0588)} y={toSvgY(-1.9536)} fill="rgba(148, 163, 184, 0.5)" fontSize="11" fontFamily="monospace">
            Downtown / Nyarugenge
          </text>
          <text x={toSvgX(30.0821)} y={toSvgY(-1.9705)} fill="rgba(148, 163, 184, 0.5)" fontSize="11" fontFamily="monospace">
            Sonatubes / Kicukiro
          </text>
          <text x={toSvgX(30.1284)} y={toSvgY(-1.9392)} fill="rgba(148, 163, 184, 0.5)" fontSize="11" fontFamily="monospace">
            Kimironko Sector
          </text>
        </svg>

        {/* HTML Overlaid Markers (allowing rich CSS animation & clickability) */}
        {/* 1. SUSPECT TARGET PIN */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: `${Math.max(50, Math.min(550, suspectSvgX))}px`, top: `${Math.max(50, Math.min(350, suspectSvgY))}px` }}
        >
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute w-12 h-12 rounded-full bg-rose-600/30 animate-ping"></div>
            <div className="w-9 h-9 rounded-full bg-rose-600 border-2 border-white shadow-lg shadow-rose-950 flex items-center justify-center text-white z-10">
              <Crosshair className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>

          {/* Suspect Target Card */}
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-[#090e1a]/95 border border-rose-500/80 rounded-lg p-2.5 shadow-xl w-52 pointer-events-none z-20">
            <div className="flex items-center justify-between border-b border-rose-900/60 pb-1 mb-1">
              <span className="text-[10px] font-mono font-bold text-rose-400">SUSPECT PINPOINT</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300">
                ±{suspectLoc.accuracyMeters}m
              </span>
            </div>
            <p className="text-[11px] font-bold text-white truncate">{suspectLoc.approximateAddress}</p>
            <p className="text-[10px] text-slate-300 font-mono">MSISDN: {report.suspectContact || 'Unknown'}</p>
            <p className="text-[9px] text-cyan-300 font-mono">Cell: {suspectLoc.cellTower}</p>
          </div>
        </div>

        {/* 2. POLICE PATROL CRUISER PIN */}
        {patrol && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ left: `${Math.max(40, Math.min(560, patrolSvgX))}px`, top: `${Math.max(40, Math.min(360, patrolSvgY))}px` }}
          >
            <div className="relative flex items-center justify-center">
              {/* Emergency Blue Strobe */}
              <div className="absolute w-10 h-10 rounded-full bg-blue-500/40 animate-ping"></div>
              <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-slate-900 shadow-lg shadow-amber-950 flex items-center justify-center text-slate-950 font-bold z-10">
                <Car className="w-4 h-4" />
              </div>
            </div>

            {/* Patrol Card */}
            <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-[#0b1324]/95 border border-amber-500/80 rounded-lg p-2 shadow-xl w-48 text-left pointer-events-none">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-400">
                <span>{patrol.unitId}</span>
                <span className="text-emerald-400">{patrol.status}</span>
              </div>
              <p className="text-[10px] text-slate-200 font-sans truncate">{patrol.officerCallsign}</p>
              <p className="text-[9px] text-amber-300 font-mono">ETA: {patrol.etaMinutes} mins to suspect</p>
            </div>
          </div>
        )}

        {/* Live HUD Overlay (Bottom Left) */}
        <div className="absolute bottom-3 left-3 bg-[#070d18]/90 backdrop-blur-md border border-cyan-900/60 rounded-xl p-3 text-xs font-mono space-y-1 z-10 pointer-events-none max-w-xs shadow-lg">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-[11px] border-b border-cyan-950 pb-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '12s' }} />
            <span>KIGALI GPS TELEMETRY MATRIX</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px]">
            <span className="text-slate-400">LATITUDE:</span>
            <span className="text-white font-bold">{suspectLoc.lat.toFixed(6)}° S</span>
            <span className="text-slate-400">LONGITUDE:</span>
            <span className="text-white font-bold">{suspectLoc.lng.toFixed(6)}° E</span>
            <span className="text-slate-400">CARRIER:</span>
            <span className="text-emerald-400 truncate">{suspectLoc.isp}</span>
            <span className="text-slate-400">SIGNAL:</span>
            <span className="text-cyan-300">{suspectLoc.signalStrengthDbm} dBm (RSSI)</span>
            <span className="text-slate-400">IP TRACE:</span>
            <span className="text-amber-300">{suspectLoc.ipAddress}</span>
            <span className="text-slate-400">LAST ACTIVE:</span>
            <span className="text-rose-400 font-bold">{suspectLoc.lastActiveTime}</span>
          </div>
        </div>

        {/* Compass Rose (Top Right) */}
        <div className="absolute top-3 right-3 bg-[#0b1324]/80 backdrop-blur-sm border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-300 flex items-center gap-1.5 z-10">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" />
          <span>KIGALI FORENSIC SECTOR GRID</span>
        </div>
      </div>

      {/* Quick Action Resolution Toolbar ("Solve Case in Short Period of Time") */}
      <div className="p-4 bg-[#0b1324] border-t border-cyan-950 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Rapid Case Interception & Fast-Track Resolution
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Average Resolution Target: <strong className="text-emerald-400">&lt; 15 mins</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* Action 1: Instant MoMo Freeze */}
          <button
            onClick={() => onFastAction('FREEZE_MOMO')}
            disabled={isActionLoading}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 text-amber-200 transition text-center group disabled:opacity-50"
            title="Instant simulated freeze of suspect MTN & Airtel MoMo wallet to prevent fund cash-out"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase">{t.policeBtnFreezeMoMo}</span>
            <span className="text-[9px] text-amber-400/80">MTN & Airtel API</span>
          </button>

          {/* Action 2: Bank Provisional Freeze */}
          <button
            onClick={() => onFastAction('FREEZE_BANK')}
            disabled={isActionLoading}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/70 border border-blue-500/40 text-blue-200 transition text-center group disabled:opacity-50"
            title="Issue National Bank of Rwanda (BNR) provisional preservation order across banks"
          >
            <Zap className="w-4 h-4 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase">{t.policeBtnFreezeBank}</span>
            <span className="text-[9px] text-blue-400/80">BNR Interbank</span>
          </button>

          {/* Action 3: Telecom Tower IMSI Lock */}
          <button
            onClick={() => onFastAction('IMSI_LOCK')}
            disabled={isActionLoading}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-200 transition text-center group disabled:opacity-50"
            title="Enforce cellular BTS tower lock and continuous GPS tracking"
          >
            <Radio className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase">{t.policeBtnImsiLock}</span>
            <span className="text-[9px] text-cyan-400/80">Tower Radius</span>
          </button>

          {/* Action 4: Dispatch Patrol Intercept */}
          <button
            onClick={() => onFastAction('DISPATCH_PATROL')}
            disabled={isActionLoading}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-500/40 text-indigo-200 transition text-center group disabled:opacity-50"
            title="Dispatch nearest RNP patrol squad or rapid motorcycle to suspect GPS location"
          >
            <Car className="w-4 h-4 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase">{t.policeBtnDispatchPatrol}</span>
            <span className="text-[9px] text-indigo-400/80">RNP Squad (2m)</span>
          </button>

          {/* Action 5: RIB Fast Warrant */}
          <button
            onClick={() => onFastAction('EXPEDITE_WARRANT')}
            disabled={isActionLoading}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 transition text-center group disabled:opacity-50"
            title="Generate expedited digital arrest warrant signed by RIB prosecutor"
          >
            <Layers className="w-4 h-4 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase">{t.policeBtnExpediteWarrant}</span>
            <span className="text-[9px] text-purple-400/80">Digital Signature</span>
          </button>

          {/* Action 6: Rapid Resolve & Restitution */}
          <button
            onClick={() => onFastAction('RESOLVED_RAPID')}
            disabled={isActionLoading}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-200 transition text-center group disabled:opacity-50 shadow-md shadow-emerald-950"
            title="Mark case as solved: suspect intercepted, stolen funds secured, and citizen notified"
          >
            <Zap className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase text-white">{t.policeBtnResolveFast}</span>
            <span className="text-[9px] text-emerald-300">Close & Notify</span>
          </button>
        </div>

        {/* Live fast action audit timeline */}
        {report.fastActionsTaken && report.fastActionsTaken.length > 0 && (
          <div className="mt-2 p-2.5 bg-[#070d18] border border-slate-800 rounded-xl space-y-1.5 font-mono text-[11px]">
            <span className="text-[10px] font-bold text-cyan-300 uppercase block">
              Recent Interceptions on Docket {report.trackingId}:
            </span>
            {report.fastActionsTaken.slice(-3).map((act, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-300">
                <span className="text-amber-400 font-bold shrink-0">[{act.actionType}]:</span>
                <span className="text-slate-300 truncate">{act.details}</span>
                <span className="text-[10px] text-slate-500 ml-auto shrink-0">({act.officer})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
