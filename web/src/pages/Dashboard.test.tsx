import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Dashboard Page', () => {
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
          <Dashboard />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
  });

  it('renders investment category cards', () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <AuthProvider>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/Indian Mutual Funds/)).toBeInTheDocument();
    expect(screen.getByText(/Listed Indian Equities/)).toBeInTheDocument();
  });

  it('renders quick actions section', () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <AuthProvider>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </AuthProvider>
    );
    expect(screen.getByText(/Quick actions/)).toBeInTheDocument();
  });
});
