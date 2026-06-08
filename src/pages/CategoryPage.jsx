import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const CategoryPage = () => {
  const services = useContext(ServiceContext);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('');
  const [goods, setGoods] = useState([]);

  useEffect(() => {
    services.good.getCategories().then((list) => {
      setCategories(list);
      setActive(list[0]?.id || '');
    });
  }, [services.good]);

  useEffect(() => {
    services.good.getGoodList({ categoryId: active }).then(setGoods);
  }, [services.good, active]);

  return (
    <section className="section split-layout">
      <aside className="side-list">
        <h2>商品分类</h2>
        {categories.map((category) => (
          <button className={active === category.id ? 'active' : ''} key={category.id} onClick={() => setActive(category.id)}>
            {category.name}
          </button>
        ))}
      </aside>
      <div className="content-panel">
        <div className="section-title">
          <h2>{services.good.getCategoryName(categories, active)}</h2>
          <span>共 {goods.length} 件商品</span>
        </div>
        <div className="product-grid compact">
          {goods.map((good) => (
            <Link className="product-card" key={good.id} to={`/detail/${good.id}`}>
              <img src={good.img} alt={good.name} />
              <div className="product-body">
                <strong>{good.name}</strong>
                <b>￥{good.price}</b>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryPage;
