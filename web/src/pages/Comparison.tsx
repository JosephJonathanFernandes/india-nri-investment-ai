import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Scale } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CATEGORY_META: Record<string, { risk: string; liquidity: string; repatriation: string; tax: string; account: string }> = {
  'indian-mutual-funds': { risk: 'Moderate', liquidity: 'High', repatriation: 'Depends on NRE/NRO basis', tax: 'Moderate', account: 'NRE/NRO + intermediary KYC' },
  'listed-indian-equities': { risk: 'High', liquidity: 'High', repatriation: 'Repatriable via NRE/PIS', tax: 'Moderate-High', account: 'NRE/NRO + demat + PIS' },
  'exchange-traded-funds': { risk: 'Moderate-High', liquidity: 'High', repatriation: 'Same as listed equities', tax: 'Moderate', account: 'NRE/NRO + demat' },
  'ipos': { risk: 'High', liquidity: 'Low until listing', repatriation: 'Subject to FEMA/allotment', tax: 'Moderate', account: 'NRE/NRO + demat' },
  'government-securities-bonds': { risk: 'Low-Moderate', liquidity: 'Moderate', repatriation: 'Varies by instrument', tax: 'Moderate', account: 'NRE/NRO + demat' },
  'fixed-deposits': { risk: 'Low', liquidity: 'Moderate', repatriation: 'NRE/FCNR repatriable; NRO limited', tax: 'Low-Moderate', account: 'NRE/NRO/FCNR' },
  'real-estate': { risk: 'Moderate-High', liquidity: 'Low', repatriation: 'Restricted under FEMA', tax: 'High', account: 'NRO; RBI approvals may apply' },
  'reits-invits': { risk: 'Moderate-High', liquidity: 'Moderate', repatriation: 'Varies by structure', tax: 'High', account: 'NRE/NRO + demat' },
  'gift-city-products': { risk: 'Moderate-High', liquidity: 'Varies', repatriation: 'Subject to IFSC/FEMA rules', tax: 'High', account: 'IFSC-compliant + KYC' },
};

const RISK_SCORE: Record<string, number> = { Low: 1, 'Low-Moderate': 2, Moderate: 3, 'Moderate-High': 4, High: 5 };
const LIQUIDITY_SCORE: Record<string, number> = { Low: 1, Moderate: 2, High: 3 };

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

