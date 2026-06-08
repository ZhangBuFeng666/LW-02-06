import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const CreateOrderPage = () => {
  const { goodId } = useParams();
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const user = services.user.getCurrentUser();
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState('');
  const [fallbackAddress, setFallbackAddress] = useState('北京市海淀区北京交通大学');
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function loadItems() {
      if (!user) return;
      const list = await services.address.getAddresses(user.id);
      setAddresses(list);
      setAddressId(String(list.find((item) => item.isDefault)?.id || list[0]?.id || ''));
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

  const submit = async () => {
    if (items.length === 0) return alert('没有可结算商品');
    const selected = addresses.find((item) => item.id === Number(addressId));
    const addressText = selected ? `${selected.province}${selected.city}${selected.detail}` : fallbackAddress;
    const order = await services.order.createOrder(user.id, items, addressText, selected?.id || null);
    if (!goodId) await services.cart.clearSelected(user.id);
    navigate(`/pay/${order.id}`);
  };

  return (
    <section className="section order-page">
      <div className="section-title">
        <h1>创建订单</h1>
        <span>确认收货地址与商品清单</span>
      </div>
      {addresses.length > 0 ? (
        <label className="wide-label">
          收货地址
          <select value={addressId} onChange={(e) => setAddressId(e.target.value)}>
            {addresses.map((address) => (
              <option value={address.id} key={address.id}>
                {address.name} {address.phone} - {address.province}{address.city}{address.detail}{address.isDefault ? '（默认）' : ''}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="wide-label">收货地址<input value={fallbackAddress} onChange={(e) => setFallbackAddress(e.target.value)} /></label>
      )}
      <Link className="small-login-link address-shortcut" to="/addresses">管理收货地址</Link>
      <div className="order-items">
        {items.map((item) => (
          <div className="cart-item" key={item.goodId}>
            <img src={item.img} alt={item.name} />
            <div><strong>{item.name}</strong><p>￥{item.price} × {item.count}</p></div>
          </div>
        ))}
      </div>
      <div className="checkout-bar">
        <strong>应付金额 ￥{total}</strong>
        <button className="button" onClick={submit}>提交订单</button>
      </div>
    </section>
  );
};

export default CreateOrderPage;
