import { request } from './request';

class UserService {
  getCurrentUser() {
    const current = localStorage.getItem('currentUser');
    return current ? JSON.parse(current) : null;
  }

  async login(username, password) {
    const user = await request('/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  async register(username, password, nickname = username) {
    const user = await request('/register', { method: 'POST', body: JSON.stringify({ username, password, nickname }) });
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  logout() {
    localStorage.removeItem('currentUser');
  }
}

const userService = new UserService();
export default userService;
