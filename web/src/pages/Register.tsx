import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertCircle, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(fields);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 text-navy-900 dark:text-white font-bold text-xl mb-4"
            >
              <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                N
              </div>
              NRI Investment Simplifier
            </Link>
            <h2 className="text-2xl font-bold text-navy-900 dark:text-white">
              Create your account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We never request banking credentials or sensitive identity documents.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <Card className="p-6">
            <CardHeader>
              <CardTitle>Create account</CardTitle>
              <CardDescription>
                Join to save your eligibility checks and investment options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-900 dark:text-white">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Aanya Sharma"
                      value={fields.name}
                      onChange={(e) => setFields({ ...fields, name: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-900 dark:text-white">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="you@example.com"
                      value={fields.email}
                      onChange={(e) => setFields({ ...fields, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy-900 dark:text-white">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={fields.password}
                      onChange={(e) => setFields({ ...fields, password: e.target.value })}
                      className="pl-10"
                    />
                    <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
                  </div>
                </div>
                <Button type="submit" variant="emerald" className="w-full">
                  Create account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <footer className="mt-auto border-t border-gray-200 dark:border-white/10 bg-white dark:bg-navy-900 py-6">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Educational guidance only — not professional legal, tax, or investment advice.
        </div>
      </footer>
    </div>
  );
}
