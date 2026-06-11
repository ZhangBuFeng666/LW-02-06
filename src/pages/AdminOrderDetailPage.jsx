import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const statusClass = { unpaid: 'unpaid', paid: 'paid', shipped: 'shipped', received: 'received', closed: 'closed' };

const AdminOrderDetailPage = () => {
  const { orderId } = useParams();
  const services = useContext(ServiceContext);
  const adminService = services.admin;
  const orderService = services.order;
  const navigate = useNavigate();
  const admin = adminService.getCurrentAdmin();
  const canShip = adminService.canShipOrders();

  const [order, setOrder] = useState(null);
  const [logistics, setLogistics] = useState(null);
  const [shipForm, setShipForm] = useState({ company: '校园优选快递', trackingNo: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchOrderData = useCallback(() => (
    Promise.all([
      orderService.getOrderById(orderId),
      orderService.getLogistics(orderId),
    ])
  ), [orderService, orderId]);

  const loadOrder = useCallback(async () => {
    const [nextOrder, nextLogistics] = await fetchOrderData();
    setOrder(nextOrder);
    setLogistics(nextLogistics);
    setShipForm({
      company: nextOrder.logisticsCompany || nextLogistics.company || '校园优选快递',
      trackingNo: nextOrder.trackingNo || nextLogistics.trackingNo || '',
    });
  }, [fetchOrderData]);

  useEffect(() => {
    let active = true;
    fetchOrderData().then(([nextOrder, nextLogistics]) => {
      if (!active) return;
      setOrder(nextOrder);
      setLogistics(nextLogistics);
      setShipForm({
        company: nextOrder.logisticsCompany || nextLogistics.company || '校园优选快递',
        trackingNo: nextOrder.trackingNo || nextLogistics.trackingNo || '',
      });
    });
    return () => {
      active = false;
    };
  }, [fetchOrderData]);

  const logout = () => {
    adminService.logout();
    navigate('/admin/login');
  };

  const submitShip = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!canShip) {
      setError('运营角色只能查看订单，不能发货。');
      return;
    }
    if (order.status !== 'paid') {
      setError('只有待发货订单可以发货。');
      return;
    }
    if (!shipForm.company.trim() || !shipForm.trackingNo.trim()) {
      setError('请填写快递公司和物流单号。');
      return;
    }
    await orderService.shipOrder(order.id, {
      company: shipForm.company.trim(),
      trackingNo: shipForm.trackingNo.trim(),
    });
    setMessage('发货成功，顾客订单详情页会同步显示物流公司、单号和轨迹。');
    await loadOrder();
  };

  if (!order) return <section className="empty-state">订单加载中... <Link to="/admin/orders">返回订单管理</Link></section>;

  return (
    <section className="admin-page admin-detail-page">
      <div className="admin-head">
        <div>
          <h1>后台订单详情</h1>
          <p>{admin.username} · {admin.roleName} · 商家视角订单处理</p>
        </div>
        <div className="row-actions">
          <Link className="text-button" to="/admin/orders">返回订单列表</Link>
          <button className="text-button" onClick={logout}>退出后台</button>
        </div>
      </div>

      <div className="admin-detail-summary">
        <div>
          <span>订单号</span>
          <strong>{order.orderNo}</strong>
        </div>
        <div>
          <span>订单状态</span>
          <strong><span className={`status-badge ${statusClass[order.status] || ''}`}>{order.statusText}</span></strong>
        </div>
        <div>
          <span>订单金额</span>
          <strong className="price">￥{order.price}</strong>
        </div>
        <div>
          <span>商品件数</span>
          <strong>{order.items.reduce((sum, item) => sum + Number(item.count || 0), 0)}</strong>
        </div>
      </div>

      <div className="admin-detail-grid">
        <section className="admin-detail-panel">
          <div className="section-title">
            <h2>买家与收货信息</h2>
          </div>
          <div className="info-grid admin-info-grid">
            <p><strong>买家用户ID</strong><br />{order.userId}</p>
            <p><strong>收货人</strong><br />{order.receiver ? `${order.receiver.name} ${order.receiver.phone}` : '未填写'}</p>
            <p><strong>收货地址</strong><br />{order.address}</p>
            <p><strong>创建时间</strong><br />{order.createTime}</p>
            <p><strong>支付时间</strong><br />{order.payTime || '未支付'}</p>
            <p><strong>发货时间</strong><br />{order.shipTime || '未发货'}</p>
          </div>
        </section>

        <section className="admin-detail-panel">
          <div className="section-title">
            <h2>商家发货处理</h2>
          </div>
          {order.status === 'paid' ? (
            <form className="ship-form admin-detail-ship-form" onSubmit={submitShip}>
              <label className="admin-field">
                <span>快递公司</span>
                <input value={shipForm.company} onChange={(e) => setShipForm({ ...shipForm, company: e.target.value })} required disabled={!canShip} />
              </label>
              <label className="admin-field">
                <span>物流单号</span>
                <input value={shipForm.trackingNo} onChange={(e) => setShipForm({ ...shipForm, trackingNo: e.target.value })} required disabled={!canShip} />
              </label>
              <button className="button" type="submit" disabled={!canShip}>确认发货</button>
            </form>
          ) : (
            <div className="admin-logistics-card">
              <p><strong>当前处理状态</strong><br />{order.status === 'unpaid' ? '顾客未支付，暂不能发货。' : '该订单无需再次发货。'}</p>
              <p><strong>物流公司</strong><br />{logistics?.company || order.logisticsCompany || '未发货'}</p>
              <p><strong>物流单号</strong><br />{logistics?.trackingNo || order.trackingNo || '暂无'}</p>
            </div>
          )}
          {!canShip && <p className="notice">运营角色只能查看订单，不能执行发货。</p>}
          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}
        </section>
      </div>

      <section className="admin-detail-panel">
        <div className="section-title">
          <h2>商品清单</h2>
        </div>
        <div className="admin-table">
          <div className="admin-row admin-row-head admin-order-items-head">
            <span>商品</span><span>单价</span><span>数量</span><span>小计</span>
          </div>
          {order.items.map((item) => (
            <div className="admin-row admin-order-items-row" key={item.goodId}>
              <span className="admin-order-good">
                <img src={item.img} alt={item.name} />
                <span>{item.name}</span>
              </span>
              <span>￥{item.price}</span>
              <span>{item.count}</span>
              <span>￥{Number(item.price) * Number(item.count)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-detail-panel">
        <div className="section-title">
          <h2>后台物流记录</h2>
          {logistics?.statusText && <span className={`status-badge ${statusClass[logistics.status] || ''}`}>{logistics.statusText}</span>}
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
          <p style={{ color: 'var(--on-surface-variant)' }}>暂无物流记录</p>
        )}
      </section>
    </section>
  );
};

export default AdminOrderDetailPage;
