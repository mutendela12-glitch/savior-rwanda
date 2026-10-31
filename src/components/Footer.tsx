import React from 'react';
import { Shield, Lock, PhoneCall, AlertTriangle, ExternalLink } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../translations';

interface FooterProps {
  language: LanguageCode;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = translations[language];

  return (
    <footer className="bg-[#050914] border-t border-cyan-950/80 text-slate-400 text-xs mt-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold tracking-widest text-white text-base">
                SAVIOR RWANDA
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {t.footerDesc}
            </p>
            <div className="p-2.5 bg-[#0b1324] border border-amber-900/50 rounded-lg text-[11px] text-amber-300/90 font-mono">
              ⚠️ {t.simulatedNotice}
            </div>
          </div>

          {/* Col 2: Emergency Response Numbers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
              Rwanda Emergency Lines
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-[#0b1324] rounded-lg border border-slate-800">
                <span className="text-slate-300">RIB Cybercrime:</span>
                <span className="text-amber-400 font-bold">166 (Toll-Free)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#0b1324] rounded-lg border border-slate-800">
                <span className="text-slate-300">RNP Cyber Police:</span>
                <span className="text-emerald-400 font-bold">112 (Emergency)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-[#0b1324] rounded-lg border border-slate-800">
                <span className="text-slate-300">NCSA Rwanda:</span>
                <span className="text-cyan-400 font-bold">9070 (Advisory)</span>
              </div>
            </div>
          </div>

          {/* Col 3: Compliance & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
              {t.footerLegalTitle}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>{t.footerLaw1}</li>
              <li>{t.footerLaw2}</li>
              <li>• AES-256 Vector Biometric Vault Standard</li>
              <li>• SHA-256 Digital Chain of Custody</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <span>© 2026 SAVIOR Platform. All rights reserved.</span>
          <span>Lead Administrator: mutendela12@gmail.com</span>
          <span className="text-cyan-400/80">Kigali, Rwanda</span>
        </div>
      </div>
    </footer>
  );
};
