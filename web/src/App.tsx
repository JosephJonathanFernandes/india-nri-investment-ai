import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/context/AuthContext';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Eligibility from '@/pages/Eligibility';
import Assistant from '@/pages/Assistant';
import Checklist from '@/pages/Checklist';
import Comparison from '@/pages/Comparison';
import Tax from '@/pages/Tax';
import Settings from '@/pages/Settings';
import Investments from '@/pages/Investments';
import EligibilityHistory from '@/pages/EligibilityHistory';
import Privacy from '@/pages/Privacy';
import Disclaimer from '@/pages/Disclaimer';
import Contact from '@/pages/Contact';
import AdminPanel from '@/pages/Admin';
import { Navbar } from '@/components/layout/Navbar';

const Protected = ({ children }: { children: React.ReactNode }) => {
  // children rendered only when authenticated; AuthContext handles redirect via page
  return <>{children}</>;
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/eligibility" element={<Eligibility />} />
            <Route path="/eligibility/history" element={<EligibilityHistory />} />
            <Route path="/eligibility/history/:id" element={<EligibilityHistory />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/tax" element={<Tax />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
