import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { LogOut } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Canada',
  'Australia',
  'Singapore',
  'Other',
];
const STATUSES = ['NRI', 'OCI', 'Other / unsure'];

export default function Settings() {
  const { user, profile, updateProfile, logout, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    countryOfResidence: profile?.countryOfResidence || '',
    residencyStatus: profile?.residencyStatus || '',
    investmentObjectives: profile?.investmentObjectives || [],
    riskPreference: profile?.riskPreference || '',
    investmentAmountRange: profile?.investmentAmountRange || '',
    repatriationPreference: profile?.repatriationPreference || '',
    existingBanking: profile?.existingBanking || [],
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      countryOfResidence: profile?.countryOfResidence || '',
      residencyStatus: profile?.residencyStatus || '',
      investmentObjectives: profile?.investmentObjectives || [],
      riskPreference: profile?.riskPreference || '',
      investmentAmountRange: profile?.investmentAmountRange || '',
      repatriationPreference: profile?.repatriationPreference || '',
      existingBanking: profile?.existingBanking || [],
    });
  }, [user, profile]);

  const toggleMulti = (key: string, value: string) => {
    setForm((prev: any) => {
      const cur = (prev[key] as string[]) || [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...prev, [key]: next };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        countryOfResidence: form.countryOfResidence,
        residencyStatus: form.residencyStatus,
        investmentObjectives: form.investmentObjectives,
        riskPreference: form.riskPreference,
        investmentAmountRange: form.investmentAmountRange,
        repatriationPreference: form.repatriationPreference,
        existingBanking: form.existingBanking,
        completedOnboarding: true,
      });
      await fetchProfile();
      setEditing(false);
      setMessage('Profile saved.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Settings & Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your profile, preferences, and saved data.
            </p>
          </div>
          <div className="flex gap-3">
            {!editing && (
              <Button variant="emerald" onClick={() => setEditing(true)}>
                <span className="w-4 h-4 mr-1">🏦</span> Edit profile
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                logout();
              }}
            >
              <LogOut className="w-4 h-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/20 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 text-sm">
            {message}
          </div>
        )}

        {/* Profile card (view mode) */}
        {!editing && (
          <Card>
            <CardHeader className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-semibold text-lg">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="font-bold text-navy-900 dark:text-white">
                    {user?.name || 'No name'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Role: {user?.role}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow
                  label="Country of residence"
                  value={profile?.countryOfResidence || '—'}
                  icon={<MapPinIcon className="w-4 h-4" />}
                />
                <InfoRow
                  label="Residency status"
                  value={profile?.residencyStatus || '—'}
                  icon={<UserIcon2 className="w-4 h-4" />}
                />
                <InfoRow
                  label="Risk preference"
                  value={profile?.riskPreference || '—'}
                  icon={<ShieldIcon className="w-4 h-4" />}
                />
                <InfoRow
                  label="Investment amount"
                  value={profile?.investmentAmountRange || '—'}
                  icon={<BuildingIcon className="w-4 h-4" />}
                />
                <InfoRow
                  label="Repatriation preference"
                  value={profile?.repatriationPreference || '—'}
                  icon={<ArrowIcon className="w-4 h-4" />}
                />
                <InfoRow
                  label="Existing banking"
                  value={profile?.existingBanking?.join(', ') || 'None'}
                  icon={<BankIcon className="w-4 h-4" />}
                />
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                <h3 className="text-sm font-semibold text-navy-900 dark:text-white mb-3">
                  Investment objectives
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(profile?.investmentObjectives || []).map((o: string, _i: number) => (
                    <span
                      key={_i}
                      className="px-3 py-1 rounded-lg border border-gray-200 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-sm text-gray-600 dark:text-gray-300"
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                <h3 className="text-sm font-semibold text-navy-900 dark:text-white mb-3">
                  Onboarding status
                </h3>
                <Badge variant={profile?.completedOnboarding ? 'eligible' : 'insufficient'}>
                  {profile?.completedOnboarding ? 'Completed' : 'Not completed'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit form */}
        {editing && (
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle>Edit profile</CardTitle>
              <CardDescription className="text-sm">
                Update your residency and investment preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-navy-900 dark:text-white">
                      Full name
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-navy-900 dark:text-white">
                      Email
                    </label>
                    <Input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-900 dark:text-white">
                    Country of residence
                  </label>
                  <Select
                    value={form.countryOfResidence}
                    onChange={(e) => setForm({ ...form, countryOfResidence: e.target.value })}
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-900 dark:text-white">
                    Residency status
                  </label>
                  <Select
                    value={form.residencyStatus}
                    onChange={(e) => setForm({ ...form, residencyStatus: e.target.value })}
                  >
                    <option value="">Select status</option>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-900 dark:text-white">
                    Risk preference
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Conservative', 'Moderate', 'Aggressive'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm({ ...form, riskPreference: r })}
                        className={cn(
                          'px-3 py-2 rounded-xl border text-sm transition-colors',
                          form.riskPreference === r
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                            : 'border-gray-200 dark:border-white/20 text-navy-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10'
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-900 dark:text-white">
                    Investment amount range
                  </label>
                  <Select
                    value={form.investmentAmountRange}
                    onChange={(e) => setForm({ ...form, investmentAmountRange: e.target.value })}
                  >
                    <option value="">Select range</option>
                    {[
                      'Less than ₹5 lakh',
                      '₹5 lakh – ₹25 lakh',
                      '₹25 lakh – ₹1 crore',
                      '₹1 crore – ₹5 crore',
                      'More than ₹5 crore',
                    ].map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-900 dark:text-white">
                    Repatriation preference
                  </label>
                  <Select
                    value={form.repatriationPreference}
                    onChange={(e) => setForm({ ...form, repatriationPreference: e.target.value })}
                  >
                    <option value="">Select preference</option>
                    {[
                      'Prefer full repatriation where legally permitted',
                      'Partial repatriation',
                      'No immediate repatriation requirement',
                      'Unsure',
                    ].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-900 dark:text-white">
                    Existing banking arrangements
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['NRE account', 'NRO account', 'FCNR deposit', 'None', 'Unsure'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => toggleMulti('existingBanking', b)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors',
                          form.existingBanking.includes(b)
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                            : 'border-gray-200 dark:border-white/20 text-navy-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10'
                        )}
                      >
                        <span>{b}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <CardFooter className="p-4 border-t border-gray-200 dark:border-white/10 flex gap-3">
                  <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button variant="emerald" type="submit" disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="text-center mt-10 text-xs text-gray-500 dark:text-gray-500">
          Educational guidance only — not professional legal, tax, or investment advice.
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-navy-800 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-sm font-medium text-navy-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return <span className={className}>📍</span>;
}
function UserIcon2({ className }: { className?: string }) {
  return <span className={className}>👤</span>;
}
function ShieldIcon({ className }: { className?: string }) {
  return <span className={className}>🛡️</span>;
}
function BuildingIcon({ className }: { className?: string }) {
  return <span className={className}>🏦</span>;
}
function ArrowIcon({ className }: { className?: string }) {
  return <span className={className}>↔️</span>;
}
function BankIcon({ className }: { className?: string }) {
  return <span className={className}>🏛️</span>;
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
