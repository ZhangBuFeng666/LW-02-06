import { buildQuery, request } from './request';

class CartService {
  async getCart(userId) {
    return request(`/cart${buildQuery({ userId })}`);
  }

  async addItem(userId, goodId, count = 1) {
    return request('/cart', { method: 'POST', body: JSON.stringify({ userId, goodId, count }) });
  }

  async updateItem(id, patch) {
    return request(`/cart/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
  }

  async removeItem(id) {
    return request(`/cart/${id}`, { method: 'DELETE' });
  }

  async clearSelected(userId) {
    return request(`/cart/selected${buildQuery({ userId })}`, { method: 'DELETE' });
  }
}

const cartService = new CartService();
export default cartService;
