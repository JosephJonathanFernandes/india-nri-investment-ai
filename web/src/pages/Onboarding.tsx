import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, CheckCircle2, User, MapPin, Target, ShieldAlert, Building2, Home, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const COUNTRIES = ['United States', 'United Kingdom', 'United Arab Emirates', 'Canada', 'Australia', 'Singapore', 'Other'];
const RESIDENCY_STATUS = ['NRI', 'OCI', 'Other / unsure'];
const OBJECTIVES = ['Long-term wealth creation', 'Retirement planning', 'Regular income', 'Capital preservation', 'Diversification'];
const RISK = ['Conservative', 'Moderate', 'Aggressive'];
const AMOUNTS = ['Less than ₹5 lakh', '₹5 lakh – ₹25 lakh', '₹25 lakh – ₹1 crore', '₹1 crore – ₹5 crore', 'More than ₹5 crore'];
const REPATRIATION = ['Prefer full repatriation where legally permitted', 'Partial repatriation', 'No immediate repatriation requirement', 'Unsure'];
const BANKING = ['NRE account', 'NRO account', 'FCNR deposit', 'None', 'Unsure'];

const STEPS: Record<Step, { title: string; desc: string }> = {
  1: { title: 'Country of residence', desc: 'Where do you currently live?' },
  2: { title: 'Residency & identity', desc: 'Your NRI / OCI / other status.' },
  3: { title: 'Investment objectives', desc: 'What are you investing for?' },
  4: { title: 'Risk preference', desc: 'How much risk are you comfortable with?' },
  5: { title: 'Investment amount', desc: 'Approximate amount you plan to invest (INR).' },
  6: { title: 'Repatriation preference', desc: 'Do you need to move proceeds abroad?' },
  7: { title: 'Existing banking', desc: 'Which Indian accounts do you already hold?' },
  8: { title: 'Profile summary', desc: 'Review your details before finishing.' },
};

type FormData = {
  countryOfResidence: string;
  residencyStatus: string;
  investmentObjectives: string[];
  riskPreference: string;
  investmentAmountRange: string;
  repatriationPreference: string;
  existingBanking: string[];
};

