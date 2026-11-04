import React, { useState } from 'react';
import { 
  CreditCard, 
  Send, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  ArrowRight, 
  Smartphone, 
  RefreshCw, 
  CheckCircle2,
  Building2
} from 'lucide-react';
import { FinancialConnection, TransactionAuthorization, LanguageCode } from '../types';
import { translations } from '../translations';
import { TransactionAuthModal } from '../components/TransactionAuthModal';

interface FinancialSimulatorProps {
  connections: FinancialConnection[];
  transactions: TransactionAuthorization[];
  language: LanguageCode;
  onRefreshData: () => void;
}

export const FinancialSimulator: React.FC<FinancialSimulatorProps> = ({
  connections,
  transactions,
  language,
  onRefreshData,
}) => {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>(connections[0]?.id || 'FC-02');
  const [recipientName, setRecipientName] = useState('Aimable Uwizeyimana');
  const [recipientPhone, setRecipientPhone] = useState('+250 788 891 023');
  const [amount, setAmount] = useState<number>(75000);
  const [txType, setTxType] = useState<TransactionAuthorization['transactionType']>('MOMO_PAY');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTxForAuth, setSelectedTxForAuth] = useState<TransactionAuthorization | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const t = translations[language];

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/transactions/create-simulated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: selectedConnectionId,
          recipientName,
          recipientPhoneOrAccount: recipientPhone,
          amount: Number(amount),
          transactionType: txType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transaction creation failed');

      onRefreshData();
      setSuccessMsg(`Simulated transaction ${data.referenceCode} created! Complete multi-stage authorization.`);
      setSelectedTxForAuth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#0b1324] border border-cyan-900/60 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {t.navSimulator}
            </h1>
            <p className="text-xs text-amber-300 font-mono font-bold">
              {t.simulatedNotice}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Create Transaction & Active Simulator Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Transaction Initiator */}
        <div className="lg:col-span-7 bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">{t.simInitiateTitle}</h3>
            <span className="text-[10px] font-mono text-cyan-400">{t.sim3StageRequired}</span>
          </div>

          <form onSubmit={handleCreateTransaction} className="space-y-4">
            {/* Provider Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                {t.simSelectProvider}
              </label>
              <select
                value={selectedConnectionId}
                onChange={(e) => setSelectedConnectionId(e.target.value)}
                className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.providerName} ({c.accountNumberMasked}) — Bal: {c.lastSimulatedBalance.toLocaleString()} {c.currency}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">{t.simRecipientName}</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">{t.simRecipientPhone}</label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            {/* Amount & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">{t.simAmountLabel}</label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">{t.simTxType}</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as any)}
                  className="w-full bg-[#070d18] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="MOMO_PAY">MoMo Payment (*182#)</option>
                  <option value="TRANSFER">Bank Wire Transfer</option>
                  <option value="WITHDRAWAL">Agent Cash Withdrawal</option>
                  <option value="MERCHANT">Merchant POS Checkout</option>
                </select>
              </div>
            </div>

            {/* Fraud Risk Indicator preview */}
            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">{t.simRiskAnalysis}</span>
              <p className="text-slate-300">
                {amount >= 200000 
                  ? t.simRiskThresholdTriggered
                  : t.simRiskStandard}
              </p>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-600 rounded-lg text-xs text-rose-200">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-600 rounded-lg text-xs text-emerald-200">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.simBtnSubmitting}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t.simBtnSubmit}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Connected Providers & Pending Queue */}
        <div className="lg:col-span-5 space-y-5">
          {/* Provider Balances */}
          <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">{t.simWalletsTitle}</h3>
            <div className="space-y-2.5">
              {connections.map((c) => (
                <div key={c.id} className="p-3 bg-[#070d18] border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-semibold text-white block">{c.providerName}</span>
                    <span className="text-[10px] text-slate-500">{c.accountNumberMasked}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">
                    {c.lastSimulatedBalance.toLocaleString()} {c.currency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Authorizations List */}
          <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{t.simQueueTitle}</h3>
              <span className="text-[10px] font-mono text-cyan-300">
                {transactions.filter(t => t.status === 'PENDING').length} Pending
              </span>
            </div>

            <div className="space-y-2.5">
              {transactions.filter(t => t.status === 'PENDING').map((tx) => (
                <div key={tx.id} className="p-3 bg-[#070d18] border border-amber-900/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{tx.recipientName}</span>
                    <span className="font-mono text-emerald-400 font-bold">{tx.amount.toLocaleString()} {tx.currency}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{tx.providerName}</span>
                    <button
                      onClick={() => setSelectedTxForAuth(tx)}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold uppercase tracking-wider transition"
                    >
                      {t.simBtnAuthNow}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Auth Modal */}
      <TransactionAuthModal
        isOpen={Boolean(selectedTxForAuth)}
        onClose={() => setSelectedTxForAuth(null)}
        transaction={selectedTxForAuth}
        onAuthorized={() => {
          onRefreshData();
          setSuccessMsg('Transaction authorized with 3-tier cryptographic signature!');
        }}
        language={language}
      />
    </div>
  );
};
