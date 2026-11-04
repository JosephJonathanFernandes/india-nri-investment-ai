import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-navy-900 dark:hover:text-white">Home</Link>
          <span className="text-sm text-gray-400">/</span>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Disclaimer</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Important Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="font-semibold text-red-700 dark:text-red-400">This platform is for educational purposes only.</p>
            <ul className="list-disc pl-5 my-4">
              <li>NRI Investment Simplifier does not provide investment, legal, or tax advice.</li>
              <li>Eligibility rules include demonstration (“ILLUSTRATIVE”) data that is not current law. Verified rules carry official source URLs and verification dates.</li>
              <li>We do not guarantee that any investment is legally permitted, profitable, or repatriable.</li>
              <li>Tax estimates are illustrative and versioned; they are not a definitive tax liability. Consult a qualified tax adviser in your country of residence and India.</li>
              <li>Always confirm eligibility, account requirements, and repatriation rules with an authorized financial institution (bank, SEBI-registered broker, or mutual fund distributor) before investing.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
