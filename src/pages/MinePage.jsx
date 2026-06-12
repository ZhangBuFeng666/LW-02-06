import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import { BoxIcon, CartIcon, CheckIcon, HeartIcon, ListIcon, PinIcon, TruckIcon, UserIcon, WalletIcon } from '../components/icons';

const orderTabs = [
  { key: 'all', label: '全部订单', Icon: ListIcon },
  { key: 'unpaid', label: '待付款', Icon: WalletIcon },
  { key: 'paid', label: '待发货', Icon: BoxIcon },
  { key: 'shipped', label: '待收货', Icon: TruckIcon },
  { key: 'received', label: '已完成', Icon: CheckIcon },
];

const quickLinks = [
  { to: '/cart', Icon: CartIcon, label: '购物车' },
  { to: '/favorites', Icon: HeartIcon, label: '我的收藏' },
  { to: '/addresses', Icon: PinIcon, label: '收货地址' },
];

const MinePage = () => {
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const user = services.user.getCurrentUser();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      services.order.getOrdersByUser(user.id).then(setOrders);
    }
  }, []);

  if (!user) return (
    <section className="empty-state animate-fade-rise">
      <div style={{ textAlign: 'center' }}>
        <p style={{ display: 'flex', justifyContent: 'center', margin: '0 0 24px', color: 'var(--on-surface-variant)' }}>
          <UserIcon width={80} height={80} strokeWidth={1.4} />
        </p>
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
        <button className="mine-logout-btn" onClick={logout}>退出登录</button>
      </div>

      {/* 订单状态快捷入口 */}
      <div className="mine-order-tabs">
        {orderTabs.map((tab) => (
          <Link className="mine-tab" to={tab.key === 'all' ? '/orderList' : `/orderList?status=${tab.key}`} key={tab.key}>
            <span className="mine-tab-icon"><tab.Icon /></span>
            <span className="mine-tab-label">{tab.label}</span>
            {tab.key !== 'all' && countByStatus(tab.key) > 0 && (
              <span className="mine-tab-badge">{countByStatus(tab.key)}</span>
            )}
          </Link>
        ))}
      </div>

      {/* 快捷功能列表 */}
      <div className="mine-menu-list">
        {quickLinks.map((link) => (
          <Link className="mine-menu-item" to={link.to} key={link.to}>
            <span className="mine-menu-icon"><link.Icon /></span>
            <span className="mine-menu-label">{link.label}</span>
            <span className="mine-menu-arrow">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
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
