import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import Assistant from './Assistant';

describe('Assistant Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders page heading', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Assistant />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/AI Regulatory Assistant/)).toBeInTheDocument();
  });

  it('renders sign-in prompt when not authenticated', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Assistant />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/Sign in and complete onboarding/)).toBeInTheDocument();
  });

  it('renders go to onboarding button', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Assistant />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByRole('button', { name: /Go to onboarding/ })).toBeInTheDocument();
  });
});
