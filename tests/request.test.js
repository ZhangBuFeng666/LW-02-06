import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request, buildQuery } from '../src/services/request';

describe('Request Utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildQuery', () => {
    it('should format params into query string', () => {
      const params = { foo: 'bar', age: 10, empty: '', nil: null, undef: undefined };
      const query = buildQuery(params);
      expect(query).toBe('?foo=bar&age=10');
    });

    it('should return empty string for empty params', () => {
      expect(buildQuery({})).toBe('');
    });
  });

  describe('request', () => {
    it('should return JSON when response is ok', async () => {
      const mockData = { success: true };
      const globalFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });
      vi.stubGlobal('fetch', globalFetch);

      const res = await request('/test-path', { method: 'POST' });
      expect(res).toEqual(mockData);
      expect(globalFetch).toHaveBeenCalledWith('/api/test-path', expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
      }));
    });

    it('should throw error when response is not ok', async () => {
      const mockErrorMsg = 'Server Error';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: mockErrorMsg }),
      }));

      await expect(request('/fail')).rejects.toThrow(mockErrorMsg);
    });

    it('should handle json parse error gracefully', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: async () => { throw new Error('Parse error'); },
      }));

      const res = await request('/json-error');
      expect(res).toEqual({});
    });
  });
});
