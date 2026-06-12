import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'unpaid', label: '待支付' },
  { value: 'paid', label: '待发货' },
  { value: 'shipped', label: '已发货' },
  { value: 'received', label: '已完成' },
  { value: 'closed', label: '已关闭' },
];

const AdminOrdersPage = () => {
  const services = useContext(ServiceContext);
  const adminService = services.admin;
  const orderService = services.order;
  const navigate = useNavigate();
  const admin = adminService.getCurrentAdmin();
  const canShip = adminService.canShipOrders();

  const [orders, setOrders] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [shippingId, setShippingId] = useState(null);
  const [shipForm, setShipForm] = useState({ company: '校园优选快递', trackingNo: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchOrders = useCallback(() => orderService.getOrderList(), [orderService]);

  const load = useCallback(async () => {
    setOrders(await fetchOrders());
  }, [fetchOrders]);

  useEffect(() => {
    let active = true;
    fetchOrders().then((nextOrders) => {
      if (active) setOrders(nextOrders);
    });
    return () => {
      active = false;
    };
  }, [fetchOrders]);

  const stats = useMemo(() => ({
    total: orders.length,
    unpaid: orders.filter((order) => order.status === 'unpaid').length,
    paid: orders.filter((order) => order.status === 'paid').length,
    shippedDone: orders.filter((order) => ['shipped', 'received'].includes(order.status)).length,
  }), [orders]);

  const filteredOrders = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    return orders.filter((order) => {
      const keywordOk = !text || String(order.orderNo).toLowerCase().includes(text);
      const statusOk = status === 'all' || order.status === status;
      return keywordOk && statusOk;
    });
  }, [orders, keyword, status]);

  const openShipForm = (order) => {
    if (!canShip) {
      setMessage('运营角色只能查看订单，不能发货。');
      return;
    }
    if (order.status !== 'paid') {
      setMessage('只有待发货订单可以发货。');
      return;
    }
    setShippingId(order.id);
    setShipForm({ company: order.logisticsCompany || '校园优选快递', trackingNo: order.trackingNo || '' });
    setError('');
    setMessage('');
  };

  const submitShip = async (event, order) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!canShip) {
      setMessage('运营角色只能查看订单，不能发货。');
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
    setShippingId(null);
    setShipForm({ company: '校园优选快递', trackingNo: '' });
    setMessage(`订单 ${order.orderNo} 已发货，用户订单详情页可查看物流信息。`);
    await load();
  };

  const logout = () => {
    adminService.logout();
    navigate('/admin/login');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'unpaid': return 'badge-warning';
      case 'paid': return 'badge-info';
      case 'shipped': return 'badge-neutral';
      case 'received': return 'badge-success';
      case 'closed': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-head">
        <div>
          <h1>后台订单管理</h1>
          <p>{admin.username} · {admin.roleName} · 权限：{adminService.getPermissionText(admin)}</p>
        </div>
        <div className="row-actions">
          <Link className="button secondary" to="/admin/goods">商品管理</Link>
          <button className="button ghost" onClick={logout}>退出后台</button>
        </div>
      </div>

      <div className="admin-stats">
        <div><span>订单总数</span><strong>{stats.total}</strong></div>
        <div><span>待支付</span><strong>{stats.unpaid}</strong></div>
        <div><span>待发货</span><strong>{stats.paid}</strong></div>
        <div><span>已发货/已完成</span><strong>{stats.shippedDone}</strong></div>
      </div>

      <div className="admin-filters">
        <input placeholder="搜索订单号" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {statusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <button className="button ghost" type="button" onClick={() => { setKeyword(''); setStatus('all'); }}>重置筛选</button>
      </div>

      {!canShip && <p className="notice">运营角色只有订单查看权限，无法执行发货。</p>}
      {message && <p className="success-text">{message}</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="admin-table">
        <div className="admin-row order-admin-head">
          <span>订单号</span><span>金额</span><span>状态</span><span>收货信息</span><span>操作</span>
        </div>
        {filteredOrders.map((order) => (
          <div className="admin-row order-admin-row" key={order.id}>
            <span>{order.orderNo}</span>
            <span>￥{order.price}</span>
            <span>
              <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                {order.statusText}
              </span>
            </span>
            <span>{order.receiver?.name || '用户'} {order.receiver?.phone || ''} {order.address}</span>
            <span className="row-actions">
              <Link className="text-button" to={`/admin/orders/${order.id}`}>详情</Link>
              <button
                className="text-button"
                disabled={!canShip || order.status !== 'paid'}
                title={!canShip ? '运营角色只能查看' : order.status !== 'paid' ? '只有待发货订单可发货' : ''}
                onClick={() => openShipForm(order)}
              >
                发货
              </button>
            </span>
            {shippingId === order.id && (
              <form className="ship-form" onSubmit={(event) => submitShip(event, order)}>
                <input placeholder="快递公司" value={shipForm.company} onChange={(e) => setShipForm({ ...shipForm, company: e.target.value })} required />
                <input placeholder="物流单号" value={shipForm.trackingNo} onChange={(e) => setShipForm({ ...shipForm, trackingNo: e.target.value })} required />
                <button className="button" type="submit">确认发货</button>
                <button className="button ghost" type="button" onClick={() => setShippingId(null)}>取消</button>
              </form>
            )}
          </div>
        ))}
      </div>
      {filteredOrders.length === 0 && <div className="empty-state admin-empty">没有符合条件的订单</div>}
    </section>
  );
};

export default AdminOrdersPage;
