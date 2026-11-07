import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="flex items-center gap-2 mb-8">
          <Link
            to="/"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white"
          >
            Home
          </Link>
          <span className="text-sm text-gray-400">/</span>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Contact</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Get in touch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Have questions or feedback about the NRI Investment Simplifier?</p>
            <p>Email: support@nrisimplifier.local</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              For regulatory or investment questions, consult a qualified financial adviser or the
              relevant authority (RBI, SEBI, Income Tax Department).
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
