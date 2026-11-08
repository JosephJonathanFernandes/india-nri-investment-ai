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
import {
  Shield,
  User,
  FileText,
  AlertTriangle,
  Plus,
  Clock,
  RefreshCw,
  Play,
  Archive,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

const STATUS_CONFIG: Record<string, { variant: 'eligible' | 'restriction' | 'verification' | 'insufficient'; color: string }> = {
  PUBLISHED: { variant: 'eligible', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/20' },
  DRAFT: { variant: 'verification', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/20' },
  ARCHIVED: { variant: 'insufficient', color: 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700/20' },
};

export default function Admin() {
  const { user } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [unresolved, setUnresolved] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rules' | 'conflicts' | 'expiring' | 'unresolved' | 'updates'>('rules');
  const [newRule, setNewRule] = useState({
    ruleId: '',
    categoryId: '',
    jurisdiction: '',
    investorCategory: 'NRI',
    conditions: JSON.stringify([{ key: 'countryOfResidence', operator: 'eq', value: '' }]),
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation: '',
    sourceUrl: '',
    status: 'DRAFT' as const,
    effectiveFrom: '',
    effectiveTo: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [user]);

  const load = async () => {
    try {
      const [r, u, un, cf, ex] = await Promise.all([
        api.get<{ rules: any[] }>('/rules'),
        api.get<{ updates: any[] }>('/admin/updates'),
        api.get<{ unresolvedChecks: any[] }>('/admin/unresolved-checks'),
        api.get<{ conflicts: any[] }>('/admin/rules/conflicts'),
        api.get<{ expiringRules: any[] }>('/admin/rules/expiring'),
      ]);
      setRules(r.rules || []);
      setUpdates(u.updates || []);
      setUnresolved(un.unresolvedChecks || []);
      setConflicts(cf.conflicts || []);
      setExpiring(ex.expiringRules || []);
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
        effectiveFrom: newRule.effectiveFrom || undefined,
        effectiveTo: newRule.effectiveTo || undefined,
        status: newRule.status,
      });
      setError(null);
      load();
      setNewRule({
        ruleId: '',
        categoryId: '',
        jurisdiction: '',
        investorCategory: 'NRI',
        conditions: JSON.stringify([{ key: 'countryOfResidence', operator: 'eq', value: '' }]),
        outcome: 'POTENTIALLY_ELIGIBLE',
        explanation: '',
        sourceUrl: '',
        status: 'DRAFT',
        effectiveFrom: '',
        effectiveTo: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add rule.');
    }
  };

  const publishRule = async (id: string) => {
    try {
      await api.post(`/admin/rules/${id}/publish`);
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to publish rule.');
    }
  };

  const archiveRule = async (id: string) => {
    try {
      await api.post(`/admin/rules/${id}/archive`);
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to archive rule.');
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

  const statusConfig = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.DRAFT;

  const tabs = [
    { id: 'rules', label: 'Rules', count: rules.length },
    { id: 'conflicts', label: 'Conflicts', count: conflicts.length },
    { id: 'expiring', label: 'Expiring', count: expiring.length },
    { id: 'unresolved', label: 'Unresolved', count: unresolved.length },
    { id: 'updates', label: 'Updates', count: updates.length },
  ] as {
    id: 'rules' | 'conflicts' | 'expiring' | 'unresolved' | 'updates';
    label: string;
    count: number;
  }[];

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
          Manage eligibility rules, review conflicts, monitor expiring rules, and publish regulatory
          updates.
        </p>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'rules' | 'conflicts' | 'expiring' | 'unresolved' | 'updates')}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white'
              }`}
            >
              {tab.label} {tab.count > 0 && <span className="ml-1 text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    {rules.map((r) => {
                      const sc = statusConfig(r.status);
                      return (
                        <div
                          key={r.id}
                          className="p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-navy-800"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-navy-900 dark:text-white">
                                {r.ruleId}
                              </span>
                              <Badge
                                variant={sc.variant as any}
                                className={`text-[10px] ${sc.color}`}
                              >
                                {r.status}
                              </Badge>
                              {r.status === 'DRAFT' && (
                                <Badge variant="verification" className="text-[10px] ml-1">
                                  Draft
                                </Badge>
                              )}
                              {r.status === 'ARCHIVED' && (
                                <Badge variant="insufficient" className="text-[10px] ml-1">
                                  Archived
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {r.status === 'DRAFT' && (
                                <Button variant="emerald" size="sm" onClick={() => publishRule(r.id)}>
                                  <Play className="w-3 h-3 mr-1" /> Publish
                                </Button>
                              )}
                              {r.status !== 'ARCHIVED' && (
                                <Button variant="outline" size="sm" onClick={() => archiveRule(r.id)}>
                                  <Archive className="w-3 h-3 mr-1" /> Archive
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {r.jurisdiction} · {r.investorCategory} ·{' '}
                            {r.categoryId ? 'category set' : '—'}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {r.explanation}
                          </p>
                          <div className="flex flex-wrap gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                            {r.effectiveFrom && (
                              <span>
                                From:{' '}
                                {new Date(r.effectiveFrom).toLocaleDateString()}
                              </span>
                            )}
                            {r.effectiveTo && (
                              <span>
                                To:{' '}
                                {new Date(r.effectiveTo).toLocaleDateString()}
                              </span>
                            )}
                            {r.lastVerified && (
                              <span>
                                Verified:{' '}
                                {new Date(r.lastVerified).toLocaleDateString()}
                              </span>
                            )}
                            {!r.lastVerified && <span>Not verified</span>}
                          </div>
                          {r.sourceUrl && (
                            <a
                              key="source"
                              href={r.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1 inline-block"
                            >
                              Source: {r.sourceName || r.sourceUrl}
                            </a>
                          )}
                        </div>
                      )})}
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
                          onChange={(e) =>
                            setNewRule({ ...newRule, ruleId: e.target.value })}
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
                          onChange={(e) =>
                            setNewRule({ ...newRule, jurisdiction: e.target.value })}
                          className="text-sm"
                          placeholder="United States"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Investor category
                        </label>
                        <Select
                          value={newRule.investorCategory}
                          onChange={(e) =>
                            setNewRule({ ...newRule, investorCategory: e.target.value })}
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
                          Status
                        </label>
                        <Select
                          value={newRule.status}
                          onChange={(e) =>
                            setNewRule({ ...newRule, status: e.target.value as any })}
                          className="text-sm"
                        >
                          <option value="DRAFT">Draft (not visible to users)</option>
                          <option value="PUBLISHED">Published (live)</option>
                          <option value="ARCHIVED">Archived (retired)</option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Effective from
                        </label>
                        <Input
                          type="date"
                          value={newRule.effectiveFrom}
                          onChange={(e) =>
                            setNewRule({ ...newRule, effectiveFrom: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Effective to
                        </label>
                        <Input
                          type="date"
                          value={newRule.effectiveTo}
                          onChange={(e) =>
                            setNewRule({ ...newRule, effectiveTo: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Outcome
                      </label>
                      <Select
                        value={newRule.outcome}
                        onChange={(e) =>
                          setNewRule({ ...newRule, outcome: e.target.value })}
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
                        onChange={(e) =>
                          setNewRule({ ...newRule, explanation: e.target.value })}
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
                        onChange={(e) =>
                          setNewRule({ ...newRule, sourceUrl: e.target.value })}
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
          </div>
        )}

        {/* Conflicts Tab */}
        {activeTab === 'conflicts' && (
          <Card>
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-navy-900 dark:text-white">
                  Rule Conflicts ({conflicts.length})
                </h3>
              </div>
              <CardDescription className="text-sm">
                Rules with the same category + jurisdiction + investor category but conflicting
                outcomes require manual review.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {conflicts.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No conflicting rules. All clear.
                </p>
              )}
              {conflicts.map((c) => (
                <div
                  key={c.key}
                  className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-navy-800 mb-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-navy-900 dark:text-white">
                      {c.rules[0].jurisdiction} · {c.rules[0].investorCategory}
                    </span>
                    <Badge variant="verification" className="text-[10px]">
                      Conflict
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {c.rules.map((r: any) => (
                      <div
                        key={r.id}
                        className="flex items-start gap-3 p-2 rounded-lg border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5"
                      >
                        <span className="text-xs font-medium text-navy-900 dark:text-white">
                          {r.ruleId}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {r.outcome}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {r.explanation.slice(0, 100)}…
                          </p>
                        </div>
                        <Badge
                          variant={statusConfig(r.status).variant as any}
                          className="text-[10px]"
                        >
                          {r.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Expiring Tab */}
        {activeTab === 'expiring' && (
          <Card>
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-navy-900 dark:text-white">
                  Expiring Rules ({expiring.length})
                </h3>
              </div>
              <CardDescription className="text-sm">
                Rules past their effective date or not verified in over 12 months need admin
                attention.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {expiring.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  All rules are current.
                </p>
              )}
              {expiring.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl border border-amber-100 dark:border-amber-900/20 bg-amber-50 dark:bg-amber-900/10 mb-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                      {r.ruleId}
                    </span>
                    <Badge variant="verification" className="text-[10px]">
                      Needs review
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {r.jurisdiction} · {r.investorCategory}
                  </div>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mb-1">
                    {r.explanation}
                  </p>
                  <div className="flex gap-3 text-[10px] text-amber-600 dark:text-amber-400">
                    {r.effectiveTo && (
                      <span>Expires: {new Date(r.effectiveTo).toLocaleDateString()}</span>
                    )}
                    {r.lastVerified && (
                      <span>
                        Last verified: {new Date(r.lastVerified).toLocaleDateString()}
                      </span>
                    )}
                    {!r.lastVerified && <span>Never verified</span>}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => publishRule(r.id)}>
                    <RefreshCw className="w-3 h-3 mr-1" /> Re-verify
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Unresolved Tab */}
        {activeTab === 'unresolved' && (
          <Card>
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-navy-900 dark:text-white">
                  Unresolved cases ({unresolved.length})
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="space-y-4">
                {unresolved.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No unresolved cases.
                  </p>
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
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
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
        )}
      </div>
    </div>
  );
}
