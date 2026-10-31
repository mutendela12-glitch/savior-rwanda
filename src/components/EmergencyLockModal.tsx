import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, Lock, X, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../translations';

interface EmergencyLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLock: (reason: string) => Promise<void>;
  language: LanguageCode;
}

export const EmergencyLockModal: React.FC<EmergencyLockModalProps> = ({
  isOpen,
  onClose,
  onConfirmLock,
  language,
}) => {
  const [reason, setReason] = useState('Suspected unauthorized access or active phone/SIM threat');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const t = translations[language];

  if (!isOpen) return null;

  const handleExecuteLock = async () => {
    setIsProcessing(true);
    try {
      await onConfirmLock(reason);
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        setIsProcessing(false);
        onClose();
      }, 1800);
    } catch (err) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0d1424] border-2 border-rose-600/70 rounded-xl shadow-2xl shadow-rose-950/80 p-6 text-white overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isDone ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-950/80 border border-rose-500 rounded-full flex items-center justify-center mx-auto text-rose-400 animate-bounce">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-rose-200">
              {t.emergencyLockedBanner}
            </h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto">
              {t.emergencyLockedDesc}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-rose-950/80 border border-rose-500/80 flex items-center justify-center text-rose-400">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{t.emergencyTitle}</span>
                  <span className="text-[10px] bg-rose-900/60 border border-rose-500/60 text-rose-300 px-2 py-0.5 rounded font-mono uppercase">
                    Level 1 Freeze
                  </span>
                </h3>
                <p className="text-xs text-rose-300/80 font-mono">
                  {t.emergencySubtitle}
                </p>
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-lg p-3 text-xs text-rose-200 space-y-2">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Immediate defensive actions executed:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 text-[11px]">
                <li>Revoke all other active device login sessions immediately.</li>
                <li>Freeze all pending Bank of Kigali & MoMo financial authorizations.</li>
                <li>Activate emergency lock state and require cryptographically verified identity recovery.</li>
                <li>Issue critical audit alert to SAVIOR incident register.</li>
              </ul>
            </div>

            {/* Reason selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                {t.emergencyReason}:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#070d18] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="Suspected unauthorized access or active phone/SIM threat">
                  {t.emergencyReasonSuspectedHack}
                </option>
                <option value="Compromised MoMo PIN or unsolicited OTP request">
                  {t.emergencyReasonStolenPhone}
                </option>
                <option value="Targeted phishing campaign or extortion threat">
                  Targeted phishing campaign or extortion threat
                </option>
                <option value="Precautionary high-security lockdown">
                  Precautionary high-security lockdown
                </option>
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
              >
                {t.btnCancel}
              </button>
              <button
                type="button"
                onClick={handleExecuteLock}
                disabled={isProcessing}
                className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-rose-900/50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Locking...</span>
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-4 h-4" />
                    <span>{t.emergencyConfirmBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
