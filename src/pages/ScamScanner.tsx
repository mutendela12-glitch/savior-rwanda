import React, { useState } from 'react';
import { 
  Cpu, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Link as LinkIcon, 
  MessageSquare, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { ThreatScanResult, LanguageCode } from '../types';
import { translations } from '../translations';

interface ScamScannerProps {
  language: LanguageCode;
  onReportIncidentWithDetails: (details: { title: string; description: string; suspectContact?: string }) => void;
}

export const ScamScanner: React.FC<ScamScannerProps> = ({
  language,
  onReportIncidentWithDetails,
}) => {
  const [scanType, setScanType] = useState<'MESSAGE' | 'URL'>('MESSAGE');
  const [messageInput, setMessageInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ThreatScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = translations[language];

  // Quick preset test samples
  const sampleMessages = [
    {
      label: '⚠️ Fake MTN MoMo PIN Scam (Kinyarwanda)',
      text: 'Yewe Jean! Amafaranga 120,000 RWF yoherejwe kuri konti yawe ya MoMo mu buryo bw\'ikosa. Kanda *182# ushyiremo umubare w\'ibanga ugaruze aya mafaranga cyangwa konti yawe ifungwe n\'umukozi wa MTN.',
    },
    {
      label: '⚠️ Fake MoMo Reversal Scam (Kiswahili)',
      text: 'Habari! Umepokea 150,000 RWF kimakosa kutoka MTN MoMo. Tafadhali piga *182# uweke PIN yako ili urejeshe au akaunti yako itazuiliwa na wakala wa MTN.',
    },
    {
      label: '⚠️ Fake BK Loan Phishing Link',
      text: 'Bank of Kigali yagabanyije inyungu kuri inguzanyo z\'abaturage! Kanda hano wuzuze imyirondoro yawe n\'ijambobanga rya konti: http://bk-loans-rwanda.xyz/apply-now',
    },
    {
      label: '✅ Legitimate Irembo Notification',
      text: 'Ubusabe bwawe bwo guhindura icyemezo cy\'amavuko kuri IremboGov bwakiriwe. Nimero y\'ubusabe ni RW-2026-99482. Nta mafaranga yandi asabwa.',
    }
  ];

  const handleScanMessage = async () => {
    if (!messageInput.trim()) {
      setError('Please paste or type a message to inspect.');
      return;
    }
    setIsScanning(true);
    setError(null);
    try {
      const res = await fetch('/api/scanner/analyze-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageInput, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setScanResult(data);
    } catch (err: any) {
      setError(err.message || 'Scam analysis engine error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanUrl = async () => {
    if (!urlInput.trim()) {
      setError('Please enter a website URL.');
      return;
    }
    setIsScanning(true);
    setError(null);
    try {
      const res = await fetch('/api/scanner/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'URL scan failed');
      setScanResult(data);
    } catch (err: any) {
      setError(err.message || 'URL inspection error');
    } finally {
      setIsScanning(false);
    }
  };

  const getThreatBadge = (level: ThreatScanResult['threatLevel']) => {
    switch (level) {
      case 'CRITICAL':
        return { text: 'CRITICAL SCAM THREAT', bg: 'bg-rose-950/80 border-rose-500 text-rose-300', icon: ShieldAlert };
      case 'HIGH':
        return { text: 'HIGH RISK FRAUD', bg: 'bg-amber-950/80 border-amber-500 text-amber-300', icon: AlertTriangle };
      case 'SUSPICIOUS':
        return { text: 'SUSPICIOUS LINK / PATTERN', bg: 'bg-yellow-950/80 border-yellow-500 text-yellow-300', icon: AlertTriangle };
      case 'LOW':
      case 'SAFE':
      default:
        return { text: 'CLEAN / LOW RISK', bg: 'bg-emerald-950/80 border-emerald-500 text-emerald-300', icon: ShieldCheck };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0b1324] border border-cyan-900/60 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {t.scannerTitle}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {t.scannerSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Input Mode Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-[#070d18] border border-slate-800 rounded-xl max-w-md">
        <button
          onClick={() => { setScanType('MESSAGE'); setScanResult(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
            scanType === 'MESSAGE' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Inspect SMS / WhatsApp Message</span>
        </button>

        <button
          onClick={() => { setScanType('URL'); setScanResult(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
            scanType === 'URL' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Inspect Suspicious URL</span>
        </button>
      </div>

      {/* Input Box */}
      <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-4">
        {scanType === 'MESSAGE' ? (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Paste message body (SMS, WhatsApp, Email, or MoMo SMS notification):</span>
              <span className="text-[10px] text-cyan-400 font-mono">Kinyarwanda & English Supported</span>
            </label>
            <textarea
              rows={4}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={t.scannerInputPlaceholder}
              className="w-full bg-[#070d18] border border-slate-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Enter suspicious link or domain name:
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={t.scannerUrlPlaceholder}
              className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        )}

        {error && (
          <div className="p-2.5 bg-rose-950/60 border border-rose-600 rounded-lg text-xs text-rose-200">
            {error}
          </div>
        )}

        {/* Action Button & Sample Triggers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono">Quick test samples:</span>
            {sampleMessages.map((sample, i) => (
              <button
                key={i}
                onClick={() => {
                  setScanType('MESSAGE');
                  setMessageInput(sample.text);
                }}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 transition"
              >
                {sample.label}
              </button>
            ))}
          </div>

          <button
            onClick={scanType === 'MESSAGE' ? handleScanMessage : handleScanUrl}
            disabled={isScanning}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-purple-950 flex items-center justify-center gap-2 self-end sm:self-auto"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.scannerAnalyzing}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{t.btnScanNow}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {scanResult && (
        <div className="bg-[#0b1324] border border-cyan-900/60 rounded-2xl p-6 space-y-5 animate-fadeIn">
          {/* Header row with Threat Level Badge */}
          {(() => {
            const badge = getThreatBadge(scanResult.threatLevel);
            const Icon = badge.icon;
            return (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${badge.bg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      SCAN REF: {scanResult.scanId} • CONFIDENCE: {scanResult.confidenceScore}%
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {scanResult.scamType || 'Cyber Threat Analysis'}
                    </h3>
                  </div>
                </div>

                <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border self-start sm:self-auto ${badge.bg}`}>
                  {badge.text}
                </span>
              </div>
            );
          })()}

          {/* Explanation */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
              Forensic AI Analysis:
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-[#070d18] border border-slate-800 rounded-xl p-4">
              {scanResult.analysisExplanation}
            </p>
          </div>

          {/* Warning Signs & Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#070d18] border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-rose-300 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Detected Red Flags / Indicators:</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {scanResult.warningSigns.map((sign, idx) => (
                  <li key={idx}>{sign}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-[#070d18] border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Recommended Protective Action:</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {scanResult.actionGuidance.map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Official Law Notice & 1-Click Report Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-cyan-950/40 border border-cyan-800/60 rounded-xl">
            <p className="text-xs text-slate-300 font-mono">
              {scanResult.officialWarningNotes || 'Rwanda Investigation Bureau (RIB) monitors reported scams.'}
            </p>

            <button
              onClick={() => {
                onReportIncidentWithDetails({
                  title: `Scam Detected: ${scanResult.scamType || 'Fraudulent Communication'}`,
                  description: `Scan Ref: ${scanResult.scanId}\nThreat: ${scanResult.threatLevel}\nDetails: ${scanResult.analysisExplanation}\nSample: ${scanResult.inputSample}`,
                  suspectContact: scanResult.inputSample.length < 50 ? scanResult.inputSample : undefined,
                });
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap shadow-lg shadow-rose-950 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Report to RIB / Police</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
