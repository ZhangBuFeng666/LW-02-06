import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const orderTabs = [
  { key: 'all', label: '全部订单', icon: '📋' },
  { key: 'unpaid', label: '待付款', icon: '💳' },
  { key: 'paid', label: '待发货', icon: '📦' },
  { key: 'shipped', label: '待收货', icon: '🚚' },
  { key: 'received', label: '已完成', icon: '✅' },
];

const quickLinks = [
  { to: '/cart', icon: '🛒', label: '购物车' },
  { to: '/favorites', icon: '❤️', label: '我的收藏' },
  { to: '/addresses', icon: '📍', label: '收货地址' },
];

const MinePage = () => {
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const user = services.user.getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user) {
      services.order.getOrdersByUser(user.id).then(setOrders);
      services.favorite.getFavorites(user.id).then(setFavorites);
    }
  }, []);

  if (!user) return (
    <section className="empty-state animate-fade-rise">
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 48, margin: '0 0 12px' }}>👤</p>
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>请先登录</p>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: 16 }}>登录后查看订单、收藏和地址</p>
        <Link to="/login" className="primary-link">去登录</Link>
      </div>
    </section>
  );

  const countByStatus = (status) => orders.filter((o) => o.status === status).length;

  const logout = () => {
    services.user.logout();
    navigate('/home');
    window.location.reload();
  };

  return (
    <section className="mine-page animate-fade-rise">
      {/* 个人信息头部 */}
      <div className="mine-header">
        <div className="mine-avatar">{user.nickname.slice(0, 1).toUpperCase()}</div>
        <div className="mine-user-info">
          <h1>{user.nickname}</h1>
          <p>用户名：{user.username}</p>
        </div>
        <button className="text-button danger" onClick={logout} style={{ marginLeft: 'auto' }}>退出登录</button>
      </div>

      {/* 订单统计 */}
      <div className="mine-stats">
        <div className="mine-stat-item" onClick={() => navigate('/orderList')}>
          <strong>{orders.length}</strong>
          <span>全部订单</span>
        </div>
        <div className="mine-stat-item" onClick={() => navigate('/orderList?status=unpaid')}>
          <strong>{countByStatus('unpaid')}</strong>
          <span>待付款</span>
        </div>
        <div className="mine-stat-item" onClick={() => navigate('/orderList?status=paid')}>
          <strong>{countByStatus('paid')}</strong>
          <span>待发货</span>
        </div>
        <div className="mine-stat-item" onClick={() => navigate('/orderList?status=shipped')}>
          <strong>{countByStatus('shipped')}</strong>
          <span>待收货</span>
        </div>
      </div>

      {/* 订单状态快捷入口 */}
      <div className="mine-order-tabs">
        {orderTabs.map((tab) => (
          <Link className="mine-tab" to={tab.key === 'all' ? '/orderList' : `/orderList?status=${tab.key}`} key={tab.key}>
            <span className="mine-tab-icon">{tab.icon}</span>
            <span className="mine-tab-label">{tab.label}</span>
            {tab.key !== 'all' && countByStatus(tab.key) > 0 && (
              <span className="mine-tab-badge">{countByStatus(tab.key)}</span>
            )}
          </Link>
        ))}
      </div>

      {/* 快捷功能 */}
      <div className="mine-quick-links">
        {quickLinks.map((link) => (
          <Link className="mine-quick-item" to={link.to} key={link.to}>
            <span className="mine-quick-icon">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      {/* 最近订单 */}
      {orders.length > 0 && (
        <div className="section" style={{ marginTop: 0 }}>
          <div className="section-title">
            <h2>最近订单</h2>
            <Link to="/orderList" className="text-button">查看全部</Link>
          </div>
          <div className="animate-stagger" style={{ display: 'grid', gap: 12 }}>
            {orders.slice(0, 3).map((order) => (
              <Link className="order-row-enhanced" key={order.id} to={`/orderDetail/${order.id}`}>
                <div className="order-row-top">
                  <span style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>订单号：{order.orderNo}</span>
                  <span className={`status-badge ${order.status}`}>{order.statusText}</span>
                </div>
                <div className="order-row-bottom">
                  <div className="order-row-items">
                    {order.items.slice(0, 3).map((item, i) => (
                      <img src={item.img} alt={item.name} key={i} />
                    ))}
                  </div>
                  <span className="price" style={{ fontSize: 18 }}>￥{order.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default MinePage;
