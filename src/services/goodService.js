import { buildQuery, request } from './request';

class GoodService {
  constructor() {
    this._categoriesCache = null;
  }

  async getCategories() {
    if (this._categoriesCache) {
      return this._categoriesCache;
    }
    const data = await request('/categories');
    this._categoriesCache = data;
    return data;
  }

  getCategoryName(categories, categoryId) {
    return categories.find((item) => item.id === categoryId)?.name || '未分类';
  }

  async getGoodById(id) {
    return request(`/goods/${id}`);
  }

  async getGoodList(options = {}) {
    return request(`/goods${buildQuery(options)}`);
  }

  async addGood(good) {
    return request('/admin/goods', { method: 'POST', body: JSON.stringify(good) });
  }

  async updateGood(good) {
    return request(`/admin/goods/${good.id}`, { method: 'PUT', body: JSON.stringify(good) });
  }

  async deleteGood(id) {
    return request(`/admin/goods/${id}`, { method: 'DELETE' });
  }

  async toggleStatus(id) {
    return request(`/admin/goods/${id}/status`, { method: 'PATCH' });
  }
}

const goodService = new GoodService();
export default goodService;
