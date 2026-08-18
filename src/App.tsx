import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EmergencyLockModal } from './components/EmergencyLockModal';
import { AccountRecoveryModal } from './components/AccountRecoveryModal';
import { BiometricScannerModal } from './components/BiometricScannerModal';
import { TrustCenter } from './pages/TrustCenter';
import { Vault } from './pages/Vault';
import { ScamScanner } from './pages/ScamScanner';
import { FinancialSimulator } from './pages/FinancialSimulator';
import { CybercrimeReporting } from './pages/CybercrimeReporting';
import { OfficialCommandPortal } from './pages/OfficialCommandPortal';
import { AdminSOC } from './pages/AdminSOC';
import { SaviorAIChat } from './pages/SaviorAIChat';
import { 
  UserProfile, 
  SecurityScoreBreakdown, 
  BiometricProfile, 
  FinancialConnection, 
  TransactionAuthorization, 
  CybercrimeReport, 
  ActiveSession, 
  SecurityAlert, 
  LanguageCode 
} from './types';
import { ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('trust-center');
  const [language, setLanguage] = useState<LanguageCode>('rw'); // Default to Kinyarwanda as requested for Rwanda users

  // Core system state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [securityScore, setSecurityScore] = useState<SecurityScoreBreakdown | null>(null);
  const [biometricProfile, setBiometricProfile] = useState<BiometricProfile | null>(null);
  const [financialConnections, setFinancialConnections] = useState<FinancialConnection[]>([]);
  const [transactions, setTransactions] = useState<TransactionAuthorization[]>([]);
  const [reports, setReports] = useState<CybercrimeReport[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isEmergencyLockOpen, setIsEmergencyLockOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [prefilledReportDetails, setPrefilledReportDetails] = useState<{ title: string; description: string; suspectContact?: string } | null>(null);

  const fetchAppData = async () => {
    try {
      const [
        userRes,
        scoreRes,
        bioRes,
        finRes,
        txRes,
        repRes,
        sessRes,
        alertRes
      ] = await Promise.all([
        fetch('/api/user/profile').then(r => r.ok ? r.json() : null),
        fetch('/api/security/score').then(r => r.ok ? r.json() : null),
        fetch('/api/biometrics/status').then(r => r.ok ? r.json() : null),
        fetch('/api/financial/connections').then(r => r.ok ? r.json() : []),
        fetch('/api/transactions').then(r => r.ok ? r.json() : []),
        fetch('/api/reports').then(r => r.ok ? r.json() : []),
        fetch('/api/user/sessions').then(r => r.ok ? r.json() : []),
        fetch('/api/alerts').then(r => r.ok ? r.json() : []),
      ]);

      if (userRes) setUser(userRes);
      if (scoreRes) setSecurityScore(scoreRes);
      if (bioRes) setBiometricProfile(bioRes);
      if (finRes) setFinancialConnections(finRes);
      if (txRes) setTransactions(txRes);
      if (repRes) setReports(repRes);
      if (sessRes) setSessions(sessRes);
      if (alertRes) setAlerts(alertRes);
    } catch (error) {
      console.error('Failed to load SAVIOR platform state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
  }, []);

  const handleRoleChange = async (newRole: UserProfile['role']) => {
    try {
      const res = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        fetchAppData();
      }
    } catch (e) {
      console.error('Failed to update role:', e);
    }
  };

  const handleEmergencyLock = async (reason: string) => {
    const res = await fetch('/api/user/emergency-lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to lock account');
    }
    await fetchAppData();
  };

  const handleAccountRecovery = async (payload: { backupCode?: string; passwordReset?: string; unlockConfirmed: boolean }) => {
    const res = await fetch('/api/user/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Recovery failed');
    }
    await fetchAppData();
  };

  const handleReportWithDetails = (details: { title: string; description: string; suspectContact?: string }) => {
    setPrefilledReportDetails(details);
    setCurrentTab('report');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060b17] text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
        <div className="text-center space-y-1 font-mono">
          <p className="text-sm font-bold text-cyan-300">INITIALIZING SAVIOR SECURITY SUBSYSTEMS...</p>
          <p className="text-xs text-slate-500">Rwanda Cyber Defense & Biometric Vault Engine</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b17] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        securityScore={securityScore}
        language={language}
        setLanguage={setLanguage}
        onOpenEmergencyLock={() => setIsEmergencyLockOpen(true)}
        onOpenRecovery={() => setIsRecoveryOpen(true)}
        onChangeRole={handleRoleChange}
      />

      {/* Account Locked Red Alert Banner */}
      {user?.isAccountLocked && (
        <div className="bg-rose-950/90 border-y border-rose-600/80 px-4 py-3 text-rose-200">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
              <span>
                <strong>EMERGENCY LOCKDOWN ACTIVE:</strong> All financial transactions and session tokens are currently frozen.
              </span>
            </div>
            <button
              onClick={() => setIsRecoveryOpen(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold uppercase tracking-wider transition"
            >
              Initiate Identity Recovery & Unlock
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'trust-center' && (
          <TrustCenter
            user={user}
            securityScore={securityScore}
            alerts={alerts}
            language={language}
            onOpenVault={() => setCurrentTab('vault')}
            onOpenScanner={() => setCurrentTab('scanner')}
            onOpenSimulator={() => setCurrentTab('simulator')}
            onOpenReport={() => setCurrentTab('report')}
            onOpenBiometrics={() => setIsFaceModalOpen(true)}
            onOpenEmergencyLock={() => setIsEmergencyLockOpen(true)}
          />
        )}

        {currentTab === 'vault' && (
          <Vault
            user={user}
            biometricProfile={biometricProfile}
            financialConnections={financialConnections}
            transactions={transactions}
            reports={reports}
            sessions={sessions}
            language={language}
            onRefreshData={fetchAppData}
            onOpenEmergencyLock={() => setIsEmergencyLockOpen(true)}
            onOpenRecovery={() => setIsRecoveryOpen(true)}
          />
        )}

        {currentTab === 'scanner' && (
          <ScamScanner
            language={language}
            onReportIncidentWithDetails={handleReportWithDetails}
          />
        )}

        {currentTab === 'simulator' && (
          <FinancialSimulator
            connections={financialConnections}
            transactions={transactions}
            language={language}
            onRefreshData={fetchAppData}
          />
        )}

        {currentTab === 'report' && (
          <CybercrimeReporting
            reports={reports}
            language={language}
            initialDetails={prefilledReportDetails}
            onRefreshData={fetchAppData}
          />
        )}

        {currentTab === 'official' && (
          <OfficialCommandPortal
            reports={reports}
            language={language}
            onRefreshData={fetchAppData}
          />
        )}

        {currentTab === 'admin' && (
          <AdminSOC
            language={language}
          />
        )}

        {(currentTab === 'ai-chat' || currentTab === 'chat') && (
          <SaviorAIChat
            language={language}
          />
        )}
      </main>

      {/* Global Modals */}
      <EmergencyLockModal
        isOpen={isEmergencyLockOpen}
        onClose={() => setIsEmergencyLockOpen(false)}
        onConfirmLock={handleEmergencyLock}
        language={language}
      />

      <AccountRecoveryModal
        isOpen={isRecoveryOpen}
        onClose={() => setIsRecoveryOpen(false)}
        onConfirmRecovery={handleAccountRecovery}
        language={language}
      />

      <BiometricScannerModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        onSuccess={() => {
          fetchAppData();
          setIsFaceModalOpen(false);
        }}
        mode={user?.isFaceEnrolled ? 'VERIFY' : 'ENROLL'}
        language={language}
      />

      {/* Global Footer */}
      <Footer language={language} />
    </div>
  );
}

export default App;
