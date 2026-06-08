import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const PayPage = () => {
  const { orderId } = useParams();
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(30);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    services.order.getOrderById(orderId).then(setOrder);
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [orderId]);

  if (!order) return <section className="empty-state">订单加载中... <Link to="/home">返回首页</Link></section>;

  const pay = async () => {
    await services.order.payOrder(order.id);
    navigate(`/orderDetail/${order.id}`);
  };

  return (
    <section className="pay-panel">
      <h1>订单支付</h1>
      <p>订单号：{order.orderNo}</p>
      <div className="fake-qr">PAY</div>
      <p className="price">￥{order.price}</p>
      <p>请在 {seconds} 秒内完成付款，库存将为你暂时保留。</p>
      <button className="button" onClick={pay}>确认已支付</button>
    </section>
  );
};

export default PayPage;
