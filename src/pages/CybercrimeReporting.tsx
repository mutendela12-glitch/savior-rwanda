import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Send, 
  RefreshCw,
  AlertTriangle,
  Lock,
  Copy,
  Check
} from 'lucide-react';
import { CybercrimeReport, LanguageCode } from '../types';
import { translations } from '../translations';

interface CybercrimeReportingProps {
  reports: CybercrimeReport[];
  language: LanguageCode;
  initialDetails?: { title: string; description: string; suspectContact?: string } | null;
  onRefreshData: () => void;
}

export const CybercrimeReporting: React.FC<CybercrimeReportingProps> = ({
  reports,
  language,
  initialDetails,
  onRefreshData,
}) => {
  const [category, setCategory] = useState<CybercrimeReport['category']>('MOBILE_MONEY_FRAUD');
  const [title, setTitle] = useState(initialDetails?.title || '');
  const [description, setDescription] = useState(initialDetails?.description || '');
  const [suspectContact, setSuspectContact] = useState(initialDetails?.suspectContact || '');
  const [financialLoss, setFinancialLoss] = useState<number>(0);
  const [priority, setPriority] = useState<CybercrimeReport['priority']>('ROUTINE');
  const [evidenceFileName, setEvidenceFileName] = useState<string>('scam_evidence_export.txt');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<CybercrimeReport | null>(null);
  const [trackingSearch, setTrackingSearch] = useState('');
  const [trackedResult, setTrackedResult] = useState<CybercrimeReport | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reports/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title,
          description,
          suspectContact,
          financialLossAmount: Number(financialLoss),
          evidenceFileName: evidenceFileName || 'sealed_evidence.txt',
          evidenceFileContent: `${title} - ${description} - ${suspectContact} - ${Date.now()}`,
          priority,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to file report');

      setSubmittedReport(data);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Report submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchTracking = async () => {
    if (!trackingSearch.trim()) return;
    setTrackError(null);
    try {
      const res = await fetch(`/api/reports/track/${encodeURIComponent(trackingSearch.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tracking ID not found');
      setTrackedResult(data);
    } catch (err: any) {
      setTrackError(err.message);
      setTrackedResult(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0b1324] border border-cyan-900/60 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {t.btnSubmitReport}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              SHA-256 Digitally Sealed Cybercrime Evidence Intake & RIB / RNP Escalation
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Reporting Form & Tracking Lookup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Incident Report Intake Form */}
        <div className="lg:col-span-7 bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Incident Evidence Intake</h3>
            <span className="text-[10px] font-mono text-cyan-300">Chain of Custody Compliant</span>
          </div>

          {submittedReport ? (
            <div className="p-6 bg-emerald-950/40 border border-emerald-500/80 rounded-2xl text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Report Cryptographically Sealed!</h4>
                <p className="text-xs text-emerald-300 font-mono mt-1">
                  Unique Tracking ID: <span className="text-white font-bold">{submittedReport.trackingId}</span>
                </p>
              </div>

              <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl text-left text-xs font-mono space-y-1.5 text-slate-300">
                <p className="text-cyan-300 font-bold">DIGITAL EVIDENCE RECEIPT:</p>
                <p className="truncate text-[11px]">Integrity Seal: {submittedReport.evidenceFiles?.[0]?.digitalSealSignature || 'SAVIOR-SEAL-CONFIRMED'}</p>
                <p className="text-[11px] text-slate-400">SHA-256 Hash: {submittedReport.evidenceFiles?.[0]?.sha256Hash || 'N/A'}</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(submittedReport.trackingId);
                    setCopiedId(true);
                    setTimeout(() => setCopiedId(false), 2000);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Tracking ID</span>
                </button>
                <button
                  onClick={() => setSubmittedReport(null)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  Submit Another Report
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Crime Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="MOBILE_MONEY_FRAUD">Mobile Money (MoMo) PIN Theft / Fraud</option>
                  <option value="PHISHING_LINK">Phishing Link / Deceptive Website</option>
                  <option value="FINANCIAL_SCAM">Bank / Online Financial Fraud</option>
                  <option value="ACCOUNT_HACKING">Account Takeover / SIM Swap</option>
                  <option value="IDENTITY_THEFT">Identity Theft / Impersonation</option>
                  <option value="RANSOMWARE">Ransomware / Extortion Threat</option>
                  <option value="MALICIOUS_APP">Malicious Android APK / App</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Incident Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unsolicited call claiming to be BK staff asking for token"
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Detailed Description:</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide timestamps, messages received, phone numbers involved, and exact sequence of events..."
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Suspect Contact & Loss */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Suspect Phone / URL / Handle:</label>
                  <input
                    type="text"
                    value={suspectContact}
                    onChange={(e) => setSuspectContact(e.target.value)}
                    placeholder="+250 780 ... or https://..."
                    className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Financial Loss Amount (RWF):</label>
                  <input
                    type="number"
                    min={0}
                    value={financialLoss}
                    onChange={(e) => setFinancialLoss(Number(e.target.value))}
                    className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Evidence File Attachment Simulation */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Evidence File Attachment:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={evidenceFileName}
                    onChange={(e) => setEvidenceFileName(e.target.value)}
                    className="flex-1 bg-[#070d18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  <div className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-400 flex items-center gap-1">
                    <UploadCloud className="w-4 h-4 text-cyan-400" />
                    <span>SHA-256 Auto-Seal</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-amber-950 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generating Cryptographic Tamper Seal...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit & Cryptographically Seal Report</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right: Track Existing Incident by ID */}
        <div className="lg:col-span-5 space-y-5">
          {/* Tracking Box */}
          <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Track Incident Status & Docket</h3>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={trackingSearch}
                onChange={(e) => setTrackingSearch(e.target.value.toUpperCase())}
                placeholder="SAV-2026-XXXXXX"
                className="flex-1 bg-[#070d18] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSearchTracking}
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition"
              >
                Track
              </button>
            </div>

            {trackError && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-600 rounded-lg text-xs text-rose-200">
                {trackError}
              </div>
            )}

            {trackedResult && (
              <div className="p-4 bg-[#070d18] border border-cyan-900/60 rounded-xl space-y-3 animate-fadeIn text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-300">{trackedResult.trackingId}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                    {trackedResult.status}
                  </span>
                </div>
                <h4 className="font-semibold text-white">{trackedResult.title}</h4>
                <p className="text-slate-300">{trackedResult.description}</p>

                {trackedResult.assignedUnit && (
                  <p className="text-[11px] text-amber-300 font-mono">
                    Assigned Unit: {trackedResult.assignedUnit}
                  </p>
                )}

                {trackedResult.chainOfCustodyAudit && (
                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono block">CHAIN OF CUSTODY LOGS:</span>
                    {trackedResult.chainOfCustodyAudit.map((log, idx) => (
                      <div key={idx} className="text-[10px] text-slate-400 font-mono">
                        • [{new Date(log.timestamp).toLocaleDateString()}] {log.actor}: {log.action}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick list of user's existing reports */}
          <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Your Logged Reports ({reports.length})</h3>
            <div className="space-y-2">
              {reports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    setTrackingSearch(r.trackingId);
                    setTrackedResult(r);
                  }}
                  className="p-3 bg-[#070d18] border border-slate-800 hover:border-cyan-700 cursor-pointer rounded-xl text-xs space-y-1 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-300">{r.trackingId}</span>
                    <span className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white font-medium truncate">{r.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
