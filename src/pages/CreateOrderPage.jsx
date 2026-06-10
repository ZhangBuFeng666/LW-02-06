import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const emptyAddrForm = { name: '', phone: '', province: '北京市', city: '海淀区', detail: '' };

const CreateOrderPage = () => {
  const { goodId } = useParams();
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const user = services.user.getCurrentUser();
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState('');
  const [items, setItems] = useState([]);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState(emptyAddrForm);
  const [submitting, setSubmitting] = useState(false);

  const loadAddresses = async (uid) => {
    const list = await services.address.getAddresses(uid);
    setAddresses(list);
    if (!addressId) {
      setAddressId(String(list.find((item) => item.isDefault)?.id || list[0]?.id || ''));
    }
    return list;
  };

  useEffect(() => {
    async function loadItems() {
      if (!user) return;
      await loadAddresses(user.id);
      if (goodId) {
        const good = await services.good.getGoodById(goodId);
        setItems([{ goodId: good.id, count: 1, price: good.price, name: good.name, img: good.img }]);
        return;
      }
      const cart = await services.cart.getCart(user.id);
      setItems(cart.filter((item) => item.selected).map((item) => ({
        goodId: item.good.id,
        count: item.count,
        price: item.good.price,
        name: item.good.name,
        img: item.good.img,
      })));
    }
    loadItems();
  }, [goodId]);

  if (!user) return <section className="empty-state">请先登录后创建订单 <Link to="/login">去登录</Link></section>;

  const total = items.reduce((sum, item) => sum + item.price * item.count, 0);

  const addAddress = async (e) => {
    e.preventDefault();
    const newAddr = await services.address.addAddress({ ...addrForm, userId: user.id });
    setShowAddrForm(false);
    setAddrForm(emptyAddrForm);
    const list = await loadAddresses(user.id);
    setAddressId(String(newAddr.id || list[list.length - 1]?.id || ''));
  };

  const submit = async () => {
    if (items.length === 0) return alert('没有可结算商品');
    setSubmitting(true);
    const selected = addresses.find((item) => item.id === Number(addressId));
    const addressText = selected
      ? `${selected.province}${selected.city}${selected.detail}`
      : '北京市海淀区北京交通大学';
    const order = await services.order.createOrder(user.id, items, addressText, selected?.id || null);
    if (!goodId) await services.cart.clearSelected(user.id);
    navigate(`/pay/${order.id}`);
  };

  return (
    <section className="section order-page animate-fade-rise">
      <div className="section-title">
        <h1>创建订单</h1>
        <span>确认收货地址与商品清单</span>
      </div>

      {/* 收货地址选择 */}
      <p style={{ fontWeight: 600, marginBottom: 10 }}>收货地址</p>
      {addresses.length > 0 ? (
        <div className="address-cards animate-stagger">
          {addresses.map((address) => (
            <div
              className={`address-card${addressId === String(address.id) ? ' selected' : ''}`}
              key={address.id}
              onClick={() => setAddressId(String(address.id))}
            >
              <div className="address-card-radio" />
              <div className="address-card-info">
                <strong>{address.name} {address.phone}</strong>
                <p>{address.province}{address.city}{address.detail}</p>
              </div>
              {address.isDefault && <span className="address-card-default">默认</span>}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: 12 }}>暂无收货地址，请新增</p>
      )}

      {/* 新增地址 */}
      {showAddrForm ? (
        <form className="admin-form animate-fade-rise" onSubmit={addAddress} style={{ marginBottom: 12 }}>
          <input placeholder="收货人" value={addrForm.name} onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })} required />
          <input placeholder="手机号" value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} required />
          <input placeholder="省份" value={addrForm.province} onChange={(e) => setAddrForm({ ...addrForm, province: e.target.value })} required />
          <input placeholder="城市/区" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} required />
          <input placeholder="详细地址" value={addrForm.detail} onChange={(e) => setAddrForm({ ...addrForm, detail: e.target.value })} required />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="button" type="submit">保存</button>
            <button className="button ghost" type="button" onClick={() => setShowAddrForm(false)}>取消</button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <button className="text-button" onClick={() => setShowAddrForm(true)}>+ 新增收货地址</button>
          <Link className="small-login-link" to="/addresses">管理收货地址</Link>
        </div>
      )}

      {/* 商品清单 */}
      <p style={{ fontWeight: 600, marginBottom: 10 }}>商品清单</p>
      <div className="order-items animate-stagger">
        {items.map((item) => (
          <div className="cart-item" key={item.goodId}>
            <img src={item.img} alt={item.name} style={{ borderRadius: 6 }} />
            <div>
              <strong>{item.name}</strong>
              <p className="price" style={{ fontSize: 16, marginTop: 4 }}>￥{item.price}</p>
            </div>
            <div className="qty-control">
              <button onClick={() => { const updated = items.map((i) => i.goodId === item.goodId ? { ...i, count: Math.max(1, i.count - 1) } : i); setItems(updated); }} disabled={item.count <= 1}>−</button>
              <span>{item.count}</span>
              <button onClick={() => { const updated = items.map((i) => i.goodId === item.goodId ? { ...i, count: i.count + 1 } : i); setItems(updated); }}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="checkout-bar">
        <strong style={{ fontSize: 18 }}>应付金额 <span className="price">￥{total}</span></strong>
        <button className="button" onClick={submit} disabled={submitting}>
          {submitting ? '提交中...' : '提交订单'}
        </button>
      </div>
    </section>
  );
};

export default CreateOrderPage;
