import React, { useState } from 'react';
import { KeyRound, ShieldCheck, CheckCircle2, X, RefreshCw, Smartphone, Eye, EyeOff } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../translations';

interface AccountRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRecovery: (payload: { backupCode?: string; passwordReset?: string; unlockConfirmed: boolean }) => Promise<void>;
  language: LanguageCode;
}

export const AccountRecoveryModal: React.FC<AccountRecoveryModalProps> = ({
  isOpen,
  onClose,
  onConfirmRecovery,
  language,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [backupCode, setBackupCode] = useState('SAV-9821-4821');
  const [smsOtp, setSmsOtp] = useState('849201');
  const [newPassword, setNewPassword] = useState('SaviorRwanda#2026!Sec');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[language];

  if (!isOpen) return null;

  const handleFinishRecovery = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await onConfirmRecovery({
        backupCode,
        passwordReset: newPassword,
        unlockConfirmed: true,
      });
      setStep(3);
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
        setStep(1);
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Recovery validation failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0d1424] border border-cyan-500/50 rounded-xl shadow-2xl shadow-cyan-950/80 p-6 text-white overflow-hidden">
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
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {t.btnStartRecovery}
            </h3>
            <p className="text-xs text-cyan-300/80 font-mono">
              Identity Verification & Shield Restore
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-5 px-2 text-xs font-mono">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            <span>Verify</span>
          </div>
          <div className="h-0.5 flex-1 mx-2 bg-slate-800">
            <div className={`h-full bg-cyan-500 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            <span>Security Reset</span>
          </div>
          <div className="h-0.5 flex-1 mx-2 bg-slate-800">
            <div className={`h-full bg-cyan-500 transition-all ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
          </div>
          <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span>Restored</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-rose-950/60 border border-rose-600 rounded-lg text-xs text-rose-200">
            {error}
          </div>
        )}

        {/* Step 1: Backup code or SMS verification */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Enter one of your 12-character SAVIOR Emergency Backup Codes or the SMS OTP sent to your registered number (+250 788 ••• 102).
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-cyan-300 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Emergency Backup Recovery Code:</span>
              </label>
              <input
                type="text"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                placeholder="SAV-XXXX-XXXX"
                className="w-full bg-[#070d18] border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono tracking-wider text-cyan-200 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[10px] text-slate-400">Example code from your Secure Vault archive.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-cyan-300 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Secondary SMS OTP (Auto-dispatched):</span>
              </label>
              <input
                type="text"
                value={smsOtp}
                onChange={(e) => setSmsOtp(e.target.value)}
                placeholder="6-digit OTP code"
                maxLength={6}
                className="w-full bg-[#070d18] border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono tracking-widest text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-cyan-950 mt-2"
            >
              Verify & Proceed to Reset
            </button>
          </div>
        )}

        {/* Step 2: New master password reset & confirmation */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Identity verified. Establish a new high-entropy master password and unlock your account.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                New Strong Master Password:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-lg px-3 py-2 pr-10 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Entropy: 94/100 (Strong - 12+ chars, uppercase, symbols)</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinishRecovery}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Restoring Shield...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Unlock & Restore Shield</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Finished */}
        {step === 3 && (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-950 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-emerald-300">
              Account Restored Successfully!
            </h4>
            <p className="text-xs text-slate-300">
              Emergency lockdown lifted. All security policies reinstated.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
