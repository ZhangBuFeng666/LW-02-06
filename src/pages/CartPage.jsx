import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import { CartIcon } from '../components/icons';

const CartPage = () => {
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const user = services.user.getCurrentUser();
  const [cart, setCart] = useState([]);

  const loadCart = async () => {
    if (user) setCart(await services.cart.getCart(user.id));
  };

  useEffect(() => {
    loadCart();
  }, []);

  if (!user) return <section className="empty-state">请先登录后查看购物车 <Link to="/login">去登录</Link></section>;

  if (cart.length === 0) return (
    <section className="empty-state animate-fade-rise">
      <div style={{ textAlign: 'center' }}>
        <p style={{ display: 'flex', justifyContent: 'center', margin: '0 0 12px', color: 'var(--on-surface-variant)' }}>
          <CartIcon width={48} height={48} strokeWidth={1.4} />
        </p>
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>购物车是空的</p>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: 16 }}>去发现心仪的商品吧</p>
        <Link to="/home" className="primary-link">去逛逛</Link>
      </div>
    </section>
  );

  const selected = cart.filter((item) => item.selected);
  const total = selected.reduce((sum, item) => sum + item.good.price * item.count, 0);

  const updateCount = async (item, delta) => {
    const newCount = item.count + delta;
    if (newCount < 1) return;
    await services.cart.updateItem(item.id, { count: newCount });
    loadCart();
  };

  const removeItem = async (item) => {
    if (!window.confirm(`确定删除「${item.good.name}」吗？`)) return;
    await services.cart.removeItem(item.id);
    loadCart();
  };

  const checkout = () => {
    if (selected.length === 0) {
      alert('请先选择要结算的商品');
      return;
    }
    navigate('/createOrder');
  };

  return (
    <section className="section animate-fade-rise">
      <div className="section-title">
        <h1>购物车</h1>
        <span>共 {cart.length} 件商品</span>
      </div>
      <div className="cart-list animate-stagger">
        {cart.map((item) => (
          <div className="cart-item" key={item.id}>
            <input type="checkbox" checked={item.selected} onChange={async () => { await services.cart.updateItem(item.id, { selected: !item.selected }); loadCart(); }} />
            <img src={item.good.img} alt={item.good.name} className="img-hover-zoom" style={{ borderRadius: 6 }} />
            <div>
              <Link to={`/detail/${item.good.id}`}>{item.good.name}</Link>
              <p className="price" style={{ fontSize: 16, marginTop: 4 }}>￥{item.good.price}</p>
            </div>
            <div className="qty-control">
              <button onClick={() => updateCount(item, -1)} disabled={item.count <= 1}>−</button>
              <span>{item.count}</span>
              <button onClick={() => updateCount(item, 1)}>+</button>
            </div>
            <button className="text-button danger" onClick={() => removeItem(item)}>删除</button>
          </div>
        ))}
      </div>
      <div className="checkout-bar">
        <strong>已选 {selected.length} 件，合计 <span className="price">￥{total}</span></strong>
        <button className="button" onClick={checkout}>去结算</button>
      </div>
    </section>
  );
};

export default CartPage;
