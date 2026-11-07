import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Link as LinkIcon, 
  MessageSquare, 
  Image as ImageIcon,
  UploadCloud, 
  FileText, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  X,
  PhoneCall,
  DollarSign,
  Eye,
  Sliders
} from 'lucide-react';
import { ThreatScanResult, ThreatMarker, LanguageCode } from '../types';
import { translations } from '../translations';

interface ScamScannerProps {
  language: LanguageCode;
  onReportIncidentWithDetails: (details: { title: string; description: string; suspectContact?: string }) => void;
}

export const ScamScanner: React.FC<ScamScannerProps> = ({
  language,
  onReportIncidentWithDetails,
}) => {
  const [scanType, setScanType] = useState<'MESSAGE' | 'IMAGE' | 'URL'>('IMAGE');
  const [messageInput, setMessageInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  
  // Image / Screenshot Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ThreatScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  const t = translations[language];

  // Helper to generate a realistic synthetic canvas screenshot for test presets
  const generatePresetScreenshotBase64 = (
    sender: string,
    messageText: string,
    timestamp: string,
    carrier: string = 'MTN RW'
  ): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Dark cyber phone screen background
    ctx.fillStyle = '#0b1324';
    ctx.fillRect(0, 0, 600, 420);

    // Top status bar
    ctx.fillStyle = '#060d1b';
    ctx.fillRect(0, 0, 600, 45);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`${carrier} 4G`, 20, 28);
    ctx.fillText(timestamp, 270, 28);
    ctx.fillText('🔋 94%', 540, 28);

    // Message header card
    ctx.fillStyle = '#111e38';
    ctx.fillRect(20, 60, 560, 60);
    ctx.strokeStyle = '#1e3a66';
    ctx.strokeRect(20, 60, 560, 60);

    // Sender icon circle
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(55, 90, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(sender.substring(0, 2).toUpperCase(), 46, 95);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`Sender: ${sender}`, 85, 86);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('SMS Message • Unverified personal cellular number', 85, 104);

    // Message bubble
    ctx.fillStyle = '#162b50';
    ctx.fillRect(20, 135, 560, 250);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 135, 560, 250);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px sans-serif';

    // Word wrap helper
    const words = messageText.split(' ');
    let line = '';
    let y = 175;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 510 && i > 0) {
        ctx.fillText(line, 45, y);
        line = words[i] + ' ';
        y += 26;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 45, y);

    // Simulated Action link / alert in bubble
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('⚠️ SECURITY ALERT: DEMANDS IMMEDIATE REVERSE CASH-OUT', 45, 360);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  // Realistic Rwandan Scam Screenshot Presets
  const sampleScreenshots = [
    {
      id: 'momo_reversal',
      label: '📱 Fake MoMo Reversal SMS (+250 788 349 102)',
      sender: '+250 788 349 102',
      text: 'Yello! Amafaranga 150,000 RWF yoherejwe kuri konti yawe mu buryo bw\'ikosa. Kanda *182# ushyiremo umubare w\'ibanga ugaruze aya mafaranga cyangwa konti yawe ifungwe n\'umukozi wa MTN.',
      time: '14:24 CAT',
    },
    {
      id: 'irembo_renewal',
      label: '🏛️ Spoofed Irembo NIDA Phish (.xyz domain)',
      sender: '+250 722 918 402',
      text: 'Urwego rwa IremboGov: Indangamuntu yawe irangiye. Kanda kuri http://irembo-gov-rw.verify-ident.xyz/renew kugira ngo ukorere renew indangamuntu n\'amafaranga 3,500 RWF.',
      time: '09:15 CAT',
    },
    {
      id: 'whatsapp_sacco',
      label: '💬 Fake WhatsApp SACCO Dividend Alert',
      sender: '+250 733 410 882',
      text: 'Muraho mugize itsinda rya SACCO Kigali! Mwakiriye inyungu y\'umwaka ya 320,000 RWF. Banza wohereze amafaranga y\'ifishi 15,000 RWF kuri iyi numero y\'umubitsi: 0788349102.',
      time: 'Yesterday',
    },
  ];

  // Quick preset test messages (text mode)
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

  // Global paste listener for pasting screenshots directly from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (scanType !== 'IMAGE') return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelect(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [scanType]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds 10MB limit. Please upload a smaller screenshot.');
      return;
    }

    setError(null);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = (e) => {
      setImageBase64(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadPresetScreenshot = (sample: typeof sampleScreenshots[0]) => {
    setError(null);
    const dataUrl = generatePresetScreenshotBase64(sample.sender, sample.text, sample.time);
    setImageBase64(dataUrl);
    setImagePreviewUrl(dataUrl);
    setImageFile(new File(['mock'], `${sample.id}.jpg`, { type: 'image/jpeg' }));
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImageBase64(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScanScreenshot = async () => {
    if (!imageBase64) {
      setError('Please upload or select a screenshot image of the scam.');
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const res = await fetch('/api/scanner/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Screenshot analysis failed');
      setScanResult({
        ...data,
        screenshotPreview: imageBase64,
      });
    } catch (err: any) {
      setError(err.message || 'Scam screenshot analysis error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanMessage = async () => {
    if (!messageInput.trim()) {
      setError('Please paste or type a message to inspect.');
      return;
    }
    setIsScanning(true);
    setError(null);
    setScanResult(null);
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
    setScanResult(null);
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
        return { text: 'SUSPICIOUS PATTERN', bg: 'bg-yellow-950/80 border-yellow-500 text-yellow-300', icon: AlertTriangle };
      case 'LOW':
      case 'SAFE':
      default:
        return { text: 'CLEAN / LOW RISK', bg: 'bg-emerald-950/80 border-emerald-500 text-emerald-300', icon: ShieldCheck };
    }
  };

  const handleCopyAnalysis = () => {
    if (!scanResult) return;
    const summary = `SAVIOR Threat Report [${scanResult.scanId}]\nThreat Level: ${scanResult.threatLevel}\nScam Type: ${scanResult.scamType}\nExplanation: ${scanResult.analysisExplanation}\nSuspect Numbers: ${(scanResult.extractedContacts || []).join(', ') || 'N/A'}\nRed Flags:\n${scanResult.warningSigns.map(s => `- ${s}`).join('\n')}`;
    navigator.clipboard.writeText(summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#070e1e] via-[#09152b] to-[#070e1e] border border-cyan-500/50 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-950">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-mono text-white tracking-wide">
                  {t.scannerTitle}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                  OCR + NEURAL 3.8
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                {t.scannerSubtitle}
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-[#040813] border border-cyan-950 rounded-xl px-3.5 py-1.5 self-start sm:self-auto">
            <span className="text-cyan-300 font-bold">MULTIMODAL SHIELD:</span> SMS • Screenshots • URLs
          </div>
        </div>
      </div>

      {/* Input Mode Selector Tabs (Screenshot, Message, URL) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#070d18] border border-slate-800 rounded-xl max-w-xl">
        <button
          onClick={() => { setScanType('IMAGE'); setScanResult(null); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
            scanType === 'IMAGE'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950 border border-cyan-400/50 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-cyan-300" />
          <span>{t.scannerInspectImgTab}</span>
        </button>

        <button
          onClick={() => { setScanType('MESSAGE'); setScanResult(null); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
            scanType === 'MESSAGE'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950 border border-purple-400/50 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{t.scannerInspectMsgTab}</span>
        </button>

        <button
          onClick={() => { setScanType('URL'); setScanResult(null); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
            scanType === 'URL'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950 border border-purple-400/50 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>{t.scannerInspectUrlTab}</span>
        </button>
      </div>

      {/* Primary Input Container */}
      <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        {/* MODE 1: SCREENSHOT / IMAGE UPLOAD */}
        {scanType === 'IMAGE' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span>{t.scannerUploadImgTitle}</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {t.scannerUploadImgSubtitle}
                </p>
              </div>

              <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                {t.scannerUploadPasteHint}
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {/* Dropzone & Preview Box */}
            {!imageBase64 ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-3 ${
                  isDragOver
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-xl shadow-cyan-950'
                    : 'border-cyan-900/60 bg-[#070d18] hover:border-cyan-500 hover:bg-[#0a1428]'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-400/80 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-950">
                  <UploadCloud className="w-7 h-7 animate-bounce" />
                </div>
                <div className="space-y-1 font-mono">
                  <p className="text-sm font-bold text-white">
                    Click to browse or drag & drop scam screenshot here
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports PNG, JPG, JPEG, WEBP • Max 10MB • Or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">Ctrl + V</kbd> to paste
                  </p>
                </div>
              </div>
            ) : (
              /* Image Uploaded Preview Card */
              <div className="p-4 bg-[#070d18] border border-cyan-500/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-cyan-400/80 bg-black shrink-0 shadow-lg">
                    <img
                      src={imagePreviewUrl || imageBase64}
                      alt="Uploaded Scam Screenshot"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center p-1">
                      <span className="text-[9px] font-mono text-cyan-300">ATTACHED</span>
                    </div>
                  </div>

                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {imageFile?.name || 'Scam_Screenshot_Preview.jpg'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                        READY TO SCAN
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Payload: {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : 'Synthetic Preset Mockup'}
                    </p>
                    <p className="text-[11px] text-cyan-300">
                      SAVIOR OCR will extract sender, visible MoMo PIN demands, and fraud cues.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition"
                  >
                    Change Picture
                  </button>
                  <button
                    onClick={handleClearImage}
                    className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 transition"
                    title="Remove Screenshot"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Preset Test Screenshot Samples */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">
                {t.scannerSampleScreenshotsTitle}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {sampleScreenshots.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleLoadPresetScreenshot(sample)}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 rounded-xl text-[11px] font-mono text-slate-300 hover:text-cyan-200 transition text-left flex items-center gap-1.5"
                  >
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: MESSAGE TEXT INPUT */}
        {scanType === 'MESSAGE' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>{t.scannerPasteMsgLabel}</span>
              <span className="text-[10px] text-cyan-400 font-mono">{t.scannerLanguagesSupported}</span>
            </label>
            <textarea
              rows={4}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={t.scannerInputPlaceholder}
              className="w-full bg-[#070d18] border border-slate-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-mono">{t.scannerQuickSamples}</span>
              {sampleMessages.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => setMessageInput(sample.text)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 transition"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODE 3: SUSPICIOUS URL INPUT */}
        {scanType === 'URL' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              {t.scannerEnterUrlLabel}
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

        {/* Error banner */}
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-600 rounded-xl text-xs text-rose-200 font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              if (scanType === 'IMAGE') handleScanScreenshot();
              else if (scanType === 'MESSAGE') handleScanMessage();
              else handleScanUrl();
            }}
            disabled={isScanning || (scanType === 'IMAGE' && !imageBase64)}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition shadow-lg shadow-cyan-950 flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {scanType === 'IMAGE' ? t.scannerAnalyzingImage : t.scannerAnalyzing}
                </span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-cyan-300" />
                <span>{scanType === 'IMAGE' ? 'Analyze Scam Screenshot with AI' : t.btnScanNow}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* COMPREHENSIVE THREAT RESULTS DISPLAY (SHOW RESULT OF WHAT WAS FOUND AS A THREAT) */}
      {scanResult && (
        <div className="bg-[#0b1324] border border-cyan-500/60 rounded-2xl p-6 space-y-6 shadow-2xl animate-in fade-in duration-300">
          {/* Header row with Threat Level Badge & Score */}
          {(() => {
            const badge = getThreatBadge(scanResult.threatLevel);
            const Icon = badge.icon;
            return (
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl border shadow-lg ${badge.bg}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block tracking-wider">
                      SAVIOR FORENSIC SCAN REF: {scanResult.scanId} • SCAN TYPE: {scanResult.scanType}
                    </span>
                    <h2 className="text-lg font-bold font-mono text-white">
                      {scanResult.scamType || 'Identified Cybercrime Threat Pattern'}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-400 block uppercase">Threat Index</span>
                    <span className="text-xl font-black text-rose-400">
                      {scanResult.confidenceScore}% Confidence
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-extrabold px-3.5 py-2 rounded-xl border ${badge.bg}`}>
                    {badge.text}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* IF SCREENSHOT SCAN: DUAL INSPECTION VIEW (Image + Extracted OCR Data) */}
          {scanResult.screenshotPreview && (
            <div className="p-4 bg-[#070d18] border border-cyan-900/60 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>{t.scannerExtractedOcrTitle}</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Multimodal OCR Active</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left: Thumbnail Preview of Analyzed Screenshot */}
                <div className="lg:col-span-4 rounded-xl overflow-hidden border border-cyan-900/80 bg-black/80 max-h-56 relative group">
                  <img
                    src={scanResult.screenshotPreview}
                    alt="Analyzed Screenshot"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-rose-950/90 border border-rose-600 px-2 py-0.5 rounded text-[9px] font-mono text-rose-300 font-bold">
                    FLAGGED EVIDENCE
                  </div>
                </div>

                {/* Right: Extracted Artifacts (Suspect Phone, Stated Amounts, URLs) */}
                <div className="lg:col-span-8 space-y-3 font-mono text-xs">
                  {/* Extracted Suspect Phone Number */}
                  {scanResult.extractedContacts && scanResult.extractedContacts.length > 0 && (
                    <div className="p-3 bg-[#0c1a33] border border-cyan-500/50 rounded-xl space-y-1">
                      <span className="text-[10px] text-rose-300 uppercase block font-bold flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                        <span>{t.scannerExtractedContactsLabel}</span>
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {scanResult.extractedContacts.map((contact, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded bg-rose-950 text-rose-200 border border-rose-700 font-mono font-bold text-xs"
                          >
                            {contact}
                          </span>
                        ))}
                        <span className="text-[10px] text-slate-400">
                          (Unverified sender pretending to represent official telecom)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Extracted URLs or Monetary Amounts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {scanResult.extractedUrls && scanResult.extractedUrls.length > 0 && (
                      <div className="p-2.5 bg-[#0a1428] border border-slate-800 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase block">
                          {t.scannerExtractedUrlsLabel}
                        </span>
                        {scanResult.extractedUrls.map((u, i) => (
                          <span key={i} className="text-rose-300 font-bold block truncate">
                            {u}
                          </span>
                        ))}
                      </div>
                    )}

                    {scanResult.extractedAmounts && scanResult.extractedAmounts.length > 0 && (
                      <div className="p-2.5 bg-[#0a1428] border border-slate-800 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase block">
                          {t.scannerExtractedAmountsLabel}
                        </span>
                        {scanResult.extractedAmounts.map((amt, i) => (
                          <span key={i} className="text-amber-300 font-bold block">
                            {amt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* OCR Transcribed Text Box */}
                  {scanResult.extractedText && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase block">
                        Complete Text Transcription Read from Screenshot:
                      </span>
                      <div className="p-2.5 bg-black/70 border border-slate-800 rounded-lg text-slate-300 text-[11px] font-mono leading-relaxed whitespace-pre-wrap max-h-24 overflow-y-auto">
                        {scanResult.extractedText}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DETAILED THREAT FINDINGS CHECKLIST (SPECIFIC THREATS FOUND) */}
          {scanResult.threatMarkers && scanResult.threatMarkers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{t.scannerThreatFindingsTitle}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scanResult.threatMarkers.map((marker, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border space-y-1 ${
                      marker.severity === 'CRITICAL'
                        ? 'bg-rose-950/40 border-rose-700/80'
                        : marker.severity === 'HIGH'
                        ? 'bg-amber-950/40 border-amber-700/80'
                        : 'bg-yellow-950/30 border-yellow-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-white">{marker.category}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        marker.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border-rose-600'
                          : 'bg-amber-950 text-amber-300 border-amber-600'
                      }`}>
                        {marker.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono leading-relaxed">
                      {marker.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forensic Explanation */}
          <div className="space-y-1.5 font-mono">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {t.scannerForensicTitle}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-[#070d18] border border-slate-800 rounded-xl p-4">
              {scanResult.analysisExplanation}
            </p>
          </div>

          {/* Warning Signs & Action Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            <div className="p-4 bg-[#070d18] border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t.scannerRedFlags}</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {scanResult.warningSigns.map((sign, idx) => (
                  <li key={idx}>{sign}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-[#070d18] border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.scannerGuidance}</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {scanResult.actionGuidance.map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Official Law Notice & 1-Click Report Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-cyan-950/40 border border-cyan-800/60 rounded-xl font-mono">
            <p className="text-xs text-slate-300">
              {scanResult.officialWarningNotes || 'Rwanda Investigation Bureau (RIB) & Police Cybercrime Division accept digital evidence dossiers.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleCopyAnalysis}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied' : t.scannerCopyAnalysis}</span>
              </button>

              <button
                onClick={() => {
                  const suspectNum = scanResult.extractedContacts && scanResult.extractedContacts.length > 0
                    ? scanResult.extractedContacts[0]
                    : scanResult.inputSample.length < 35 ? scanResult.inputSample : undefined;

                  onReportIncidentWithDetails({
                    title: `Cyber Threat Detected: ${scanResult.scamType || 'Fraudulent Communication'}`,
                    description: `SAVIOR Forensic Scan ID: ${scanResult.scanId}\nThreat Level: ${scanResult.threatLevel} (${scanResult.confidenceScore}% confidence)\nForensics:\n${scanResult.analysisExplanation}\n\nEvidence Transcript:\n${scanResult.extractedText || scanResult.inputSample}`,
                    suspectContact: suspectNum,
                  });
                }}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap shadow-lg shadow-rose-950 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Forward Evidence to Police / RIB</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
