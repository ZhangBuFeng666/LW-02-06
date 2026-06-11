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

  isAdmin() {
    return this.getCurrentAdmin()?.role === 'admin';
  }

  canManageGoods() {
    return this.isAdmin();
  }

  canShipOrders() {
    return this.isAdmin();
  }

  getPermissionText(admin = this.getCurrentAdmin()) {
    if (!admin) return '未登录';
    return admin.role === 'admin' ? '商品管理、订单发货' : '商品查看、订单查看';
  }
}

const adminService = new AdminService();
export default adminService;
