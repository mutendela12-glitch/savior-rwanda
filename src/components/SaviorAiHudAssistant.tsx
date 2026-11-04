import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw, 
  ChevronRight,
  ExternalLink,
  Cpu,
  Mic,
  Maximize2
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../translations';

interface SaviorAiHudAssistantProps {
  language: LanguageCode;
  onNavigateTab: (tab: string) => void;
  onOpenEmergencyLock: () => void;
}

interface Message {
  id: string;
  sender: 'SAVIOR' | 'USER';
  text: string;
  timestamp: string;
}

export const SaviorAiHudAssistant: React.FC<SaviorAiHudAssistantProps> = ({
  language,
  onNavigateTab,
  onOpenEmergencyLock,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  // Quick prompt suggestions according to language
  const quickPrompts: Record<LanguageCode, string[]> = {
    rw: [
      'Nabonye SMS ya MoMo imbwira ko noherejwe amafaranga y\'ikosa, nkore iki?',
      'Ese umuntu ashobora kwiba PIN yanjye ya MTN cyangwa Airtel?',
      'Namenya nte ko ifoto cyangwa umwirondoro wanjye bibawe?',
      'Ni ayahe mategeko arinda umwirondoro w\'Abanyarwanda mu ikoranabuhanga?'
    ],
    en: [
      'I received an SMS claiming erroneous MoMo transfer, what do I do?',
      'How do I protect my SIM card from unauthorized SIM swaps?',
      'How does SAVIOR face verification protect my bank account?',
      'What should I immediately do if my phone was stolen in Rwanda?'
    ],
    fr: [
      'J\'ai reçu un SMS suspect de transfert MoMo, que dois-je faire ?',
      'Comment protéger ma carte SIM contre le piratage au Rwanda ?',
      'Comment fonctionne la vérification faciale biométrique de SAVIOR ?',
      'Quelles démarches suivre en cas de vol de téléphone à Kigali ?'
    ],
    sw: [
      'Nimepokea SMS ya MoMo ikidai pesa zimetumwa kimakosa, nifanye nini?',
      'Ninawezaje kulinda laini yangu ya simu dhidi ya ulaghai wa SIM swap?',
      'Je, uthibitishaji wa uso wa SAVIOR unalindaje akaunti yangu?',
      'Hatua za haraka za kuchukua simu ikiibwa nchini Rwanda?'
    ],
  };

  // Initial welcome message per language
  useEffect(() => {
    const welcomeTexts: Record<LanguageCode, string> = {
      rw: 'Muraho! Ndi SAVIOR AI Security Copilot. Nshobora kugufasha gusesengura ubutekamutwe, kurinda MoMo, cyangwa kugufasha kurega kuri Polisi na RIB.',
      en: 'Greetings! I am the SAVIOR AI Security Assistant. I can analyze suspicious messages, guide financial shielding, or triage cyber incidents for Rwanda Law Enforcement.',
      fr: 'Bonjour ! Je suis l\'assistant cybernétique SAVIOR AI. Je peux analyser les fraudes potentielles, sécuriser vos transactions MoMo et orienter vos signalements RIB.',
      sw: 'Hujambo! Mimi ni Msaidizi wa Usalama wa SAVIOR AI. Naweza kuchambua ulaghai wa simu, kulinda akaunti za MoMo, na kukusaidia kutoa taarifa Polisi na RIB.',
    };

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'SAVIOR',
        text: welcomeTexts[language] || welcomeTexts.en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const speakText = (text: string) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis unsupported or blocked
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const promptToSend = queryText || input;
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'USER',
      text: promptToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: promptToSend,
          language,
        }),
      });

      const data = await res.json();
      const reply = data.answer || 'SAVIOR AI core responded with standard threat mitigation guidelines.';

      const saviorMsg: Message = {
        id: `sav-${Date.now()}`,
        sender: 'SAVIOR',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, saviorMsg]);
      speakText(reply);
    } catch (err) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'SAVIOR',
        text: 'Unable to reach SAVIOR AI Neural Engine. Fallback heuristic: never share your PIN, disconnect compromised devices, and report to RIB 166.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger HUD Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 py-3 bg-[#081226]/95 hover:bg-[#0c1b38] border border-cyan-400/60 hover:border-cyan-400 rounded-full shadow-2xl shadow-cyan-950 backdrop-blur-md transition-all duration-300 transform hover:scale-105"
        >
          {/* Animated Holographic Core Ring */}
          <div className="relative w-8 h-8 rounded-full bg-cyan-950 flex items-center justify-center border border-cyan-400">
            <span className="w-full h-full rounded-full bg-cyan-400/20 absolute animate-ping" />
            <Bot className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform" />
          </div>

          <div className="text-left font-mono pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-white tracking-wider">SAVIOR AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-cyan-300 font-sans">
              Cyber Copilot
            </p>
          </div>

          {/* Soundwave bars animation */}
          <div className="flex items-center gap-0.5 h-4">
            <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 h-3.5 bg-cyan-400 animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 h-2.5 bg-cyan-400 animate-pulse" style={{ animationDelay: '300ms' }} />
            <span className="w-0.5 h-4 bg-cyan-400 animate-pulse" style={{ animationDelay: '450ms' }} />
          </div>
        </button>
      )}

      {/* Expanded Holographic HUD Drawer */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#070e1e]/98 border border-cyan-500/70 rounded-3xl shadow-2xl shadow-cyan-950/90 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* HUD Header */}
          <div className="bg-gradient-to-r from-[#09152e] via-[#0d1f42] to-[#09152e] border-b border-cyan-900/60 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-400/80 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-950">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-mono text-white tracking-wider">
                    SAVIOR AI ASSISTANT
                  </h3>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-cyan-400 font-mono">
                  Rwanda National Cyber Intelligence Subsystem
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 rounded-lg border transition ${
                  soundEnabled
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
                title={soundEnabled ? 'Speech audio enabled' : 'Speech audio muted'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Full Chat Link */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateTab('ai-chat');
                }}
                className="p-1.5 rounded-lg border border-transparent text-slate-400 hover:text-white hover:border-slate-700 transition"
                title="Open Dedicated Fullscreen AI Lab"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-1 ${
                    m.sender === 'USER'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md shadow-cyan-950'
                      : 'bg-[#0d1a33] border border-cyan-900/60 text-slate-200 rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <span className="text-[9px] font-mono block opacity-60 text-right">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-[#0d1a33] border border-cyan-900/60 rounded-2xl w-fit text-cyan-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="text-[11px] font-mono">SAVIOR Neural Engine computing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-[#060c1a]">
            <p className="text-[10px] text-slate-400 font-mono mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Suggested Security Questions:</span>
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {(quickPrompts[language] || quickPrompts.en).slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="whitespace-nowrap text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-200 transition shrink-0"
                >
                  {prompt.length > 34 ? prompt.substring(0, 34) + '...' : prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#070e1e] border-t border-cyan-950 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask SAVIOR AI about cyber threats..."
              className="flex-1 bg-[#030712] border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white rounded-xl transition shadow-lg shadow-cyan-950"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
