import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const AdminOrdersPage = () => {
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const admin = services.admin.getCurrentAdmin();
  const [orders, setOrders] = useState([]);

  const load = async () => {
    setOrders(await services.order.getOrderList());
  };

  useEffect(() => {
    if (admin) load();
  }, []);

  if (!admin) return <section className="empty-state">请先登录后台 <Link to="/admin/login">去登录</Link></section>;

  const logout = () => {
    services.admin.logout();
    navigate('/admin/login');
  };

  return (
    <section className="admin-page">
      <div className="admin-head">
        <div>
          <h1>后台订单管理</h1>
          <p>查看订单状态，为已支付订单安排发货。</p>
        </div>
        <div className="row-actions">
          <Link className="text-button" to="/admin/goods">商品管理</Link>
          <button className="text-button" onClick={logout}>退出后台</button>
        </div>
      </div>
      <div className="admin-table">
        <div className="admin-row order-admin-head">
          <span>订单号</span><span>金额</span><span>状态</span><span>收货信息</span><span>操作</span>
        </div>
        {orders.map((order) => (
          <div className="admin-row order-admin-row" key={order.id}>
            <span>{order.orderNo}</span>
            <span>￥{order.price}</span>
            <span>{order.statusText}</span>
            <span>{order.receiver?.name || '用户'} {order.address}</span>
            <span className="row-actions">
              <Link className="text-button" to={`/orderDetail/${order.id}`}>详情</Link>
              <button className="text-button" disabled={order.status !== 'paid'} onClick={async () => { await services.order.shipOrder(order.id); load(); }}>发货</button>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminOrdersPage;
