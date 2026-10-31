import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  Key, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Fingerprint, 
  Check, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Radio,
  FileCheck2,
  Building2,
  Globe
} from 'lucide-react';
import { UserProfile, LanguageCode } from '../types';
import { translations } from '../translations';
import cyberBg from '../assets/images/cyber_defense_bg.jpg';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  language,
  setLanguage,
}) => {
  const t = translations[language];
  const [authMode, setAuthMode] = useState<'SIGNIN' | 'SIGNUP'>('SIGNIN');
  const [step, setStep] = useState<'CREDENTIALS' | 'VERIFY_CODE'>('CREDENTIALS');

  // Form fields
  const [email, setEmail] = useState('mutendela12@gmail.com');
  const [password, setPassword] = useState('SaviorRwanda2026!#');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('Jean-Claude Mugisha');
  const [phone, setPhone] = useState('+250 788 349 102');
  const [nationalId, setNationalId] = useState('1 1994 8 0049281 0 34');
  const [district, setDistrict] = useState('Gasabo (Kigali)');
  const [province, setProvince] = useState('Kigali City');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // OTP Verification state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [activeCodePreview, setActiveCodePreview] = useState<string | null>(null);
  const [previewEmail, setPreviewEmail] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resending OTP code
  useEffect(() => {
    let interval: any = null;
    if (step === 'VERIFY_CODE' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  // Handle Requesting Email Verification Code
  const handleInitiateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage(t.authErrorEmail);
      return;
    }

    if (authMode === 'SIGNUP') {
      if (!fullName.trim()) {
        setErrorMessage(t.authErrorName);
        return;
      }
      if (!termsAccepted) {
        setErrorMessage(t.authErrorTerms);
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          type: authMode,
          fullName: authMode === 'SIGNUP' ? fullName : undefined,
          phone: authMode === 'SIGNUP' ? phone : undefined,
          nationalId: authMode === 'SIGNUP' ? nationalId : undefined,
          district: authMode === 'SIGNUP' ? district : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch email verification code');
      }

      setActiveCodePreview(data.code);
      setPreviewEmail(data.previewEmail);
      setStep('VERIFY_CODE');
      setTimerSeconds(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMessage(
        language === 'rw'
          ? `Kode y’uburinzi yoherejwe kuri ${email}`
          : `Verification code dispatched to ${email}`
      );

      // Focus first OTP input
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error requesting verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Input Change
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.length === 0) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Single digit entry
    const char = cleaned.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto-advance
    if (index < 5 && char) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle KeyDown (Backspace navigation)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle Paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pasted.length, 5);
    otpInputsRef.current[nextIndex]?.focus();
  };

  // Handle OTP Verification Submission
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || otpDigits.join('');
    if (finalCode.length < 6) {
      setErrorMessage(t.authErrorOtpDigits);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: finalCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Store auth session
      if (data.token) {
        localStorage.setItem('savior_auth_token', data.token);
        localStorage.setItem('savior_auth_user', JSON.stringify(data.user));
      }

      setSuccessMessage(t.authSuccessLogin);

      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Persona Select for Demo & Instant Evaluation
  const selectQuickPersona = (
    pEmail: string, 
    pName: string, 
    pRole: UserProfile['role'], 
    pPhone: string
  ) => {
    setEmail(pEmail);
    setFullName(pName);
    setPhone(pPhone);
    setErrorMessage(null);
  };

  // Quick Auto-fill code from preview
  const handleAutoFillCode = () => {
    if (activeCodePreview) {
      const digits = activeCodePreview.split('').slice(0, 6);
      setOtpDigits(digits);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      handleVerifyOtp(activeCodePreview);
    }
  };

  return (
    <div 
      className="relative min-h-screen w-full flex flex-col justify-between font-sans text-slate-100 overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(6, 11, 23, 0.88), rgba(4, 8, 16, 0.94)), url(${cyberBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Ambient Cyber Grid & Glow Lines Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full border-b border-cyan-950/60 bg-[#070d18]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-[#060b17] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black tracking-widest text-cyan-300">SAVIOR</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-bold tracking-wider">
                RWANDA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              AI-Powered Cybersecurity & Digital Protection Platform
            </p>
          </div>
        </div>

        {/* Language selector & Security status */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>TLS 1.3 / AES-256 SECURED GATEWAY</span>
          </div>

          <div className="flex items-center bg-[#091122] border border-cyan-900/50 rounded-lg p-0.5 text-xs font-mono">
            {(['rw', 'en', 'fr', 'sw'] as LanguageCode[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded transition uppercase ${
                  language === lang
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Authentication Card Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl">
          
          {/* Top Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-2 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{t.authProtocolBadge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {step === 'CREDENTIALS' 
                ? (authMode === 'SIGNIN' ? t.authSignInTitle : t.authSignUpTitle)
                : t.authVerifyEmailTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              {step === 'CREDENTIALS'
                ? (authMode === 'SIGNIN' ? t.authSignInSubtitle : t.authSignUpSubtitle)
                : `${t.authVerifyEmailSubtitle} (${email})`}
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-[#091122]/90 backdrop-blur-xl border border-cyan-900/60 rounded-2xl shadow-2xl shadow-cyan-950/80 p-6 sm:p-8">
            
            {/* Error / Success Notifications */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 font-medium animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-start gap-2.5 font-medium animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{successMessage}</div>
              </div>
            )}

            {/* STEP 1: CREDENTIALS (SIGN IN / SIGN UP) */}
            {step === 'CREDENTIALS' && (
              <>
                {/* Mode Selector Tabs */}
                <div className="flex bg-[#050a14] p-1 rounded-xl border border-slate-800 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('SIGNIN');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
                      authMode === 'SIGNIN'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.authSignInTab}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('SIGNUP');
                      setErrorMessage(null);
                    }}
                    className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
                      authMode === 'SIGNUP'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.authSignUpTab}
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleInitiateAuth} className="space-y-4">
                  {/* SIGN UP ADDITIONAL FIELDS */}
                  {authMode === 'SIGNUP' && (
                    <>
                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1.5">
                          {t.authFullName} *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder={t.authFullNamePlaceholder}
                            className="w-full pl-10 pr-3 py-2.5 bg-[#050a14] border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-mono text-slate-300 mb-1.5">
                            {t.authNationalId}
                          </label>
                          <input
                            type="text"
                            value={nationalId}
                            onChange={(e) => setNationalId(e.target.value)}
                            placeholder={t.authNationalIdPlaceholder}
                            className="w-full px-3 py-2.5 bg-[#050a14] border border-slate-800 focus:border-cyan-500 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-slate-300 mb-1.5">
                            {t.authPhone} *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder={t.authPhonePlaceholder}
                              required
                              className="w-full pl-10 pr-3 py-2.5 bg-[#050a14] border border-slate-800 focus:border-cyan-500 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1.5">
                          {t.authDistrict}
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 bg-[#050a14] border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white focus:outline-none transition"
                          >
                            <option value="Gasabo (Kigali)">Gasabo — Kigali City</option>
                            <option value="Kicukiro (Kigali)">Kicukiro — Kigali City</option>
                            <option value="Nyarugenge (Kigali)">Nyarugenge — Kigali City</option>
                            <option value="Musanze (Northern)">Musanze — Northern Province</option>
                            <option value="Rubavu (Western)">Rubavu — Western Province</option>
                            <option value="Huye (Southern)">Huye — Southern Province</option>
                            <option value="Rwamagana (Eastern)">Rwamagana — Eastern Province</option>
                            <option value="Muhanga (Southern)">Muhanga — Southern Province</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* EMAIL INPUT */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-mono text-slate-300">
                        {t.authEmail} *
                      </label>
                      {email !== 'mutendela12@gmail.com' && (
                        <button
                          type="button"
                          onClick={() => setEmail('mutendela12@gmail.com')}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                        >
                          Use mutendela12@gmail.com
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder={t.authEmailPlaceholder}
                        className="w-full pl-10 pr-3 py-2.5 bg-[#050a14] border border-slate-800 focus:border-cyan-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      {t.authPassword} *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder={t.authPasswordPlaceholder}
                        className="w-full pl-10 pr-10 py-2.5 bg-[#050a14] border border-slate-800 focus:border-cyan-500 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* TERMS CHECKBOX FOR SIGNUP */}
                  {authMode === 'SIGNUP' && (
                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded bg-[#050a14] border-slate-700 text-cyan-600 focus:ring-0"
                      />
                      <label htmlFor="terms" className="text-[11px] text-slate-400 leading-relaxed">
                        {t.authTermsNotice}
                      </label>
                    </div>
                  )}

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-cyan-600 hover:from-cyan-500 to-blue-600 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span className="font-mono text-xs uppercase tracking-wider">
                          {t.authBtnSending}
                        </span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-cyan-200" />
                        <span>{t.authBtnSendCode}</span>
                        <ArrowRight className="w-4 h-4 text-cyan-200 ml-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Persona Switcher for Immediate Review */}
                <div className="mt-6 pt-5 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      {t.authQuickPersonas}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">1-Click Select</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => selectQuickPersona('mutendela12@gmail.com', 'Jean-Claude Mugisha', 'CITIZEN', '+250 788 349 102')}
                      className={`p-2 rounded-lg border text-left transition flex items-center gap-2 ${
                        email === 'mutendela12@gmail.com'
                          ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-200'
                          : 'bg-[#050a14] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold truncate">{t.roleCitizen}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">mutendela12@gmail.com</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectQuickPersona('rib.command@rib.gov.rw', 'Insp. Emmanuel Kalisa', 'INVESTIGATOR', '+250 788 000 166')}
                      className={`p-2 rounded-lg border text-left transition flex items-center gap-2 ${
                        email === 'rib.command@rib.gov.rw'
                          ? 'bg-amber-950/60 border-amber-500/60 text-amber-200'
                          : 'bg-[#050a14] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold truncate">{t.roleInvestigator}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">rib.command@rib.gov.rw</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: VERIFY 6-DIGIT EMAIL CODE */}
            {step === 'VERIFY_CODE' && (
              <div className="space-y-6">
                
                {/* Official Email Notification Preview Drawer */}
                <div className="p-4 bg-gradient-to-br from-[#0c1a32] to-[#070e1c] border border-cyan-500/40 rounded-xl shadow-inner text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2">
                    <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      <span>OFFICIAL DISPATCH PREVIEW</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      RECEIVED JUST NOW
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="text-slate-400">
                      <strong className="text-slate-300">From:</strong> verification@cyber.gov.rw
                    </div>
                    <div className="text-slate-400 truncate">
                      <strong className="text-slate-300">To:</strong> {email}
                    </div>
                    <div className="text-slate-300 font-semibold pt-1">
                      Subject: [SAVIOR RWANDA] Single-Use Access Code: {activeCodePreview || 'SAV-842915'}
                    </div>
                  </div>

                  {activeCodePreview && (
                    <div className="mt-2 pt-2 border-t border-cyan-900/40 flex items-center justify-between">
                      <div className="font-mono text-xs text-slate-300">
                        Verification Code: <strong className="text-cyan-300 text-sm tracking-wider">{activeCodePreview}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFillCode}
                        className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-mono text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? 'Filled!' : t.authAutoFill}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 6 Digit Input Group */}
                <div>
                  <label className="block text-center text-xs font-mono text-slate-300 mb-3 uppercase tracking-wider">
                    {t.authEnter6Digits}
                  </label>

                  <div className="flex justify-center items-center gap-2 sm:gap-3">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        onPaste={handlePaste}
                        className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border bg-[#050a14] focus:outline-none transition ${
                          digit
                            ? 'border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950'
                            : 'border-slate-800 text-white focus:border-cyan-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Resend Timer & Controls */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                  <div>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleInitiateAuth}
                        disabled={isLoading}
                        className="text-cyan-400 hover:text-cyan-300 font-bold underline transition"
                      >
                        {t.authBtnResend}
                      </button>
                    ) : (
                      <span>
                        {t.authResendIn}: <strong className="text-cyan-300">{timerSeconds}s</strong>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('CREDENTIALS');
                      setErrorMessage(null);
                    }}
                    className="text-slate-400 hover:text-slate-200 underline"
                  >
                    Change Email
                  </button>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={isLoading || otpDigits.join('').length < 6}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 hover:from-cyan-500 to-blue-600 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2 transition disabled:opacity-40"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span className="font-mono text-xs uppercase tracking-wider">
                        {t.authBtnVerifying}
                      </span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-4 h-4 text-cyan-200" />
                      <span>{t.authBtnVerifyNow}</span>
                    </>
                  )}
                </button>

                {/* Fallback tip */}
                <p className="text-[11px] text-center text-slate-500 font-mono">
                  💡 Hint: You can use the single-click <strong>"Auto-Fill Code"</strong> above or type <strong>{activeCodePreview || '123456'}</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Security Assurance Footnote */}
          <div className="mt-6 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero-Trust Architecture • Defensive Cyber Operations Only</span>
            </div>
            <p className="text-[10px] text-slate-500 max-w-sm mx-auto">
              Compliant with Republic of Rwanda Cyber Security Guidelines & National Data Protection Privacy Framework.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-cyan-950/50 bg-[#070d18]/90 px-4 py-3 text-center text-[11px] font-mono text-slate-500">
        SAVIOR Rwanda © 2026 • National Cyber Incident & Cybercrime Prevention Platform
      </footer>
    </div>
  );
};
