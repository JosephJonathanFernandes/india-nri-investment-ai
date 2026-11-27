import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import Tax from './Tax';

describe('Tax Page', () => {
  it('renders page title', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Tax />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/Tax & Repatriation Explainer/)).toBeInTheDocument();
  });

  it('renders input field labels', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Tax />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/Investment type/)).toBeInTheDocument();
    expect(screen.getByText(/Country of tax residence/)).toBeInTheDocument();
    expect(screen.getByText(/DTAA treaty country/)).toBeInTheDocument();
    expect(screen.getByText(/Purchase value \(INR\)/)).toBeInTheDocument();
    expect(screen.getByText(/Sale value \(INR\)/)).toBeInTheDocument();
  });

  it('has calculate button', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Tax />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByRole('button', { name: /calculate estimate/i })).toBeInTheDocument();
  });
});
