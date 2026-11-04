import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/Navbar';
import { Scale, Shield, Building2, MapPin, Home, SparklesIcon, BarChart3 } from 'lucide-react';

const ICONS: Record<string, any> = {
  'indian-mutual-funds': Shield,
  'listed-indian-equities': Building2,
  'exchange-traded-funds': Scale,
  'ipos': BarChart3,
  'government-securities-bonds': Shield,
  'fixed-deposits': MapPin,
  'real-estate': Home,
  'reits-invits': Home,
  'gift-city-products': SparklesIcon,
};

export default function Investments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/investments/categories')
      .then((res: any) => { setCategories(res.categories || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const isAuthenticated = !!user;

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-navy-900 flex items-center justify-center">
      <h2 className="text-navy-900 dark:text-white font-medium">Loading investments…</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white">Home</Link>
          <span className="text-sm text-gray-400">/</span>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Explore Investments</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Browse Indian investment categories and check your eligibility for each based on your NRI profile.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => {
            const Icon = ICONS[c.slug] || Scale;
            return (
              <Card key={c.id} className="card-hover p-6 cursor-pointer" onClick={() => navigate(`/eligibility?category=${encodeURIComponent(c.name)}`)}>
                <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="illustrative" className="text-[10px]">Demo data</Badge>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <CardTitle className="text-navy-900 dark:text-white">{c.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-300 mb-4">{c.description || 'Indian investment category.'}</CardDescription>
                  <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex justify-between"><span>Risk:</span> <span className="text-navy-900 dark:text-white">{c.riskLevel}</span></div>
                    <div className="flex justify-between"><span>Liquidity:</span> <span className="text-navy-900 dark:text-white">{c.liquidity}</span></div>
                    <div className="flex justify-between"><span>Repatriation:</span> <span className="text-navy-900 dark:text-white">{c.repatriation}</span></div>
                    <div className="flex justify-between"><span>Tax complexity:</span> <span className="text-navy-900 dark:text-white">{c.taxComplexity}</span></div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 border-t border-gray-100 dark:border-white/10">
                  <Button variant="emerald" size="sm" className="w-full" disabled={!isAuthenticated}>
                    {isAuthenticated ? 'Check my eligibility' : 'Sign in to check'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        {!isAuthenticated && (
          <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            Sign in to run personalized eligibility checks for any investment category.
          </p>
        )}
      </div>
    </div>
  );
}
