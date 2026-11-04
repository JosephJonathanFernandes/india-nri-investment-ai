import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Scale, Shield, ShieldAlert, CheckCircle2, Activity, Clock, Save, Bell, ArrowRight,
  MapPin, Building2, RefreshCw, Clipboard, BarChart3, AlertCircle,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { type EligibilityCheck } from '@/types';
import { OutcomeDonut } from '@/components/charts/OutcomeDonut';
import { RiskLiquidityChart } from '@/components/charts/RiskLiquidityChart';

const CATEGORIES = [
  { name: 'Indian Mutual Funds', slug: 'indian-mutual-funds', icon: Shield, color: 'bg-blue-500' },
  { name: 'Listed Indian Equities', slug: 'listed-indian-equities', icon: Building2, color: 'bg-indigo-500' },
  { name: 'Fixed Deposits', slug: 'fixed-deposits', icon: Shield, color: 'bg-emerald-500' },
  { name: 'Government Securities & Bonds', slug: 'government-securities-bonds', icon: MapPin, color: 'bg-amber-500' },
  { name: 'Real Estate', slug: 'real-estate', icon: Home, color: 'bg-rose-500' },
  { name: 'GIFT City Products', slug: 'gift-city-products', icon: SparklesIcon, color: 'bg-purple-500' },
];

function SparklesIcon({ className }: { className?: string }) { return <span className={className}>✦</span>; }
function Home({ className }: { className?: string }) { return <span className={className}>🏠</span>; }

