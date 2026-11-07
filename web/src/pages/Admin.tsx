import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, User, FileText, AlertTriangle, Plus } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function Admin() {
  const { user } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [unresolved, setUnresolved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRule, setNewRule] = useState({
    ruleId: '',
    categoryId: '',
    jurisdiction: '',
    investorCategory: 'NRI',
    conditions: JSON.stringify([{ key: 'countryOfResidence', operator: 'eq', value: '' }]),
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation: '',
    sourceUrl: '',
    reviewStatus: 'PENDING' as const,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      // redirect-like behavior
    }
    load();
  }, [user]);

  const load = async () => {
    try {
      const [r, u, un] = await Promise.all([
        api.get<{ rules: any[] }>('/rules'),
        api.get<{ updates: any[] }>('/admin/updates'),
        api.get<{ unresolvedChecks: any[] }>('/admin/unresolved-checks'),
      ]);
      setRules(r.rules || []);
      setUpdates(u.updates || []);
      setUnresolved(un.unresolvedChecks || []);
    } catch {}
    setLoading(false);
  };

  const addRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/rules', {
        ...newRule,
        conditions: JSON.parse(newRule.conditions || '[]'),
        version: 1,
        isActive: true,
      });
      setError(null);
      load();
      setNewRule({ ...newRule, ruleId: '', explanation: '', sourceUrl: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to add rule.');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white dark:bg-navy-900 flex items-center justify-center">
        <h2 className="text-navy-900 dark:text-white font-medium">Loading admin panel…</h2>
      </div>
    );

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader className="p-8">
              <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <CardTitle>Admin access required</CardTitle>
              <CardDescription className="text-sm">
                You must be signed in as an administrator to view this page.
              </CardDescription>
            </CardHeader>
            <CardFooter className="p-6">
              <Button variant="emerald" className="w-full" asChild onClick={() => {}}>
                <Link to="/login">Sign in</Link>
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link
            to="/dashboard"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white"
          >
            Dashboard
          </Link>
          <span className="text-sm text-gray-400">/</span>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Admin Panel</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage eligibility rules, regulatory sources, and review unresolved cases.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rules management */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader className="p-5 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-navy-900 dark:text-white" />
                  <h3 className="font-bold text-navy-900 dark:text-white">
                    Eligibility rules ({rules.length})
                  </h3>
                </div>
                <Button variant="emerald" size="sm" onClick={() => {}}>
                  Add rule
                </Button>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-4">
                  {rules.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No rules.</p>
                  )}
                  {rules.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-navy-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-navy-900 dark:text-white">
                          {r.ruleId}
                        </span>
                        <Badge
                          variant={
                            r.reviewStatus === 'VERIFIED'
                              ? 'eligible'
                              : r.reviewStatus === 'OUTDATED'
                                ? 'restriction'
                                : 'verification'
                          }
                          className="text-[10px]"
                        >
                          {r.reviewStatus}
                        </Badge>
                        {r.isIllustrative && (
                          <Badge variant="illustrative" className="text-[10px]">
                            Illustrative
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {r.jurisdiction} · {r.investorCategory} ·{' '}
                        {r.categoryId ? 'category set' : '—'}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{r.explanation}</p>
                      {r.sourceUrl && (
                        <a
                          href={r.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Source: {r.sourceName || r.sourceUrl}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-5 pb-3">
                <h3 className="font-bold text-navy-900 dark:text-white">Add new rule</h3>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <form onSubmit={addRule} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Rule ID
                      </label>
                      <Input
                        value={newRule.ruleId}
                        onChange={(e) => setNewRule({ ...newRule, ruleId: e.target.value })}
                        className="text-sm"
                        placeholder="e.g. MF-US-002"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Jurisdiction
                      </label>
                      <Input
                        value={newRule.jurisdiction}
                        onChange={(e) => setNewRule({ ...newRule, jurisdiction: e.target.value })}
                        className="text-sm"
                        placeholder="United States"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Investor category
                    </label>
                    <Select
                      value={newRule.investorCategory}
                      onChange={(e) => setNewRule({ ...newRule, investorCategory: e.target.value })}
                      className="text-sm"
                    >
                      <option value="NRI">NRI</option>
                      <option value="OCI">OCI</option>
                      <option value="OTHER">Other</option>
                      <option value="ANY">ANY</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Outcome
                    </label>
                    <Select
                      value={newRule.outcome}
                      onChange={(e) => setNewRule({ ...newRule, outcome: e.target.value })}
                      className="text-sm"
                    >
                      <option value="POTENTIALLY_ELIGIBLE">Potentially eligible</option>
                      <option value="POTENTIAL_RESTRICTION">Potential restriction</option>
                      <option value="VERIFICATION_REQUIRED">Verification required</option>
                      <option value="INSUFFICIENT_INFO">Insufficient information</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Explanation
                    </label>
                    <Input
                      value={newRule.explanation}
                      onChange={(e) => setNewRule({ ...newRule, explanation: e.target.value })}
                      className="text-sm"
                      placeholder="Plain-language explanation"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Source URL
                    </label>
                    <Input
                      value={newRule.sourceUrl}
                      onChange={(e) => setNewRule({ ...newRule, sourceUrl: e.target.value })}
                      className="text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                  <Button type="submit" variant="emerald" className="w-full">
                    Add rule
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Unresolved cases + updates */}
          <div className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-bold text-navy-900 dark:text-white">Unresolved cases</h3>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-4">
                  {unresolved.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No unresolved cases.</p>
                  )}
                  {unresolved.map((c: any) => (
                    <div
                      key={c.check.id}
                      className="p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-navy-800"
                    >
                      <div className="text-xs font-semibold text-navy-900 dark:text-white mb-1">
                        {c.check.countryOfResidence} · {c.check.residencyStatus}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {c.check.overallOutcome}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {c.check.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-5 pb-3">
                <h3 className="font-bold text-navy-900 dark:text-white">Regulatory updates</h3>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                {updates.map((u: any) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-navy-800"
                  >
                    <div className="font-semibold text-sm text-navy-900 dark:text-white">
                      {u.title}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{u.summary}</p>
                    <div className="text-[10px] text-gray-400 mt-2">
                      {new Date(u.publishedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" onClick={() => {}}>
                  <Plus className="w-3 h-3 mr-1" /> Publish update
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
