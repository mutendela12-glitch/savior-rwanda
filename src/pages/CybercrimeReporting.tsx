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
  Check,
  MapPin,
  Car,
  Zap,
  Radio,
  ShieldAlert,
  DollarSign,
  KeyRound,
  Layers,
  PhoneCall,
  MessageSquare,
  AlertOctagon,
  Building2,
  ArrowRight,
  UserX,
  HelpCircle
} from 'lucide-react';
import { CybercrimeReport, LanguageCode } from '../types';
import { translations } from '../translations';

interface CybercrimeReportingProps {
  reports: CybercrimeReport[];
  language: LanguageCode;
  initialDetails?: { title: string; description: string; suspectContact?: string } | null;
  onRefreshData: () => void;
  onSwitchToOfficialPortal?: () => void;
}

export const CybercrimeReporting: React.FC<CybercrimeReportingProps> = ({
  reports,
  language,
  initialDetails,
  onRefreshData,
  onSwitchToOfficialPortal,
}) => {
  const t = translations[language];

  // Active view: 'REPORT_WIZARD' | 'TRACK_CASE'
  const [activeSubTab, setActiveSubTab] = useState<'REPORT_WIZARD' | 'TRACK_CASE'>('REPORT_WIZARD');

  // Core Questionnaire State
  // Q1: What was stolen?
  const [theftType, setTheftType] = useState<'MONEY' | 'INFORMATION' | 'BOTH'>('MONEY');

  // Q2A: Money Questions
  const [amountRwf, setAmountRwf] = useState<number>(initialDetails ? 50000 : 75000);
  const [paymentChannel, setPaymentChannel] = useState<'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK_TRANSFER' | 'AGENT_KIOSK' | 'OTHER'>('MTN_MOMO');
  const [bankProviderName, setBankProviderName] = useState<string>('Bank of Kigali (BK)');
  const [moneyDeceptionMethod, setMoneyDeceptionMethod] = useState<string>('FAKE_REVERSAL_SMS');
  const [customDeceptionText, setCustomDeceptionText] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('MP260328.0911.H49102');
  const [recipientAccountOrPhone, setRecipientAccountOrPhone] = useState<string>('+250 788 192 481');

  // Q2B: Information / Account Questions
  const [compromisedItems, setCompromisedItems] = useState<string[]>(['WHATSAPP_ACCOUNT', 'NATIONAL_ID']);
  const [infoTheftMethod, setInfoTheftMethod] = useState<string>('PHISHING_SMS_LINK');
  const [isOngoingImpersonation, setIsOngoingImpersonation] = useState<boolean>(true);
  const [extortionOrBlackmail, setExtortionOrBlackmail] = useState<boolean>(false);
  const [contactsAtRiskNotes, setContactsAtRiskNotes] = useState<string>('');

  // Q3: Suspect Profile
  const [suspectContact, setSuspectContact] = useState(initialDetails?.suspectContact || '+250 784 991 204');
  const [suspectNameOrAlias, setSuspectNameOrAlias] = useState('Officer Patrick (claimed MTN Security)');
  const [suspectPlatform, setSuspectPlatform] = useState('PHONE_CALL_SMS');
  const [suspectLanguage, setSuspectLanguage] = useState('KINYARWANDA');

  // Q4: Incident Details & Narrative
  const [title, setTitle] = useState(initialDetails?.title || 'Urgent Case: MoMo PIN Extortion & WhatsApp Impersonation');
  const [description, setDescription] = useState(initialDetails?.description || 'The suspect called claiming to be an MTN customer care representative verifying my MoMo account. Shortly after, a fraudulent reversal SMS arrived and they demanded my PIN, locking me out.');

  // Q5: Location & Telemetry in Rwanda
  const [district, setDistrict] = useState<string>('Gasabo');
  const [sector, setSector] = useState<string>('Remera');
  const [landmark, setLandmark] = useState<string>('Near Kisimenti Commercial Center');
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>({ lat: -1.9542, lng: 30.1082 });
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Q6: Immediate Protective Actions Requested from Police & RIB
  const [requestMoMoFreeze, setRequestMoMoFreeze] = useState<boolean>(true);
  const [requestSimLock, setRequestSimLock] = useState<boolean>(true);
  const [requestPatrolIntercept, setRequestPatrolIntercept] = useState<boolean>(false);

  // Evidence file simulation
  const [evidenceFileName, setEvidenceFileName] = useState<string>('scam_evidence_sms_receipt.png');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<CybercrimeReport | null>(null);

  // Tracking lookup
  const [trackingSearch, setTrackingSearch] = useState('');
  const [trackedResult, setTrackedResult] = useState<CybercrimeReport | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Handle GPS detection
  const handleDetectGps = () => {
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoordinates({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
          });
          setIsDetectingGps(false);
        },
        () => {
          setGpsCoordinates({ lat: -1.9542, lng: 30.1082 });
          setIsDetectingGps(false);
        },
        { timeout: 5000 }
      );
    } else {
      setGpsCoordinates({ lat: -1.9542, lng: 30.1082 });
      setIsDetectingGps(false);
    }
  };

  const toggleCompromisedItem = (itemKey: string) => {
    if (compromisedItems.includes(itemKey)) {
      setCompromisedItems(compromisedItems.filter(i => i !== itemKey));
    } else {
      setCompromisedItems([...compromisedItems, itemKey]);
    }
  };

  // Submit report to server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const immediateActionsRequested: string[] = [];
    if (requestMoMoFreeze) immediateActionsRequested.push('FREEZE_MOMO');
    if (requestSimLock) immediateActionsRequested.push('IMSI_LOCK');
    if (requestPatrolIntercept) immediateActionsRequested.push('DISPATCH_PATROL');

    // Determine category based on questionnaire
    let category: CybercrimeReport['category'] = 'MOBILE_MONEY_FRAUD';
    if (theftType === 'MONEY') {
      category = paymentChannel === 'MTN_MOMO' || paymentChannel === 'AIRTEL_MONEY' 
        ? 'MOBILE_MONEY_FRAUD' 
        : 'FINANCIAL_SCAM';
    } else if (theftType === 'INFORMATION') {
      if (compromisedItems.includes('WHATSAPP_ACCOUNT') || compromisedItems.includes('SOCIAL_MEDIA')) {
        category = 'ACCOUNT_HACKING';
      } else if (compromisedItems.includes('NATIONAL_ID')) {
        category = 'IDENTITY_THEFT';
      } else {
        category = 'PHISHING_LINK';
      }
    } else {
      category = 'MOBILE_MONEY_FRAUD';
    }

    const payload = {
      category,
      title,
      description,
      theftType,
      moneyDetails: (theftType === 'MONEY' || theftType === 'BOTH') ? {
        amountRwf: Number(amountRwf),
        paymentChannel,
        providerName: paymentChannel === 'BANK_TRANSFER' ? bankProviderName : paymentChannel,
        transactionReference: transactionRef,
        deceptionMethod: moneyDeceptionMethod === 'OTHER' ? customDeceptionText : moneyDeceptionMethod,
        recipientAccountOrPhone,
      } : undefined,
      informationDetails: (theftType === 'INFORMATION' || theftType === 'BOTH') ? {
        compromisedItems,
        theftMethod: infoTheftMethod,
        isOngoingImpersonation,
        extortionOrBlackmail,
        contactsAtRiskNotes,
      } : undefined,
      suspectDetails: {
        aliasOrName: suspectNameOrAlias,
        phoneOrWhatsApp: suspectContact,
        platformUsed: suspectPlatform,
        languageUsed: suspectLanguage,
      },
      immediateActionsRequested,
      financialLossAmount: (theftType === 'MONEY' || theftType === 'BOTH') ? Number(amountRwf) : 0,
      evidenceFileName: evidenceFileName || 'cybercrime_evidence.png',
      evidenceFileContent: `SAVIOR-OFFICIAL-CASE-EVIDENCE-${title}-${theftType}-${suspectContact}-${Date.now()}`,
      priority: (theftType === 'BOTH' || Number(amountRwf) > 100000 || isOngoingImpersonation) ? 'EMERGENCY' : 'URGENT',
      incidentLocation: {
        lat: gpsCoordinates?.lat || -1.9542,
        lng: gpsCoordinates?.lng || 30.1082,
        district,
        sector,
        address: `${landmark}, ${sector}, ${district}`,
      }
    };

    try {
      const res = await fetch('/api/reports/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit case to Police & RIB');

      setSubmissionSuccess(data);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Report transmission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchTracking = async (searchId?: string) => {
    const idToSearch = searchId || trackingSearch;
    if (!idToSearch.trim()) return;
    setTrackError(null);
    try {
      const res = await fetch(`/api/reports/track/${encodeURIComponent(idToSearch.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tracking ID not found in SAVIOR registry');
      setTrackedResult(data);
      setActiveSubTab('TRACK_CASE');
    } catch (err: any) {
      setTrackError(err.message);
      setTrackedResult(null);
    }
  };

  return (
    <div className="space-y-6 pb-14">
      {/* Official Case Intake Banner */}
      <div className="bg-gradient-to-r from-[#0b1324] via-[#0e1a32] to-[#0a1224] border border-cyan-900/60 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-950 to-rose-950 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase">
                  {t.reportIntakeBadge}
                </span>
                <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  Direct Transmission to Rwanda Investigation Bureau (RIB) & Police
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                {t.reportIntakeTitle}
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl mt-1">
                {t.reportIntakeSubtitle}
              </p>
            </div>
          </div>

          {/* Subtabs: New Report vs Track Existing */}
          <div className="flex items-center bg-[#070d18] border border-slate-800 rounded-xl p-1 gap-1 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('REPORT_WIZARD')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'REPORT_WIZARD'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.reportTabNew}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('TRACK_CASE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeSubTab === 'TRACK_CASE'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{t.reportTabTrack}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-300 ml-1">
                {reports.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'REPORT_WIZARD' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Wizard Column (8 cols) */}
          <div className="lg:col-span-8 bg-[#0b1324] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-7">
            {submissionSuccess ? (
              /* Success Confirmation Card with RIB Docket Number */
              <div className="p-7 bg-emerald-950/40 border border-emerald-500/80 rounded-2xl text-center space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-950">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    CASE OFFICIALLY TRANSMITTED TO POLICE & RIB
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                    {language === 'rw' ? 'Dosiye yawe yakiriwe muri Polisi & RIB!' : 'Case Docket Successfully Opened & Transmitted!'}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto">
                    {language === 'rw'
                      ? 'Icyaha cyawe cyanditswe, ibimenyetso birindwa n’ikimenyetso cya SHA-256. Polisi na RIB batangiye iperereza.'
                      : 'Your inquiry has been cryptographically sealed and dispatched directly to the Rwanda Investigation Bureau Cybercrime Division and RNP field response.'}
                  </p>
                </div>

                {/* Docket & Tracking IDs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left">
                  <div className="p-3.5 bg-[#070d18] border border-cyan-800/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 block font-semibold uppercase">
                      Citizen Tracking ID:
                    </span>
                    <span className="text-sm font-mono font-bold text-white select-all">
                      {submissionSuccess.trackingId}
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#070d18] border border-amber-800/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 block font-semibold uppercase">
                      Official RIB Docket Number:
                    </span>
                    <span className="text-sm font-mono font-bold text-amber-300 select-all">
                      {submissionSuccess.ribCaseNumber || 'RIB-CYBER-2026-ACTIVE'}
                    </span>
                  </div>
                </div>

                {/* Evidence Receipt Breakdown */}
                <div className="p-4 bg-[#070d18] border border-slate-800 rounded-xl text-left text-xs font-mono space-y-2 text-slate-300 max-w-lg mx-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-cyan-300 font-bold">DIGITAL EVIDENCE AUDIT:</span>
                    <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Court Admissible Seal
                    </span>
                  </div>
                  <p className="text-[11px] truncate">
                    <span className="text-slate-400">Digital Seal: </span>
                    <span className="text-white">{submissionSuccess.evidenceFiles?.[0]?.digitalSealSignature || 'SAVIOR-SEAL-RW-CONFIRMED'}</span>
                  </p>
                  <p className="text-[11px] truncate">
                    <span className="text-slate-400">SHA-256 Hash: </span>
                    <span className="text-cyan-300">{submissionSuccess.evidenceFiles?.[0]?.sha256Hash || 'e3b0c44298fc1c149afbf4...'}</span>
                  </p>
                  <p className="text-[11px]">
                    <span className="text-slate-400">Police Patrol Dispatch: </span>
                    <span className="text-amber-300">Target area {submissionSuccess.suspectLocation?.district} ({submissionSuccess.suspectLocation?.approximateAddress})</span>
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(submissionSuccess.trackingId);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-medium flex items-center gap-1.5 transition"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId ? 'Copied Tracking Code' : 'Copy Tracking Code'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setTrackedResult(submissionSuccess);
                      setActiveSubTab('TRACK_CASE');
                      setSubmissionSuccess(null);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-950"
                  >
                    {language === 'rw' ? 'Kurikirana aho Dosiye Igeze' : 'Track Investigation Live'}
                  </button>

                  {onSwitchToOfficialPortal && (
                    <button
                      onClick={onSwitchToOfficialPortal}
                      className="px-4 py-2.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{language === 'rw' ? 'Reba uko Polisi na RIB babyakiriye' : 'View in Police & RIB Console'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Questionnaire Intake Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* QUESTION 1: WHAT WAS STOLEN? */}
                <div className="space-y-3 bg-[#070d18] border border-cyan-900/50 p-4 sm:p-5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {t.reportQ1Title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 ml-8">
                    {t.reportQ1Subtitle}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 ml-0 sm:ml-8 pt-1">
                    {/* Option 1: Money */}
                    <button
                      type="button"
                      onClick={() => setTheftType('MONEY')}
                      className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                        theftType === 'MONEY'
                          ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg ring-1 ring-amber-500'
                          : 'bg-[#0b1324] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <DollarSign className={`w-6 h-6 ${theftType === 'MONEY' ? 'text-amber-400' : 'text-slate-400'}`} />
                        {theftType === 'MONEY' && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">
                          {t.reportTheftMoney}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t.reportTheftMoneyDesc}
                        </p>
                      </div>
                    </button>

                    {/* Option 2: Information / Credentials */}
                    <button
                      type="button"
                      onClick={() => setTheftType('INFORMATION')}
                      className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                        theftType === 'INFORMATION'
                          ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500'
                          : 'bg-[#0b1324] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <KeyRound className={`w-6 h-6 ${theftType === 'INFORMATION' ? 'text-cyan-400' : 'text-slate-400'}`} />
                        {theftType === 'INFORMATION' && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">
                          {t.reportTheftInfo}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t.reportTheftInfoDesc}
                        </p>
                      </div>
                    </button>

                    {/* Option 3: Both */}
                    <button
                      type="button"
                      onClick={() => setTheftType('BOTH')}
                      className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                        theftType === 'BOTH'
                          ? 'bg-rose-950/60 border-rose-500 text-white shadow-lg ring-1 ring-rose-500'
                          : 'bg-[#0b1324] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Layers className={`w-6 h-6 ${theftType === 'BOTH' ? 'text-rose-400' : 'text-slate-400'}`} />
                        {theftType === 'BOTH' && <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">
                          {t.reportTheftBoth}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t.reportTheftBothDesc}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* QUESTION 2A: DEEP DIVE INTO STOLEN MONEY (If Money or Both) */}
                {(theftType === 'MONEY' || theftType === 'BOTH') && (
                  <div className="space-y-4 bg-[#070d18] border border-amber-900/50 p-4 sm:p-5 rounded-2xl animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-950 border border-amber-400 text-amber-300 font-mono text-xs font-bold flex items-center justify-center">
                        2
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-400" />
                        <span>
                          {t.reportQ2MoneyTitle}
                        </span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 sm:ml-8">
                      {/* Amount stolen */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">
                          {t.reportAmountLost}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            step={500}
                            value={amountRwf}
                            onChange={(e) => setAmountRwf(Number(e.target.value))}
                            className="w-full bg-[#0b1324] border border-amber-600/70 rounded-xl px-3.5 py-2.5 text-sm font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                            required
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-400">RWF</span>
                        </div>
                      </div>

                      {/* Payment Channel */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">
                          {t.reportChannel}
                        </label>
                        <select
                          value={paymentChannel}
                          onChange={(e) => setPaymentChannel(e.target.value as any)}
                          className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                        >
                          <option value="MTN_MOMO">{t.reportChannelMtn}</option>
                          <option value="AIRTEL_MONEY">{t.reportChannelAirtel}</option>
                          <option value="BANK_TRANSFER">{t.reportChannelBank}</option>
                          <option value="AGENT_KIOSK">{t.reportChannelKiosk}</option>
                          <option value="OTHER">Other Financial Channel</option>
                        </select>
                      </div>

                      {/* If Bank Transfer, which Bank */}
                      {paymentChannel === 'BANK_TRANSFER' && (
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-medium text-slate-300">Bank Name in Rwanda:</label>
                          <select
                            value={bankProviderName}
                            onChange={(e) => setBankProviderName(e.target.value)}
                            className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            <option value="Bank of Kigali (BK)">Bank of Kigali (BK)</option>
                            <option value="I&M Bank Rwanda">I&M Bank Rwanda</option>
                            <option value="Equity Bank Rwanda">Equity Bank Rwanda</option>
                            <option value="BPR Bank Rwanda">BPR Bank Rwanda (Bank Populaire)</option>
                            <option value="Zigama CSS">Zigama CSS</option>
                            <option value="Cogebanque">Cogebanque</option>
                            <option value="Urwego Bank">Urwego Bank / SACCO</option>
                          </select>
                        </div>
                      )}

                      {/* How did the thief deceive you? */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-medium text-slate-300">
                          {t.reportDeceptionMethod}
                        </label>
                        <select
                          value={moneyDeceptionMethod}
                          onChange={(e) => setMoneyDeceptionMethod(e.target.value)}
                          className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="FAKE_REVERSAL_SMS">
                            Fake Reversal SMS / Call: "I sent you money by mistake, please refund me or enter your PIN"
                          </option>
                          <option value="MOMO_PIN_SCAM">
                            Fake Telecom Agent: Caller claimed to be MTN/Airtel asking for PIN to "prevent account suspension"
                          </option>
                          <option value="UNAUTHORIZED_PUSH_PROMPT">
                            Pop-up Push Prompt: Received MoMo approval prompt unexpectedly and entered PIN under pressure
                          </option>
                          <option value="JOB_RECRUITMENT_FEE">
                            Job / Tender Scam: Asked to send MoMo fee for interview, job placement, or tender documents
                          </option>
                          <option value="INVESTMENT_LOTTERY_SCAM">
                            Lottery / Forex Scam: Promised high returns, asked to deposit into an agent or personal number
                          </option>
                          <option value="SIM_SWAP_FRAUD">
                            SIM Swap: My phone suddenly lost network service and the thief drained my wallet at an agent kiosk
                          </option>
                          <option value="EXTORTION_BLACKMAIL">
                            Extortion / Threat: Blackmailed into sending money under threat of exposing private data
                          </option>
                          <option value="OTHER">Other Deception Technique (Describe below)</option>
                        </select>
                      </div>

                      {moneyDeceptionMethod === 'OTHER' && (
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-medium text-slate-300">Describe the deception method:</label>
                          <input
                            type="text"
                            value={customDeceptionText}
                            onChange={(e) => setCustomDeceptionText(e.target.value)}
                            placeholder="Explain how the scam occurred..."
                            className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      )}

                      {/* Transaction Reference / SMS Code */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">
                          Transaction ID / Reference (from SMS):
                        </label>
                        <input
                          type="text"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder="e.g. MP260328.0911.H49102"
                          className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Recipient Account or Phone */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">
                          Recipient Phone or Account that received funds:
                        </label>
                        <input
                          type="text"
                          value={recipientAccountOrPhone}
                          onChange={(e) => setRecipientAccountOrPhone(e.target.value)}
                          placeholder="+250 78X XXX XXX or Bank Account"
                          className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-rose-300 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* QUESTION 2B: DEEP DIVE INTO STOLEN INFORMATION / ACCOUNTS (If Information or Both) */}
                {(theftType === 'INFORMATION' || theftType === 'BOTH') && (
                  <div className="space-y-4 bg-[#070d18] border border-cyan-900/50 p-4 sm:p-5 rounded-2xl animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center">
                        {theftType === 'BOTH' ? '3' : '2'}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-cyan-400" />
                        <span>
                          {language === 'rw' 
                            ? 'Amakuru Bwite Cyangwa Konti Zinjiriwe n’Uko Byagenze' 
                            : 'Compromised Information & Account Hijacking Inquiry'}
                        </span>
                      </h3>
                    </div>

                    <div className="ml-0 sm:ml-8 space-y-4">
                      {/* Checkboxes: Which items compromised */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-300 block">
                          {language === 'rw' 
                            ? 'Ni ibihe bintu byawe byibwe cyangwa byinjiriwe? (Hitamo ibyabaye):' 
                            : 'Which accounts or personal data were stolen or hijacked? (Select all that apply):'}
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            { key: 'WHATSAPP_ACCOUNT', label: 'WhatsApp Account (Hacked or Taken Over)' },
                            { key: 'NATIONAL_ID', label: 'National ID (NID number or photo stolen)' },
                            { key: 'MOBILE_BANKING', label: 'Mobile Banking Login / App PIN' },
                            { key: 'EMAIL_ACCOUNT', label: 'Email Account (Gmail, Outlook, Yahoo)' },
                            { key: 'SOCIAL_MEDIA', label: 'Social Media (Instagram, Facebook, X, TikTok)' },
                            { key: 'SIM_CARD', label: 'Phone SIM Card (SIM Swap or Clone)' },
                            { key: 'PERSONAL_DOCS', label: 'Private Documents or Photos Extorted' },
                          ].map((item) => (
                            <label
                              key={item.key}
                              className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition ${
                                compromisedItems.includes(item.key)
                                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                                  : 'bg-[#0b1324] border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={compromisedItems.includes(item.key)}
                                onChange={() => toggleCompromisedItem(item.key)}
                                className="w-4 h-4 text-cyan-500 rounded border-slate-700 focus:ring-0 focus:ring-offset-0 bg-[#070d18]"
                              />
                              <span className="font-medium text-white">{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* How information was stolen */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-300">
                          {language === 'rw' ? 'Umujura yabonye ate amakuru yawe?' : 'How did the thief obtain or compromise your information?'}
                        </label>
                        <select
                          value={infoTheftMethod}
                          onChange={(e) => setInfoTheftMethod(e.target.value)}
                          className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                        >
                          <option value="PHISHING_SMS_LINK">
                            Clicked a Phishing link in SMS or WhatsApp ("Verify your Irembo/RRA/Bank details here")
                          </option>
                          <option value="OTP_VERIFICATION_TRICK">
                            Shared 6-digit SMS verification code (OTP) after caller asked for it
                          </option>
                          <option value="MALICIOUS_APK_DOWNLOAD">
                            Downloaded a suspicious Android APK file or app sent via WhatsApp or online link
                          </option>
                          <option value="IMPERSONATION_CALL">
                            Caller impersonated bank officer or telecom agent and asked for secret credentials
                          </option>
                          <option value="DEVICE_THEFT_LOST">
                            Physical device was stolen or lost while unlocked
                          </option>
                          <option value="UNKNOWN_HACK">
                            Suddenly lost access / unknown unauthorized login from foreign IP
                          </option>
                        </select>
                      </div>

                      {/* Active Threat: Is hacker currently messaging people? */}
                      <div className="p-3.5 bg-rose-950/40 border border-rose-600/60 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-rose-300 flex items-center gap-2">
                            <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
                            <span>Is the hacker currently messaging your contacts or asking for money?</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsOngoingImpersonation(true)}
                              className={`px-3 py-1 rounded text-xs font-bold font-mono transition ${
                                isOngoingImpersonation
                                  ? 'bg-rose-600 text-white shadow'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              YES (URGENT)
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsOngoingImpersonation(false)}
                              className={`px-3 py-1 rounded text-xs font-bold font-mono transition ${
                                !isOngoingImpersonation
                                  ? 'bg-slate-700 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              NO / UNSURE
                            </button>
                          </div>
                        </div>

                        {isOngoingImpersonation && (
                          <div className="space-y-1.5 pt-2 border-t border-rose-900/60">
                            <label className="text-[11px] text-rose-200">
                              Contacts, WhatsApp groups, or phone numbers at immediate risk:
                            </label>
                            <input
                              type="text"
                              value={contactsAtRiskNotes}
                              onChange={(e) => setContactsAtRiskNotes(e.target.value)}
                              placeholder="e.g. Family group, +250 788 ..., work colleagues"
                              className="w-full bg-[#0b1324] border border-rose-700 rounded-lg px-3 py-2 text-xs text-white placeholder-rose-300/40 focus:outline-none focus:border-rose-400 font-mono"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* QUESTION 3: SUSPECT PROFILE & CONTACT */}
                <div className="space-y-4 bg-[#070d18] border border-slate-800 p-4 sm:p-5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 text-slate-300 font-mono text-xs font-bold flex items-center justify-center">
                      {theftType === 'BOTH' ? '4' : '3'}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <UserX className="w-4 h-4 text-amber-400" />
                      <span>{language === 'rw' ? 'Umwirondoro w’Ukekwa (Umujura)' : 'Suspect Profile & Contact Channels'}</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 sm:ml-8">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Suspect Phone Number / WhatsApp / Caller ID:
                      </label>
                      <input
                        type="text"
                        value={suspectContact}
                        onChange={(e) => setSuspectContact(e.target.value)}
                        placeholder="+250 78X XXX XXX"
                        className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-rose-400 focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Fake Name, Alias, or Authority Claimed:
                      </label>
                      <input
                        type="text"
                        value={suspectNameOrAlias}
                        onChange={(e) => setSuspectNameOrAlias(e.target.value)}
                        placeholder="e.g. Officer Patrick, MTN Agent Eric, BK Customer Service"
                        className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Platform Used by Suspect:</label>
                      <select
                        value={suspectPlatform}
                        onChange={(e) => setSuspectPlatform(e.target.value)}
                        className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="PHONE_CALL_SMS">Direct Phone Call & SMS</option>
                        <option value="WHATSAPP">WhatsApp Call / Message</option>
                        <option value="COUNTERFEIT_WEBSITE">Phishing / Counterfeit Website</option>
                        <option value="TELEGRAM">Telegram Channel</option>
                        <option value="FACEBOOK_INSTAGRAM">Facebook / Instagram</option>
                        <option value="PHYSICAL_KIOSK">Physical Agent Kiosk Encounter</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Language / Accent Spoken:</label>
                      <select
                        value={suspectLanguage}
                        onChange={(e) => setSuspectLanguage(e.target.value)}
                        className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option value="KINYARWANDA">Kinyarwanda (Fluent)</option>
                        <option value="ENGLISH">English</option>
                        <option value="FRENCH">French</option>
                        <option value="KISWAHILI">Kiswahili</option>
                        <option value="MIXED">Mixed / Other Accent</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* QUESTION 4: INCIDENT LOCATION & GPS COORDINATES */}
                <div className="space-y-3 bg-[#070d18] border border-slate-800 p-4 sm:p-5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 text-slate-300 font-mono text-xs font-bold flex items-center justify-center">
                        {theftType === 'BOTH' ? '5' : '4'}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-400" />
                        <span>Incident Location in Rwanda (for Police Patrol Intercept)</span>
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={handleDetectGps}
                      disabled={isDetectingGps}
                      className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{isDetectingGps ? 'Detecting GPS...' : 'Detect My GPS'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 ml-0 sm:ml-8">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">District:</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                      >
                        <option value="Gasabo">Gasabo (Kigali)</option>
                        <option value="Nyarugenge">Nyarugenge (Kigali)</option>
                        <option value="Kicukiro">Kicukiro (Kigali)</option>
                        <option value="Musanze">Musanze (Northern)</option>
                        <option value="Rubavu">Rubavu (Western)</option>
                        <option value="Huye">Huye (Southern)</option>
                        <option value="Rwamagana">Rwamagana (Eastern)</option>
                        <option value="Muhanga">Muhanga (Southern)</option>
                        <option value="Nyagatare">Nyagatare (Eastern)</option>
                        <option value="Rusizi">Rusizi (Western)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Sector:</label>
                      <input
                        type="text"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        placeholder="e.g. Remera, Gikondo"
                        className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">GPS Coordinates (Auto-Locked):</label>
                      <div className="p-2 bg-[#0b1324] border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 flex items-center justify-between">
                        <span>{gpsCoordinates ? `${gpsCoordinates.lat.toFixed(4)}, ${gpsCoordinates.lng.toFixed(4)}` : 'Detecting...'}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700">GPS OK</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QUESTION 5: EVIDENCE & IMMEDIATE PROTECTIVE REQUESTS */}
                <div className="space-y-4 bg-[#070d18] border border-slate-800 p-4 sm:p-5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 text-slate-300 font-mono text-xs font-bold flex items-center justify-center">
                      {theftType === 'BOTH' ? '6' : '5'}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-cyan-400" />
                      <span>Digital Evidence Attachment & Immediate Police Actions</span>
                    </h3>
                  </div>

                  <div className="ml-0 sm:ml-8 space-y-4">
                    {/* Narrative Title & Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Case Title Summary:</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[#0b1324] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Detailed Sequence of Events:</label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide details on what the thief said, exact timeline, messages received..."
                        className="w-full bg-[#0b1324] border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    {/* Evidence Attachment */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Screenshot / SMS Export Attachment:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={evidenceFileName}
                          onChange={(e) => setEvidenceFileName(e.target.value)}
                          className="flex-1 bg-[#0b1324] border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                        />
                        <div className="px-3.5 py-2 bg-slate-900 border border-cyan-800/80 rounded-xl text-xs text-cyan-300 flex items-center gap-1.5 font-mono">
                          <Lock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>SHA-256 Tamper Seal</span>
                        </div>
                      </div>
                    </div>

                    {/* Immediate Fast Action Requests to Police & RIB */}
                    <div className="p-3.5 bg-[#0b1324] border border-cyan-900/60 rounded-xl space-y-2">
                      <span className="text-[11px] font-bold text-cyan-300 font-mono block">
                        {t.reportQ6ActionsTitle}:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requestMoMoFreeze}
                            onChange={(e) => setRequestMoMoFreeze(e.target.checked)}
                            className="rounded text-amber-500 bg-slate-900 border-slate-700"
                          />
                          <span>{t.reportActionFreezeMoMo}</span>
                        </label>

                        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requestSimLock}
                            onChange={(e) => setRequestSimLock(e.target.checked)}
                            className="rounded text-rose-500 bg-slate-900 border-slate-700"
                          />
                          <span>{t.reportActionSimLock}</span>
                        </label>

                        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requestPatrolIntercept}
                            onChange={(e) => setRequestPatrolIntercept(e.target.checked)}
                            className="rounded text-cyan-500 bg-slate-900 border-slate-700"
                          />
                          <span>{t.reportActionPatrol}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition shadow-xl shadow-amber-950 flex items-center justify-center gap-2.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>{t.reportBtnSubmitting}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>{t.reportBtnSubmit}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Case Guidance & Citizen Hotlines (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Direct Official Helpline Box */}
            <div className="bg-gradient-to-br from-[#0b1324] to-[#111e38] border border-amber-900/60 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Rwanda Cyber Emergency Hotlines</h4>
                  <p className="text-[11px] text-slate-400">Toll-free 24/7 direct intervention</p>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 bg-[#070d18] border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="text-slate-300">RIB Cybercrime Hotline:</span>
                  <strong className="text-amber-400 text-sm">166</strong>
                </div>
                <div className="p-2.5 bg-[#070d18] border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="text-slate-300">Rwanda National Police:</span>
                  <strong className="text-cyan-400 text-sm">112</strong>
                </div>
                <div className="p-2.5 bg-[#070d18] border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="text-slate-300">MTN MoMo Fraud Center:</span>
                  <strong className="text-yellow-400 text-sm">100</strong>
                </div>
                <div className="p-2.5 bg-[#070d18] border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="text-slate-300">Airtel Money Fraud:</span>
                  <strong className="text-rose-400 text-sm">100</strong>
                </div>
              </div>
            </div>

            {/* Immediate Citizen Safety Steps */}
            <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span>What to do IMMEDIATELY:</span>
              </h4>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-2.5 bg-[#070d18] border border-slate-800/80 rounded-xl space-y-1">
                  <strong className="text-amber-400 block">1. If Money was stolen:</strong>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Dial <strong>*182#</strong> immediately or call 100 to freeze your MoMo wallet. Do NOT delete any SMS messages received from MTN or Airtel.
                  </p>
                </div>

                <div className="p-2.5 bg-[#070d18] border border-slate-800/80 rounded-xl space-y-1">
                  <strong className="text-cyan-400 block">2. If WhatsApp was hijacked:</strong>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Warn your close family and colleagues immediately via standard SMS or phone call so they do not send money to the imposter.
                  </p>
                </div>

                <div className="p-2.5 bg-[#070d18] border border-slate-800/80 rounded-xl space-y-1">
                  <strong className="text-emerald-400 block">3. Keep Evidence Intact:</strong>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Take screenshots of phone call history, SMS messages, and any payment receipts. Every detail is cryptographically sealed for the court.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CASE TRACKING VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tracking Search & Status (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>Real-Time Case Dossier & RIB Investigation Tracker</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your SAVIOR tracking ID or official RIB docket number to inspect live case progress, investigator assignments, and suspect GPS triangulation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={trackingSearch}
                  onChange={(e) => setTrackingSearch(e.target.value.toUpperCase())}
                  placeholder="e.g. SAV-2026-XXXXXX or RIB-CYBER-2026-XXXXX"
                  className="flex-1 bg-[#070d18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => handleSearchTracking()}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Track Case
                </button>
              </div>

              {trackError && (
                <div className="p-3 bg-rose-950/60 border border-rose-600 rounded-xl text-xs text-rose-200">
                  {trackError}
                </div>
              )}
            </div>

            {/* Display Tracked Result */}
            {trackedResult ? (
              <div className="bg-[#0b1324] border border-cyan-900/60 rounded-2xl p-6 space-y-5 shadow-xl animate-fadeIn text-xs">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-300 text-sm">
                        {trackedResult.trackingId}
                      </span>
                      {trackedResult.ribCaseNumber && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold">
                          {trackedResult.ribCaseNumber}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-white text-base mt-1">{trackedResult.title}</h4>
                  </div>

                  <span className={`text-xs font-mono px-3 py-1 rounded-lg font-bold ${
                    trackedResult.status === 'RESOLVED' 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                      : trackedResult.status === 'ESCALATED_RIB'
                      ? 'bg-amber-950 text-amber-300 border border-amber-600'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-600'
                  }`}>
                    {trackedResult.status}
                  </span>
                </div>

                {/* Theft Details Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">THEFT TYPE:</span>
                    <strong className="text-white">{trackedResult.theftType || trackedResult.category}</strong>
                  </div>
                  <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">REPORTED LOSS:</span>
                    <strong className="text-emerald-400">
                      {trackedResult.financialLossAmount?.toLocaleString() || 0} RWF
                    </strong>
                  </div>
                  <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">SUSPECT CONTACT:</span>
                    <strong className="text-rose-400">{trackedResult.suspectContact || 'Unknown'}</strong>
                  </div>
                </div>

                {/* Stolen Money Details if applicable */}
                {trackedResult.moneyDetails && (
                  <div className="p-3.5 bg-amber-950/20 border border-amber-900/50 rounded-xl space-y-1.5 font-mono">
                    <span className="text-amber-400 font-bold text-[11px] block flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> STOLEN MONEY FORENSICS:
                    </span>
                    <p className="text-slate-200">
                      Channel: <strong className="text-white">{trackedResult.moneyDetails.paymentChannel}</strong>
                    </p>
                    <p className="text-slate-200">
                      Transaction Ref: <strong className="text-cyan-300">{trackedResult.moneyDetails.transactionReference || 'N/A'}</strong>
                    </p>
                    <p className="text-slate-300 text-[11px]">
                      Deception Method: {trackedResult.moneyDetails.deceptionMethod}
                    </p>
                  </div>
                )}

                {/* Stolen Information Details if applicable */}
                {trackedResult.informationDetails && (
                  <div className="p-3.5 bg-cyan-950/20 border border-cyan-900/50 rounded-xl space-y-1.5 font-mono">
                    <span className="text-cyan-300 font-bold text-[11px] block flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" /> COMPROMISED ACCOUNTS / DATA:
                    </span>
                    <p className="text-slate-200">
                      Compromised Items: <strong className="text-white">{trackedResult.informationDetails.compromisedItems.join(', ')}</strong>
                    </p>
                    <p className="text-slate-200">
                      Theft Technique: <strong className="text-cyan-300">{trackedResult.informationDetails.theftMethod}</strong>
                    </p>
                    {trackedResult.informationDetails.isOngoingImpersonation && (
                      <span className="text-rose-400 font-bold block animate-pulse">
                        ⚠️ High Alert: Suspect is currently impersonating victim to contacts!
                      </span>
                    )}
                  </div>
                )}

                {/* Suspect Triangulation GPS Telemetry */}
                {trackedResult.suspectLocation && (
                  <div className="p-4 bg-gradient-to-br from-[#070d18] to-[#0a1222] border border-rose-900/50 rounded-xl space-y-2 font-mono">
                    <div className="flex items-center justify-between border-b border-rose-950 pb-1.5">
                      <span className="text-rose-400 font-bold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> SUSPECT GPS LOCATION (TRIANGULATED BY POLICE & RIB)
                      </span>
                      <span className="text-[10px] text-slate-400">Cell Triangulation</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400">Approximate Location: </span>
                        <strong className="text-white">{trackedResult.suspectLocation.approximateAddress}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Telecom Tower Node: </span>
                        <strong className="text-cyan-300">{trackedResult.suspectLocation.cellTower}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Carrier / ISP: </span>
                        <strong className="text-emerald-400">{trackedResult.suspectLocation.isp}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Hardware / Device: </span>
                        <strong className="text-slate-200">{trackedResult.suspectLocation.deviceModel}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned Police Patrol Unit */}
                {trackedResult.assignedPatrolUnit && (
                  <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl font-mono text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="text-amber-300 font-bold block">Assigned Intercept Patrol Unit:</span>
                        <span className="text-slate-200">{trackedResult.assignedPatrolUnit.unitId} ({trackedResult.assignedPatrolUnit.officerCallsign})</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold">
                      ETA: {trackedResult.assignedPatrolUnit.etaMinutes} mins
                    </span>
                  </div>
                )}

                {/* Fast actions taken */}
                {trackedResult.fastActionsTaken && trackedResult.fastActionsTaken.length > 0 && (
                  <div className="p-3 bg-[#070d18] border border-cyan-900/60 rounded-xl font-mono text-xs space-y-1.5">
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Rapid Law Enforcement Interventions:
                    </span>
                    {trackedResult.fastActionsTaken.map((act, i) => (
                      <p key={i} className="text-slate-300 text-[11px]">
                        ⚡ <strong className="text-white">[{act.actionType}]:</strong> {act.details}
                      </p>
                    ))}
                  </div>
                )}

                {/* Investigator Notes */}
                {trackedResult.investigatorNotes && trackedResult.investigatorNotes.length > 0 && (
                  <div className="p-3 bg-[#070d18] border border-slate-800 rounded-xl font-mono text-xs space-y-1">
                    <span className="text-slate-400 text-[10px] block font-bold">INVESTIGATOR DIARY NOTES:</span>
                    {trackedResult.investigatorNotes.map((note, idx) => (
                      <p key={idx} className="text-slate-200 text-[11px]">
                        • {note}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 bg-[#0b1324] border border-slate-800 rounded-2xl text-center text-slate-500 font-mono text-xs">
                Select a case from the list on the right or enter a tracking ID above to inspect its real-time dossier.
              </div>
            )}
          </div>

          {/* Quick list of Citizen's reported cases (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Your Logged Cases ({reports.length})</span>
                </h3>
                <span className="text-[10px] font-mono text-cyan-400">Click to Inspect</span>
              </div>

              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {reports.map((r) => {
                  const isSelected = trackedResult?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        setTrackedResult(r);
                        setTrackingSearch(r.trackingId);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition text-xs space-y-2 ${
                        isSelected
                          ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-lg'
                          : 'bg-[#070d18] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-cyan-300">{r.trackingId}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          r.status === 'RESOLVED' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                            : 'bg-amber-950 text-amber-300 border border-amber-600'
                        }`}>
                          {r.status}
                        </span>
                      </div>

                      <h4 className="font-semibold text-white leading-snug">{r.title}</h4>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>{r.theftType || r.category}</span>
                        <span className="text-emerald-400 font-bold">
                          {r.financialLossAmount ? `${r.financialLossAmount.toLocaleString()} RWF` : 'Personal Data'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {reports.length === 0 && (
                  <div className="p-6 text-center text-slate-500 font-mono text-xs">
                    No cases filed yet. Use the reporting wizard to file a case.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
