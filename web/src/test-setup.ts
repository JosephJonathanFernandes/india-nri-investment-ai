import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia for components that use it (e.g., ThemeToggle)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })),
});