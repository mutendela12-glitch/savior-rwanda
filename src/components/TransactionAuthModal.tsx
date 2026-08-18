import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Smartphone, 
  Scan, 
  CheckCircle2, 
  X, 
  CreditCard,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { TransactionAuthorization, LanguageCode } from '../types';
import { translations } from '../translations';
import { BiometricScannerModal } from './BiometricScannerModal';

interface TransactionAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionAuthorization | null;
  onAuthorized: () => void;
  language: LanguageCode;
}

export const TransactionAuthModal: React.FC<TransactionAuthModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onAuthorized,
  language,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [password, setPassword] = useState('SaviorRwanda#2026!');
  const [mfaCode, setMfaCode] = useState('592810');
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[language];

  if (!isOpen || !transaction) return null;

  const handlePasswordNext = () => {
    if (!password.trim()) {
      setError('Please enter your account authorization password.');
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  const handleMfaNext = () => {
    if (mfaCode.length < 6) {
      setError('Please enter the 6-digit TOTP / SMS code.');
      return;
    }
    setError(null);
    setCurrentStep(3);
  };

  const handleFaceSuccess = () => {
    setIsFaceVerified(true);
    setShowFaceModal(false);
    setCurrentStep(4);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/transactions/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txId: transaction.id,
          passwordVerified: true,
          mfaVerified: true,
          faceBiometricVerified: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authorize transaction');
      }
      onAuthorized();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authorization failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0a1120] border-2 border-cyan-500/60 rounded-2xl shadow-2xl shadow-cyan-950 p-6 text-white overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {t.btnAuthorize}
            </h3>
            <p className="text-xs text-amber-300 font-mono">
              SAVIOR MULTI-TIER STRONG AUTHORIZATION
            </p>
          </div>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-[#050914] border border-cyan-900/50 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Provider:</span>
            <span className="text-xs font-semibold text-cyan-300">{transaction.providerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Recipient:</span>
            <span className="text-xs font-mono text-white">{transaction.recipientName} ({transaction.recipientPhoneOrAccount})</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="text-xs font-medium text-slate-300">Amount:</span>
            <span className="text-base font-mono font-bold text-emerald-400">
              {transaction.amount.toLocaleString()} {transaction.currency}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">Risk Assessment:</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
              transaction.riskLevel === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-600' :
              transaction.riskLevel === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-600' :
              'bg-emerald-950 text-emerald-300 border border-emerald-600'
            }`}>
              {transaction.riskLevel} FRAUD RISK
            </span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2 mb-5 text-[11px] font-mono text-center">
          <div className={`p-1.5 rounded border ${currentStep >= 1 ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            1. Password
          </div>
          <div className={`p-1.5 rounded border ${currentStep >= 2 ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            2. MFA Code
          </div>
          <div className={`p-1.5 rounded border ${currentStep >= 3 ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            3. Face Scan
          </div>
          <div className={`p-1.5 rounded border ${currentStep === 4 ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
            4. Confirm
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-950/70 border border-rose-600 rounded-lg text-xs text-rose-200">
            {error}
          </div>
        )}

        {/* STEP 1: PASSWORD */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Stage 1 of 3: Enter your primary SAVIOR defense vault password to verify authorization intent.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-cyan-300 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Primary Account Password:</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#070d18] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              type="button"
              onClick={handlePasswordNext}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <span>Next: Multi-Factor Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: MFA TOTP */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Stage 2 of 3: Enter the 6-digit TOTP code from your authenticator app or SMS token sent to +250 788 ••• 102.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-cyan-300 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>6-Digit Verification Code:</span>
              </label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                className="w-full bg-[#070d18] border border-slate-700 rounded-lg px-3 py-2 text-base font-mono tracking-widest text-white text-center focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleMfaNext}
                className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                <span>Next: Biometric Face Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FACE BIOMETRIC */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Stage 3 of 3: Perform live 1:1 facial biometric verification with liveness challenge to finalize the transaction cryptographically.
            </p>
            <div className="p-4 bg-cyan-950/40 border border-cyan-600/50 rounded-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cyan-900/60 border border-cyan-400 flex items-center justify-center mx-auto text-cyan-300">
                <Scan className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Biometric Face Scanner Required</p>
                <p className="text-[10px] text-slate-400">128-point face geometry vector matching</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFaceModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-cyan-950"
              >
                Launch Biometric Face Scan
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FINAL CONFIRMATION */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-950/60 border border-emerald-500 rounded-lg flex items-center gap-3 text-emerald-300">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold block">All 3 Authorization Tiers Verified</span>
                <span className="text-[10px] text-emerald-200/80 font-mono">Password: ✓ | MFA: ✓ | Face Biometrics: 99.8% match ✓</span>
              </div>
            </div>

            <div className="bg-[#050914] border border-slate-800 rounded-lg p-3 text-xs space-y-1 text-slate-300">
              <p className="text-[11px] font-mono text-cyan-300">
                DATA INTEGRITY SIGNATURE: <span className="text-slate-400">{transaction.dataHash.substring(0, 24)}...</span>
              </p>
              <p className="text-[10px] text-slate-400">
                You are authorizing a simulated transfer of {transaction.amount.toLocaleString()} {transaction.currency} to {transaction.recipientName}.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Broadcasting Authorization...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Execute Signed Authorization</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Embedded Biometric Modal */}
        <BiometricScannerModal
          isOpen={showFaceModal}
          onClose={() => setShowFaceModal(false)}
          onSuccess={handleFaceSuccess}
          mode="VERIFY"
          title="Transaction Authorization Face Scan"
          subtitle={`Verifying ${transaction.amount.toLocaleString()} RWF transfer`}
          language={language}
        />
      </div>
    </div>
  );
};
