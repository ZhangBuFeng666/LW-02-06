import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const statusClass = { unpaid: 'unpaid', paid: 'paid', shipped: 'shipped', received: 'received', closed: 'closed' };

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
    if (!window.confirm('确认已收到商品？')) return;
    await services.order.receiveOrder(order.id);
    loadOrder();
  };

  return (
    <section className="section order-detail animate-fade-rise">
      <div className="section-title">
        <h1>订单详情</h1>
        <span className={`status-badge ${statusClass[order.status] || ''}`}>{order.statusText}</span>
      </div>

      <div className="info-grid">
        <p><strong>订单号</strong><br />{order.orderNo}</p>
        <p><strong>创建时间</strong><br />{order.createTime}</p>
        <p><strong>支付时间</strong><br />{order.payTime || '未支付'}</p>
        <p><strong>收货地址</strong><br />{order.address}</p>
        <p><strong>收货人</strong><br />{order.receiver ? `${order.receiver.name} ${order.receiver.phone}` : '未填写'}</p>
        <p><strong>物流状态</strong><br />{logistics?.company ? `${logistics.company} · ${logistics.trackingNo}` : '待发货'}</p>
      </div>

      <p style={{ fontWeight: 600, marginBottom: 10 }}>商品清单</p>
      <div className="order-items animate-stagger">
        {order.items.map((item) => (
          <div className="cart-item" key={item.goodId}>
            <img src={item.img} alt={item.name} style={{ borderRadius: 6 }} />
            <div>
              <strong>{item.name}</strong>
              <p className="price" style={{ fontSize: 16, marginTop: 4 }}>￥{item.price} × {item.count}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="section logistics-panel animate-fade-rise" style={{ animationDelay: '200ms' }}>
        <div className="section-title">
          <h2>物流轨迹</h2>
          {logistics?.statusText && <span className="status-badge shipped">{logistics.statusText}</span>}
        </div>
        {(logistics?.traces || []).length > 0 ? (
          <div className="timeline-enhanced">
            {logistics.traces.map((trace, index) => (
              <div className="timeline-node" key={index}>
                <div className="timeline-node-time">{trace.time}</div>
                <p className="timeline-node-text">{trace.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--on-surface-variant)', padding: '12px 0' }}>暂无物流信息</p>
        )}
      </section>

      <div className="checkout-bar">
        <strong style={{ fontSize: 18 }}>订单金额 <span className="price">￥{order.price}</span></strong>
        {order.status === 'shipped' && <button className="button" onClick={receive}>确认收货</button>}
      </div>
    </section>
  );
};

export default OrderDetailPage;
