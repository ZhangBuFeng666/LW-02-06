import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const services = useContext(ServiceContext);
  const [order, setOrder] = useState(null);
  const [logistics, setLogistics] = useState(null);

  const loadOrder = async () => {
    setOrder(await services.order.getOrderById(orderId));
    setLogistics(await services.order.getLogistics(orderId));
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  if (!order) return <section className="empty-state">订单加载中... <Link to="/home">返回首页</Link></section>;

  const receive = async () => {
    await services.order.receiveOrder(order.id);
    loadOrder();
  };

  return (
    <section className="section order-detail">
      <div className="section-title">
        <h1>订单详情</h1>
        <span>{order.statusText}</span>
      </div>
      <div className="info-grid">
        <p>订单号：{order.orderNo}</p>
        <p>创建时间：{order.createTime}</p>
        <p>支付时间：{order.payTime || '未支付'}</p>
        <p>收货地址：{order.address}</p>
        <p>收货人：{order.receiver ? `${order.receiver.name} ${order.receiver.phone}` : '未填写'}</p>
        <p>物流公司：{logistics?.company || '待发货'}</p>
        <p>运单号：{logistics?.trackingNo || '暂无'}</p>
        <p>物流信息：{order.logistics}</p>
      </div>
      <div className="order-items">
        {order.items.map((item) => (
          <div className="cart-item" key={item.goodId}>
            <img src={item.img} alt={item.name} />
            <div><strong>{item.name}</strong><p>￥{item.price} × {item.count}</p></div>
          </div>
        ))}
      </div>
      <section className="section logistics-panel">
        <div className="section-title">
          <h2>物流轨迹</h2>
          <span>{logistics?.statusText}</span>
        </div>
        <div className="timeline">
          {(logistics?.traces || []).map((trace, index) => (
            <div className="timeline-item" key={index}>
              <span>{trace.time}</span>
              <p>{trace.text}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="checkout-bar">
        <strong>订单金额 ￥{order.price}</strong>
        {order.status === 'shipped' && <button className="button" onClick={receive}>确认收货</button>}
      </div>
    </section>
  );
};

export default OrderDetailPage;
