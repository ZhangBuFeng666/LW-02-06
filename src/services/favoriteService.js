import { buildQuery, request } from './request';

class FavoriteService {
  getFavorites(userId, goodId = '') {
    return request(`/favorites${buildQuery({ userId, goodId })}`);
  }

  addFavorite(userId, goodId) {
    return request('/favorites', { method: 'POST', body: JSON.stringify({ userId, goodId }) });
  }

  removeFavorite(id) {
    return request(`/favorites/${id}`, { method: 'DELETE' });
  }
}

const favoriteService = new FavoriteService();
export default favoriteService;
