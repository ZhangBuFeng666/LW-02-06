import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const FavoritePage = () => {
  const services = useContext(ServiceContext);
  const user = services.user.getCurrentUser();
  const [favorites, setFavorites] = useState([]);

  const load = async () => {
    if (user) setFavorites(await services.favorite.getFavorites(user.id));
  };

  useEffect(() => {
    load();
  }, []);

  if (!user) return <section className="empty-state">请先登录后查看收藏 <Link to="/login">去登录</Link></section>;

  if (favorites.length === 0) return (
    <section className="empty-state animate-fade-rise">
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 48, margin: '0 0 12px' }}>❤️</p>
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>收藏夹是空的</p>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: 16 }}>去发现心仪的商品，点击收藏</p>
        <Link to="/home" className="primary-link">去逛逛</Link>
      </div>
    </section>
  );

  const removeFavorite = async (item) => {
    if (!window.confirm(`确定取消收藏「${item.good.name}」吗？`)) return;
    await services.favorite.removeFavorite(item.id);
    load();
  };

  return (
    <section className="section animate-fade-rise">
      <div className="section-title">
        <h1>我的收藏</h1>
        <span>共 {favorites.length} 件商品</span>
      </div>
      <div className="product-grid compact animate-stagger">
        {favorites.map((item) => (
          <div className="product-card" key={item.id}>
            <Link to={`/detail/${item.good.id}`}>
              <img src={item.good.img} alt={item.good.name} />
              <div className="product-card-body">
                <strong>{item.good.name}</strong>
                <span>￥{item.good.price}</span>
              </div>
            </Link>
            <button className="text-button danger favorite-remove" onClick={() => removeFavorite(item)}>取消收藏</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FavoritePage;
