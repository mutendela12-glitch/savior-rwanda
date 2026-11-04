import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  User, 
  ExternalLink,
  PhoneCall
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../translations';

interface SaviorAIChatProps {
  language: LanguageCode;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const SaviorAIChat: React.FC<SaviorAIChatProps> = ({ language }) => {
  const getGreeting = (lang: LanguageCode) => {
    switch (lang) {
      case 'rw':
        return 'Muraho! Ndi Savior AI, umufasha wawe mu by’umutekano w’ikoranabuhanga mu Rwanda. Nshobora kugufasha ku bibazo by’ubutekamutwe bwa MoMo, imiyoboro yiba amabanga, cyangwa uko warinda konti yawe. Mbaze ikibazo cyose!';
      case 'sw':
        return 'Habari! Mimi ni Savior AI, mshauri wako wa usalama wa mtandao na ulinzi wa kidijitali nchini Rwanda. Ninaweza kukusaidia kuhusu ulaghai wa MoMo, SMS za kutiliwa shaka, au jinsi ya kulinda akaunti na taarifa zako. Niulize swali lolote!';
      case 'fr':
        return 'Bonjour ! Je suis Savior AI, votre conseiller en cybersécurité et protection numérique au Rwanda. Posez-moi vos questions sur les fraudes MoMo, les SMS suspects ou la sécurisation de vos comptes.';
      case 'en':
      default:
        return 'Hello! I am SAVIOR AI, your dedicated digital security and cybercrime defense advisor for Rwanda. Ask me any question about MoMo fraud, suspicious SMS messages, password hygiene, or how to secure your accounts.';
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: getGreeting(language),
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const t = translations[language];

  const suggestedQuestions = language === 'rw' 
    ? [
        'Nakorera iki niba mbonye SMS yiba MoMo PIN?',
        'Niki cyerekana ko urubuga rwa Bank ari urw\'abajura?',
        'Konti yanjye ifunzwe byihutirwa nayigarura nte?',
      ]
    : language === 'sw'
    ? [
        'Nifanye nini nikipokea SMS inayoomba PIN yangu ya MoMo?',
        'Ni dalili gani zinazoonyesha tovuti bandia ya benki nchini Rwanda?',
        'Je, uthibitishaji wa uso wa SAVIOR unalindaje miamala yangu?',
      ]
    : language === 'fr'
    ? [
        'Que faire si je reçois un SMS demandant mon code PIN MoMo ?',
        'Quels sont les signes d’un faux site bancaire au Rwanda ?',
        'Comment la vérification faciale protège-t-elle mes transactions ?',
      ]
    : [
        'How do I identify a fake MTN MoMo reverse transaction SMS?',
        'What are the red flags of a phishing bank website in Rwanda?',
        'How does SAVIOR 1:1 Face Verification protect my transactions?',
      ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend, language }),
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: data.answer || 'Response generated.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: 'Never disclose your secret MoMo PIN or bank password to anyone. If you suspect an active fraud attack, lock your account immediately in the SAVIOR Vault or call RIB on 166 / Police on 112.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#0b1324] border border-cyan-900/60 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">
                Savior AI Cyber Advisor
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                GEMINI 3.7 NEURAL INTELLIGENCE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Expert advice on Rwandan cyber laws, scam indicators & digital protection
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Window */}
      <div className="bg-[#0b1324] border border-slate-800 rounded-2xl p-6 space-y-4 min-h-[420px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[480px] pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl space-y-1 shadow-md ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-[#070d18] border border-slate-800 text-slate-200 rounded-bl-none whitespace-pre-wrap'
                }`}
              >
                <p>{m.text}</p>
                <span className={`text-[9px] font-mono block ${m.sender === 'user' ? 'text-cyan-200' : 'text-slate-500'}`}>
                  {m.timestamp}
                </span>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-[#070d18] border border-slate-800 rounded-2xl flex items-center gap-2 text-cyan-300">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span className="font-mono text-[11px]">Savior AI analyzing security heuristics...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition"
              >
                💡 {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.aiInputPlaceholder}
              className="flex-1 bg-[#070d18] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-cyan-950 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t.aiSendBtn}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
