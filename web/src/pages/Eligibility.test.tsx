import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import Eligibility from './Eligibility';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Eligibility Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders page heading', () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <AuthProvider>
        <BrowserRouter>
          <Eligibility />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/Eligibility Checker/)).toBeInTheDocument();
  });

  it('renders investment categories', () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <AuthProvider>
        <BrowserRouter>
          <Eligibility />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/Indian Mutual Funds/)).toBeInTheDocument();
    expect(screen.getByText(/Listed Indian Equities/)).toBeInTheDocument();
  });

  it('renders a check button', () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <AuthProvider>
        <BrowserRouter>
          <Eligibility />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByRole('button', { name: /check eligibility/i })).toBeInTheDocument();
  });
});
