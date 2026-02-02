import { vi } from 'vitest';

export const mockSearchConsoleClient = {
  sites: {
    list: vi.fn(),
    add: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
  sitemaps: {
    list: vi.fn(),
    submit: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
  searchanalytics: {
    query: vi.fn(),
  },
  urlInspection: {
    index: {
      inspect: vi.fn(),
    },
  },
};

vi.mock('../src/google-client', () => ({
  getSearchConsoleClient: vi.fn().mockResolvedValue(mockSearchConsoleClient),
}));
