import { useContext, useEffect, useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import { optimizeImageUrl } from '../utils/imageUtil';

const ProductSlideCard = memo(({ good }) => {
  return (
    <Link className="apple-slide-card" to={`/detail/${good.id}`}>
      <img src={optimizeImageUrl(good.img, 400)} alt={good.name} loading="lazy" />
      <div className="apple-slide-card-body">
        <strong>{good.name}</strong>
        <span>￥{good.price}</span>
      </div>
    </Link>
  );
});

const HERO_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1800&q=82',
    title: 'Samsung 智能数码专区',
    subtitle: '科技改变日常。Galaxy S24 Ultra 旗舰好物现已登场',
    tag: '三星品牌特惠 · 极速配送',
  },
  {
    img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1800&q=82',
    title: 'IKEA 北欧居家美学',
    subtitle: '斯堪的纳维亚设计的温馨体验，用极简点亮生活细节',
    tag: '宜家专区 · 满百包邮',
  },
  {
    img: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1800&q=82',
    title: 'Bala 莫兰迪健身生活',
    subtitle: '把优雅融入阻力与拉伸，让每一次居家律动更自在',
    tag: 'Bala 运动专区 · 满分推荐',
  },
  {
    img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=82',
    title: 'Blue Bottle 咖啡文化',
    subtitle: '致敬每一杯纯净的手冲咖啡，让咖啡香气溢满晨间',
    tag: '蓝瓶咖啡豆与周边专场',
  },
];

const HomePage = () => {
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [goods, setGoods] = useState([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    services.good.getGoodList().then((list) => setGoods(list));
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
          <p className="eyebrow apple-font-accent">React Mall</p>
          <h1>{HERO_SLIDES[slide].title}</h1>
          <p className="hero-subtitle">{HERO_SLIDES[slide].subtitle}</p>
          <div className="apple-search-row">
            <input value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') goSearch(); }}
              placeholder="搜索三星、宜家、Bala、蓝瓶咖啡..." />
            <button onClick={goSearch}>搜索</button>
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
          <span className="apple-font-accent">01</span>
          <strong>今日精选</strong>
          <p>从通勤数码到居家小物，挑选属于您的质感生活。</p>
        </div>
        <div>
          <span className="apple-font-accent">02</span>
          <strong>轻松选购</strong>
          <p>将心仪好物加入购物车，享受极简顺畅的结算流程。</p>
        </div>
        <div>
          <span className="apple-font-accent">03</span>
          <strong>品牌保证</strong>
          <p>精选四大官方来源好物，杜绝山寨与嘈杂的促销宣传。</p>
        </div>
      </section>

      <section className="apple-split-grid">
        <Link className="apple-promo-card" to="/category?cat=life" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.05)), url(https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80)` }}>
          <div className="apple-promo-content">
            <p className="eyebrow">IKEA 居家美学</p>
            <h3>营造宁静温馨的专属角落</h3>
            <p>挑选经典的北欧设计，从舒适的沙发椅到暖光工作台灯，让家充满呼吸感与诗意。</p>
          </div>
        </Link>
        <Link className="apple-promo-card" to="/category?cat=sport" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.05)), url(https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1000&q=80)` }}>
          <div className="apple-promo-content">
            <p className="eyebrow">Bala 运动美学</p>
            <h3>用优雅阻力激活核心力量</h3>
            <p>加厚双面防滑瑜伽拉伸垫，极具设计感的哑铃球，为日常锻炼增添一份低饱和度色彩。</p>
          </div>
        </Link>
      </section>

      <section className="apple-slider-wrapper">
        <div className="section-title">
          <h2>热门商品推荐</h2>
          <span>左右滑动浏览三星、宜家、Bala及蓝瓶咖啡的精选好物</span>
        </div>
        <div className="apple-slider">
          {goods.map((good) => (
            <ProductSlideCard key={good.id} good={good} />
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;

