import React, { useState } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  FileText, 
  Lock, 
  Radio, 
  AlertTriangle,
  UserCheck,
  Send,
  Eye
} from 'lucide-react';
import { CybercrimeReport, LanguageCode } from '../types';
import { translations } from '../translations';

interface OfficialCommandPortalProps {
  reports: CybercrimeReport[];
  language: LanguageCode;
  onRefreshData: () => void;
}

export const OfficialCommandPortal: React.FC<OfficialCommandPortalProps> = ({
  reports,
  language,
  onRefreshData,
}) => {
  const [activeAgency, setActiveAgency] = useState<'RIB' | 'RNP'>('RIB');
  const [selectedReport, setSelectedReport] = useState<CybercrimeReport | null>(reports[0] || null);
  const [statusUpdate, setStatusUpdate] = useState<CybercrimeReport['status']>('ESCALATED_RIB');
  const [investigatorNote, setInvestigatorNote] = useState('');
  const [officerName, setOfficerName] = useState('Insp. Uwimana (RIB Cybercrime Div)');
  const [isUpdating, setIsUpdating] = useState(false);
  const t = translations[language];

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusUpdate,
          note: investigatorNote || 'Case review updated by officer in charge.',
          officerName: officerName || 'Duty Officer',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update docket');

      setSelectedReport(data);
      onRefreshData();
      setInvestigatorNote('');
      alert('Case docket updated successfully with immutable chain of custody entry.');
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#0b1324] border border-cyan-900/60 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/90 border border-cyan-500/60 flex items-center justify-center text-cyan-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">
                Official Law Enforcement Command Portal
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                SIMULATED INTEGRATION
              </span>
            </div>
            <p className="text-xs text-amber-300 font-mono">
              Rwanda Investigation Bureau (RIB) & Rwanda National Police (RNP) Case Escalation
            </p>
          </div>
        </div>
      </div>

      {/* Agency Toggle */}
      <div className="flex items-center gap-2 p-1.5 bg-[#070d18] border border-slate-800 rounded-xl max-w-lg">
        <button
          onClick={() => {
            setActiveAgency('RIB');
            setOfficerName('Insp. Uwimana (RIB Cybercrime Div)');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition ${
            activeAgency === 'RIB' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>RIB Investigation Docket Management</span>
        </button>

        <button
          onClick={() => {
            setActiveAgency('RNP');
            setOfficerName('Capt. Nkurunziza (RNP Cyber-Response Unit)');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition ${
            activeAgency === 'RNP' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/60' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>RNP Rapid Cyber-Response Unit</span>
        </button>
      </div>

      {/* Master Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Case Docket List */}
        <div className="lg:col-span-5 bg-[#0b1324] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Active Case Dossiers ({reports.length})</h3>
            <span className="text-[10px] font-mono text-cyan-400">Cryptographically Verified</span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {reports.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedReport(r)}
                className={`p-3.5 rounded-xl border cursor-pointer transition text-xs space-y-1.5 ${
                  selectedReport?.id === r.id
                    ? 'bg-cyan-950/60 border-cyan-500/80 text-white shadow-md'
                    : 'bg-[#070d18] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-300">{r.trackingId}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                    {r.status}
                  </span>
                </div>
                <h4 className="font-semibold text-white truncate">{r.title}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Category: {r.category}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Case Dossier & Officer Action Form */}
        <div className="lg:col-span-7 space-y-5">
          {selectedReport ? (
            <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-5">
              {/* Dossier Top */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase block">
                    CASE DOCKET REF: {selectedReport.trackingId}
                  </span>
                  <h3 className="text-base font-bold text-white">{selectedReport.title}</h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-600">
                  {selectedReport.status}
                </span>
              </div>

              {/* Case Details Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">CATEGORY:</span>
                  <span className="text-white font-semibold">{selectedReport.category}</span>
                </div>
                <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">REPORTER PHONE:</span>
                  <span className="text-cyan-300 font-semibold">{selectedReport.reporterContactMasked}</span>
                </div>
                <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">SUSPECT CONTACT:</span>
                  <span className="text-rose-300 font-semibold">{selectedReport.suspectContact || 'Unspecified'}</span>
                </div>
                <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">FINANCIAL IMPACT:</span>
                  <span className="text-emerald-400 font-semibold">
                    {selectedReport.financialLossAmount?.toLocaleString() || 0} RWF
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 bg-[#070d18] border border-slate-800 rounded-xl text-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Full Incident Report:</span>
                <p className="text-slate-300 leading-relaxed">{selectedReport.description}</p>
              </div>

              {/* Evidence Seals */}
              {selectedReport.evidenceFiles && selectedReport.evidenceFiles.length > 0 && (
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-1.5 font-mono">
                  <span className="text-[10px] text-cyan-300 font-bold block">CRYPTOGRAPHIC DIGITAL EVIDENCE SEALS:</span>
                  {selectedReport.evidenceFiles.map((ev, i) => (
                    <div key={i} className="text-[11px] text-slate-300">
                      📄 <span className="text-white">{ev.fileName}</span> (SHA-256: <span className="text-cyan-400">{ev.sha256Hash}</span>)
                    </div>
                  ))}
                </div>
              )}

              {/* Officer Decision Form */}
              <form onSubmit={handleUpdateCase} className="p-4 bg-[#070d18] border border-cyan-900/50 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Investigator Action & Chain of Custody Log
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300">Officer in Charge:</label>
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      className="w-full bg-[#0b1324] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300">Update Status:</label>
                    <select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value as any)}
                      className="w-full bg-[#0b1324] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="UNDER_REVIEW">Under Active Investigation</option>
                      <option value="ESCALATED_RIB">Escalate to RIB Cyber Division</option>
                      <option value="ESCALATED_RNP">Dispatch RNP Tactical Takedown</option>
                      <option value="RESOLVED">Resolved / Threat Neutralized</option>
                      <option value="DISMISSED">Dismissed / Inconclusive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300">Officer Case Note (Appended to Audit Trail):</label>
                  <textarea
                    rows={2}
                    value={investigatorNote}
                    onChange={(e) => setInvestigatorNote(e.target.value)}
                    placeholder="Enter formal forensic observation, carrier subpoena request, or domain sinkhole action..."
                    className="w-full bg-[#0b1324] border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Update Case Docket & Append Cryptographic Seal</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-[#0b1324] border border-slate-800 rounded-2xl">
              Select a case dossier from the left list to review forensic evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
