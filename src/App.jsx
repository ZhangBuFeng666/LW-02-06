import { useContext, useState, Suspense } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import './App.css';
import { BrandMark, CartIcon, UserIcon } from './components/icons';
import { ServiceContext } from './contexts/ServiceContext';

const CATEGORY_NAV = [
  { id: 'phone', label: '数码' },
  { id: 'life', label: '居家' },
  { id: 'food', label: '零食' },
  { id: 'sport', label: '运动' },
];

function App() {
  const services = useContext(ServiceContext);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [, setUser] = useState(services.user.getCurrentUser());

  return (
    <div className="app-shell">
      <header className="site-header">
        {!isAdminRoute ? (
          <>
            <Link className="brand" to="/home" aria-label="返回首页">
              <BrandMark size={48} />
            </Link>
            <nav className="nav-categories">
              {CATEGORY_NAV.map((c) => (
                <NavLink key={c.id} to={`/category?cat=${c.id}`}>
                  {c.label}
                </NavLink>
              ))}
            </nav>
            <div className="user-area">
              <NavLink className="header-action" to="/cart" aria-label="购物车">
                <CartIcon />
                <span>购物车</span>
              </NavLink>
              <NavLink className="header-action" to="/mine" aria-label="我的">
                <UserIcon />
                <span>我的</span>
              </NavLink>
            </div>
          </>
        ) : (
          <>
            <Link className="brand" to="/home" aria-label="返回首页">
              <BrandMark size={48} />
            </Link>
            <div className="admin-shell-label">后台管理</div>
          </>
        )}
      </header>
      <main className="page-main">
        <Suspense fallback={<div className="page-loading" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--on-surface-variant)', fontFamily: '"STKaiti", "KaiTi", serif', fontSize: '15px' }}>正在加载页面...</div>}>
          <Outlet context={{ refreshUser: () => setUser(services.user.getCurrentUser()) }} />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
