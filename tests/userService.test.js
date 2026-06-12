import { describe, it, expect, vi, beforeEach } from 'vitest';
import userService from '../src/services/userService';

describe('UserService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should get current user as null initially', () => {
    expect(userService.getCurrentUser()).toBeNull();
  });

  it('should login and set localStorage', async () => {
    const mockUser = { id: 1, username: 'user' };
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });
    vi.stubGlobal('fetch', globalFetch);

    const user = await userService.login('user', '123456');
    expect(user).toEqual(mockUser);
    expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockUser));
    expect(userService.getCurrentUser()).toEqual(mockUser);
  });

  it('should register and set localStorage', async () => {
    const mockUser = { id: 2, username: 'newuser', nickname: 'nick' };
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });
    vi.stubGlobal('fetch', globalFetch);

    const user = await userService.register('newuser', 'password', 'nick');
    expect(user).toEqual(mockUser);
    expect(localStorage.getItem('currentUser')).toBe(JSON.stringify(mockUser));
  });

  it('should logout and clear localStorage', () => {
    localStorage.setItem('currentUser', JSON.stringify({ id: 1 }));
    userService.logout();
    expect(localStorage.getItem('currentUser')).toBeNull();
    expect(userService.getCurrentUser()).toBeNull();
  });
});
