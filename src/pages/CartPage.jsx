import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

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

  const selected = cart.filter((item) => item.selected);
  const total = selected.reduce((sum, item) => sum + item.good.price * item.count, 0);

  const checkout = () => {
    if (selected.length === 0) {
      alert('请先选择要结算的商品');
      return;
    }
    navigate('/createOrder');
  };

  return (
    <section className="section">
      <div className="section-title">
        <h1>购物车</h1>
        <span>修改数量，选择本次结算的商品</span>
      </div>
      <div className="cart-list">
        {cart.map((item) => (
          <div className="cart-item" key={item.id}>
            <input type="checkbox" checked={item.selected} onChange={async () => { await services.cart.updateItem(item.id, { selected: !item.selected }); loadCart(); }} />
            <img src={item.good.img} alt={item.good.name} />
            <div>
              <Link to={`/detail/${item.good.id}`}>{item.good.name}</Link>
              <p>￥{item.good.price}</p>
            </div>
            <input className="count-input" type="number" min="1" value={item.count} onChange={async (e) => { await services.cart.updateItem(item.id, { count: e.target.value }); loadCart(); }} />
            <button className="text-button danger" onClick={async () => { await services.cart.removeItem(item.id); loadCart(); }}>删除</button>
          </div>
        ))}
      </div>
      <div className="checkout-bar">
        <strong>已选 {selected.length} 件，合计 ￥{total}</strong>
        <button className="button" onClick={checkout}>去结算</button>
      </div>
    </section>
  );
};

export default CartPage;
