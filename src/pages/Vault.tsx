import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  FileText, 
  CreditCard, 
  KeyRound, 
  Eye, 
  Smartphone, 
  Scan, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  ExternalLink,
  Laptop,
  CheckCircle2,
  XCircle,
  Plus
} from 'lucide-react';
import { 
  UserProfile, 
  BiometricProfile, 
  FinancialConnection, 
  TransactionAuthorization, 
  CybercrimeReport, 
  ActiveSession,
  LanguageCode 
} from '../types';
import { translations } from '../translations';
import { BiometricScannerModal } from '../components/BiometricScannerModal';
import { TransactionAuthModal } from '../components/TransactionAuthModal';

interface VaultProps {
  user: UserProfile | null;
  biometricProfile: BiometricProfile | null;
  financialConnections: FinancialConnection[];
  transactions: TransactionAuthorization[];
  reports: CybercrimeReport[];
  sessions: ActiveSession[];
  language: LanguageCode;
  onRefreshData: () => void;
  onOpenEmergencyLock: () => void;
  onOpenRecovery: () => void;
}

export const Vault: React.FC<VaultProps> = ({
  user,
  biometricProfile,
  financialConnections,
  transactions,
  reports,
  sessions,
  language,
  onRefreshData,
  onOpenEmergencyLock,
  onOpenRecovery,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'incidents' | 'connections' | 'transactions' | 'recovery' | 'privacy'>('profile');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedTxForAuth, setSelectedTxForAuth] = useState<TransactionAuthorization | null>(null);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [faceModalMode, setFaceModalMode] = useState<'VERIFY' | 'ENROLL'>('ENROLL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const t = translations[language];

  useEffect(() => {
    fetch('/api/vault/backup-codes')
      .then(res => res.json())
      .then(data => {
        if (data.backupCodes) setBackupCodes(data.backupCodes);
      })
      .catch(() => {});
  }, []);

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await fetch(`/api/user/sessions/${sessionId}`, { method: 'DELETE' });
      onRefreshData();
      showFeedback('Session revoked successfully.');
    } catch (e) {}
  };

  const handleToggleConnection = async (connectionId: string, action: 'CONNECT' | 'DISCONNECT' | 'UPGRADE_SHIELD') => {
    try {
      await fetch('/api/financial/connections/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, action }),
      });
      onRefreshData();
      showFeedback('Financial connection updated.');
    } catch (e) {}
  };

  const handleDeleteBiometrics = async () => {
    if (confirm('Are you sure you want to delete your biometric face vector? This will lower your security score.')) {
      try {
        await fetch('/api/biometrics', { method: 'DELETE' });
        onRefreshData();
        showFeedback('Biometric template securely wiped from vault.');
      } catch (e) {}
    }
  };

  const handleRejectTx = async (txId: string) => {
    try {
      await fetch('/api/transactions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId, reason: 'Rejected from vault' }),
      });
      onRefreshData();
      showFeedback('Transaction rejected and blocked.');
    } catch (e) {}
  };

  const navTabs = [
    { id: 'profile', label: t.vaultProfile, icon: User },
    { id: 'security', label: t.vaultSecurity, icon: ShieldCheck },
    { id: 'incidents', label: t.vaultIncidents, icon: FileText },
    { id: 'connections', label: t.vaultConnections, icon: CreditCard },
    { id: 'transactions', label: t.vaultTransactions, icon: Lock },
    { id: 'recovery', label: t.vaultRecovery, icon: KeyRound },
    { id: 'privacy', label: t.vaultPrivacy, icon: Scan },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Vault Header Banner */}
      <div className="bg-[#0b1324] border border-cyan-900/60 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {t.vaultTitle}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                  AES-256 ENCRYPTED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {t.vaultBannerSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenEmergencyLock}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/70 text-rose-200 rounded-lg text-xs font-semibold tracking-wide transition shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{t.btnEmergencyLock}</span>
            </button>

            <button
              onClick={() => {
                setFaceModalMode('VERIFY');
                setShowFaceModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/60 text-cyan-300 rounded-lg text-xs font-semibold tracking-wide transition"
            >
              <Scan className="w-4 h-4 text-cyan-400" />
              <span>{t.btnVerifyFace}</span>
            </button>
          </div>
        </div>

        {actionSuccessMsg && (
          <div className="mt-4 p-2.5 bg-emerald-950/80 border border-emerald-500 rounded-lg text-xs text-emerald-200 font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Compartment Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 p-1.5 bg-[#070d18] border border-slate-800 rounded-xl">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* COMPARTMENT 1: PROFILE */}
      {activeTab === 'profile' && user && (
        <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">{t.vaultProfile}</h3>
              <p className="text-xs text-slate-400">Cryptographically bound citizen profile</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-600">
              NATIONAL ID VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-3.5 bg-[#070d18] border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">{t.vaultProfileLegalName}</span>
              <span className="text-sm font-semibold text-white">{user.fullName}</span>
            </div>

            <div className="p-3.5 bg-[#070d18] border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">{t.vaultProfileNationalId}</span>
              <span className="text-sm font-mono text-cyan-300">{user.nationalIdMasked}</span>
            </div>

            <div className="p-3.5 bg-[#070d18] border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">{t.vaultProfilePhone}</span>
              <span className="text-sm font-mono text-white">{user.phone}</span>
            </div>

            <div className="p-3.5 bg-[#070d18] border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">{t.vaultProfileEmail}</span>
              <span className="text-sm font-mono text-white">{user.email}</span>
            </div>

            <div className="p-3.5 bg-[#070d18] border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">{t.vaultProfileResidence}</span>
              <span className="text-sm text-white">{user.district}, {user.province}</span>
            </div>

            <div className="p-3.5 bg-[#070d18] border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">{t.vaultProfileStatus}</span>
              <span className="text-sm font-bold text-emerald-400">ACTIVE DEFENSE (UNLOCKED)</span>
            </div>
          </div>
        </div>
      )}

      {/* COMPARTMENT 2: SECURITY & SESSIONS */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Active Devices & Sessions */}
          <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Active Trusted Hardware Sessions</h3>
                <p className="text-xs text-slate-400">Review devices with active cryptographic tokens</p>
              </div>
              <span className="text-xs font-mono text-cyan-300">{sessions.length} Connected Devices</span>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 bg-[#070d18] border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 mt-0.5">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{sess.deviceName}</span>
                        {sess.isCurrent && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                            CURRENT
                          </span>
                        )}
                        {!sess.isTrusted && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-700">
                            UNTRUSTED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {sess.browser} • {sess.ipAddress} • {sess.location}
                      </p>
                      <p className="text-[10px] text-slate-500">Last active: {sess.lastActive}</p>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(sess.id)}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-700 text-rose-300 rounded-lg text-xs font-medium transition self-start sm:self-center"
                    >
                      Revoke Token
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPARTMENT 3: MY INCIDENTS */}
      {activeTab === 'incidents' && (
        <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Cryptographic Cybercrime Reports</h3>
              <p className="text-xs text-slate-400">All submitted fraud reports sealed with SHA-256 digital custody</p>
            </div>
            <span className="text-xs font-mono text-cyan-300">{reports.length} Reports Logged</span>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 bg-[#070d18] border border-slate-800 rounded-xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                      {rep.trackingId}
                    </span>
                    <span className="text-sm font-semibold text-white">{rep.title}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded self-start ${
                    rep.status === 'ESCALATED_RIB' ? 'bg-amber-950 text-amber-300 border border-amber-600' :
                    rep.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' :
                    'bg-slate-900 text-slate-300 border border-slate-700'
                  }`}>
                    {rep.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{rep.description}</p>

                {rep.evidenceFiles && rep.evidenceFiles.length > 0 && (
                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs space-y-1 font-mono">
                    <span className="text-[10px] text-slate-400 block">DIGITALLY SEALED EVIDENCE:</span>
                    {rep.evidenceFiles.map((f, i) => (
                      <div key={i} className="text-[11px] text-cyan-300 truncate">
                        📄 {f.fileName} (SHA-256: {f.sha256Hash.substring(0, 16)}...)
                      </div>
                    ))}
                  </div>
                )}

                {rep.investigatorNotes && rep.investigatorNotes.length > 0 && (
                  <div className="p-2.5 bg-cyan-950/30 border border-cyan-900/40 rounded-lg text-xs space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono">Official Authority Notes:</span>
                    {rep.investigatorNotes.map((note, i) => (
                      <p key={i} className="text-[11px] text-slate-300 italic">{note}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPARTMENT 4: CONNECTED FINANCIAL SIMULATORS */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Simulated Financial Service Connections</h3>
                <p className="text-xs text-amber-300/90 font-mono">
                  SIMULATED FINANCIAL CONNECTION — NO REAL MONEY IS MOVED
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {financialConnections.map((conn) => (
                <div
                  key={conn.id}
                  className="p-5 bg-[#070d18] border border-slate-800 hover:border-cyan-900/70 rounded-xl space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{conn.providerName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{conn.accountNumberMasked}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      conn.status === 'CONNECTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-slate-900 text-slate-400'
                    }`}>
                      {conn.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                    <span className="text-slate-400">Simulated Balance:</span>
                    <span className="font-bold text-emerald-400">
                      {conn.lastSimulatedBalance.toLocaleString()} {conn.currency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Protection Shield:</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      conn.authLevel === 'SAVIOR_HIGH_SHIELD' ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' : 'bg-slate-900 text-slate-300'
                    }`}>
                      {conn.authLevel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleToggleConnection(conn.id, 'UPGRADE_SHIELD')}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded text-xs font-medium transition"
                    >
                      {conn.authLevel === 'SAVIOR_HIGH_SHIELD' ? 'Downgrade to Std' : 'Upgrade to High-Shield'}
                    </button>
                    <button
                      onClick={() => handleToggleConnection(conn.id, conn.status === 'CONNECTED' ? 'DISCONNECT' : 'CONNECT')}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                        conn.status === 'CONNECTED' ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900' : 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                      }`}
                    >
                      {conn.status === 'CONNECTED' ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPARTMENT 5: TRANSACTION AUTHORIZATIONS */}
      {activeTab === 'transactions' && (
        <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Strong Transaction Authorizations</h3>
              <p className="text-xs text-slate-400">Password + MFA + 1:1 Biometric Face verification history</p>
            </div>
            <span className="text-xs font-mono text-cyan-300">{transactions.length} Authorizations</span>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 bg-[#070d18] border border-slate-800 rounded-xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                      {tx.referenceCode}
                    </span>
                    <span className="text-sm font-semibold text-white">{tx.providerName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      tx.riskLevel === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-700' :
                      tx.riskLevel === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    }`}>
                      {tx.riskLevel} RISK
                    </span>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      tx.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' :
                      tx.status === 'PENDING' ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse' :
                      'bg-rose-950 text-rose-300 border border-rose-600'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 bg-slate-900/60 rounded">
                    <span className="text-[10px] text-slate-400 block">RECIPIENT:</span>
                    <span className="text-white font-medium">{tx.recipientName}</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded">
                    <span className="text-[10px] text-slate-400 block">AMOUNT:</span>
                    <span className="text-emerald-400 font-bold">{tx.amount.toLocaleString()} {tx.currency}</span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded">
                    <span className="text-[10px] text-slate-400 block">TIME:</span>
                    <span className="text-slate-300">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                {tx.status === 'PENDING' && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleRejectTx(tx.id)}
                      className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-700 text-rose-300 rounded-lg text-xs font-medium transition"
                    >
                      {t.btnReject}
                    </button>
                    <button
                      onClick={() => setSelectedTxForAuth(tx)}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-cyan-950"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t.btnAuthorize} (Password + MFA + Face)</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPARTMENT 6: EMERGENCY RECOVERY & BACKUP CODES */}
      {activeTab === 'recovery' && (
        <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Emergency Backup Keys & Recovery</h3>
              <p className="text-xs text-slate-400">Keep these 12-character emergency codes in a safe place</p>
            </div>
            <button
              onClick={onOpenRecovery}
              className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-300 rounded text-xs font-semibold font-mono"
            >
              Test Recovery Flow
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {backupCodes.map((code, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#070d18] border border-slate-800 rounded-xl flex items-center justify-between font-mono text-xs"
              >
                <span className="text-cyan-300 font-bold tracking-wider">{code}</span>
                <button
                  onClick={() => handleCopy(code)}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition"
                  title="Copy recovery code"
                >
                  {copiedCode === code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMPARTMENT 7: PRIVACY & BIOMETRICS */}
      {activeTab === 'privacy' && biometricProfile && (
        <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Biometric Privacy & Template Controls</h3>
              <p className="text-xs text-slate-400">Strict adherence to Rwandan Cyber Security Law (Law Nº 60/2018)</p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600">
              {biometricProfile.enrolled ? 'ACTIVE VECTOR' : 'NO BIOMETRICS'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#070d18] border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-white block">Template Cryptography</span>
              <p className="text-xs text-slate-300 font-mono">Algorithm: {biometricProfile.algorithm}</p>
              <p className="text-xs text-slate-400 font-mono truncate">Hash: {biometricProfile.templateHash || 'N/A'}</p>
              <p className="text-[11px] text-slate-500">Enrolled At: {biometricProfile.enrolledAt ? new Date(biometricProfile.enrolledAt).toLocaleDateString() : 'N/A'}</p>
            </div>

            <div className="p-4 bg-[#070d18] border border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-bold text-white block">Biometric Data Deletion</span>
              <p className="text-xs text-slate-400">
                You can permanently purge your facial vector geometry from the SAVIOR vault at any time.
              </p>
              <button
                onClick={handleDeleteBiometrics}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-300 rounded-lg text-xs font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Biometric Template</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Biometric Scanner Modal */}
      <BiometricScannerModal
        isOpen={showFaceModal}
        onClose={() => setShowFaceModal(false)}
        onSuccess={() => {
          onRefreshData();
          showFeedback('Biometric verification passed.');
        }}
        mode={faceModalMode}
        language={language}
      />

      {/* Transaction Auth Modal */}
      <TransactionAuthModal
        isOpen={Boolean(selectedTxForAuth)}
        onClose={() => setSelectedTxForAuth(null)}
        transaction={selectedTxForAuth}
        onAuthorized={() => {
          onRefreshData();
          showFeedback('Transaction authorized successfully!');
        }}
        language={language}
      />
    </div>
  );
};
