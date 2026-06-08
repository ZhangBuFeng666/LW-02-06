import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const OrderListPage = () => {
  const services = useContext(ServiceContext);
  const user = services.user.getCurrentUser();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) services.order.getOrdersByUser(user.id).then(setOrders);
  }, []);

  if (!user) return <section className="empty-state">请先登录后查看订单 <Link to="/login">去登录</Link></section>;

  return (
    <section className="section">
      <div className="section-title">
        <h1>订单列表</h1>
        <span>查看支付状态和订单明细</span>
      </div>
      <div className="table-list">
        {orders.map((order) => (
          <Link className="order-row" key={order.id} to={`/orderDetail/${order.id}`}>
            <span>{order.orderNo}</span>
            <span>￥{order.price}</span>
            <span>{order.statusText}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default OrderListPage;