export default function Onboarding() {
  const { updateProfile, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    countryOfResidence: '',
    residencyStatus: '',
    investmentObjectives: [],
    riskPreference: '',
    investmentAmountRange: '',
    repatriationPreference: '',
    existingBanking: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const toggleMulti = (key: keyof FormData, value: string) => {
    setForm((prev) => {
      const cur = (prev[key] as string[]) || [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...prev, [key]: next };
    });
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validateStep = useCallback((s: Step): boolean => {
    const e: Record<string, string> = {};
    switch (s) {
      case 1:
        if (!form.countryOfResidence) e.countryOfResidence = 'Please select your country of residence.';
        break;
      case 2:
        if (!form.residencyStatus) e.residencyStatus = 'Please select your residency status.';
        break;
      case 3:
        if (!form.investmentObjectives?.length) e.investmentObjectives = 'Please select at least one objective.';
        break;
      case 4:
        if (!form.riskPreference) e.riskPreference = 'Please select a risk preference.';
        break;
      case 5:
        if (!form.investmentAmountRange) e.investmentAmountRange = 'Please select an investment amount range.';
        break;
      case 6:
        if (!form.repatriationPreference) e.repatriationPreference = 'Please select a repatriation preference.';
        break;
      case 7:
        if (!form.existingBanking?.length) e.existingBanking = 'Please select at least one option.';
        break;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const next = () => {
    if (validateStep(step)) {
      if (step === 8) return finish();
      setStep((s) => (s + 1) as Step);
    }
  };

  const back = () => setStep((s) => (s - 1) as Step);

  const finish = async () => {
    if (!validateStep(8)) return;
    setSubmitting(true);
    try {
      await updateProfile({
        ...form,
        completedOnboarding: true,
      });
      await fetchProfile();
      navigate('/dashboard');
    } catch (err: any) {
      setErrors({ _submit: err.message || 'Failed to save profile.' });
    } finally {
      setSubmitting(false);
    }
  };

  const progress = (step / 8) * 100;
  const current = STEPS[step];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="p-6 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-navy-900 dark:text-white">Step {step} of 8</span>
              <span className="text-xs text-muted-foreground">{current.title}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <div className={`h-full bg-emerald-600 transition-all duration-500`} style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{current.desc}</p>
          </div>

          {/* Step content */}
          <CardContent className="p-6 space-y-6 min-h-[320px]">
            {step === 1 && (
              <>
                <CardTitle className="text-xl">Country of residence</CardTitle>
                <CardDescription>This affects which investment rules apply to you.</CardDescription>
                <Select
                  label="Country"
                  value={form.countryOfResidence}
                  onChange={(e) => setField('countryOfResidence', e.target.value)}
                  error={errors.countryOfResidence}
                >
                  <option value="">Select a country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </>
            )}
            {step === 2 && (
              <>
                <CardTitle className="text-xl">Residency & identity</CardTitle>
                <CardDescription>We never request identity documents or sensitive credentials.</CardDescription>
                <Select
                  label="Residency status"
                  value={form.residencyStatus}
                  onChange={(e) => setField('residencyStatus', e.target.value)}
                  error={errors.residencyStatus}
                >
                  <option value="">Select your status</option>
                  {RESIDENCY_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <p className="text-xs text-muted-foreground">NRI = Non-Resident Indian · OCI = Overseas Citizen of India</p>
              </>
            )}
            {step === 3 && (
              <>
                <CardTitle className="text-xl">Investment objectives</CardTitle>
                <CardDescription>Select all that apply.</CardDescription>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {OBJECTIVES.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => toggleMulti('investmentObjectives', o)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-colors',
                        form.investmentObjectives.includes(o)
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                          : 'border-gray-200 dark:border-white/20 text-navy-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10'
                      )}
                    >
                      <CheckCircle2 className={cn('w-4 h-4', form.investmentObjectives.includes(o) ? 'text-emerald-600' : 'text-gray-300')} />
                      {o}
                    </button>
                  ))}
                </div>
                {errors.investmentObjectives && <p className="text-sm text-red-600 dark:text-red-400">{errors.investmentObjectives}</p>}
              </>
            )}
            {step === 4 && (
              <>
                <CardTitle className="text-xl">Risk preference</CardTitle>
                <CardDescription>How much fluctuation in value can you tolerate?</CardDescription>
                <div className="grid grid-cols-1 gap-3">
                  {RISK.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setField('riskPreference', r)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-colors',
                        form.riskPreference === r
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                          : 'border-gray-200 dark:border-white/20 text-navy-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10'
                      )}
                    >
                      <span>{r}</span>
                      {form.riskPreference === r && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 5 && (
              <>
                <CardTitle className="text-xl">Investment amount</CardTitle>
                <CardDescription>Approximate amount you plan to invest, in INR.</CardDescription>
                <Select
                  label="Amount range"
                  value={form.investmentAmountRange}
                  onChange={(e) => setField('investmentAmountRange', e.target.value)}
                  error={errors.investmentAmountRange}
                >
                  <option value="">Select a range</option>
                  {AMOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </Select>
              </>
            )}
            {step === 6 && (
              <>
                <CardTitle className="text-xl">Repatriation preference</CardTitle>
                <CardDescription>Whether you want to move proceeds back to your country of residence.</CardDescription>
                <div className="grid grid-cols-1 gap-3">
                  {REPATRIATION.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setField('repatriationPreference', r)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-colors',
                        form.repatriationPreference === r
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                          : 'border-gray-200 dark:border-white/20 text-navy-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10'
                      )}
                    >
                      <span>{r}</span>
                      {form.repatriationPreference === r && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 7 && (
              <>
                <CardTitle className="text-xl">Existing banking arrangements</CardTitle>
                <CardDescription>Select all Indian accounts you hold (optional).</CardDescription>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {BANKING.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleMulti('existingBanking', b)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition-colors',
                        form.existingBanking.includes(b)
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                          : 'border-gray-200 dark:border-white/20 text-navy-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10'
                      )}
                    >
                      <Building2 className={cn('w-4 h-4', form.existingBanking.includes(b) ? 'text-emerald-600' : 'text-gray-300')} />
                      {b}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 8 && (
              <>
                <CardTitle className="text-xl">Profile summary</CardTitle>
                <CardDescription>Review your details. You can edit them later in Settings.</CardDescription>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                    <span className="text-gray-600 dark:text-gray-400">Country of residence</span>
                    <span className="text-navy-900 dark:text-white">{form.countryOfResidence}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                    <span className="text-gray-600 dark:text-gray-400">Residency status</span>
                    <span className="text-navy-900 dark:text-white">{form.residencyStatus}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                    <span className="text-gray-600 dark:text-gray-400">Objectives</span>
                    <span className="text-navy-900 dark:text-white">{form.investmentObjectives.join(', ') || '—'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                    <span className="text-gray-600 dark:text-gray-400">Risk preference</span>
                    <span className="text-navy-900 dark:text-white">{form.riskPreference}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                    <span className="text-gray-600 dark:text-gray-400">Investment amount</span>
                    <span className="text-navy-900 dark:text-white">{form.investmentAmountRange}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                    <span className="text-gray-600 dark:text-gray-400">Repatriation</span>
                    <span className="text-navy-900 dark:text-white">{form.repatriationPreference}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                    <span className="text-gray-600 dark:text-gray-400">Existing banking</span>
                    <span className="text-navy-900 dark:text-white">{form.existingBanking.join(', ') || 'None'}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">This information is used to personalize eligibility checks and is never shared with third parties.</p>
              </>
            )}
          </CardContent>

          <CardFooter className="p-6 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
            {errors._submit && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <HelpCircle className="w-4 h-4" /> {errors._submit}
              </div>
            )}
            <div className="flex items-center gap-3">
              {step > 1 && (
                <Button variant="outline" onClick={back} disabled={submitting}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              )}
              {step < 8 ? (
                <Button variant="emerald" onClick={next} disabled={submitting}>
                  Continue <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button variant="emerald" onClick={finish} disabled={submitting}>
                  Finish & Continue <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
