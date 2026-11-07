import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Scale, Shield } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

const OUTCOME_LABELS: Record<string, string> = {
  POTENTIALLY_ELIGIBLE: 'Potentially eligible',
  POTENTIAL_RESTRICTION: 'Potential restriction',
  VERIFICATION_REQUIRED: 'Additional verification required',
  INSUFFICIENT_INFO: 'Insufficient information',
  UNRESOLVED: 'Unresolved — manual review',
};

export default function EligibilityHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [checks, setChecks] = useState<any[]>([]);
  const [single, setSingle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      if (id) {
        const res: any = await api.get(`/eligibility/history`);
        // find specific check
        const found = (res.checks || []).find((c: any) => c.id === id);
        if (found) {
          const results: any = await api.get(`/eligibility/history`);
          // results already embedded
          setSingle(found);
        }
      } else {
        const res: any = await api.get(`/eligibility/history`);
        setChecks(res.checks || []);
      }
    } catch {}
    setLoading(false);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white dark:bg-navy-900 flex items-center justify-center">
        <h2 className="text-navy-900 dark:text-white font-medium">Loading…</h2>
      </div>
    );

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
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Eligibility history</h1>
        </div>

        {id && single && (
          <Card>
            <CardHeader className="p-5 pb-3 flex items-center justify-between">
              <div>
                <CardTitle>Check details</CardTitle>
                <CardDescription className="text-sm">
                  {new Date(single.createdAt).toLocaleString()} · {single.countryOfResidence} ·{' '}
                  {single.residencyStatus}
                </CardDescription>
              </div>
              <Badge
                variant={
                  single.overallOutcome === 'POTENTIALLY_ELIGIBLE'
                    ? 'eligible'
                    : single.overallOutcome === 'POTENTIAL_RESTRICTION'
                      ? 'restriction'
                      : single.overallOutcome === 'VERIFICATION_REQUIRED'
                        ? 'verification'
                        : 'insufficient'
                }
              >
                {OUTCOME_LABELS[single.overallOutcome] || single.overallOutcome}
              </Badge>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">{single.summary}</p>
              <div className="space-y-4">
                {(single.results || []).map((r: any) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-navy-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          r.outcome === 'POTENTIALLY_ELIGIBLE'
                            ? 'eligible'
                            : r.outcome === 'POTENTIAL_RESTRICTION'
                              ? 'restriction'
                              : r.outcome === 'VERIFICATION_REQUIRED'
                                ? 'verification'
                                : 'insufficient'
                        }
                        className="text-[10px]"
                      >
                        {OUTCOME_LABELS[r.outcome] || r.outcome}
                      </Badge>
                      {r.isIllustrative && (
                        <Badge variant="illustrative" className="text-[10px]">
                          Illustrative
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-navy-900 dark:text-white mb-1">
                      {r.category}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{r.explanation}</p>
                    {r.accountType && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Account:</strong> {r.accountType}
                      </p>
                    )}
                    {r.repatriation && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Repatriation:</strong> {r.repatriation}
                      </p>
                    )}
                    {r.taxConsiderations && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Tax:</strong> {r.taxConsiderations}
                      </p>
                    )}
                    {r.sourceUrl && (
                      <a
                        href={r.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1 inline-block"
                      >
                        View source
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!id && (
          <div className="space-y-4">
            {checks.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Scale className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-navy-900 dark:text-white mb-2">
                  No eligibility checks yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Run your first check to see results here.
                </p>
                <Button variant="emerald" className="mt-4" onClick={() => navigate('/eligibility')}>
                  Run a check
                </Button>
              </div>
            )}
            {checks.map((c) => (
              <Card key={c.id} className="p-5">
                <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge
                    variant={
                      c.overallOutcome === 'POTENTIALLY_ELIGIBLE'
                        ? 'eligible'
                        : c.overallOutcome === 'POTENTIAL_RESTRICTION'
                          ? 'restriction'
                          : c.overallOutcome === 'VERIFICATION_REQUIRED'
                            ? 'verification'
                            : 'insufficient'
                    }
                  >
                    {OUTCOME_LABELS[c.overallOutcome] || c.overallOutcome}
                  </Badge>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-navy-900 dark:text-white">
                      {c.countryOfResidence} · {c.residencyStatus}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {c.investmentAmount ? `₹${c.investmentAmount}` : 'No amount'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{c.summary}</p>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/eligibility/history/${c.id}`}
                      className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      View details <Scale className="ml-1 w-3 h-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
