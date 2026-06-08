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

  return (
    <section className="section">
      <div className="section-title">
        <h1>我的收藏</h1>
        <span>常看的商品可以先放在这里</span>
      </div>
      <div className="product-grid compact">
        {favorites.map((item) => (
          <div className="product-card" key={item.id}>
            <Link to={`/detail/${item.good.id}`}>
              <img src={item.good.img} alt={item.good.name} />
              <div className="product-body">
                <strong>{item.good.name}</strong>
                <b>￥{item.good.price}</b>
              </div>
            </Link>
            <button className="text-button danger favorite-remove" onClick={async () => { await services.favorite.removeFavorite(item.id); load(); }}>取消收藏</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FavoritePage;
