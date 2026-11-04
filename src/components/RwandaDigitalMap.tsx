import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Radio, 
  MapPin, 
  Activity, 
  Layers, 
  Zap, 
  Crosshair, 
  Server, 
  Wifi, 
  Globe,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';
import { RwandaThreatMapDistrict, LanguageCode } from '../types';
import { translations } from '../translations';

interface AttackTrajectory {
  id: string;
  sourceLabel: string;
  sourceCoords: { x: number; y: number };
  targetDistrictId: string;
  targetCoords: { x: number; y: number };
  type: 'MOMO_PROBE' | 'DDOS_FLOOD' | 'PHISHING_CLUSTER' | 'SIM_SWAP_RELAY' | 'MALWARE_C2';
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  progress: number;
  blocked: boolean;
}

interface RwandaDigitalMapProps {
  districts: RwandaThreatMapDistrict[];
  selectedDistrict: RwandaThreatMapDistrict | null;
  onSelectDistrict: (district: RwandaThreatMapDistrict) => void;
  language: LanguageCode;
}

export const RwandaDigitalMap: React.FC<RwandaDigitalMapProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
  language,
}) => {
  const t = translations[language];
  const [activeLayer, setActiveLayer] = useState<'HEATMAP' | 'ATTACK_VECTORS' | 'TELECOM_BACKBONE'>('ATTACK_VECTORS');
  const [radarAngle, setRadarAngle] = useState(0);
  const [trajectories, setTrajectories] = useState<AttackTrajectory[]>([
    {
      id: 'atk-1',
      sourceLabel: 'External Botnet [185.220.x.x]',
      sourceCoords: { x: 40, y: 70 },
      targetDistrictId: 'gasabo',
      targetCoords: { x: 420, y: 260 }, // Kigali
      type: 'DDOS_FLOOD',
      severity: 'HIGH',
      progress: 0.65,
      blocked: true,
    },
    {
      id: 'atk-2',
      sourceLabel: 'Fraudulent USSD Gateway [Nairobi Ingress]',
      sourceCoords: { x: 740, y: 90 },
      targetDistrictId: 'kicukiro',
      targetCoords: { x: 435, y: 285 },
      type: 'MOMO_PROBE',
      severity: 'CRITICAL',
      progress: 0.82,
      blocked: true,
    },
    {
      id: 'atk-3',
      sourceLabel: 'Tor Exit Relay [Punycode Phish]',
      sourceCoords: { x: 70, y: 380 },
      targetDistrictId: 'rubavu',
      targetCoords: { x: 195, y: 175 },
      type: 'PHISHING_CLUSTER',
      severity: 'HIGH',
      progress: 0.45,
      blocked: true,
    },
    {
      id: 'atk-4',
      sourceLabel: 'Spoofed SIM Aggregator',
      sourceCoords: { x: 720, y: 410 },
      targetDistrictId: 'huye',
      targetCoords: { x: 335, y: 400 },
      type: 'SIM_SWAP_RELAY',
      severity: 'MEDIUM',
      progress: 0.3,
      blocked: true,
    },
    {
      id: 'atk-5',
      sourceLabel: 'C2 Malicious APK Beacon',
      sourceCoords: { x: 480, y: 30 },
      targetDistrictId: 'musanze',
      targetCoords: { x: 325, y: 145 },
      type: 'MALWARE_C2',
      severity: 'HIGH',
      progress: 0.55,
      blocked: true,
    },
  ]);

  // District SVG Node anchors coordinates (normalized to 800 x 540 SVG viewBox)
  const districtNodes: Record<string, { x: number; y: number; province: string; hubName: string }> = {
    // Kigali City
    gasabo: { x: 435, y: 250, province: 'Kigali City', hubName: 'Kigali Fiber Core 01' },
    nyarugenge: { x: 410, y: 265, province: 'Kigali City', hubName: 'BNR Financial Gateway' },
    kicukiro: { x: 440, y: 280, province: 'Kigali City', hubName: 'Telecom Substation 03' },
    // Northern Province
    musanze: { x: 325, y: 145, province: 'Northern', hubName: 'Volcano Telecom Hub' },
    burera: { x: 380, y: 110, province: 'Northern', hubName: 'Border Sensor Northern' },
    gicumbi: { x: 475, y: 170, province: 'Northern', hubName: 'Highland Fiber Relay' },
    rulindo: { x: 395, y: 200, province: 'Northern', hubName: 'Rulindo Microwave Node' },
    gakenke: { x: 345, y: 205, province: 'Northern', hubName: 'Central-North Gateway' },
    // Southern Province
    huye: { x: 335, y: 400, province: 'Southern', hubName: 'University & Research Node' },
    muhanga: { x: 345, y: 275, province: 'Southern', hubName: 'Southern Transit Core' },
    ruhango: { x: 355, y: 325, province: 'Southern', hubName: 'Ruhango Substation' },
    nyanza: { x: 350, y: 365, province: 'Southern', hubName: 'Nyanza Heritage Station' },
    gisagara: { x: 350, y: 450, province: 'Southern', hubName: 'Border Mesh South' },
    nyamagabe: { x: 275, y: 380, province: 'Southern', hubName: 'Nyungwe Edge Sensor' },
    nyaruguru: { x: 290, y: 450, province: 'Southern', hubName: 'Kibeho Border Sensor' },
    kamonyi: { x: 385, y: 285, province: 'Southern', hubName: 'Kigali-South Interface' },
    // Western Province
    rubavu: { x: 195, y: 175, province: 'Western', hubName: 'Lake Kivu Fiber Terminal' },
    nyabihu: { x: 265, y: 180, province: 'Western', hubName: 'Tea Belt Repeater' },
    ngororero: { x: 275, y: 235, province: 'Western', hubName: 'Western Central Hub' },
    karongi: { x: 215, y: 275, province: 'Western', hubName: 'Kivu Solar Data Node' },
    rutsiro: { x: 205, y: 220, province: 'Western', hubName: 'Lakeside Micro-node' },
    nyamasheke: { x: 190, y: 360, province: 'Western', hubName: 'South Kivu Node' },
    rusizi: { x: 155, y: 440, province: 'Western', hubName: 'Rusizi Border Terminal' },
    // Eastern Province
    rwamagana: { x: 520, y: 260, province: 'Eastern', hubName: 'Eastern Provincial Core' },
    bugesera: { x: 475, y: 350, province: 'Eastern', hubName: 'Airport Tech City Ring' },
    kayonza: { x: 575, y: 250, province: 'Eastern', hubName: 'East Agro-Tech Node' },
    gatsibo: { x: 550, y: 175, province: 'Eastern', hubName: 'Gatsibo Data Aggregator' },
    nyagatare: { x: 590, y: 100, province: 'Eastern', hubName: 'Savannah Fiber Terminal' },
    kirehe: { x: 670, y: 330, province: 'Eastern', hubName: 'Rusumo Border Terminal' },
    ngoma: { x: 585, y: 330, province: 'Eastern', hubName: 'Kibungo Substation' },
  };

  // Province Polygons for Rwanda Map representation
  const provincePolygons = [
    {
      name: 'Northern Province (Amajyaruguru)',
      path: 'M 290 120 L 370 70 L 450 85 L 510 150 L 470 215 L 375 225 L 305 180 Z',
      color: 'rgba(6, 182, 212, 0.12)',
      stroke: '#06b6d4',
    },
    {
      name: 'Western Province (Iburengerazuba)',
      path: 'M 170 150 L 290 120 L 305 180 L 260 250 L 225 365 L 140 435 L 145 470 L 190 410 L 205 290 L 165 200 Z',
      color: 'rgba(59, 130, 246, 0.12)',
      stroke: '#3b82f6',
    },
    {
      name: 'Southern Province (Amajyepfo)',
      path: 'M 305 180 L 375 225 L 400 270 L 390 350 L 380 470 L 265 470 L 225 365 L 260 250 Z',
      color: 'rgba(168, 85, 247, 0.10)',
      stroke: '#a855f7',
    },
    {
      name: 'Kigali City (Umujyi wa Kigali)',
      path: 'M 390 240 L 455 235 L 465 295 L 405 305 Z',
      color: 'rgba(0, 240, 255, 0.28)',
      stroke: '#00f0ff',
    },
    {
      name: 'Eastern Province (Iburasirazuba)',
      path: 'M 510 150 L 630 65 L 680 140 L 610 230 L 710 320 L 670 410 L 520 400 L 455 340 L 465 295 L 455 235 L 510 150 Z',
      color: 'rgba(16, 185, 129, 0.12)',
      stroke: '#10b981',
    },
  ];

  // Fiber backbone links between key strategic hubs
  const fiberLinks = [
    { from: 'gasabo', to: 'musanze' },
    { from: 'gasabo', to: 'rwamagana' },
    { from: 'gasabo', to: 'muhanga' },
    { from: 'gasabo', to: 'bugesera' },
    { from: 'musanze', to: 'rubavu' },
    { from: 'rubavu', to: 'karongi' },
    { from: 'karongi', to: 'rusizi' },
    { from: 'muhanga', to: 'huye' },
    { from: 'huye', to: 'nyaruguru' },
    { from: 'rwamagana', to: 'kayonza' },
    { from: 'kayonza', to: 'nyagatare' },
    { from: 'kayonza', to: 'kirehe' },
    { from: 'gicumbi', to: 'gasabo' },
  ];

  // Radar sweep animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 2) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Cycle animated cyberattack trajectories
  useEffect(() => {
    const trajInterval = setInterval(() => {
      setTrajectories((prev) =>
        prev.map((t) => ({
          ...t,
          progress: t.progress >= 1 ? 0.05 : t.progress + 0.02,
        }))
      );
    }, 80);
    return () => clearInterval(trajInterval);
  }, []);

  const getDistrictThreatColor = (level?: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH') => {
    switch (level) {
      case 'HIGH':
        return { fill: '#ef4444', stroke: '#f87171', glow: 'rgba(239, 68, 68, 0.7)' };
      case 'ELEVATED':
        return { fill: '#f59e0b', stroke: '#fbbf24', glow: 'rgba(245, 158, 11, 0.6)' };
      case 'MODERATE':
        return { fill: '#eab308', stroke: '#fde047', glow: 'rgba(234, 179, 8, 0.5)' };
      case 'LOW':
      default:
        return { fill: '#00f0ff', stroke: '#38bdf8', glow: 'rgba(0, 240, 255, 0.6)' };
    }
  };

  return (
    <div className="bg-[#050b17] border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Top Map Control Bar */}
      <div className="bg-[#091224] border-b border-cyan-950 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block animate-ping absolute -top-0.5 -left-0.5" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block relative border border-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono tracking-wider text-white uppercase">
                RWANDA NATIONAL CYBER DEFENSE TACTICAL MAP
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                GEO-DEFENSE 3.7
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Real-time Ingress Threat Trajectories & National Telecom Fiber Ring
            </p>
          </div>
        </div>

        {/* Layer Switches */}
        <div className="flex items-center gap-1.5 p-1 bg-[#040812] border border-cyan-900/50 rounded-xl">
          <button
            onClick={() => setActiveLayer('ATTACK_VECTORS')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              activeLayer === 'ATTACK_VECTORS'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Attack Vectors</span>
          </button>
          <button
            onClick={() => setActiveLayer('HEATMAP')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              activeLayer === 'HEATMAP'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>Threat Heatmap</span>
          </button>
          <button
            onClick={() => setActiveLayer('TELECOM_BACKBONE')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
              activeLayer === 'TELECOM_BACKBONE'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3 h-3" />
            <span>Fiber Backbone</span>
          </button>
        </div>
      </div>

      {/* Main SVG Vector Canvas */}
      <div className="relative w-full aspect-[16/9] min-h-[440px] max-h-[580px] bg-[#030712] overflow-hidden flex items-center justify-center">
        {/* Subtle Cyber Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff07_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff07_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        {/* Ambient Map Glow */}
        <div className="absolute w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

        <svg
          viewBox="0 0 800 540"
          className="w-full h-full select-none"
          style={{ filter: 'drop-shadow(0 0 16px rgba(0,240,255,0.06))' }}
        >
          <defs>
            {/* Linear and Radial Gradients */}
            <radialGradient id="kigaliCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="attackGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.1" />
            </linearGradient>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Radar Sweep Arc Beam */}
          <g transform="translate(425, 270)" opacity="0.35">
            <line
              x1="0"
              y1="0"
              x2={380 * Math.cos((radarAngle * Math.PI) / 180)}
              y2={380 * Math.sin((radarAngle * Math.PI) / 180)}
              stroke="#00f0ff"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <circle
              cx="0"
              cy="0"
              r="140"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="0.75"
              strokeDasharray="2 6"
              opacity="0.3"
            />
            <circle
              cx="0"
              cy="0"
              r="280"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="0.75"
              strokeDasharray="4 8"
              opacity="0.2"
            />
          </g>

          {/* Rwanda Provincial Polygons */}
          <g id="provinces-layer">
            {provincePolygons.map((prov, i) => (
              <path
                key={i}
                d={prov.path}
                fill={prov.color}
                stroke={prov.stroke}
                strokeWidth="1.2"
                strokeDasharray="3 2"
                className="transition-all duration-300 hover:fill-opacity-30"
              >
                <title>{prov.name}</title>
              </path>
            ))}
          </g>

          {/* Rwanda Fiber Backbone Links */}
          {activeLayer === 'TELECOM_BACKBONE' && (
            <g id="fiber-links" opacity="0.8">
              {fiberLinks.map((link, idx) => {
                const nodeA = districtNodes[link.from];
                const nodeB = districtNodes[link.to];
                if (!nodeA || !nodeB) return null;
                return (
                  <line
                    key={idx}
                    x1={nodeA.x}
                    y1={nodeA.y}
                    x2={nodeB.x}
                    y2={nodeB.y}
                    stroke="#10b981"
                    strokeWidth="1.8"
                    strokeDasharray="6 4"
                    filter="url(#neonGlow)"
                    opacity="0.7"
                  />
                );
              })}
            </g>
          )}

          {/* Animated Ballistic Cyber Attack Arcs */}
          {activeLayer === 'ATTACK_VECTORS' && (
            <g id="attack-arcs">
              {trajectories.map((traj) => {
                // Curved quadratic bezier arc
                const midX = (traj.sourceCoords.x + traj.targetCoords.x) / 2;
                const midY = Math.min(traj.sourceCoords.y, traj.targetCoords.y) - 60;
                const pathD = `M ${traj.sourceCoords.x} ${traj.sourceCoords.y} Q ${midX} ${midY} ${traj.targetCoords.x} ${traj.targetCoords.y}`;

                // Calculate current projectile position along quadratic curve
                const tVal = traj.progress;
                const curX =
                  Math.pow(1 - tVal, 2) * traj.sourceCoords.x +
                  2 * (1 - tVal) * tVal * midX +
                  Math.pow(tVal, 2) * traj.targetCoords.x;
                const curY =
                  Math.pow(1 - tVal, 2) * traj.sourceCoords.y +
                  2 * (1 - tVal) * tVal * midY +
                  Math.pow(tVal, 2) * traj.targetCoords.y;

                return (
                  <g key={traj.id}>
                    {/* Underlying trajectory path */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={traj.severity === 'CRITICAL' ? '#f43f5e' : '#f59e0b'}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.45"
                    />

                    {/* Threat Source Pin */}
                    <circle
                      cx={traj.sourceCoords.x}
                      cy={traj.sourceCoords.y}
                      r="4"
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                    <text
                      x={traj.sourceCoords.x}
                      y={traj.sourceCoords.y - 8}
                      fill="#fca5a5"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {traj.sourceLabel}
                    </text>

                    {/* Animated Projectile Bullet */}
                    <circle
                      cx={curX}
                      cy={curY}
                      r="4.5"
                      fill="#00f0ff"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      filter="url(#neonGlow)"
                    />

                    {/* Interception Shield at Target Node */}
                    {traj.blocked && (
                      <g transform={`translate(${traj.targetCoords.x}, ${traj.targetCoords.y})`}>
                        <circle
                          r="14"
                          fill="none"
                          stroke="#00f0ff"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                          className="animate-spin"
                          style={{ transformOrigin: '0 0', animationDuration: '4s' }}
                        />
                        <text
                          y="-18"
                          fill="#38bdf8"
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          SHIELDED
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* District & Infrastructure Interactive Nodes */}
          <g id="district-nodes">
            {Object.entries(districtNodes).map(([id, node]) => {
              const districtData = districts.find(
                (d) => d.id.toLowerCase() === id.toLowerCase() || d.name.toLowerCase() === id.toLowerCase()
              );
              const isSelected =
                selectedDistrict?.id.toLowerCase() === id.toLowerCase() ||
                selectedDistrict?.name.toLowerCase() === id.toLowerCase();
              const colors = getDistrictThreatColor(districtData?.threatLevel);
              const isCapital = id === 'gasabo' || id === 'nyarugenge' || id === 'kicukiro';

              return (
                <g
                  key={id}
                  onClick={() => {
                    if (districtData) onSelectDistrict(districtData);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isCapital ? 22 : 16}
                      fill="none"
                      stroke="#00f0ff"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      className="animate-spin"
                      style={{ transformOrigin: `${node.x}px ${node.y}px`, animationDuration: '8s' }}
                    />
                  )}

                  {/* Pulsing Outer Ring for active alerts */}
                  {districtData && districtData.threatLevel === 'HIGH' && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isCapital ? 18 : 12}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      opacity="0.8"
                      className="animate-ping"
                      style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                    />
                  )}

                  {/* Base Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isCapital ? 8 : 5}
                    fill={colors.fill}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 2 : 1}
                    filter="url(#neonGlow)"
                    className="transition-transform group-hover:scale-125"
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  />

                  {/* Node Label */}
                  <text
                    x={node.x}
                    y={node.y + (isCapital ? 18 : 14)}
                    fill={isSelected ? '#00f0ff' : '#cbd5e1'}
                    fontSize={isCapital ? '10' : '8.5'}
                    fontWeight={isSelected || isCapital ? 'bold' : 'normal'}
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow"
                  >
                    {districtData ? districtData.name : id.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Watermark / Coordinates */}
          <text
            x="780"
            y="525"
            fill="#475569"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="end"
          >
            RWANDA GRID: 1.9403° S, 29.8739° E • TLS 1.3 SECURE
          </text>
        </svg>

        {/* Floating Mini Overlay Legend */}
        <div className="absolute bottom-3 left-3 bg-[#08101e]/90 border border-cyan-900/60 backdrop-blur-md rounded-xl p-3 text-xs font-mono space-y-1.5 shadow-xl max-w-xs">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>National Defense Legend</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Normal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Elevated
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Critical
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Click any district node to isolate telemetry and review local fraud vectors.
          </p>
        </div>
      </div>
    </div>
  );
};
