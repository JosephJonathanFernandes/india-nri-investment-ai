import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Scale,
  Sparkles,
  FileText,
  Smartphone,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Navbar, Footer } from '@/components/layout/Navbar';

const features = [
  {
    title: 'Investment Eligibility',
    description:
      'Check which Indian investments may be available to you based on your country of residence and residency status.',
    icon: Shield,
  },
  {
    title: 'Regulatory Guidance',
    description:
      'Plain-language explanations of RBI, SEBI, and FEMA rules that apply to NRI investors.',
    icon: FileText,
  },
  {
    title: 'Tax Awareness',
    description:
      'Understand Indian capital gains, withholding tax, and repatriation considerations before you invest.',
    icon: BarChart3,
  },
  {
    title: 'Repatriation Planning',
    description:
      'Learn how to move investment proceeds back to your country of residence within legal limits.',
    icon: Smartphone,
  },
];

export default function Landing() {
  const location = useLocation();
  const scrolled = location.pathname !== '/';

  return (
    <div className="min-h-screen bg-white text-navy-900 dark:bg-navy-900 dark:text-white selection:bg-emerald-200 selection:text-navy-900">
      <Navbar />
      {scrolled ? (
        <div className="border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-navy-900/90 backdrop-blur sticky top-0 z-30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="font-bold text-lg tracking-tight">
              NRI Investment Simplifier
            </Link>
            <div className="flex gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-navy-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Sign in
              </Link>
              <Button variant="emerald" asChild onClick={() => {}}>
                <a href="/onboarding">Check My Eligibility</a>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Hero */}
      <section className="relative px-4 py-16 sm:py-24 lg:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 dark:opacity-20">
          <div className="relative top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-emerald-600/20 blur-[120px]"></div>
        </div>
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live regulatory rules engine
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
            Invest in India.{' '}
            <span className="text-emerald-600 dark:text-emerald-400">Understand Your Options.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            A smarter way for NRIs to explore investment eligibility, account requirements, tax
            considerations, and repatriation rules — without the complexity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="emerald" className="text-lg px-8 py-4" asChild onClick={() => {}}>
              <a href="/onboarding">
                Check My Eligibility <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4" asChild onClick={() => {}}>
              <a href="/investments">Explore Investments</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-b border-gray-200 dark:border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Built for NRI investors</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Simplify complex Indian investment regulations into clear, actionable guidance.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="card-hover p-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-navy-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {f.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="py-20 bg-gray-50 dark:bg-navy-800">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Your personalized dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">
              See your eligibility summary, saved options, and next steps in one place.
            </p>
          </div>
          <div className="max-w-5xl mx-auto rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy-800 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>2 potentially eligible investments</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>1 item needs verification</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>3 saved investment options</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>Onboarding complete</span>
              </div>
            </div>
            <div className="h-48 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden flex">
              <div className="w-1/3 bg-gray-100 dark:bg-navy-700 p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/2"></div>
                <div className="h-32 mt-2 bg-white dark:bg-navy-800 rounded border border-gray-200 p-3">
                  <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-2/3"></div>
                </div>
              </div>
              <div className="w-2/3 p-6">
                <h4 className="font-semibold mb-2">Mutual Funds (US)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Potentially eligible — NRE account required. Repatriable on NRE basis.
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-800">
                    Potentially eligible
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-medium border border-purple-200 bg-purple-50 text-purple-800">
                    Illustrative data
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How it works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Tell us your profile',
                text: 'Country of residence, residency status (NRI/OCI), goals, and repatriation preference.',
              },
              {
                step: '2',
                title: 'Run an eligibility check',
                text: 'Select an investment category and see which rules apply to you.',
              },
              {
                step: '3',
                title: 'Review & act',
                text: 'Save options, download a document checklist, or ask the AI assistant.',
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center mx-auto mb-4 font-bold">
                  {s.step}
                </div>
                <h3 className="font-semibold text-navy-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-navy-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'Is this platform a substitute for professional advice?',
                a: 'No. It provides educational guidance based on illustrative and verified rules. Always consult a qualified financial, tax, or legal professional before investing.',
              },
              {
                q: 'Are the eligibility rules current law?',
                a: 'Rules marked “ILLUSTRATIVE” are demonstration data, not current law. Verified rules carry official source URLs and verification dates.',
              },
              {
                q: 'Do you store my passwords or banking credentials?',
                a: 'No. We never request or store banking credentials or sensitive identity documents. Passwords are hashed.',
              },
            ].map((f) => (
              <div
                key={f.q}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy-800 p-5"
              >
                <p className="font-medium text-navy-900 dark:text-white">{f.q}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
