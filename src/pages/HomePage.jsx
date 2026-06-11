import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const HERO_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1800&q=82',
    title: '夏日焕新季',
    subtitle: '数码·生活·零食·运动，好物低至 ¥15 起',
    tag: '全场满 99 包邮',
  },
  {
    img: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=1800&q=82',
    title: '限时特惠',
    subtitle: '精选爆款直降，限时抢购中',
    tag: '每日 10:00 开抢',
  },
  {
    img: 'https://images.unsplash.com/photo-1561715276-a2d087060f1d?auto=format&fit=crop&w=1800&q=82',
    title: '数码狂欢节',
    subtitle: '手机、耳机、充电宝，开学装备一站购齐',
    tag: '学生专享 9 折',
  },
];

const HomePage = () => {
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [goods, setGoods] = useState([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    services.good.getGoodList().then((list) => setGoods(list.slice(0, 8)));
  }, [services.good]);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const goSearch = () => {
    const kw = keyword.trim();
    if (kw) {
      navigate(`/category?search=${encodeURIComponent(kw)}`);
    } else {
      navigate('/category');
    }
  };

  return (
    <>
      <section className="hero-band" style={{ backgroundImage: `linear-gradient(90deg, rgba(25,45,42,0.65), rgba(25,45,42,0.25), rgba(25,45,42,0.04)), url(${HERO_SLIDES[slide].img})` }}>
        <div className="hero-copy">
          <p className="eyebrow">React Mall</p>
          <h1>{HERO_SLIDES[slide].title}</h1>
          <p className="hero-subtitle">{HERO_SLIDES[slide].subtitle}</p>
          <div className="search-row">
            <input value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') goSearch(); }}
              placeholder="搜索商品名称" />
            <button className="button" onClick={goSearch}>搜索</button>
          </div>
        </div>
        <p className="hero-tag">{HERO_SLIDES[slide].tag}</p>
        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={i === slide ? 'active' : ''} onClick={() => setSlide(i)} />
          ))}
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
          {goods.slice(0, 4).map((good) => (
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
              <div className="product-card-body">
                <strong>{good.name}</strong>
                <span>￥{good.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;
