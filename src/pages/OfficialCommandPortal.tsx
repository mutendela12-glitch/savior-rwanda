import React, { useState, useEffect } from 'react';
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
  Eye,
  Crosshair,
  MapPin,
  Car,
  Clock,
  Zap,
  Filter,
  Check,
  Download,
  PhoneCall,
  ShieldCheck
} from 'lucide-react';
import { CybercrimeReport, LanguageCode } from '../types';
import { translations } from '../translations';
import { GpsSuspectRadar } from '../components/GpsSuspectRadar';

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
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'EMERGENCY' | 'URGENT' | 'ROUTINE'>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [statusUpdate, setStatusUpdate] = useState<CybercrimeReport['status']>('ESCALATED_RIB');
  const [investigatorNote, setInvestigatorNote] = useState('');
  const [officerName, setOfficerName] = useState('Insp. Uwimana (RIB Cybercrime Div)');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const t = translations[language];

  // Selected report lookup
  const selectedReport = reports.find(r => r.id === selectedReportId) || reports[0] || null;

  // Filtered reports
  const filteredReports = reports.filter(r => {
    if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;
    if (districtFilter !== 'ALL' && r.suspectLocation?.district !== districtFilter && r.incidentLocation?.district !== districtFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTracking = r.trackingId.toLowerCase().includes(q);
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchContact = r.suspectContact?.toLowerCase().includes(q);
      const matchDistrict = r.suspectLocation?.district.toLowerCase().includes(q);
      if (!matchTracking && !matchTitle && !matchContact && !matchDistrict) return false;
    }
    return true;
  });

  // Fast action handler ("Solve the case in short period of time")
  const handleFastAction = async (actionType: 'FREEZE_MOMO' | 'FREEZE_BANK' | 'IMSI_LOCK' | 'DISPATCH_PATROL' | 'EXPEDITE_WARRANT' | 'RESOLVED_RAPID') => {
    if (!selectedReport) return;
    setIsActionLoading(true);
    setActionSuccessMsg(null);
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/fast-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          officerName: activeAgency === 'RIB' ? 'Insp. Uwimana (RIB)' : 'Capt. Nkurunziza (RNP)',
          notes: `Tactical fast-response triggered from ${activeAgency} Command Console.`
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute action');
      
      onRefreshData();
      const actionLabels = {
        FREEZE_MOMO: t.policeActionMoMoSuccess,
        FREEZE_BANK: t.policeActionBankSuccess,
        IMSI_LOCK: t.policeActionImsiSuccess,
        DISPATCH_PATROL: t.policeActionPatrolSuccess,
        EXPEDITE_WARRANT: 'RIB Special Prosecutor digital warrant generated.',
        RESOLVED_RAPID: t.policeActionResolvedSuccess
      };
      setActionSuccessMsg(actionLabels[actionType]);
      setTimeout(() => setActionSuccessMsg(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Re-ping GPS telemetry
  const handleRefreshTelemetry = async () => {
    if (!selectedReport) return;
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/gps-track`);
      if (res.ok) {
        onRefreshData();
      }
    } catch (e) {
      console.error('Failed to ping telemetry:', e);
    }
  };

  // Standard case docket update
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

      onRefreshData();
      setInvestigatorNote('');
      setActionSuccessMsg('Case docket updated and sealed in immutable chain-of-custody.');
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const emergencyCount = reports.filter(r => r.priority === 'EMERGENCY').length;
  const activeCount = reports.filter(r => r.status !== 'RESOLVED' && r.status !== 'DISMISSED').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Law Enforcement Command Header */}
      <div className="bg-[#0b1324] border border-cyan-900/60 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-950 to-blue-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                  {t.policeHeaderTitle}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold">
                  OFFICIAL INTERVENTION
                </span>
              </div>
              <p className="text-xs text-amber-300 font-mono mt-0.5">
                {t.policeHeaderSubtitle}
              </p>
            </div>
          </div>

          {/* Agency Switcher */}
          <div className="flex items-center bg-[#070d18] border border-slate-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => {
                setActiveAgency('RIB');
                setOfficerName('Insp. Uwimana (RIB Cybercrime Div)');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeAgency === 'RIB' 
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>{t.policeAgencyRib}</span>
            </button>

            <button
              onClick={() => {
                setActiveAgency('RNP');
                setOfficerName('Capt. Nkurunziza (RNP Rapid Cyber Unit)');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeAgency === 'RNP' 
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>{t.policeAgencyRnp}</span>
            </button>
          </div>
        </div>

        {/* Operational Statistics Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs font-mono">
          <div className="p-2.5 bg-[#070d18] border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block">ACTIVE DOCKETS:</span>
            <span className="text-base font-bold text-white">{activeCount} Cases Active</span>
          </div>

          <div className="p-2.5 bg-[#070d18] border border-rose-900/40 rounded-xl">
            <span className="text-[10px] text-rose-400 block">EMERGENCY INTERVENTIONS:</span>
            <span className="text-base font-bold text-rose-400">{emergencyCount} Critical (MoMo / Theft)</span>
          </div>

          <div className="p-2.5 bg-[#070d18] border border-cyan-900/40 rounded-xl">
            <span className="text-[10px] text-cyan-400 block">AVG RAPID RESOLUTION:</span>
            <span className="text-base font-bold text-emerald-400">18.4 Minutes Target</span>
          </div>

          <div className="p-2.5 bg-[#070d18] border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 block">TELECOM INTERCEPT GATEWAYS:</span>
            <span className="text-base font-bold text-cyan-300">MTN & Airtel Online</span>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccessMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500/60 px-4 py-3 rounded-xl text-emerald-200 text-xs font-mono flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* SECTION 1: LIVE GPS SUSPECT RADAR FOR SELECTED CASE */}
      {selectedReport && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                {t.policeGpsRadarSectionTitle}
              </h2>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">
              {t.policeTrackingSuspectOnCase} <strong className="text-white">{selectedReport.trackingId}</strong>
            </span>
          </div>

          <GpsSuspectRadar
            report={selectedReport}
            language={language}
            onFastAction={handleFastAction}
            onRefreshTelemetry={handleRefreshTelemetry}
            isActionLoading={isActionLoading}
          />
        </div>
      )}

      {/* SECTION 2: CASE TRIAGE AND FORENSIC AUDIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Case Docket List with Filters */}
        <div className="lg:col-span-5 bg-[#0b1324] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">{t.policeIncomingDocketsTitle} ({filteredReports.length})</h3>
              <p className="text-[10px] text-slate-400">{t.policeDocketsFiledByCitizens}</p>
            </div>
            <button
              onClick={onRefreshData}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-bold flex items-center gap-1"
            >
              Refresh
            </button>
          </div>

          {/* Search & Filters */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tracking #, suspect phone, district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#070d18] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1"><Filter className="w-3 h-3" /> Priority:</span>
              {(['ALL', 'EMERGENCY', 'URGENT', 'ROUTINE'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2 py-0.5 rounded transition ${
                    priorityFilter === p
                      ? p === 'EMERGENCY' ? 'bg-rose-950 text-rose-300 border border-rose-600 font-bold'
                        : p === 'URGENT' ? 'bg-amber-950 text-amber-300 border border-amber-600 font-bold'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-600 font-bold'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* District Filter */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
              <span className="text-slate-400">District:</span>
              {['ALL', 'Gasabo', 'Nyarugenge', 'Kicukiro', 'Rubavu', 'Musanze'].map(d => (
                <button
                  key={d}
                  onClick={() => setDistrictFilter(d)}
                  className={`px-2 py-0.5 rounded transition ${
                    districtFilter === d
                      ? 'bg-slate-800 text-white font-bold border border-slate-600'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800/80'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Docket Cards */}
          <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredReports.map((r) => {
              const isSelected = selectedReport?.id === r.id;
              const hasGps = Boolean(r.suspectLocation);
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReportId(r.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-xs space-y-2 ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                      : 'bg-[#070d18] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-[#0a1222]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-300">{r.trackingId}</span>
                      {hasGps && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950/90 text-rose-300 border border-rose-700/60 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-rose-400" /> GPS Locked
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      r.priority === 'EMERGENCY' ? 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse' :
                      r.priority === 'URGENT' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                      'bg-slate-900 text-slate-300 border border-slate-700'
                    }`}>
                      {r.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-white leading-snug">{r.title}</h4>

                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-400">
                    <div>
                      <span>Sector: </span>
                      <strong className="text-slate-200">{r.suspectLocation?.district || 'Rwanda'}</strong>
                    </div>
                    <div className="text-right">
                      <span>Status: </span>
                      <strong className={r.status === 'RESOLVED' ? 'text-emerald-400' : 'text-amber-300'}>
                        {r.status}
                      </strong>
                    </div>
                  </div>

                  {r.assignedPatrolUnit && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-300 font-mono bg-amber-950/40 px-2 py-1 rounded border border-amber-900/50">
                      <Car className="w-3 h-3 text-amber-400" />
                      <span>{r.assignedPatrolUnit.unitId} En Route (ETA: {r.assignedPatrolUnit.etaMinutes}m)</span>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredReports.length === 0 && (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No case dockets match the current filters.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Selected Case Dossier & Chain of Custody */}
        <div className="lg:col-span-7 space-y-5">
          {selectedReport ? (
            <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
              {/* Dossier Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      CASE DOCKET: {selectedReport.trackingId}
                    </span>
                    {selectedReport.ribCaseNumber && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700">
                        {selectedReport.ribCaseNumber}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedReport.title}</h3>
                </div>

                <span className={`text-xs font-mono px-3 py-1 rounded font-bold ${
                  selectedReport.status === 'RESOLVED' 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                    : 'bg-amber-950 text-amber-300 border border-amber-600'
                }`}>
                  STATUS: {selectedReport.status}
                </span>
              </div>

              {/* Forensic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">THEFT CLASSIFICATION:</span>
                  <span className="text-white font-bold">{selectedReport.theftType || selectedReport.category}</span>
                </div>
                <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">REPORTER MSISDN:</span>
                  <span className="text-cyan-300 font-semibold">{selectedReport.reporterContactMasked}</span>
                </div>
                <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">SUSPECT CONTACT / MSISDN:</span>
                  <span className="text-rose-400 font-bold">{selectedReport.suspectContact || 'Unknown Contact'}</span>
                </div>
                <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">STOLEN / ATTEMPTED LOSS:</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedReport.financialLossAmount?.toLocaleString() || 0} RWF
                  </span>
                </div>
              </div>

              {/* Citizen Questionnaire Intelligence: Stolen Money */}
              {selectedReport.moneyDetails && (
                <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-amber-900/60 pb-1.5">
                    <span className="text-amber-400 font-bold flex items-center gap-1.5">
                      💰 STOLEN MONEY INTELLIGENCE (CITIZEN INTAKE)
                    </span>
                    <span className="text-[10px] text-amber-200">
                      Channel: <strong>{selectedReport.moneyDetails.paymentChannel}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Amount Stolen: </span>
                      <strong className="text-emerald-400">{selectedReport.moneyDetails.amountRwf.toLocaleString()} RWF</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Transaction ID: </span>
                      <strong className="text-cyan-300">{selectedReport.moneyDetails.transactionReference || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Destination Account / Phone: </span>
                      <strong className="text-rose-300">{selectedReport.moneyDetails.recipientAccountOrPhone || 'N/A'}</strong>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-300 pt-1">
                    <span className="text-slate-400">Deception Method: </span>
                    <span className="text-amber-200">{selectedReport.moneyDetails.deceptionMethod}</span>
                  </div>
                </div>
              )}

              {/* Citizen Questionnaire Intelligence: Compromised Information */}
              {selectedReport.informationDetails && (
                <div className="p-4 bg-cyan-950/30 border border-cyan-800/60 rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-cyan-900/60 pb-1.5">
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                      🔑 COMPROMISED CREDENTIALS & HIJACKED ACCOUNTS
                    </span>
                    {selectedReport.informationDetails.isOngoingImpersonation && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 animate-pulse font-bold">
                        ACTIVE IMPERSONATION DETECTED
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Compromised Data / Accounts: </span>
                      <strong className="text-white">{selectedReport.informationDetails.compromisedItems.join(', ')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Theft Method: </span>
                      <strong className="text-cyan-300">{selectedReport.informationDetails.theftMethod}</strong>
                    </div>
                  </div>
                  {selectedReport.informationDetails.contactsAtRiskNotes && (
                    <div className="text-[11px] text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-900/40">
                      <strong>Family / Contacts at immediate risk:</strong> {selectedReport.informationDetails.contactsAtRiskNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Suspect Profile from Questionnaire */}
              {selectedReport.suspectDetails && (
                <div className="p-3.5 bg-[#070d18] border border-slate-800 rounded-xl text-xs font-mono space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    SUSPECT BEHAVIORAL PROFILE:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Claimed Alias / Title: </span>
                      <strong className="text-white">{selectedReport.suspectDetails.aliasOrName || 'None'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Platform: </span>
                      <strong className="text-cyan-300">{selectedReport.suspectDetails.platformUsed || 'Phone/SMS'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Language Used: </span>
                      <strong className="text-amber-300">{selectedReport.suspectDetails.languageUsed || 'Kinyarwanda'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Suspect Geolocation & Hardware Details */}
              {selectedReport.suspectLocation && (
                <div className="p-4 bg-gradient-to-br from-[#070d18] to-[#0a1222] border border-cyan-900/60 rounded-xl text-xs space-y-2 font-mono">
                  <div className="flex items-center justify-between border-b border-cyan-950 pb-1.5">
                    <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      SUSPECT GPS HARDWARE FOOTPRINT (TRIANGULATED)
                    </span>
                    <span className="text-[9px] text-slate-400">Method: {selectedReport.suspectLocation.trackingMethod}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                    <div>
                      <span className="text-slate-400">Physical Sector: </span>
                      <strong className="text-white">{selectedReport.suspectLocation.approximateAddress}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Telecom Tower BTS: </span>
                      <strong className="text-cyan-300">{selectedReport.suspectLocation.cellTower}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Coordinates: </span>
                      <strong className="text-rose-400">
                        {selectedReport.suspectLocation.lat.toFixed(5)}, {selectedReport.suspectLocation.lng.toFixed(5)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">ISP & Network: </span>
                      <strong className="text-emerald-400">{selectedReport.suspectLocation.isp}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Device Model: </span>
                      <strong className="text-slate-200">{selectedReport.suspectLocation.deviceModel}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Signal (RSSI): </span>
                      <strong className="text-amber-300">{selectedReport.suspectLocation.signalStrengthDbm} dBm</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div className="p-3.5 bg-[#070d18] border border-slate-800 rounded-xl text-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Incident Description:</span>
                <p className="text-slate-200 leading-relaxed">{selectedReport.description}</p>
              </div>

              {/* Cryptographic Evidence Seals */}
              {selectedReport.evidenceFiles && selectedReport.evidenceFiles.length > 0 && (
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-1.5 font-mono">
                  <span className="text-[10px] text-cyan-300 font-bold block">CRYPTOGRAPHIC DIGITAL EVIDENCE SEALS:</span>
                  {selectedReport.evidenceFiles.map((ev, i) => (
                    <div key={i} className="text-[11px] text-slate-300 flex items-center justify-between">
                      <span>📄 <strong className="text-white">{ev.fileName}</strong></span>
                      <span className="text-cyan-400 text-[10px]">SHA-256: {ev.sha256Hash.substring(0, 16)}...</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Officer Decision Form & Chain of Custody */}
              <form onSubmit={handleUpdateCase} className="p-4 bg-[#070d18] border border-cyan-900/50 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  {t.policeOfficerDecisionTitle}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-mono">{t.policeDutyOfficerLabel}</label>
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      className="w-full bg-[#0b1324] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-mono">{t.policeStatusTransitionLabel}</label>
                    <select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value as any)}
                      className="w-full bg-[#0b1324] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    >
                      <option value="UNDER_REVIEW">Under Active Investigation</option>
                      <option value="ESCALATED_RIB">Escalate to RIB Cyber Division</option>
                      <option value="ESCALATED_RNP">Dispatch RNP Tactical Squad</option>
                      <option value="RESOLVED">Resolved / Suspect Intercepted</option>
                      <option value="DISMISSED">Dismissed / Inconclusive</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-mono">{t.policeOfficerNotesLabel}</label>
                  <textarea
                    rows={2}
                    value={investigatorNote}
                    onChange={(e) => setInvestigatorNote(e.target.value)}
                    placeholder="Enter formal forensic observation, carrier subpoena details, or suspect apprehension log..."
                    className="w-full bg-[#0b1324] border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.policeBtnUpdateDocket}</span>
                </button>
              </form>

              {/* Chain of Custody Audit Trail */}
              {selectedReport.chainOfCustodyAudit && (
                <div className="p-4 bg-[#070d18] border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      {t.policeChainOfCustodyTitle}
                    </span>
                    <span className="text-[10px] text-slate-500">{selectedReport.chainOfCustodyAudit.length} Entries</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedReport.chainOfCustodyAudit.map((audit, i) => (
                      <div key={i} className="p-2 bg-[#0b1324] rounded-lg border border-slate-800/80 text-[11px] space-y-0.5">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-cyan-400 font-bold">{audit.actor}</span>
                          <span className="text-[10px]">{new Date(audit.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-200">{audit.action}</p>
                        <p className="text-[9px] text-slate-500">Hash: {audit.integrityHash.substring(0, 24)}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-[#0b1324] border border-slate-800 rounded-2xl">
              Select a case docket from the left list to review GPS telemetry and forensic evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
