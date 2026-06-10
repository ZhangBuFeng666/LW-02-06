import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const PayPage = () => {
  const { orderId } = useParams();
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(300);
  const [order, setOrder] = useState(null);
  const [paying, setPaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    services.order.getOrderById(orderId).then((o) => {
      setOrder(o);
      if (o.status !== 'unpaid') {
        navigate(`/orderDetail/${o.id}`, { replace: true });
      }
    });
    const timer = setInterval(() => setSeconds((value) => {
      if (value <= 1) {
        clearInterval(timer);
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [orderId]);

  if (!order) return <section className="empty-state">订单加载中... <Link to="/home">返回首页</Link></section>;

  const pay = async () => {
    setPaying(true);
    await services.order.payOrder(order.id);
    setShowSuccess(true);
    setTimeout(() => navigate(`/orderDetail/${order.id}`), 1800);
  };

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isUrgent = seconds <= 60;

  return (
    <section className="pay-panel animate-fade-rise">
      <h1 style={{ fontFamily: '"STKaiti", "KaiTi", "Noto Serif CJK SC", serif', fontWeight: 500, marginBottom: 8 }}>订单支付</h1>
      <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>订单号：{order.orderNo}</p>

      <div className="pay-qr-wrapper">
        <div className="pay-qr-inner">PAY</div>
      </div>

      <p className="price" style={{ fontSize: 32, margin: '16px 0 8px' }}>￥{order.price}</p>

      <div className={`pay-countdown${isUrgent ? ' urgent' : ''}`}>
        {minutes}:{secs.toString().padStart(2, '0')}
      </div>
      <p style={{ color: 'var(--on-surface-variant)', fontSize: 14, margin: '8px 0 24px' }}>
        {seconds > 0
          ? isUrgent ? '即将超时，请尽快完成支付' : '请在倒计时内完成付款，库存将为你暂时保留'
          : '支付超时，订单将自动关闭'}
      </p>

      <button className="button" onClick={pay} disabled={paying || seconds === 0} style={{ minWidth: 180 }}>
        {paying ? '处理中...' : seconds === 0 ? '已超时' : '确认已支付'}
      </button>

      {showSuccess && (
        <div className="pay-success-overlay">
          <div className="pay-success-card">
            <div className="pay-success-icon">✓</div>
            <h2 style={{ margin: '0 0 8px', fontFamily: '"STKaiti", "KaiTi", "Noto Serif CJK SC", serif', fontWeight: 500 }}>支付成功</h2>
            <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>正在跳转到订单详情...</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default PayPage;
