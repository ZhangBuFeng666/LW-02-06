import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const CATEGORY_ICONS = { phone: '📱', life: '🧴', food: '🍿', sport: '⚽' };

const CategoryPage = () => {
  const services = useContext(ServiceContext);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('');
  const [goods, setGoods] = useState([]);
  const [sortOrder, setSortOrder] = useState('');

  useEffect(() => {
    services.good.getCategories().then((list) => {
      setCategories(list);
      setActive(list[0]?.id || '');
    });
  }, [services.good]);

  useEffect(() => {
    if (!active) return;
    services.good.getGoodList({ categoryId: active }).then(setGoods);
  }, [services.good, active]);

  return (
    <section className="section split-layout">
      <aside className="side-list">
        <h2>商品分类</h2>
        {categories.map((category) => (
          <button className={active === category.id ? 'active' : ''} key={category.id} onClick={() => setActive(category.id)}>
            {CATEGORY_ICONS[category.id] || ''} {category.name}
          </button>
        ))}
      </aside>
      <div className="content-panel">
        <div className="section-title">
          <h2>{services.good.getCategoryName(categories, active)}</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>共 {goods.length} 件商品</span>
            <button
              className="text-button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? '' : 'asc')}
            >
              价格{sortOrder === 'asc' ? ' ↓' : sortOrder === 'desc' ? ' ↑' : ''}
            </button>
          </div>
        </div>
        {goods.length === 0 ? (
          <div className="empty-state">该分类暂无商品</div>
        ) : (
          <div className="product-grid compact">
            {[...goods]
              .sort((a, b) => (sortOrder === 'asc' ? a.price - b.price : sortOrder === 'desc' ? b.price - a.price : 0))
              .map((good) => (
                <Link className="product-card" key={good.id} to={`/detail/${good.id}`}>
                  <img src={good.img} alt={good.name} />
                  <div className="product-card-overlay">
                    <strong>{good.name}</strong>
                    <span>￥{good.price}</span>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryPage;
