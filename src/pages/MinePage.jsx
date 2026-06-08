import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const MinePage = () => {
  const services = useContext(ServiceContext);
  const user = services.user.getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user) {
      services.order.getOrdersByUser(user.id).then(setOrders);
      services.favorite.getFavorites(user.id).then(setFavorites);
    }
  }, []);

  if (!user) return <section className="empty-state">请先登录后查看我的页面 <Link to="/login">去登录</Link></section>;

  return (
    <section className="section profile-page">
      <div className="profile-head">
        <div className="avatar">{user.nickname.slice(0, 1).toUpperCase()}</div>
        <div>
          <h1>{user.nickname}</h1>
          <p>用户名：{user.username}</p>
        </div>
      </div>
      <div className="stat-grid">
        <Link to="/cart"><strong>购物车</strong><span>查看已选商品</span></Link>
        <Link to="/orderList"><strong>{orders.length}</strong><span>我的订单</span></Link>
        <Link to="/addresses"><strong>地址</strong><span>管理收货信息</span></Link>
        <Link to="/favorites"><strong>{favorites.length}</strong><span>我的收藏</span></Link>
      </div>
    </section>
  );
};

export default MinePage;
