import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/layout/Navbar';
import { Sparkles, Send, RotateCw, MessageCircle } from 'lucide-react';

const EXAMPLE_QUESTIONS = [
  'Can I invest in Indian mutual funds while living in the USA?',
  'What is the difference between NRE and NRO accounts?',
  'Can I repatriate investment proceeds to my country of residence?',
  'What documents might a broker require from an NRI?',
  'What should I verify before investing through GIFT City?',
];

export default function Assistant() {
  const { user, profile } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string; sources?: string[] }>
  >([]);
  [user]; // keep reference
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [exampleActive, setExampleActive] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAuthenticated] = useState(!!user);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'USER', content: userMsg }]);
    setExampleActive(null);

    try {
      const res: any = await api.post('/assistant/chat', {
        message: userMsg,
        conversationId,
      });
      setConversationId(res.conversationId);
      setMessages((prev) => [
        ...prev,
        { role: 'ASSISTANT', content: res.answer, sources: res.sources },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ASSISTANT',
          content:
            err.message ||
            'I could not generate a response. Please consult a qualified professional.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const useExample = (q: string) => {
    setInput(q);
    setExampleActive(q);
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
    setExampleActive(null);
  };

  if (!isAuthenticated || !profile?.countryOfResidence) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader className="p-8">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <CardTitle>AI Regulatory Assistant</CardTitle>
              <CardDescription className="text-sm">
                Sign in and complete onboarding to chat with your NRI investment assistant.
              </CardDescription>
            </CardHeader>
            <CardFooter className="p-6">
              <Button variant="emerald" className="w-full" onClick={() => {}}>
                Go to onboarding
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
              Ask Your NRI Investment Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Get plain-language answers about Indian investment rules. Your profile:{' '}
              {profile.countryOfResidence} · {profile.residencyStatus}.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearChat}>
              <RotateCw className="w-4 h-4 mr-1" /> Clear chat
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Examples sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-sm font-semibold text-navy-900 dark:text-white mb-2">
              Try asking
            </div>
            <div className="space-y-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => useExample(q)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors',
                    exampleActive === q
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      : 'border-gray-200 dark:border-white/20 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10'
                  )}
                >
                  <MessageCircle className="w-4 h-4 mr-2 text-gray-400" /> {q}
                </button>
              ))}
            </div>
            <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy-800 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              The assistant distinguishes regulatory eligibility from tax advice, cites official
              sources where available, and recommends consulting a qualified professional for
              complex cases.
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-8 flex flex-col h-[600px]">
            <Card className="flex-1 flex flex-col overflow-hidden border-gray-200 dark:border-white/10">
              <CardHeader className="p-4 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-navy-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-navy-900 dark:text-white">
                      NRI Investment Assistant
                    </div>
                    <div className="text-xs text-gray-500">Educational guidance · RAG-enabled</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 ref={scrollRef as any}">
                {messages.length === 0 && (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Start by asking a question about NRI investments in India.</p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={m.role === 'USER' ? 'flex justify-end' : 'flex justify-start'}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm',
                        m.role === 'USER'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white border border-gray-100 dark:border-white/10'
                      )}
                    >
                      {m.content}
                      {m.role === 'ASSISTANT' && m.sources?.length && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-white/10">
                          <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                            Sources
                          </div>
                          <ul className="text-xs space-y-1">
                            {m.sources.map((s, si) => (
                              <li key={si} className="flex items-center gap-1">
                                <span className="text-emerald-600 dark:text-emerald-400">→</span>
                                <a
                                  href={s}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                                >
                                  {s}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-navy-800 border border-gray-100 dark:border-white/10 rounded-2xl p-3 text-sm text-navy-900 dark:text-white animate-pulse">
                      Typing…
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-navy-800">
                <form onSubmit={sendMessage} className="flex gap-3">
                  <Input
                    placeholder="Ask about mutual funds, NRE/NRO accounts, repatriation, GIFT City…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button type="submit" variant="emerald" disabled={loading || !input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-gray-500 dark:text-gray-500">
          Educational guidance only — not professional legal, tax, or investment advice. The
          assistant may not have access to all current regulations.
        </p>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
