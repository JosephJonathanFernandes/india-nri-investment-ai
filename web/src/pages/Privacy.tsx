import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white">Home</Link>
          <span className="text-sm text-gray-400">/</span>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Privacy Policy</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>NRI Investment Simplifier does not request or store banking credentials, passwords, or sensitive identity documents.</p>
            <p>Personal data you provide (country of residence, residency status, investment preferences) is stored to personalize eligibility checks and is associated only with your account.</p>
            <p>Passwords are hashed using bcrypt and never stored in plaintext. Authentication uses JWT access/refresh tokens stored in httpOnly cookies and localStorage.</p>
            <p>We do not sell your data. Regulatory eligibility results are saved to your account history so you can revisit them.</p>
            <p>This platform provides educational guidance only and is not a substitute for professional legal, tax, or investment advice.</p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
