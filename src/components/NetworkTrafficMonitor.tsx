import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Wifi, 
  Server, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  RefreshCw,
  Sliders,
  Play,
  Pause,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../translations';

interface NetworkTrafficMonitorProps {
  language: LanguageCode;
}

export const NetworkTrafficMonitor: React.FC<NetworkTrafficMonitorProps> = ({ language }) => {
  const t = translations[language];
  const [isRunning, setIsRunning] = useState(true);
  const [bandwidthGbps, setBandwidthGbps] = useState(42.8);
  const [packetsPerSec, setPacketsPerSec] = useState(184200);
  const [latencyMs, setLatencyMs] = useState(3.4);
  const [droppedThreatsPerSec, setDroppedThreatsPerSec] = useState(148);
  const [isSpikeActive, setIsSpikeActive] = useState(false);

  // Wave points history for canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataPointsRef = useRef<number[]>(Array(50).fill(50));

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Fluctuate stats naturally
      const spikeFactor = isSpikeActive ? 2.4 : 1.0;
      const baseGbps = (38 + Math.random() * 8) * spikeFactor;
      const basePps = Math.floor((170000 + Math.random() * 25000) * spikeFactor);
      const baseLatency = Number((2.8 + Math.random() * 1.2 * spikeFactor).toFixed(1));
      const baseDropped = Math.floor((120 + Math.random() * 60) * spikeFactor);

      setBandwidthGbps(Number(baseGbps.toFixed(1)));
      setPacketsPerSec(basePps);
      setLatencyMs(baseLatency);
      setDroppedThreatsPerSec(baseDropped);

      // Push new data point to queue
      const normalizedHeight = Math.min(95, Math.max(15, (baseGbps / (isSpikeActive ? 120 : 60)) * 60 + Math.random() * 10));
      dataPointsRef.current.shift();
      dataPointsRef.current.push(normalizedHeight);

      // Redraw canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          ctx.clearRect(0, 0, width, height);

          // Grid lines
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
          ctx.lineWidth = 1;
          for (let y = 20; y < height; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }

          // Draw neon wave line
          const points = dataPointsRef.current;
          const step = width / (points.length - 1);

          ctx.beginPath();
          ctx.moveTo(0, height - (points[0] / 100) * height);
          for (let i = 1; i < points.length; i++) {
            const x = i * step;
            const y = height - (points[i] / 100) * height;
            ctx.lineTo(x, y);
          }

          ctx.strokeStyle = isSpikeActive ? '#f43f5e' : '#00f0ff';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = isSpikeActive ? 'rgba(244, 63, 94, 0.8)' : 'rgba(0, 240, 255, 0.8)';
          ctx.shadowBlur = 10;
          ctx.stroke();

          // Gradient fill under the line
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          if (isSpikeActive) {
            gradient.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
            gradient.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
          } else {
            gradient.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
            gradient.addColorStop(1, 'rgba(0, 240, 255, 0.0)');
          }
          ctx.fillStyle = gradient;
          ctx.fill();

          // Reset shadow
          ctx.shadowBlur = 0;
        }
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, isSpikeActive]);

  const protocols = [
    { name: 'TLS 1.3 / HTTPS (e-Gov, Irembo, Banking)', share: 58, rate: `${(bandwidthGbps * 0.58).toFixed(1)} Gbps`, color: 'bg-cyan-400' },
    { name: 'MoMo USSD & Open API (MTN & Airtel)', share: 22, rate: `${(bandwidthGbps * 0.22).toFixed(1)} Gbps`, color: 'bg-emerald-400' },
    { name: 'BNR Interbank Switch (RISS / ISO 8583)', share: 11, rate: `${(bandwidthGbps * 0.11).toFixed(1)} Gbps`, color: 'bg-blue-400' },
    { name: 'DNS-over-HTTPS & NTP Sync', share: 6, rate: `${(bandwidthGbps * 0.06).toFixed(1)} Gbps`, color: 'bg-indigo-400' },
    { name: 'Mitigated Malicious Probes (DDoS / Scans)', share: 3, rate: `${(bandwidthGbps * 0.03).toFixed(1)} Gbps`, color: 'bg-rose-500' },
  ];

  return (
    <div className="bg-[#070e1e] border border-cyan-900/60 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Background Cyber Ambient */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Live Status & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-950">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-mono text-white tracking-wider">
                NATIONAL TELECOM & DATA TRAFFIC MONITOR
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                isSpikeActive
                  ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-600'
              }`}>
                {isSpikeActive ? 'ANOMALY DETECTED' : 'NOMINAL INGRESS'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Aggregated Fiber Backbone Telemetry: Kigali Core, Musanze, Rubavu, Huye & Rwamagana
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSpikeActive(!isSpikeActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border ${
              isSpikeActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-950'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>{isSpikeActive ? 'Clear Threat Simulation' : 'Simulate Ingress Surge'}</span>
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            title={isRunning ? 'Pause Stream' : 'Resume Stream'}
          >
            {isRunning ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0a1428] border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">THROUGHPUT BANDWIDTH</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-cyan-300">
              {bandwidthGbps}
            </span>
            <span className="text-xs text-slate-400 font-mono">Gbps</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Peak Fiber Capacity: 100G
          </span>
        </div>

        <div className="p-4 bg-[#0a1428] border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">PACKET VELOCITY</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-white">
              {(packetsPerSec / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-400 font-mono">pkts/sec</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">Zero buffer drops</span>
        </div>

        <div className="p-4 bg-[#0a1428] border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">BACKBONE LATENCY</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-emerald-400">
              {latencyMs}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Sub-5ms SLA guarantee</span>
        </div>

        <div className="p-4 bg-[#0a1428] border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] text-slate-400 font-mono">BLOCKED THREAT FRAMES</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-rose-400">
              {droppedThreatsPerSec}
            </span>
            <span className="text-xs text-slate-400 font-mono">drops/s</span>
          </div>
          <span className="text-[10px] text-rose-300 font-mono">AI autonomous firewall</span>
        </div>
      </div>

      {/* Real-time Oscilloscope Waveform Canvas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>REAL-TIME INGRESS OSCILLOSCOPE (50-SAMPLE WINDOW)</span>
          </span>
          <span>RESOLUTION: 200ms • BGP PEERING LEVEL</span>
        </div>

        <div className="relative h-44 w-full bg-[#040813] border border-cyan-950 rounded-xl overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={176}
            className="w-full h-full block"
          />
        </div>
      </div>

      {/* Protocol Distribution Inspection */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
          DEEP PACKET INSPECTION (DPI) PROTOCOL BREAKDOWN
        </h4>

        <div className="space-y-2.5">
          {protocols.map((proto, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">{proto.name}</span>
                <span className="text-cyan-300 font-bold">{proto.rate} ({proto.share}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full ${proto.color} transition-all duration-500`}
                  style={{ width: `${proto.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
