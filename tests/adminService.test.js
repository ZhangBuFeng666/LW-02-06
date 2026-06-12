import { describe, it, expect, vi, beforeEach } from 'vitest';
import adminService from '../src/services/adminService';

describe('AdminService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should get current admin as null initially', () => {
    expect(adminService.getCurrentAdmin()).toBeNull();
  });

  it('should login, set localStorage, and return admin details', async () => {
    const mockAdmin = { username: 'admin', role: 'admin' };
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAdmin,
    });
    vi.stubGlobal('fetch', globalFetch);

    const admin = await adminService.login('admin', '123456');
    expect(admin).toEqual(mockAdmin);
    expect(localStorage.getItem('currentAdmin')).toBe(JSON.stringify(mockAdmin));
    expect(adminService.getCurrentAdmin()).toEqual(mockAdmin);
  });

  it('should check permissions', () => {
    localStorage.setItem('currentAdmin', JSON.stringify({ role: 'admin' }));
    expect(adminService.isAdmin()).toBe(true);
    expect(adminService.canManageGoods()).toBe(true);
    expect(adminService.canShipOrders()).toBe(true);
    expect(adminService.getPermissionText()).toBe('商品管理、订单发货');

    localStorage.setItem('currentAdmin', JSON.stringify({ role: 'operator' }));
    expect(adminService.isAdmin()).toBe(false);
    expect(adminService.canManageGoods()).toBe(false);
    expect(adminService.canShipOrders()).toBe(false);
    expect(adminService.getPermissionText()).toBe('商品查看、订单查看');

    localStorage.removeItem('currentAdmin');
    expect(adminService.getPermissionText()).toBe('未登录');
  });

  it('should logout and clear localStorage', () => {
    localStorage.setItem('currentAdmin', JSON.stringify({ role: 'admin' }));
    adminService.logout();
    expect(localStorage.getItem('currentAdmin')).toBeNull();
  });
});
