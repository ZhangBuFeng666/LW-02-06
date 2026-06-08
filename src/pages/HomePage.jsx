import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const HomePage = () => {
  const services = useContext(ServiceContext);
  const [keyword, setKeyword] = useState('');
  const [goods, setGoods] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    services.good.getCategories().then(setCategories);
  }, [services.good]);

  useEffect(() => {
    services.good.getGoodList({ keyword }).then((list) => setGoods(list.slice(0, 8)));
  }, [services.good, keyword]);

  return (
    <>
      <section className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">React Mall</p>
          <h1>新季好物上新，为日常添一点精致</h1>
          <p className="hero-subtitle">数码、生活、零食与运动精选好物，一站挑选，轻松带回家。</p>
          <div className="search-row">
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索商品名称" />
            <Link className="button" to="/category">查看分类</Link>
          </div>
        </div>
      </section>

      <section className="section feature-strip">
        <div>
          <span>01</span>
          <strong>今日精选</strong>
          <p>从通勤数码到居家小物，挑出更适合日常的选择。</p>
        </div>
        <div>
          <span>02</span>
          <strong>轻松选购</strong>
          <p>喜欢的商品先放进购物车，再一起结算更从容。</p>
        </div>
        <div>
          <span>03</span>
          <strong>新品常备</strong>
          <p>热门商品持续更新，把新鲜感留在每一次打开商城时。</p>
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <h2>本周推荐</h2>
          <span>值得先看一眼的人气选择</span>
        </div>
        <div className="banner-strip">
          {goods.slice(0, 3).map((good) => (
            <Link className="banner-card" key={good.id} to={`/detail/${good.id}`}>
              <img src={good.img} alt={good.name} />
              <div>
                <strong>{good.name}</strong>
                <span>￥{good.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <h2>热门商品</h2>
          <span>为学习、通勤和休闲准备的实用好物</span>
        </div>
        <div className="product-grid">
          {goods.map((good) => (
            <Link className="product-card" key={good.id} to={`/detail/${good.id}`}>
              <img src={good.img} alt={good.name} />
              <div className="product-body">
                <strong>{good.name}</strong>
                <span>{services.good.getCategoryName(categories, good.categoryId)}</span>
                <p>{good.desc}</p>
                <b>￥{good.price}</b>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;
