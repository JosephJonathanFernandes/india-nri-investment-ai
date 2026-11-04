import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, User, X, ChevronDown, Scale, Shield, Sparkles, Activity, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';

const mobileLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: Scale },
  { name: 'Eligibility Check', href: '/eligibility', icon: Shield },
  { name: 'Assistant', href: '/assistant', icon: Sparkles },
  { name: 'Checklist', href: '/checklist', icon: Activity },
  { name: 'Comparison', href: '/comparison', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: User },
];

export function Navbar() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  if (isLoading) return null;

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-navy-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-navy-900/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
              N
            </div>
            <span className="font-bold text-xl tracking-tight text-navy-900 dark:text-white">NRI Investment Simplifier</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link to="/investments" className="text-sm font-medium text-navy-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400 transition-colors">Investments</Link>
                <Link to="/eligibility" className="text-sm font-medium text-navy-900 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400 transition-colors">Eligibility</Link>
                <Button onClick={() => navigate('/login')} variant="navy" size="sm">
                  Sign in
                </Button>
              </>
            ) : (
              <>
                {mobileLinks.map((l) => {
                  const Icon = l.icon;
                  return (
                    <Link key={l.name} to={l.href} className={cn('text-sm font-medium', isActive(l.href) ? 'text-emerald-600 dark:text-emerald-400' : 'text-navy-900 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors')}>
                      <Icon className="w-4 h-4 mr-1.5" /> {l.name}
                    </Link>
                  );
                })}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-navy-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <User className="w-4 h-4" /> {user?.name || user?.email || 'Profile'}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/settings')}>Profile & Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          <ThemeToggle />
          <button className="md:hidden" onClick={() => setMobileOpen((o) => !o)}>
            <Menu className="w-6 h-6 text-navy-900 dark:text-white" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-navy-900" aria-label="Mobile menu">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <Link to="/" className="font-bold text-xl tracking-tight">NRI Investment Simplifier</Link>
            <button className="text-gray-400 hover:text-gray-600" onClick={() => setMobileOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {mobileLinks.map((l) => {
              const Icon = l.icon;
              return (
                <Link key={l.name} to={l.href} onClick={() => setMobileOpen(false)} className={cn('flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium', isActive(l.href) ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'text-navy-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10')}>
                  <Icon className="w-4 h-4" /> {l.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 dark:border-white/10 p-6">
            {isAuthenticated ? (
              <div className="space-y-3">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <button className="w-full btn-emerald" onClick={() => { setMobileOpen(false); logout(); }}>Sign out</button>
              </div>
            ) : (
              <div className="space-y-3">
                <button className="w-full btn-navy" onClick={() => { setMobileOpen(false); navigate('/login'); }}>Sign in</button>
                <button className="w-full btn-outline" onClick={() => { setMobileOpen(false); navigate('/register'); }}>Create account</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-navy-900">
      <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">N</div>
          <span className="font-medium text-navy-900 dark:text-white">NRI Investment Simplifier</span>
        </div>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-navy-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/disclaimer" className="hover:text-navy-900 dark:hover:text-white transition-colors">Disclaimer</Link>
          <Link to="/contact" className="hover:text-navy-900 dark:hover:text-white transition-colors">Contact</Link>
        </div>
        <p className="text-xs">Educational guidance only — not professional legal, tax, or investment advice.</p>
      </div>
    </footer>
  );
}
