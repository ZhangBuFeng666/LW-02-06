import { describe, it, expect, vi, beforeEach } from 'vitest';
import cartService from '../src/services/cartService';

describe('CartService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should manage cart items', async () => {
    const mockCart = [{ id: 1, userId: 123, goodId: 456, count: 2 }];
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCart,
    });
    vi.stubGlobal('fetch', globalFetch);

    expect(await cartService.getCart(123)).toEqual(mockCart);
    expect(globalFetch).toHaveBeenCalledWith('/api/cart?userId=123', expect.any(Object));

    expect(await cartService.addItem(123, 456, 2)).toEqual(mockCart);
    expect(await cartService.updateItem(1, { count: 3 })).toEqual(mockCart);
    expect(await cartService.removeItem(1)).toEqual(mockCart);
    expect(await cartService.clearSelected(123)).toEqual(mockCart);
  });
});
