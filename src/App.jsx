import { useContext, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import './App.css';
import { ServiceContext } from './contexts/ServiceContext';

function App() {
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(services.user.getCurrentUser());

  const logout = () => {
    services.user.logout();
    setUser(null);
    navigate('/home');
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/home">React Mall</Link>
        <nav className="nav-links">
          <NavLink to="/home">首页</NavLink>
          <NavLink to="/category">分类</NavLink>
          <NavLink to="/cart">购物车</NavLink>
          <NavLink to="/mine">我的</NavLink>
        </nav>
        <div className="user-area">
          {user ? (
            <>
              <span>{user.nickname}</span>
              <button className="text-button" onClick={logout}>退出</button>
            </>
          ) : (
            <Link className="primary-link" to="/login">登录</Link>
          )}
        </div>
      </header>
      <main className="page-main">
        <Outlet context={{ refreshUser: () => setUser(services.user.getCurrentUser()) }} />
      </main>
    </div>
  );
}

export default App;
