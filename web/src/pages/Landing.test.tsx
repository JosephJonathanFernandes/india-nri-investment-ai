import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Landing from './Landing';

describe('Landing Page', () => {
  it('renders hero heading', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/Invest in India/)).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/smarter way for NRIs/)).toBeInTheDocument();
  });

  it('renders primary CTA link', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByRole('link', { name: /Check My Eligibility/ })).toBeInTheDocument();
  });

  it('renders secondary CTA link', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByRole('link', { name: /Explore Investments/ })).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/Investment Eligibility/)).toBeInTheDocument();
    expect(screen.getByText(/Regulatory Guidance/)).toBeInTheDocument();
    expect(screen.getByText(/Tax Awareness/)).toBeInTheDocument();
    expect(screen.getByText(/Repatriation Planning/)).toBeInTheDocument();
  });

  it('renders footer with privacy and disclaimer links', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/Privacy Policy/)).toBeInTheDocument();
    expect(screen.getByText(/Disclaimer/)).toBeInTheDocument();
    expect(screen.getByText(/Contact/)).toBeInTheDocument();
  });
});
