import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  MapPin, 
  Activity, 
  Zap, 
  Layers, 
  Eye, 
  Info,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Maximize2,
  Compass
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../translations';

interface ThreatNode {
  id: string;
  name: string;
  province: string;
  x: number;
  y: number;
  threatLevel: 'HIGH' | 'ELEVATED' | 'MODERATE' | 'GUARDED';
  activeAttacksCount: number;
  primaryVector: string;
  carrierTarget: string;
  advice: string;
  pulseSpeed: 'fast' | 'normal' | 'slow';
}

interface SimulatedAttackTrajectory {
  id: string;
  sourceLabel: string;
  sourceCoords: { x: number; y: number };
  targetNodeId: string;
  targetCoords: { x: number; y: number };
  vectorType: string;
  color: string;
  progress: number;
}

interface CyberThreatMapProps {
  language: LanguageCode;
  onExploreReport?: () => void;
  onExploreScanner?: () => void;
}

export const CyberThreatMap: React.FC<CyberThreatMapProps> = ({
  language,
  onExploreReport,
  onExploreScanner,
}) => {
  const t = translations[language];

  // Threat Nodes across Rwandan Strategic Urban and Rural Districts
  const [nodes, setNodes] = useState<ThreatNode[]>([
    {
      id: 'gasabo',
      name: 'Gasabo (Kigali)',
      province: 'Kigali City',
      x: 435,
      y: 250,
      threatLevel: 'HIGH',
      activeAttacksCount: 48,
      primaryVector: 'MoMo USSD PIN Spray & Fake Invoices',
      carrierTarget: 'MTN & Airtel Core Gateways',
      advice: 'Never dial USSD codes received via unsolicited SMS or voice calls.',
      pulseSpeed: 'fast',
    },
    {
      id: 'nyarugenge',
      name: 'Nyarugenge (CBD)',
      province: 'Kigali City',
      x: 410,
      y: 268,
      threatLevel: 'HIGH',
      activeAttacksCount: 39,
      primaryVector: 'Irembo & Bank Portal Phishing',
      carrierTarget: 'Commercial Bank APIS',
      advice: 'Verify URL domain ends strictly in .gov.rw before submitting NIDA details.',
      pulseSpeed: 'fast',
    },
    {
      id: 'kicukiro',
      name: 'Kicukiro (Kigali)',
      province: 'Kigali City',
      x: 440,
      y: 285,
      threatLevel: 'ELEVATED',
      activeAttacksCount: 27,
      primaryVector: 'WhatsApp SACCO Group Hijacking',
      carrierTarget: 'Cellular OTP Relays',
      advice: 'Enable Two-Step Verification inside WhatsApp settings immediately.',
      pulseSpeed: 'normal',
    },
    {
      id: 'musanze',
      name: 'Musanze',
      province: 'Northern Province',
      x: 325,
      y: 145,
      threatLevel: 'ELEVATED',
      activeAttacksCount: 22,
      primaryVector: 'Tourism Tender Impersonation Scams',
      carrierTarget: 'Hospitality Web Endpoints',
      advice: 'Confirm business tender codes directly through the official e-Procurement portal.',
      pulseSpeed: 'normal',
    },
    {
      id: 'rubavu',
      name: 'Rubavu (Gisenyi)',
      province: 'Western Province',
      x: 195,
      y: 175,
      threatLevel: 'HIGH',
      activeAttacksCount: 34,
      primaryVector: 'Cross-Border MoMo Currency Arbitrage Phish',
      carrierTarget: 'Border Mobile Money Agents',
      advice: 'Only exchange money through licensed forex and regulated telecom kiosks.',
      pulseSpeed: 'fast',
    },
    {
      id: 'huye',
      name: 'Huye (Butare)',
      province: 'Southern Province',
      x: 335,
      y: 400,
      threatLevel: 'ELEVATED',
      activeAttacksCount: 19,
      primaryVector: 'Student Loan & University Grant Fraud',
      carrierTarget: 'Campus WiFi & SACCO Relays',
      advice: 'Official student disbursements are never sent via private personal WhatsApp.',
      pulseSpeed: 'normal',
    },
    {
      id: 'rwamagana',
      name: 'Rwamagana',
      province: 'Eastern Province',
      x: 520,
      y: 260,
      threatLevel: 'MODERATE',
      activeAttacksCount: 14,
      primaryVector: 'Agro-Commodity Advance Payment Scams',
      carrierTarget: 'Eastern Transit Fiber Substation',
      advice: 'Use escrow or cash-on-delivery inspection for heavy agricultural supplies.',
      pulseSpeed: 'slow',
    },
    {
      id: 'rusizi',
      name: 'Rusizi (Cyangugu)',
      province: 'Western Province',
      x: 155,
      y: 440,
      threatLevel: 'ELEVATED',
      activeAttacksCount: 21,
      primaryVector: 'SIM Card Swap & Agent Cashout Probes',
      carrierTarget: 'Southwest Border Gateway',
      advice: 'Contact your telecom immediately if your phone suddenly loses cellular network.',
      pulseSpeed: 'normal',
    },
    {
      id: 'nyagatare',
      name: 'Nyagatare',
      province: 'Eastern Province',
      x: 590,
      y: 105,
      threatLevel: 'MODERATE',
      activeAttacksCount: 12,
      primaryVector: 'Livestock Trading Phishing SMS',
      carrierTarget: 'Agritech Micro-Nodes',
      advice: 'Double check sender numbers before approving Mobile Money payments.',
      pulseSpeed: 'slow',
    },
    {
      id: 'bugesera',
      name: 'Bugesera',
      province: 'Eastern Province',
      x: 475,
      y: 350,
      threatLevel: 'GUARDED',
      activeAttacksCount: 8,
      primaryVector: 'Airport Logistics Parcel Impersonation',
      carrierTarget: 'Cargo Tracking Relays',
      advice: 'Rwanda customs (RRA) will never demand instant fines via private phone numbers.',
      pulseSpeed: 'slow',
    },
    {
      id: 'muhanga',
      name: 'Muhanga',
      province: 'Southern Province',
      x: 345,
      y: 275,
      threatLevel: 'MODERATE',
      activeAttacksCount: 11,
      primaryVector: 'Transport Courier Payment Spoofing',
      carrierTarget: 'Highway Transport Backbone',
      advice: 'Verify ride or courier bookings exclusively within verified applications.',
      pulseSpeed: 'slow',
    },
  ]);

  const [selectedNode, setSelectedNode] = useState<ThreatNode>(nodes[0]);
  const [vectorFilter, setVectorFilter] = useState<'ALL' | 'MOMO' | 'PHISHING' | 'SIM_SWAP'>('ALL');
  const [neutralizedCount, setNeutralizedCount] = useState<number>(14892);
  const [radarPulse, setRadarPulse] = useState(0);

  // Interactive Zoom & Pan Controls State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeCluster, setActiveCluster] = useState<string>('NATIONWIDE');

  // Zoom control actions
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(4.5, Number((prev + 0.35).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(1, Number((prev - 0.35).toFixed(2)));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoomPan = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActiveCluster('NATIONWIDE');
  };

  // Quick Regional Threat Cluster Focus Presets
  const focusCluster = (clusterKey: string) => {
    setActiveCluster(clusterKey);
    switch (clusterKey) {
      case 'KIGALI':
        setZoom(2.6);
        setPan({ x: -45, y: -20 });
        const kgl = nodes.find((n) => n.id === 'gasabo') || nodes[0];
        setSelectedNode(kgl);
        break;
      case 'NORTH':
        setZoom(2.5);
        setPan({ x: 190, y: 250 });
        const nth = nodes.find((n) => n.id === 'musanze') || nodes[0];
        setSelectedNode(nth);
        break;
      case 'WEST':
        setZoom(2.5);
        setPan({ x: 470, y: 190 });
        const wst = nodes.find((n) => n.id === 'rubavu') || nodes[0];
        setSelectedNode(wst);
        break;
      case 'SOUTH':
        setZoom(2.4);
        setPan({ x: 165, y: -300 });
        const sth = nodes.find((n) => n.id === 'huye') || nodes[0];
        setSelectedNode(sth);
        break;
      case 'EAST':
        setZoom(2.3);
        setPan({ x: -245, y: -10 });
        const est = nodes.find((n) => n.id === 'rwamagana') || nodes[0];
        setSelectedNode(est);
        break;
      case 'NATIONWIDE':
      default:
        handleResetZoomPan();
        break;
    }
  };

  // Mouse drag & pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const maxBound = 420 * (zoom - 0.7);
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPan({
      x: Math.max(-maxBound, Math.min(maxBound, newX)),
      y: Math.max(-maxBound, Math.min(maxBound, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Only zoom when mouse is over canvas
    const zoomDelta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoom((prev) => {
      const nextZoom = Math.max(1, Math.min(4.5, Number((prev + zoomDelta).toFixed(2))));
      if (nextZoom === 1) setPan({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  // Touch pan support for mobile/tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const maxBound = 420 * (zoom - 0.7);
    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;
    setPan({
      x: Math.max(-maxBound, Math.min(maxBound, newX)),
      y: Math.max(-maxBound, Math.min(maxBound, newY)),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const clusterTabs = [
    { id: 'NATIONWIDE', label: { rw: 'Igihugu Cyose', en: 'Nationwide (1.0x)', fr: 'Tout le Rwanda', sw: 'Rwanda Yote' } },
    { id: 'KIGALI', label: { rw: 'Umujyi wa Kigali', en: 'Kigali Hub (2.6x)', fr: 'Agglomération Kigali', sw: 'Kigali Hub' } },
    { id: 'NORTH', label: { rw: 'Amajyaruguru (Musanze)', en: 'Northern Volcano', fr: 'Nord des Volcans', sw: 'Kaskazini (Musanze)' } },
    { id: 'WEST', label: { rw: 'Iburengerazuba (Kivu)', en: 'Western Kivu', fr: 'Cluster Kivu Ouest', sw: 'Magharibi (Kivu)' } },
    { id: 'SOUTH', label: { rw: 'Amajyepfo (Huye)', en: 'Southern Academic', fr: 'Sud Académique', sw: 'Kusini (Huye)' } },
    { id: 'EAST', label: { rw: 'Iburasirazuba', en: 'Eastern Agro', fr: 'Est Agricole', sw: 'Mashariki' } },
  ];

  // Real-time animated attack trajectories (arcs shooting from edges into Rwanda)
  const [attacks, setAttacks] = useState<SimulatedAttackTrajectory[]>([
    {
      id: 'atk-kgl-1',
      sourceLabel: 'Offshore Botnet [Ingress DE]',
      sourceCoords: { x: 50, y: 80 },
      targetNodeId: 'gasabo',
      targetCoords: { x: 435, y: 250 },
      vectorType: 'MoMo API Flood',
      color: '#f43f5e',
      progress: 0.72,
    },
    {
      id: 'atk-rbv-2',
      sourceLabel: 'Cross-Border Proxy Relay',
      sourceCoords: { x: 40, y: 220 },
      targetNodeId: 'rubavu',
      targetCoords: { x: 195, y: 175 },
      vectorType: 'SIM Reversal Probe',
      color: '#06b6d4',
      progress: 0.44,
    },
    {
      id: 'atk-kgl-3',
      sourceLabel: 'Spoofed SMPP SMS Gateway',
      sourceCoords: { x: 760, y: 120 },
      targetNodeId: 'nyarugenge',
      targetCoords: { x: 410, y: 268 },
      vectorType: 'Irembo Phish Lure',
      color: '#a855f7',
      progress: 0.88,
    },
    {
      id: 'atk-hye-4',
      sourceLabel: 'Compromised Micro-Host',
      sourceCoords: { x: 740, y: 450 },
      targetNodeId: 'huye',
      targetCoords: { x: 335, y: 400 },
      vectorType: 'Credential Harvesting',
      color: '#f59e0b',
      progress: 0.28,
    },
    {
      id: 'atk-msz-5',
      sourceLabel: 'Punycode Typo Cluster',
      sourceCoords: { x: 490, y: 20 },
      targetNodeId: 'musanze',
      targetCoords: { x: 325, y: 145 },
      vectorType: 'WhatsApp Hijack Code',
      color: '#38bdf8',
      progress: 0.58,
    },
  ]);

  // Dynamic animation loop for attack projectile progression
  useEffect(() => {
    const timer = setInterval(() => {
      setAttacks((prev) =>
        prev.map((atk) => {
          const nextProg = atk.progress >= 1 ? 0.05 : atk.progress + 0.025;
          return { ...atk, progress: nextProg };
        })
      );
    }, 60);

    return () => clearInterval(timer);
  }, []);

  // Ticking attack neutralization counter
  useEffect(() => {
    const counterTimer = setInterval(() => {
      setNeutralizedCount((c) => c + 1);
    }, 4200);

    const radarTimer = setInterval(() => {
      setRadarPulse((p) => (p + 1) % 100);
    }, 2000);

    return () => {
      clearInterval(counterTimer);
      clearInterval(radarTimer);
    };
  }, []);

  const getThreatStyle = (level: ThreatNode['threatLevel']) => {
    switch (level) {
      case 'HIGH':
        return {
          fill: '#f43f5e',
          stroke: '#fda4af',
          glow: 'rgba(244, 63, 94, 0.8)',
          badge: 'bg-rose-950/80 text-rose-300 border-rose-600',
          pingClass: 'text-rose-500',
        };
      case 'ELEVATED':
        return {
          fill: '#f59e0b',
          stroke: '#fde68a',
          glow: 'rgba(245, 158, 11, 0.8)',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-600',
          pingClass: 'text-amber-500',
        };
      case 'MODERATE':
        return {
          fill: '#eab308',
          stroke: '#fef08a',
          glow: 'rgba(234, 179, 8, 0.7)',
          badge: 'bg-yellow-950/80 text-yellow-300 border-yellow-600',
          pingClass: 'text-yellow-500',
        };
      case 'GUARDED':
      default:
        return {
          fill: '#00f0ff',
          stroke: '#bae6fd',
          glow: 'rgba(0, 240, 255, 0.8)',
          badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-600',
          pingClass: 'text-cyan-400',
        };
    }
  };

  // Provinces of Rwanda for SVG silhouette background
  const provinces = [
    {
      id: 'northern',
      name: 'Northern Province (Amajyaruguru)',
      d: 'M 290 120 L 370 70 L 450 85 L 510 150 L 470 215 L 375 225 L 305 180 Z',
      stroke: '#06b6d4',
      fill: 'rgba(6, 182, 212, 0.08)',
    },
    {
      id: 'western',
      name: 'Western Province (Iburengerazuba)',
      d: 'M 170 150 L 290 120 L 305 180 L 260 250 L 225 365 L 140 435 L 145 470 L 190 410 L 205 290 L 165 200 Z',
      stroke: '#3b82f6',
      fill: 'rgba(59, 130, 246, 0.08)',
    },
    {
      id: 'southern',
      name: 'Southern Province (Amajyepfo)',
      d: 'M 305 180 L 375 225 L 400 270 L 390 350 L 380 470 L 265 470 L 225 365 L 260 250 Z',
      stroke: '#a855f7',
      fill: 'rgba(168, 85, 247, 0.08)',
    },
    {
      id: 'kigali',
      name: 'Kigali City (Umujyi wa Kigali)',
      d: 'M 390 240 L 455 235 L 465 295 L 405 305 Z',
      stroke: '#00f0ff',
      fill: 'rgba(0, 240, 255, 0.22)',
    },
    {
      id: 'eastern',
      name: 'Eastern Province (Iburasirazuba)',
      d: 'M 510 150 L 630 65 L 680 140 L 610 230 L 710 320 L 670 410 L 520 400 L 455 340 L 465 295 L 455 235 L 510 150 Z',
      stroke: '#10b981',
      fill: 'rgba(16, 185, 129, 0.08)',
    },
  ];

  // Key Lakes in Rwanda (Lake Kivu on west, Lake Muhazi in east)
  const lakes = [
    {
      name: 'Lake Kivu',
      d: 'M 145 160 Q 155 220 180 270 Q 165 340 135 430 Q 120 410 130 330 Q 140 250 135 180 Z',
    },
    {
      name: 'Lake Muhazi',
      d: 'M 490 220 Q 530 225 560 220 Q 580 225 570 230 Q 530 235 490 225 Z',
    },
  ];

  const filteredNodes = nodes.filter((node) => {
    if (vectorFilter === 'MOMO') return node.primaryVector.toLowerCase().includes('momo');
    if (vectorFilter === 'PHISHING') return node.primaryVector.toLowerCase().includes('phish');
    if (vectorFilter === 'SIM_SWAP') return node.primaryVector.toLowerCase().includes('sim') || node.primaryVector.toLowerCase().includes('whatsapp');
    return true;
  });

  return (
    <div className="bg-[#050b17] border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-[#09152b] via-[#0d1d3a] to-[#09152b] border-b border-cyan-900/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#030712] border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-xl shadow-cyan-950">
            <Radio className="w-6 h-6 animate-pulse text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black font-mono text-white tracking-wider">
                RWANDA CYBER THREAT RADAR MAP
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Real-time Ingress Threat Trajectories & Regional Defense Node Telemetry
            </p>
          </div>
        </div>

        {/* Live Attack Intercept Counter */}
        <div className="flex items-center gap-4 bg-[#030712]/80 border border-cyan-900/70 rounded-xl px-4 py-2 font-mono">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block tracking-wider">
              Attacks Neutralized Today
            </span>
            <span className="text-lg sm:text-xl font-black text-cyan-300 tracking-tight">
              {neutralizedCount.toLocaleString()}
            </span>
          </div>
          <div className="h-7 w-px bg-slate-800" />
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 uppercase block tracking-wider">
              Defense Posture
            </span>
            <span className="text-sm font-bold text-emerald-400">DEFCON 4</span>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar & Cluster Selector */}
      <div className="bg-[#040813] border-b border-slate-800/80 px-4 py-2.5 space-y-2 text-xs font-mono">
        {/* Row 1: Threat Vector Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Threat Vector:</span>
            </span>
            <button
              onClick={() => setVectorFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition ${
                vectorFilter === 'ALL'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              All Vectors ({nodes.length})
            </button>
            <button
              onClick={() => setVectorFilter('MOMO')}
              className={`px-2.5 py-1 rounded-lg transition ${
                vectorFilter === 'MOMO'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              MoMo & Banking
            </button>
            <button
              onClick={() => setVectorFilter('PHISHING')}
              className={`px-2.5 py-1 rounded-lg transition ${
                vectorFilter === 'PHISHING'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              Phishing & Portals
            </button>
            <button
              onClick={() => setVectorFilter('SIM_SWAP')}
              className={`px-2.5 py-1 rounded-lg transition ${
                vectorFilter === 'SIM_SWAP'
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              SIM & WhatsApp
            </button>
          </div>

          <span className="text-[11px] text-cyan-400/80 hidden md:inline">
            Click any pulsing node or drag map to inspect localized threat clusters
          </span>
        </div>

        {/* Row 2: Regional Cluster Quick-Focus Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-900">
          <span className="text-slate-400 flex items-center gap-1 mr-1 text-[11px]">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Regional Cluster Focus:</span>
          </span>
          {clusterTabs.map((c) => (
            <button
              key={c.id}
              onClick={() => focusCluster(c.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition flex items-center gap-1 ${
                activeCluster === c.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 font-bold shadow-sm shadow-cyan-950'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{c.label[language] || c.label.en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: SVG Map Canvas (Left 8 Cols) + Interactive Telemetry Inspector (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-[#030712]">
        {/* Responsive SVG Map Overlay Canvas with Zoom & Pan listeners */}
        <div 
          className={`lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/9] min-h-[420px] max-h-[600px] flex items-center justify-center p-2 sm:p-4 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800 select-none ${
            isDragging ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-crosshair'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Subtle Tactical Cyber Matrix Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff07_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff07_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] pointer-events-none" />

          {/* Radial Center Ambient Glow */}
          <div className="absolute w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          {/* Floating High-Tech Zoom & Pan Control Pad (Top-Right) */}
          <div 
            className="absolute top-4 right-4 z-20 flex flex-col items-center gap-1.5 p-1.5 bg-[#070e1e]/90 border border-cyan-500/60 backdrop-blur-md rounded-2xl shadow-2xl shadow-cyan-950/80"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Zoom In Button */}
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 4.5}
              className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 flex items-center justify-center transition disabled:opacity-30 disabled:pointer-events-none"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Current Zoom Readout Badge */}
            <div 
              onClick={handleResetZoomPan}
              className="px-2 py-0.5 rounded-lg bg-black/60 border border-cyan-900/80 text-[10px] font-mono font-bold text-cyan-300 cursor-pointer hover:border-cyan-400 transition"
              title="Click to reset zoom (100%)"
            >
              {Math.round(zoom * 100)}%
            </div>

            {/* Zoom Out Button */}
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 flex items-center justify-center transition disabled:opacity-30 disabled:pointer-events-none"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Reset / Recenter Button */}
            <button
              onClick={handleResetZoomPan}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition ${
                zoom > 1 || pan.x !== 0 || pan.y !== 0
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950 animate-pulse'
                  : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Reset View / Recenter Rwanda"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Pan Drag Mode Indicator */}
            <div 
              className={`w-8 h-6 rounded-lg flex items-center justify-center text-[10px] ${
                zoom > 1 ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-500 bg-slate-950'
              }`}
              title={zoom > 1 ? 'Pan Mode Active (Drag canvas to move)' : 'Default view'}
            >
              <Move className="w-3.5 h-3.5" />
            </div>
          </div>

          <svg
            viewBox="0 0 820 520"
            className="w-full h-full select-none"
            style={{ filter: 'drop-shadow(0 0 20px rgba(0, 240, 255, 0.08))' }}
          >
            <defs>
              <filter id="mapNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <radialGradient id="targetShieldGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Interactive Zoom & Pan SVG Layer Group */}
            <g
              id="interactive-zoom-pan-layer"
              transform={`translate(${410 + pan.x}, ${260 + pan.y}) scale(${zoom}) translate(-410, -260)`}
              style={{
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Radar Coordinates & Distance Concentric Rings */}
              <g transform="translate(425, 260)" opacity="0.25">
              <circle cx="0" cy="0" r="120" fill="none" stroke="#00f0ff" strokeWidth="0.7" strokeDasharray="3 6" />
              <circle cx="0" cy="0" r="240" fill="none" stroke="#00f0ff" strokeWidth="0.7" strokeDasharray="4 8" />
              <line x1="-380" y1="0" x2="380" y2="0" stroke="#00f0ff" strokeWidth="0.5" strokeDasharray="2 4" />
              <line x1="0" y1="-260" x2="0" y2="260" stroke="#00f0ff" strokeWidth="0.5" strokeDasharray="2 4" />
            </g>

            {/* Rwanda Provinces Polygons */}
            <g id="provinces-layer">
              {provinces.map((prov) => (
                <path
                  key={prov.id}
                  d={prov.d}
                  fill={prov.fill}
                  stroke={prov.stroke}
                  strokeWidth="1.2"
                  strokeDasharray="4 2"
                  className="transition-colors duration-300 hover:fill-opacity-25"
                >
                  <title>{prov.name}</title>
                </path>
              ))}
            </g>

            {/* Rwanda Water Bodies */}
            <g id="lakes-layer" opacity="0.65">
              {lakes.map((lake, idx) => (
                <path
                  key={idx}
                  d={lake.d}
                  fill="#0e2444"
                  stroke="#1e3a8a"
                  strokeWidth="0.8"
                >
                  <title>{lake.name}</title>
                </path>
              ))}
            </g>

            {/* Simulated Cyberattack Trajectory Arcs */}
            <g id="attack-trajectories">
              {attacks.map((atk) => {
                const midX = (atk.sourceCoords.x + atk.targetCoords.x) / 2;
                const midY = Math.min(atk.sourceCoords.y, atk.targetCoords.y) - 50;
                const curvePath = `M ${atk.sourceCoords.x} ${atk.sourceCoords.y} Q ${midX} ${midY} ${atk.targetCoords.x} ${atk.targetCoords.y}`;

                // Calculate projectile position
                const tVal = atk.progress;
                const pX =
                  Math.pow(1 - tVal, 2) * atk.sourceCoords.x +
                  2 * (1 - tVal) * tVal * midX +
                  Math.pow(tVal, 2) * atk.targetCoords.x;
                const pY =
                  Math.pow(1 - tVal, 2) * atk.sourceCoords.y +
                  2 * (1 - tVal) * tVal * midY +
                  Math.pow(tVal, 2) * atk.targetCoords.y;

                return (
                  <g key={atk.id}>
                    {/* Underlying trajectory dash line */}
                    <path
                      d={curvePath}
                      fill="none"
                      stroke={atk.color}
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      opacity="0.35"
                    />

                    {/* Threat Source Pin outside Rwanda */}
                    <circle
                      cx={atk.sourceCoords.x}
                      cy={atk.sourceCoords.y}
                      r="3.5"
                      fill={atk.color}
                      stroke="#ffffff"
                      strokeWidth="0.8"
                    />
                    <text
                      x={atk.sourceCoords.x}
                      y={atk.sourceCoords.y - 7}
                      fill="#94a3b8"
                      fontSize="8.5"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {atk.sourceLabel}
                    </text>

                    {/* Animated Projectile Bullet */}
                    <circle
                      cx={pX}
                      cy={pY}
                      r="4"
                      fill={atk.color}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      filter="url(#mapNeonGlow)"
                    />
                  </g>
                );
              })}
            </g>

            {/* Pulse Animations & Interactive Threat Nodes */}
            <g id="threat-nodes">
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const style = getThreatStyle(node.threatLevel);
                const isCapital = node.id === 'gasabo' || node.id === 'nyarugenge' || node.id === 'kicukiro';

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing Outer Rings */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isCapital ? 22 : 16}
                      fill="none"
                      stroke={style.stroke}
                      strokeWidth="1.5"
                      opacity="0.75"
                      className="animate-ping"
                      style={{
                        transformOrigin: `${node.x}px ${node.y}px`,
                        animationDuration: node.pulseSpeed === 'fast' ? '1.8s' : '3s',
                      }}
                    />

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isCapital ? 14 : 10}
                      fill="none"
                      stroke={style.stroke}
                      strokeWidth="1"
                      opacity="0.5"
                    />

                    {/* Selected Active Halo */}
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isCapital ? 26 : 20}
                        fill="none"
                        stroke="#00f0ff"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        className="animate-spin"
                        style={{
                          transformOrigin: `${node.x}px ${node.y}px`,
                          animationDuration: '6s',
                        }}
                      />
                    )}

                    {/* Solid Node Center */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isCapital ? 7 : 5}
                      fill={style.fill}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 2 : 1}
                      filter="url(#mapNeonGlow)"
                      className="transition-transform group-hover:scale-125"
                      style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                    />

                    {/* Node District Label */}
                    <text
                      x={node.x}
                      y={node.y + (isCapital ? 18 : 14)}
                      fill={isSelected ? '#00f0ff' : '#cbd5e1'}
                      fontSize={isCapital ? '9.5' : '8.5'}
                      fontWeight={isSelected || isCapital ? 'bold' : 'normal'}
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow"
                    >
                      {node.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </g>
            {/* End threat-nodes */}
            </g>
            {/* End interactive-zoom-pan-layer */}

            {/* Tactical Grid Footnote */}
            <text
              x="800"
              y="505"
              fill="#475569"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="end"
            >
              RWANDA NATIONAL CYBER GRID • NCSA / BNR PROTECTED
            </text>
          </svg>

          {/* Mini Inset Floating Status & Cluster Telemetry (Bottom-Left) */}
          <div className="absolute bottom-4 left-4 z-20 bg-[#081224]/95 border border-cyan-900/80 backdrop-blur-md rounded-2xl p-3 text-[11px] font-mono space-y-1.5 shadow-2xl max-w-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-cyan-300 font-bold flex items-center gap-1.5 uppercase text-[10px]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-ping" />
                Active Cluster: {activeCluster}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-800">
                {zoom.toFixed(1)}x Zoom
              </span>
            </div>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              {zoom > 1
                ? 'Pan Mode: Drag canvas to navigate clusters. Click nodes to inspect.'
                : 'Interactive Mode: Scroll wheel or buttons to zoom in. Click clusters above.'}
            </p>
          </div>
        </div>

        {/* Selected Node Inspector Drawer (Right 4 Cols) */}
        <div className="lg:col-span-4 p-5 sm:p-6 bg-[#070e1e] space-y-5 flex flex-col justify-between">
          <div className="space-y-4 font-mono">
            {/* Header of Inspector */}
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">
                  DISTRICT THREAT TELEMETRY
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>{selectedNode.name}</span>
                </h3>
                <span className="text-xs text-slate-400">{selectedNode.province}</span>
              </div>

              <span className={`text-[10px] px-2.5 py-1 rounded font-bold border ${getThreatStyle(selectedNode.threatLevel).badge}`}>
                {selectedNode.threatLevel} RISK
              </span>
            </div>

            {/* Threat Statistics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#0a1428] border border-slate-800 rounded-xl space-y-0.5">
                <span className="text-[10px] text-slate-400 block uppercase">Threats Flagged</span>
                <span className="text-xl font-bold text-rose-400">{selectedNode.activeAttacksCount}</span>
                <span className="text-[9px] text-slate-500 block">Neutralized in last 24h</span>
              </div>

              <div className="p-3 bg-[#0a1428] border border-slate-800 rounded-xl space-y-0.5">
                <span className="text-[10px] text-slate-400 block uppercase">Infrastructure</span>
                <span className="text-xs font-bold text-cyan-300 block truncate">{selectedNode.carrierTarget}</span>
                <span className="text-[9px] text-emerald-400 block">Encrypted Gateway</span>
              </div>
            </div>

            {/* Primary Vector Description */}
            <div className="p-3.5 bg-[#0a1428] border border-cyan-950 rounded-xl space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Primary Attack Vector Observed:</span>
              </span>
              <p className="text-xs font-bold text-white leading-snug">
                {selectedNode.primaryVector}
              </p>
            </div>

            {/* Direct Citizen Protection Advice */}
            <div className="p-3.5 bg-gradient-to-br from-[#0c1930] to-[#07101f] border border-cyan-800/50 rounded-xl space-y-1.5">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Immediate Citizen Shield Guidance:</span>
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedNode.advice}
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            {onExploreScanner && (
              <button
                onClick={onExploreScanner}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-600/60 hover:border-cyan-400 text-cyan-200 rounded-xl text-xs font-bold font-mono transition shadow-lg shadow-cyan-950/50"
              >
                <span>Inspect Suspicious Message in {selectedNode.name.split(' ')[0]}</span>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>
            )}

            {onExploreReport && (
              <button
                onClick={onExploreReport}
                className="w-full flex items-center justify-between px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono transition"
              >
                <span>Report Incident to Police / RIB</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
