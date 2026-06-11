import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const statusClass = { unpaid: 'unpaid', paid: 'paid', shipped: 'shipped', received: 'received', closed: 'closed' };

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'unpaid', label: '待付款' },
  { key: 'paid', label: '待发货' },
  { key: 'shipped', label: '待收货' },
  { key: 'received', label: '已完成' },
];

const OrderListPage = () => {
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const user = services.user.getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('status') || 'all';

  useEffect(() => {
    if (user) services.order.getOrdersByUser(user.id).then(setOrders);
  }, []);

  if (!user) return <section className="empty-state">请先登录后查看订单 <Link to="/login">去登录</Link></section>;

  const filtered = activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab);

  if (orders.length === 0) return (
    <section className="empty-state animate-fade-rise">
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 48, margin: '0 0 12px' }}>📦</p>
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>暂无订单</p>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: 16 }}>快去选购心仪的商品吧</p>
        <Link to="/home" className="primary-link">去逛逛</Link>
      </div>
    </section>
  );

  const cancelOrder = async (e, order) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('确定取消该订单吗？取消后不可恢复')) return;
    await services.order.closeOrder(order.id);
    services.order.getOrdersByUser(user.id).then(setOrders);
  };

  const goPay = (e, orderId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/pay/${orderId}`);
  };

  return (
    <section className="section animate-fade-rise">
      <div className="section-title">
        <h1>我的订单</h1>
        <span>共 {orders.length} 笔订单</span>
      </div>

      {/* 状态筛选标签 */}
      <div className="order-tabs">
        {statusTabs.map((tab) => {
          const count = tab.key === 'all' ? orders.length : orders.filter((o) => o.status === tab.key).length;
          return (
            <button
              key={tab.key}
              className={`order-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setSearchParams(tab.key === 'all' ? {} : { status: tab.key })}
            >
              {tab.label}
              {count > 0 && <span className="order-tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ minHeight: 180 }}>
          <p style={{ color: 'var(--on-surface-variant)' }}>该状态下暂无订单</p>
        </div>
      ) : (
        <div className="animate-stagger" style={{ display: 'grid', gap: 12 }}>
          {filtered.map((order) => (
            <Link className="order-row-enhanced" key={order.id} to={`/orderDetail/${order.id}`}>
              <div className="order-row-top">
                <span style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>订单号：{order.orderNo}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`status-badge ${statusClass[order.status] || ''}`}>{order.statusText}</span>
                  {order.status === 'unpaid' && (
                    <>
                      <button className="text-button danger" style={{ fontSize: 13 }} onClick={(e) => cancelOrder(e, order)}>取消</button>
                      <button className="text-button" style={{ fontSize: 13 }} onClick={(e) => goPay(e, order.id)}>去支付</button>
                    </>
                  )}
                </div>
              </div>
              <div className="order-row-bottom">
                <div className="order-row-items">
                  {order.items.slice(0, 3).map((item, i) => (
                    <img src={item.img} alt={item.name} key={i} />
                  ))}
                  {order.items.length > 3 && (
                    <span style={{ alignSelf: 'center', color: 'var(--on-surface-variant)', fontSize: 13 }}>
                      +{order.items.length - 3}
                    </span>
                  )}
                </div>
                <span className="price" style={{ fontSize: 18 }}>￥{order.price}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default OrderListPage;
