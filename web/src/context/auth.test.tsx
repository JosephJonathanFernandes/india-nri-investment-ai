import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(window, 'location', {
      value: { href: '/' },
      writable: true,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('provides initial unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('login calls api.post and sets authentication state', async () => {
    vi.mocked(api.post).mockResolvedValue({
      accessToken: 'test-token-123',
      user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'USER' },
    });
    vi.mocked(api.get).mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'USER' }, profile: null },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(vi.mocked(api.post)).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('logout clears authentication state', async () => {
    vi.mocked(api.post).mockResolvedValue({
      accessToken: 'test-token-123',
      user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'USER' },
    });
    vi.mocked(api.get).mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'USER' }, profile: null },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
