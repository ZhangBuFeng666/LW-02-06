import { describe, it, expect, vi, beforeEach } from 'vitest';
import favoriteService from '../src/services/favoriteService';

describe('FavoriteService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should manage favorites', async () => {
    const mockFavs = [{ id: 1, goodId: 10 }];
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFavs,
    });
    vi.stubGlobal('fetch', globalFetch);

    expect(await favoriteService.getFavorites(123, 10)).toEqual(mockFavs);
    expect(globalFetch).toHaveBeenCalledWith('/api/favorites?userId=123&goodId=10', expect.any(Object));

    expect(await favoriteService.addFavorite(123, 10)).toEqual(mockFavs);
    expect(await favoriteService.removeFavorite(1)).toEqual(mockFavs);
  });
});
