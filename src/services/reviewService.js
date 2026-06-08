import { buildQuery, request } from './request';

class ReviewService {
  getReviews(goodId) {
    return request(`/reviews${buildQuery({ goodId })}`);
  }

  addReview(review) {
    return request('/reviews', { method: 'POST', body: JSON.stringify(review) });
  }
}

const reviewService = new ReviewService();
export default reviewService;
