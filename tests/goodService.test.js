import { describe, it, expect, vi, beforeEach } from 'vitest';
import goodService from '../src/services/goodService';

describe('GoodService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should get categories', async () => {
    const mockCategories = [{ id: '1', name: 'category1' }];
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCategories,
    });
    vi.stubGlobal('fetch', globalFetch);

    const categories = await goodService.getCategories();
    expect(categories).toEqual(mockCategories);
  });

  it('should get category name', () => {
    const categories = [{ id: 'phone', name: '数码' }];
    expect(goodService.getCategoryName(categories, 'phone')).toBe('数码');
    expect(goodService.getCategoryName(categories, 'other')).toBe('未分类');
  });

  it('should get good by id', async () => {
    const mockGood = { id: 1, name: 'good1' };
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGood,
    });
    vi.stubGlobal('fetch', globalFetch);

    const good = await goodService.getGoodById(1);
    expect(good).toEqual(mockGood);
  });

  it('should get good list with query', async () => {
    const mockGoods = [{ id: 1, name: 'good1' }];
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGoods,
    });
    vi.stubGlobal('fetch', globalFetch);

    const goods = await goodService.getGoodList({ categoryId: 'phone' });
    expect(goods).toEqual(mockGoods);
    expect(globalFetch).toHaveBeenCalledWith('/api/goods?categoryId=phone', expect.any(Object));
  });

  it('should manage goods: add, update, delete, toggleStatus', async () => {
    const mockGood = { id: 1, name: 'good1' };
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGood,
    });
    vi.stubGlobal('fetch', globalFetch);

    expect(await goodService.addGood(mockGood)).toEqual(mockGood);
    expect(await goodService.updateGood(mockGood)).toEqual(mockGood);
    expect(await goodService.deleteGood(1)).toEqual(mockGood);
    expect(await goodService.toggleStatus(1)).toEqual(mockGood);
  });
});
