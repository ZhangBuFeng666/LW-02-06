import { request } from './request';

class AdminService {
  getCurrentAdmin() {
    const current = localStorage.getItem('currentAdmin');
    return current ? JSON.parse(current) : null;
  }

  async login(username, password) {
    const admin = await request('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    localStorage.setItem('currentAdmin', JSON.stringify(admin));
    return admin;
  }

  logout() {
    localStorage.removeItem('currentAdmin');
  }

  canManageGoods() {
    return this.getCurrentAdmin()?.role === 'admin';
  }
}

const adminService = new AdminService();
export default adminService;
