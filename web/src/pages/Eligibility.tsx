import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, ShieldAlert, Clock, Info, AlertTriangle, Download } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { type EligibilityOutcome } from '@/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CATEGORIES = [
  'Indian Mutual Funds',
  'Listed Indian Equities',
  'Exchange-Traded Funds (ETFs)',
  'IPOs',
  'Government Securities and Bonds',
  'Fixed Deposits',
  'Real Estate',
  'REITs and InvITs',
  'GIFT City Investment Products',
];

type OutcomeVariant = 'eligible' | 'restriction' | 'verification' | 'insufficient' | 'illustrative';

const OUTCOME_CONFIG: Record<EligibilityOutcome, { label: string; variant: OutcomeVariant; icon: any }> = {
  POTENTIALLY_ELIGIBLE: { label: 'Potentially eligible', variant: 'eligible', icon: Shield },
  POTENTIAL_RESTRICTION: { label: 'Potential restriction', variant: 'restriction', icon: ShieldAlert },
  VERIFICATION_REQUIRED: { label: 'Additional verification required', variant: 'verification', icon: Clock },
  INSUFFICIENT_INFO: { label: 'Insufficient information', variant: 'insufficient', icon: Info },
  UNRESOLVED: { label: 'Unresolved — manual review', variant: 'verification', icon: AlertTriangle },
};

function IconComp(icon: any, className: string) { const Icon = icon; return <Icon className={className} />; }

