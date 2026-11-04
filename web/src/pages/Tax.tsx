import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, AlertTriangle, BarChart3, Clock } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

const INVESTMENT_TYPES = [
  'Indian Mutual Funds (Equity)',
  'Indian Mutual Funds (Debt)',
  'Listed Indian Equities',
  'ETFs',
  'Government Bonds',
  'Fixed Deposits (NRE/NRO)',
  'Real Estate',
  'REITs / InvITs',
];

const COUNTRIES = ['United States', 'United Kingdom', 'United Arab Emirates', 'Canada', 'Australia', 'Singapore', 'Other'];

export default function Tax() {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    investmentType: 'Indian Mutual Funds (Equity)',
    investmentAmount: '',
    purchaseValue: '',
    saleValue: '',
    holdingPeriodYears: '',
    countryOfTaxResidence: profile?.countryOfResidence || '',
    expenses: '',
    knownTdsRate: '',
  });
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res: any = await api.post('/tax/estimate', {
        investmentType: form.investmentType,
        investmentAmount: form.investmentAmount ? Number(form.investmentAmount) : 0,
        purchaseValue: form.purchaseValue ? Number(form.purchaseValue) : 0,
        saleValue: form.saleValue ? Number(form.saleValue) : 0,
        holdingPeriodYears: form.holdingPeriodYears ? Number(form.holdingPeriodYears) : 0,
        countryOfTaxResidence: form.countryOfTaxResidence || undefined,
        expenses: form.expenses ? Number(form.expenses) : undefined,
        knownTdsRate: form.knownTdsRate ? Number(form.knownTdsRate) : undefined,
      });
      setEstimate(res);
    } catch (err: any) {
      setError(err.message || 'Estimate failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatInr = (v: number | undefined) => {
    if (v === undefined) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Tax & Repatriation Explainer</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Illustrative estimates of gains, Indian tax considerations, withholding tax, and repatriation questions. Not a tax computation.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {}}>
              <Clock className="w-4 h-4 mr-1" /> Assumptions
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input form */}
          <Card className="lg:col-span-2">
            <CardHeader className="p-5 pb-3">
              <CardTitle>Enter illustrative values</CardTitle>
              <CardDescription className="text-sm">All amounts in INR. Results are versioned illustrative estimates only.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-navy-900 dark:text-white">Investment type</label>
                    <Select value={form.investmentType} onChange={(e) => setForm({ ...form, investmentType: e.target.value })}>
                      {INVESTMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-navy-900 dark:text-white">Country of tax residence</label>
                    <Select value={form.countryOfTaxResidence} onChange={(e) => setForm({ ...form, countryOfTaxResidence: e.target.value })}>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-navy-900 dark:text-white">Purchase value (INR)</label>
                    <Input type="number" value={form.purchaseValue} onChange={(e) => setForm({ ...form, purchaseValue: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-navy-900 dark:text-white">Sale value (INR)</label>
                    <Input type="number" value={form.saleValue} onChange={(e) => setForm({ ...form, saleValue: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-navy-900 dark:text-white">Holding period (years)</label>
                    <Input type="number" value={form.holdingPeriodYears} onChange={(e) => setForm({ ...form, holdingPeriodYears: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-navy-900 dark:text-white">Applicable expenses (INR, optional)</label>
                    <Input type="number" value={form.expenses} onChange={(e) => setForm({ ...form, expenses: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-navy-900 dark:text-white">Known TDS rate % (optional)</label>
                    <Input type="number" value={form.knownTdsRate} onChange={(e) => setForm({ ...form, knownTdsRate: e.target.value })} />
                  </div>
                </div>
                <Button variant="emerald" type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Calculating…' : 'Calculate estimate'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Assumptions panel */}
          <Card className="lg:col-span-1">
            <CardHeader className="p-5 pb-3">
              <h3 className="font-bold text-navy-900 dark:text-white">Assumptions & limits</h3>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="space-y-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                <p>• Rates shown are versioned illustrative references (v1.0.0), not current law.</p>
                <p>• DTAA benefits and foreign tax credits are not computed.</p>
                <p>• Indian capital-gains rules and holding periods may change.</p>
                <p>• FEMA/RBI eligibility is separate from tax.</p>
                <p>• Not a definitive tax liability. Verify with a tax professional.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {estimate && (
          <div className="mt-8">
            <Card>
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="font-bold text-navy-900 dark:text-white">Estimate results</h2>
                </div>
                <Badge variant="illustrative" className="ml-auto text-[10px]">Illustrative estimate v{estimate.version}</Badge>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatBlock title="Gain / (Loss)" value={formatInr(estimate.gainOrLoss)} sub={estimate.gainPercent >= 0 ? `+${estimate.gainPercent.toFixed(1)}%` : `${estimate.gainPercent.toFixed(1)}%`} color="text-emerald-600" />
                  <StatBlock title="Estimated Indian tax" value={formatInr(estimate.illustrativeIndianTaxInr)} sub={estimate.illustrativeEffectiveRate !== undefined ? `${estimate.illustrativeEffectiveRate.toFixed(1)}% effective` : '—'} color="text-amber-600" />
                  <StatBlock title="Withholding (TDS)" value={formatInr(estimate.illustrativeIndianTaxInr ? estimate.illustrativeIndianTaxInr * 0 : 0)} sub="Confirm with your bank" color="text-blue-600" />
                </div>

                <Section title="Indian tax considerations" icon={<BarChart3 className="w-4 h-4" />}>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{estimate.indianTaxConsiderations}</p>
                </Section>
                <Section title="Withholding tax considerations" icon={<Clock className="w-4 h-4" />}>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{estimate.withholdingTaxConsiderations}</p>
                </Section>
                <Section title="Foreign tax implications" icon={<AlertTriangle className="w-4 h-4" />}>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{estimate.foreignTaxImplications}</p>
                </Section>

                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10">
                  <h4 className="text-sm font-semibold text-navy-900 dark:text-white mb-2">Repatriation questions to verify</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-5">
                    {estimate.repatriationQuestions.map((q: string, i: number) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">Assumptions</h4>
                  <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 list-disc pl-5">
                    {estimate.assumptions.map((a: string, i: number) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2 mt-3">Limitations</h4>
                  <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 list-disc pl-5">
                    {estimate.limitations.map((l: string, i: number) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <div className="mt-6 p-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
}

function StatBlock({ title, value, sub, color }: { title: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-navy-800">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
      <p className="text-lg font-bold text-navy-900 dark:text-white mt-1">{value}</p>
      <p className="text-xs {color} mt-0.5">{sub}</p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-navy-800">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="text-sm font-semibold text-navy-900 dark:text-white">{title}</h4>
      </div>
      {children}
    </div>
  );
}
