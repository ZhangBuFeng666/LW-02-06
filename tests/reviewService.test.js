import { describe, it, expect, vi, beforeEach } from 'vitest';
import reviewService from '../src/services/reviewService';

describe('ReviewService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should get reviews and add review', async () => {
    const mockReviews = [{ id: 1, content: 'good' }];
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockReviews,
    });
    vi.stubGlobal('fetch', globalFetch);

    expect(await reviewService.getReviews(123)).toEqual(mockReviews);
    expect(globalFetch).toHaveBeenCalledWith('/api/reviews?goodId=123', expect.any(Object));

    expect(await reviewService.addReview({ content: 'nice' })).toEqual(mockReviews);
  });
});