export default function Eligibility() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [repatriationPreference, setRepatriationPreference] = useState(profile?.repatriationPreference || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-run if profile complete and category preselected
  }, []);

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const profileLine = profile
      ? `Country: ${profile.countryOfResidence} | Residency: ${profile.residencyStatus} | Banking: ${(profile.existingBanking || []).join(', ') || 'None'}`
      : 'Profile not available';

    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('NRI Investment Simplifier — Eligibility Check Report', 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`Category: ${result.results?.[0]?.category || category}`, 14, 34);
    doc.text(profileLine, 14, 44);
    doc.text(`Overall outcome: ${OUTCOME_CONFIG[result.overallOutcome as EligibilityOutcome]?.label || result.overallOutcome}`, 14, 54);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 64);
    doc.text('Note: Rules marked "Illustrative" are demonstration data, not current law. Not professional advice.', 14, 74);

    const rows = result.results.map((r: any) => [
      r.category,
      OUTCOME_CONFIG[r.outcome as EligibilityOutcome]?.label || r.outcome,
      r.isIllustrative ? 'Yes' : 'No',
      r.explanation?.slice(0, 120) || '',
      r.accountType || '—',
      r.repatriation || '—',
      r.sourceName || '—',
    ]);

    (doc as any).autoTable({
      startY: 82,
      head: [['Category', 'Outcome', 'Illustrative', 'Explanation', 'Account type', 'Repatriation', 'Source']],
      body: rows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42] },
    });

    doc.save(`nri-eligibility-${category.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res: any = await api.post('/eligibility/check', {
        category,
        investmentAmount: investmentAmount || undefined,
        repatriationPreference: repatriationPreference || undefined,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Eligibility check failed.');
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Investment Eligibility Checker</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Select an investment category to evaluate eligibility based on your country of residence, residency status, and repatriation preference.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/investments')}>
              Browse categories
            </Button>
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={() => navigate('/eligibility/history')}>
                View history
              </Button>
            ) : null}
          </div>
        </div>

        {!profile?.countryOfResidence && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/20 dark:bg-amber-900/10">
            <CardContent className="p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">Complete your profile first</h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  Eligibility checks are personalized based on your country of residence and residency status.
                </p>
              </div>
              <Button variant="emerald" size="sm" onClick={() => navigate('/onboarding')}>
                Go to onboarding
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <Card className="lg:col-span-2">
            <CardHeader className="p-5 pb-3">
              <CardTitle>Run an eligibility check</CardTitle>
              <CardDescription>Results are based on the deterministic rules engine, not AI guesswork.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-900 dark:text-white">Investment category</label>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-900 dark:text-white">Illustrative investment amount (INR)</label>
                  <Input
                    type="text"
                    placeholder="e.g. 5000000"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Optional — used for rules with amount conditions.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-900 dark:text-white">Repatriation preference</label>
                  <Select
                    value={repatriationPreference}
                    onChange={(e) => setRepatriationPreference(e.target.value)}
                  >
                    <option value="">Use profile default</option>
                    <option value="Prefer full repatriation where legally permitted">Prefer full repatriation where legally permitted</option>
                    <option value="Partial repatriation">Partial repatriation</option>
                    <option value="No immediate repatriation requirement">No immediate repatriation requirement</option>
                    <option value="Unsure">Unsure</option>
                  </Select>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your profile: <strong>{profile?.countryOfResidence}</strong> · <strong>{profile?.residencyStatus}</strong> · Banking: {profile?.existingBanking?.join(', ') || 'None specified'}
                </p>
                <Button variant="emerald" type="submit" className="w-full" disabled={loading || !category || !profile?.countryOfResidence}>
                  {loading ? 'Evaluating...' : 'Check eligibility'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* How results work */}
          <Card className="lg:col-span-1">
            <CardHeader className="p-5 pb-3">
              <h3 className="font-bold text-navy-900 dark:text-white">Understanding results</h3>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="space-y-4">
                {[{
                  outcome: 'POTENTIALLY_ELIGIBLE',
                  label: 'Potentially eligible',
                  desc: 'General rules suggest the investment may be available, subject to conditions.',
                  color: 'text-emerald-600 dark:text-emerald-400',
                }, {
                  outcome: 'POTENTIAL_RESTRICTION',
                  label: 'Potential restriction',
                  desc: 'A country-specific limitation may apply. Verify before proceeding.',
                  color: 'text-amber-600 dark:text-amber-400',
                }, {
                  outcome: 'VERIFICATION_REQUIRED',
                  label: 'Additional verification required',
                  desc: 'Confirmation from an authorized financial institution is necessary.',
                  color: 'text-blue-600 dark:text-blue-400',
                }, {
                  outcome: 'INSUFFICIENT_INFO',
                  label: 'Insufficient information',
                  desc: 'We cannot determine eligibility reliably from rules on file.',
                  color: 'text-gray-500 dark:text-gray-400',
                }].map((o) => (
                  <div key={o.outcome} className="flex items-start gap-2 text-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${o.color} mt-1 flex-shrink-0`} />
                    <div>
                      <div className="font-medium text-navy-900 dark:text-white">{o.label}</div>
                      <div className="text-gray-500 dark:text-gray-400">{o.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                <strong>Important:</strong> Rules marked "ILLUSTRATIVE" are demonstration data, not current law. This tool does not constitute investment, tax, or legal advice. Consult a qualified professional before investing.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8">
            <Card>
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-navy-900 dark:text-white">Eligibility results for {result.results?.[0]?.category || category}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.summary}</p>
                  </div>
                  <Badge variant={result.overallOutcome === 'POTENTIALLY_ELIGIBLE' ? 'eligible' : result.overallOutcome === 'POTENTIAL_RESTRICTION' ? 'restriction' : result.overallOutcome === 'VERIFICATION_REQUIRED' ? 'verification' : 'insufficient'}>
                    {OUTCOME_CONFIG[result.overallOutcome as EligibilityOutcome]?.label || result.overallOutcome}
                    {result.unresolved && <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded">Manual review</span>}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {result.results.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <Info className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-navy-900 dark:text-white">No matching rules found for your profile.</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try another investment category or update your profile.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {result.results.map((r: any) => (
                      <ResultCard key={r.ruleId || r.id} result={r} />
                    ))}
                  </div>
                )}
              </CardContent>
              {result.checkId && (
                <CardFooter className="p-4 border-t border-gray-100 dark:border-white/10 flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/eligibility/history/${result.checkId}`)}>
                    View full check details
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportPDF}>
                    <Download className="w-4 h-4 mr-1" /> Export PDF
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: any }) {
  const config = OUTCOME_CONFIG[result.outcome as EligibilityOutcome] || OUTCOME_CONFIG.INSUFFICIENT_INFO;
  const isIllustrative = result.reviewStatus === 'ILLUSTRATIVE' || result.reviewStatus === 'PENDING';
  return (
    <Card className="p-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            {IconComp(config.icon, 'w-5 h-5')}
          </div>
          <div>
            <h3 className="font-semibold text-navy-900 dark:text-white">{result.category}</h3>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant={config.variant as any} className="text-[10px]">{config.label}</Badge>
              {isIllustrative && <Badge variant="illustrative" className="text-[10px]">Illustrative — not current law</Badge>}
            </div>
          </div>
        </div>
        {result.sourceUrl && (
          <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
            View source
          </a>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{result.explanation}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {result.conditions && (
          <div className="p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Conditions</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{result.conditions}</p>
          </div>
        )}
        {result.accountType && (
          <div className="p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Account type</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{result.accountType}</p>
          </div>
        )}
      </div>
      {result.repatriation && (
        <div className="p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 mb-3">
          <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Repatriation</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{result.repatriation}</p>
        </div>
      )}
      {result.taxConsiderations && (
        <div className="p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 mb-3">
          <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Tax considerations</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{result.taxConsiderations}</p>
        </div>
      )}
      {result.documentation && (
        <div className="p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 mb-3">
          <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Documentation</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{result.documentation}</p>
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Source: {result.sourceName || '—'}</span>
        <span>{result.lastVerified ? `Verified ${new Date(result.lastVerified).toLocaleDateString()}` : 'Not verified'}</span>
        <span>v{result.version}</span>
      </div>
    </Card>
  );
}