type CategoryButtonProps = {
  c: any;
  isSel: boolean;
  selectedLength: number;
  onToggle: (id: string) => void;
};
function CategoryButton({ c, isSel, selectedLength, onToggle }: CategoryButtonProps) {
  const meta = CATEGORY_META[c.slug] || { risk: '&mdash;', liquidity: '&mdash;', repatriation: '&mdash;', tax: '&mdash;', account: '&mdash;' };
  const disabled = !isSel && selectedLength >= 4;
  return (
    <button
      onClick={() => onToggle(c.id)}
      disabled={disabled}
      className={cn(
        'flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-colors cursor-pointer',
        isSel ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      )}
    >
      <div className="flex items-center gap-2">
        <Scale className="w-4 h-4" />
        <span className={cn('font-semibold text-navy-900 dark:text-white', isSel ? 'text-emerald-600 dark:text-emerald-400' : '')}>{c.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <Badge variant={isSel ? 'eligible' : 'insufficient'} className="text-[10px]">
          {isSel ? 'Selected' : 'Select'}
        </Badge>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{meta.risk} risk &middot; {meta.liquidity} liquidity</p>
      {disabled && <span className="text-[10px] text-amber-500 dark:text-amber-400 mt-1">Max 4 selections</span>}
    </button>
  );
}

export default function Comparison() {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res: any = await api.get('/investments/categories');
      setCategories(res.categories || []);
    } catch {}
    setLoading(false);
  };

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-navy-900 flex items-center justify-center">
      <h2 className="text-navy-900 dark:text-white font-medium">Loading&hellip;</h2>
    </div>
  );

  const selectedCats = categories.filter((c) => selected.includes(c.id));
  const chartData = selectedCats.map((c) => {
    const meta = CATEGORY_META[c.slug] || {};
    return {
      name: c.name.length > 14 ? c.name.slice(0, 11) + '...' : c.name,
      risk: RISK_SCORE[meta.risk ?? 'Moderate'] ?? 3,
      liquidity: LIQUIDITY_SCORE[meta.liquidity ?? 'Moderate'] ?? 2,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Investment Comparison</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Compare investment categories by eligibility, risk, liquidity, repatriation, and tax complexity. Not investment advice.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelected([])}>
              Clear all
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader className="p-5 pb-3">
            <CardTitle>Select categories to compare</CardTitle>
            <CardDescription className="text-sm">Choose up to 4 categories. Your profile: {profile?.countryOfResidence} &middot; {profile?.residencyStatus}.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {categories.map((c) => (
                <CategoryButton
                  key={c.id}
                  c={c}
                  isSel={selected.includes(c.id)}
                  selectedLength={selected.length}
                  onToggle={toggle}
                />
              ))}
              {selected.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">Select categories to see a side-by-side comparison.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {selected.length > 0 && (
          <div className="space-y-8">
            {/* Visual chart */}
            <Card>
              <CardHeader className="p-5 pb-3">
                <CardTitle>Risk &amp; liquidity at a glance</CardTitle>
                <CardDescription className="text-sm">Illustrative scores (1&ndash;5). Legal availability does not imply suitability.</CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 140, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis type="number" domain={[0, 5.5]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const entry = payload[0].payload as any;
                          const riskLabel = Object.entries(RISK_SCORE).find(([, v]) => v === entry.risk)?.[0] ?? 'Moderate';
                          const liqLabel = Object.entries(LIQUIDITY_SCORE).find(([, v]) => v === entry.liquidity)?.[0] ?? 'Moderate';
                          return (
                            <div className="p-2 bg-white dark:bg-navy-800 border border-gray-200 dark:border-white/10 rounded-lg text-sm">
                              <div className="font-medium text-navy-900 dark:text-white">{entry.name}</div>
                              <div className="text-gray-600 dark:text-gray-400">Risk: {riskLabel}</div>
                              <div className="text-gray-600 dark:text-gray-400">Liquidity: {liqLabel}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="risk" fill="#10b981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="liquidity" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Side-by-side comparison table */}
            <div className="overflow-x-auto">
              <Card>
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Side-by-side comparison</CardTitle>
                    <CardDescription className="text-sm">General eligibility considerations are illustrative unless marked verified.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    <Save className="w-4 h-4 mr-1" /> Save comparison
                  </Button>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="min-w-full">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-white/10">
                          <th className="pb-3 text-left text-xs font-semibold text-navy-900 dark:text-white w-32">Consideration</th>
                          {selected.map((id) => (
                            <th key={id} className="pb-3 text-left text-xs font-semibold text-navy-900 dark:text-white bg-gray-50 dark:bg-white/5">
                              {categories.find((x) => x.id === id)?.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                        {[
                          { label: 'General eligibility', key: 'eligibility', desc: 'Based on RBI/SEBI rules & your profile.' },
                          { label: 'Potential risk level', key: 'risk', desc: 'Illustrative risk classification.' },
                          { label: 'Liquidity', key: 'liquidity', desc: 'Ease of exiting the investment.' },
                          { label: 'Repatriation', key: 'repatriation', desc: 'Ability to move proceeds abroad.' },
                          { label: 'Tax complexity', key: 'tax', desc: 'Indian + foreign tax considerations.' },
                          { label: 'Typical account requirements', key: 'account', desc: 'NRE/NRO/demat/PIS where applicable.' },
                        ].map((row) => (
                          <tr key={row.key} className="group">
                            <td className="py-4 text-sm font-medium text-navy-900 dark:text-white">
                              {row.label}
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{row.desc}</p>
                            </td>
                            {selected.map((id) => {
                              const c = categories.find((x) => x.id === id);
                              const meta = CATEGORY_META[c?.slug || ''];
                              const val: Record<string, string> = {
                                eligibility: 'See eligibility checker',
                                risk: meta.risk || '&mdash;',
                                liquidity: meta.liquidity || '&mdash;',
                                repatriation: meta.repatriation || '&mdash;',
                                tax: meta.tax || '&mdash;',
                                account: meta.account || '&mdash;',
                              };
                              return <td key={id} className="py-4 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-navy-800/50">{val[row.key]}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Separator className="my-6" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    <strong>Important:</strong> Legal availability does not imply suitability. These are general considerations based on illustrative/demo rules unless marked verified. Tax treatment depends on your country of residence and applicable treaties &mdash; consult a qualified tax adviser.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