export default function Dashboard() {
  const { user, profile, fetchProfile, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [checks, setChecks] = useState<EligibilityCheck[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchChecks();
  }, [isAuthenticated, fetchProfile, navigate]);

  const fetchChecks = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/eligibility/history');
      setChecks(res.checks || []);
    } catch {}
    setLoading(false);
  };

  const onboardingComplete = profile?.completedOnboarding;

  if (isLoading) return (
    <div className="min-h-screen bg-white dark:bg-navy-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-navy-900" />
        <h2 className="text-navy-900 dark:text-white font-medium">Loading dashboard...</h2>
      </div>
    </div>
  );

  const recent = checks.slice(0, 3);
  const latestOutcome = recent[0]?.overallOutcome;
  const potentiallyEligible = checks.filter(c => c.overallOutcome === 'POTENTIALLY_ELIGIBLE').length;
  const needsVerification = checks.filter(c => c.overallOutcome === 'VERIFICATION_REQUIRED' || c.overallOutcome === 'POTENTIAL_RESTRICTION').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
              Welcome back, {user?.name || 'Investor'} 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's your personalized investment eligibility overview for {profile?.countryOfResidence || 'your region'}.
            </p>
          </div>
          <div className="flex gap-3">
            <ThemeToggle />
            <Button variant="emerald" onClick={() => navigate('/eligibility')}>
              <Scale className="w-4 h-4 mr-2" /> New Eligibility Check
            </Button>
            <Button variant="outline" onClick={() => navigate('/onboarding')}>
              Edit Profile
            </Button>
          </div>
        </div>

        {!onboardingComplete && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/20 dark:bg-amber-900/10">
            <CardContent className="p-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">Complete your profile</h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  Finish onboarding to get personalized eligibility checks and save your results.
                </p>
              </div>
              <Button variant="emerald" size="sm" onClick={() => navigate('/onboarding')}>
                Complete onboarding
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Overview grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Eligibility checks"
            value={checks.length}
            icon={<Scale className="w-5 h-5" />}
            color="bg-blue-500"
            trend="+2 this month"
          />
          <StatCard
            title="Potentially eligible"
            value={potentiallyEligible}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="bg-emerald-500"
          />
          <StatCard
            title="Needs verification"
            value={needsVerification}
            icon={<ShieldAlert className="w-5 h-5" />}
            color="bg-amber-500"
          />
          <StatCard
            title="Saved options"
            value={0}
            icon={<Save className="w-5 h-5" />}
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Eligibility overview (main) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-5">
                <CardHeader className="p-0 pb-4">
                  <h3 className="font-bold text-navy-900 dark:text-white mb-1">Eligibility outcomes</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Breakdown of your check results</p>
                </CardHeader>
                <CardContent className="p-0 pt-0">
                  <OutcomeDonut checks={checks} className="h-64" />
                </CardContent>
              </Card>
              <Card className="p-5">
                <CardHeader className="p-0 pb-4">
                  <h3 className="font-bold text-navy-900 dark:text-white mb-1">Risk & liquidity profile</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Illustrative profile of investment categories</p>
                </CardHeader>
                <CardContent className="p-0 pt-0">
                  <RiskLiquidityChart
                    categories={CATEGORIES.map(c => ({
                      name: c.name,
                      riskLevel: c.name === 'Indian Mutual Funds' ? 'Moderate' :
                        c.name === 'Listed Indian Equities' ? 'High' :
                        c.name === 'Fixed Deposits' ? 'Low' :
                        c.name === 'Government Securities & Bonds' ? 'Low-Moderate' :
                        c.name === 'Real Estate' ? 'Moderate-High' :
                        c.name === 'GIFT City Products' ? 'Moderate-High' : 'Moderate',
                      liquidity: c.name === 'Indian Mutual Funds' ? 'High' :
                        c.name === 'Listed Indian Equities' ? 'High' :
                        c.name === 'Fixed Deposits' ? 'Moderate' :
                        c.name === 'Government Securities & Bonds' ? 'Moderate' :
                        c.name === 'Real Estate' ? 'Low' :
                        c.name === 'GIFT City Products' ? 'Varies' : 'High',
                    }))}
                    className="h-64"
                  />
                </CardContent>
              </Card>
            </div>

            <section>
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between p-6 pb-3">
                  <div>
                    <CardTitle>Investment eligibility overview</CardTitle>
                    <CardDescription className="text-sm">
                      Based on your profile and the rules engine. <span className="text-purple-600 dark:text-purple-400">Illustrative rules are marked.</span>
                    </CardDescription>
                  </div>
                  <Badge variant={latestOutcome === 'POTENTIALLY_ELIGIBLE' ? 'eligible' : latestOutcome === 'POTENTIAL_RESTRICTION' ? 'restriction' : latestOutcome === 'VERIFICATION_REQUIRED' ? 'verification' : 'insufficient'}>
                    {latestOutcome ? outcomeLabel(latestOutcome) : 'No checks yet'}
                  </Badge>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {recent.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Scale className="w-8 h-8" />
                      </div>
                      <h3 className="font-semibold text-navy-900 dark:text-white mb-2">No eligibility checks yet</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                        Run your first eligibility check to see which Indian investments may be available to you.
                      </p>
                      <Button variant="emerald" className="mt-4" onClick={() => navigate('/eligibility')}>
                        Run a check
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recent.map((c) => (
                        <div key={c.id} className="flex items-start gap-4 p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-navy-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-navy-900 dark:text-white">{c.categoryId ? 'Investment check' : 'General check'}</span>
                              <Badge variant={c.overallOutcome === 'POTENTIALLY_ELIGIBLE' ? 'eligible' : c.overallOutcome === 'POTENTIAL_RESTRICTION' ? 'restriction' : c.overallOutcome === 'VERIFICATION_REQUIRED' ? 'verification' : 'insufficient'}>
                                {outcomeLabel(c.overallOutcome)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{c.summary || 'Check completed.'}</p>
                            <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()} · {c.countryOfResidence} · {c.residencyStatus}</p>
                          </div>
                          <Link to={`/eligibility/history/${c.id}`} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline ml-2">View details <ArrowRight className="ml-1 w-3 h-3" /></Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Potentially eligible categories */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-4 h-4 text-navy-900 dark:text-white" />
                <h2 className="text-xl font-bold text-navy-900 dark:text-white">Potentially eligible categories</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => (
                  <Card key={cat.slug} className="card-hover p-5 cursor-pointer" onClick={() => navigate(`/eligibility?category=${cat.slug}`)}>
                    <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center text-white mb-3`}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-navy-900 dark:text-white">{cat.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Check eligibility</p>
                  </Card>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Results shown are based on illustrative/demo rules unless marked verified. Always confirm with an authorized financial institution.
              </p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Account setup checklist */}
            <Card>
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2">
                  <Clipboard className="w-5 h-5 text-navy-900 dark:text-white" />
                  <h3 className="font-bold text-navy-900 dark:text-white">Account setup checklist</h3>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-3">
                  {[{
                    title: 'PAN card',
                    desc: 'Required for most Indian investments.',
                    done: true,
                  }, {
                    title: 'NRE / NRO account',
                    desc: 'Repatriable vs non-repatriable funds.',
                    done: profile?.existingBanking?.includes('NRE account') || profile?.existingBanking?.includes('NRO account'),
                  }, {
                    title: 'KYC verification',
                    desc: 'SEBI-registered intermediary KYC.',
                    done: false,
                  }, {
                    title: 'FATCA / CRS declaration',
                    desc: 'Where applicable by country.',
                    done: false,
                  }].map((item) => (
                    <div key={item.title} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${item.done ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-200 dark:border-white/20 text-gray-400 dark:text-gray-500'}`}>
                        {item.done ? <CheckCircle2 className="w-3 h-3" /> : ''}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${item.done ? 'text-navy-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{item.title}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/checklist')}>
                    View full checklist
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Regulatory updates */}
            <Card>
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-navy-900 dark:text-white" />
                    <h3 className="font-bold text-navy-900 dark:text-white">Regulatory updates</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={fetchChecks}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-navy-900 dark:text-white">Demo rules notice</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Eligibility rules shown are illustrative demo data unless marked verified.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader className="p-5 pb-3">
                <h3 className="font-bold text-navy-900 dark:text-white">Quick actions</h3>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full text-left" onClick={() => navigate('/eligibility')}>
                    <Scale className="w-4 h-4 mr-2" /> Run eligibility check
                  </Button>
                  <Button variant="outline" className="w-full text-left" onClick={() => navigate('/assistant')}>
                    <SparklesIcon className="w-4 h-4 mr-2" /> Ask the AI assistant
                  </Button>
                  <Button variant="outline" className="w-full text-left" onClick={() => navigate('/comparison')}>
                    <BarChart3 className="w-4 h-4 mr-2" /> Compare investments
                  </Button>
                  <Button variant="outline" className="w-full text-left" onClick={() => navigate('/tax')}>
                    <Clock className="w-4 h-4 mr-2" /> Tax & repatriation estimate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="text-center mt-10 text-xs text-gray-500 dark:text-gray-500">
          Educational guidance only — not professional legal, tax, or investment advice. Rules may be illustrative/demo data.
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend }: { title: string; value: number | string; icon: React.ReactNode; color: string; trend?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-navy-900 dark:text-white mt-1">{value}</p>
          {trend && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{trend}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function outcomeLabel(o: string) {
  const m: Record<string, string> = {
    POTENTIALLY_ELIGIBLE: 'Potentially eligible',
    POTENTIAL_RESTRICTION: 'Potential restriction',
    VERIFICATION_REQUIRED: 'Verification required',
    INSUFFICIENT_INFO: 'Insufficient information',
    UNRESOLVED: 'Unresolved',
  };
  return m[o] || o;
}
