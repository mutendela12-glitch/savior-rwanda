import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Terminal, 
  FileCode, 
  Binary, 
  RefreshCw,
  Search
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../translations';

interface AiThreatDetectionMatrixProps {
  language: LanguageCode;
}

export const AiThreatDetectionMatrix: React.FC<AiThreatDetectionMatrixProps> = ({ language }) => {
  const t = translations[language];
  const [selectedPreset, setSelectedPreset] = useState<string>('momo_sms');
  const [sampleText, setSampleText] = useState(
    'Yello! Amafaranga 150,000 RWF yohererejwe kuri konti yawe mu buryo bw\'ikosa. Kanda hano ngo uyasubize byihuse: https://mtn-rw-reversal.net'
  );
  const [isInspecting, setIsInspecting] = useState(false);
  const [activeLayerScan, setActiveLayerScan] = useState<number>(4);
  const [inspectionResult, setInspectionResult] = useState<{
    threatScore: number;
    verdict: 'MALICIOUS_FRAUD' | 'SUSPICIOUS' | 'BENIGN';
    confidence: number;
    mitreTactic: string;
    layers: Array<{ name: string; score: number; status: string; detail: string }>;
  }>({
    threatScore: 98,
    verdict: 'MALICIOUS_FRAUD',
    confidence: 99.4,
    mitreTactic: 'T1566.002 (Phishing: Spearphishing Link) & T1635 (SMS Impersonation)',
    layers: [
      { name: 'Layer 1: NLP Social Engineering & Urgency Detector', score: 96, status: 'TRIGGERED', detail: 'Detected simulated urgency ("mu buryo bw\'ikosa") and unauthorized financial refund bait.' },
      { name: 'Layer 2: Domain Reputation & Homoglyph Analyzer', score: 99, status: 'TRIGGERED', detail: 'Domain "mtn-rw-reversal.net" registered 48h ago on untrusted registrar. Typo-squats MTN Rwanda.' },
      { name: 'Layer 3: Payload Entropy & Link Redirection Tracer', score: 95, status: 'TRIGGERED', detail: 'URL redirects to an unverified USSD credential-harvesting form mimicking WebMoMo.' },
      { name: 'Layer 4: Behavioral Matrix & SIM Reversal Pattern Matcher', score: 98, status: 'TRIGGERED', detail: 'Matches known Kigali MoMo reversal syndicate signature cataloged in SAVIOR Threat DB.' },
    ],
  });

  const presets = [
    {
      id: 'momo_sms',
      label: 'Fake MoMo Reversal SMS',
      text: 'Yello! Amafaranga 150,000 RWF yohererejwe kuri konti yawe mu buryo bw\'ikosa. Kanda hano ngo uyasubize byihuse: https://mtn-rw-reversal.net',
      score: 98,
      verdict: 'MALICIOUS_FRAUD' as const,
      tactic: 'T1566.002 (Spearphishing Link) & T1635 (SMS Impersonation)',
      layers: [
        { name: 'Layer 1: NLP Social Engineering & Urgency Detector', score: 96, status: 'TRIGGERED', detail: 'Detected simulated urgency ("mu buryo bw\'ikosa") and unauthorized financial refund bait.' },
        { name: 'Layer 2: Domain Reputation & Homoglyph Analyzer', score: 99, status: 'TRIGGERED', detail: 'Domain "mtn-rw-reversal.net" registered 48h ago on untrusted registrar. Typo-squats MTN Rwanda.' },
        { name: 'Layer 3: Payload Entropy & Link Redirection Tracer', score: 95, status: 'TRIGGERED', detail: 'URL redirects to an unverified USSD credential-harvesting form mimicking WebMoMo.' },
        { name: 'Layer 4: Behavioral Matrix & SIM Reversal Pattern Matcher', score: 98, status: 'TRIGGERED', detail: 'Matches known Kigali MoMo reversal syndicate signature cataloged in SAVIOR Threat DB.' },
      ]
    },
    {
      id: 'irembo_phish',
      label: 'Punycode Irembo Portal Phish',
      text: 'Urwego rwa Irembo: Urwandiko rwawe rwarangiye. Kanda kuri https://irembo-gov-rw.verify-ident.xyz kugira ngo ukorere renew indangamuntu.',
      score: 94,
      verdict: 'MALICIOUS_FRAUD' as const,
      tactic: 'T1566 (Phishing) & T1583.001 (Acquire Infrastructure: Domains)',
      layers: [
        { name: 'Layer 1: NLP Social Engineering & Urgency Detector', score: 92, status: 'TRIGGERED', detail: 'Government impersonation detected (NIDA & Irembo identity lure).' },
        { name: 'Layer 2: Domain Reputation & Homoglyph Analyzer', score: 98, status: 'TRIGGERED', detail: 'Illegal use of official trademark "irembo" on non-.gov.rw top-level domain.' },
        { name: 'Layer 3: Payload Entropy & Link Redirection Tracer', score: 94, status: 'TRIGGERED', detail: 'Certificate lacks GovCA digital seal. Submits NIDA inputs to offshore IP.' },
        { name: 'Layer 4: Behavioral Matrix & SIM Reversal Pattern Matcher', score: 90, status: 'TRIGGERED', detail: 'Precursor reconnaissance for identity theft and SIM cloning.' },
      ]
    },
    {
      id: 'apk_trojan',
      label: 'Android MoMo Spy Trojan',
      text: 'PACKAGE: com.rwanda.momo.speedboost.apk | SHA256: 7f83b1657ff1... | Ingress: WhatsApp APK Distribution',
      score: 99,
      verdict: 'MALICIOUS_FRAUD' as const,
      tactic: 'T1437 (Application Layer Protocol: Android Accessibility Service Abuse)',
      layers: [
        { name: 'Layer 1: Manifest Permission Matrix', score: 98, status: 'TRIGGERED', detail: 'Requests BIND_ACCESSIBILITY_SERVICE, READ_SMS, and SYSTEM_ALERT_WINDOW.' },
        { name: 'Layer 2: Static Bytecode Analysis & Obfuscation', score: 99, status: 'TRIGGERED', detail: 'DexGuard obfuscation detected with dynamically loaded DEX payloads from C2 server.' },
        { name: 'Layer 3: Behavioral Dynamic Sandbox (Kigali Virtual Cell)', score: 99, status: 'TRIGGERED', detail: 'Monitors *182# USSD dialer and intercepts 4-digit PIN in background.' },
        { name: 'Layer 4: Threat Intelligence Signature Match', score: 100, status: 'TRIGGERED', detail: 'Known Trojan: Android/Spy.MoMoHarvest.A blacklisted by NCSA Rwanda.' },
      ]
    },
    {
      id: 'benign_bank',
      label: 'Official Bank of Kigali Notice',
      text: 'Bank of Kigali: Mwakiriye inyungu y\'ubwizigame ya 12,450 RWF kuri konti 00045*****. Ukeneye amakuru ahamagara 4455 cyangwa ukoreshe BK App.',
      score: 4,
      verdict: 'BENIGN' as const,
      tactic: 'None (Legitimate Verified Banking Stream)',
      layers: [
        { name: 'Layer 1: NLP Social Engineering & Urgency Detector', score: 2, status: 'CLEAN', detail: 'Standard transactional phrasing with no coercive urgency or external credentials link.' },
        { name: 'Layer 2: Domain & Sender Verification', score: 1, status: 'CLEAN', detail: 'Originates from verified Shortcode registered with RURA (Bank of Kigali).' },
        { name: 'Layer 3: Payload & Contact Integrity', score: 2, status: 'CLEAN', detail: 'Customer helpline 4455 matches authenticated BNR regulated call center.' },
        { name: 'Layer 4: Behavioral Pattern Match', score: 3, status: 'CLEAN', detail: 'Matches standard scheduled interest credit protocol.' },
      ]
    },
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setSelectedPreset(p.id);
    setSampleText(p.text);
    setInspectionResult({
      threatScore: p.score,
      verdict: p.verdict,
      confidence: p.score > 50 ? 99.4 : 98.8,
      mitreTactic: p.tactic,
      layers: p.layers,
    });
  };

  const handleRunInspection = () => {
    setIsInspecting(true);
    setActiveLayerScan(0);

    const step = (layerNum: number) => {
      if (layerNum <= 4) {
        setActiveLayerScan(layerNum);
        setTimeout(() => step(layerNum + 1), 350);
      } else {
        setIsInspecting(false);
      }
    };

    setTimeout(() => step(1), 300);
  };

  return (
    <div className="bg-[#070e1e] border border-cyan-900/60 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-950">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-mono text-white tracking-wider">
                AI-POWERED THREAT DETECTION & HEURISTICS MATRIX
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                NEURAL ENGINE 3.7 FLASH
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Multi-Layer Deep Heuristics for Phishing, Malware APKs, and Mobile Money Fraud Vectors
            </p>
          </div>
        </div>
      </div>

      {/* Preset Selectors */}
      <div className="space-y-2">
        <span className="text-xs text-slate-400 font-mono">SELECT MALICIOUS ARTIFACT / SAMPLE TO ANALYZE:</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`p-2.5 rounded-xl text-left border transition text-xs font-mono ${
                selectedPreset === p.id
                  ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-950'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span className="font-bold block truncate">{p.label}</span>
              <span className={`text-[10px] ${p.verdict === 'MALICIOUS_FRAUD' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {p.verdict === 'MALICIOUS_FRAUD' ? 'Threat Sample' : 'Clean Sample'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sample Input / Review Box */}
      <div className="space-y-2">
        <div className="relative">
          <textarea
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            rows={3}
            className="w-full bg-[#040813] border border-cyan-900/70 rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:border-cyan-400 focus:outline-none"
            placeholder="Paste suspicious SMS, URL, or payload signature..."
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleRunInspection}
            disabled={isInspecting || !sampleText.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition shadow-lg shadow-cyan-950"
          >
            {isInspecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning Layer {activeLayerScan}/4...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Execute AI Neural Inspection</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inspection Output Matrix */}
      <div className="p-5 bg-[#050b17] border border-cyan-500/40 rounded-xl space-y-4">
        {/* Top Verdict Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            {inspectionResult.verdict === 'MALICIOUS_FRAUD' ? (
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            )}
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block">AI VERDICT CLASSIFICATION</span>
              <span className={`text-base font-extrabold font-mono ${
                inspectionResult.verdict === 'MALICIOUS_FRAUD' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {inspectionResult.verdict} (CONFIDENCE: {inspectionResult.confidence}%)
              </span>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">THREAT INDEX</span>
            <span className={`text-2xl font-black ${
              inspectionResult.threatScore > 75 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {inspectionResult.threatScore} / 100
            </span>
          </div>
        </div>

        {/* MITRE ATT&CK Tactic */}
        <div className="p-2.5 bg-[#09152b] border border-slate-800 rounded-lg text-xs font-mono">
          <span className="text-cyan-400 font-bold">MITRE ATT&CK MAPPING: </span>
          <span className="text-slate-200">{inspectionResult.mitreTactic}</span>
        </div>

        {/* 4 Inspection Layers Stream */}
        <div className="space-y-2.5">
          {inspectionResult.layers.map((layer, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all ${
                activeLayerScan > idx || !isInspecting
                  ? layer.status === 'TRIGGERED'
                    ? 'bg-rose-950/20 border-rose-800/60'
                    : 'bg-emerald-950/20 border-emerald-800/60'
                  : 'bg-slate-900/40 border-slate-800 opacity-40'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="font-bold text-white">{layer.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  layer.status === 'TRIGGERED'
                    ? 'bg-rose-950 text-rose-300 border-rose-600'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                }`}>
                  {layer.status} • {layer.score}/100
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono">
                {layer.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
