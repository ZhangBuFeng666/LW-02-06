import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const CATEGORY_ICONS = { phone: '📱', life: '🧴', food: '🍿', sport: '⚽' };

const CategoryPage = () => {
  const services = useContext(ServiceContext);
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('');
  const [goods, setGoods] = useState([]);
  const [sortOrder, setSortOrder] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [keyword, setKeyword] = useState(() => searchParams.get('search') || '');
  const timerRef = useRef(null);

  useEffect(() => {
    services.good.getCategories().then(setCategories);
  }, [services.good]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = active ? { categoryId: active } : {};
      services.good.getGoodList(params).then(setGoods);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [services.good, active]);

  const doSearch = (kw) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const params = active ? { categoryId: active } : {};
    if (kw) params.keyword = kw;
    services.good.getGoodList(params).then(setGoods);
  };

  const filtered = [...goods]
    .filter((g) => {
      const matchKeyword = !keyword || g.name.toLowerCase().includes(keyword.toLowerCase());
      const min = priceMin ? Number(priceMin) : 0;
      const max = priceMax ? Number(priceMax) : Infinity;
      return matchKeyword && g.price >= min && g.price <= max;
    })
    .sort((a, b) => (sortOrder === 'asc' ? a.price - b.price : sortOrder === 'desc' ? b.price - a.price : 0));

  const categoryName = active ? services.good.getCategoryName(categories, active) : '全部商品';

  return (
    <section className="section split-layout">
      <aside className="side-list">
        <h2>商品分类</h2>
        <button className={active === '' ? 'active' : ''} onClick={() => setActive('')}>
          全部商品
        </button>
        {categories.map((category) => (
          <button className={active === category.id ? 'active' : ''} key={category.id} onClick={() => setActive(category.id)}>
            {CATEGORY_ICONS[category.id] || ''} {category.name}
          </button>
        ))}
      </aside>
      <div className="content-panel">
        <div className="search-row" style={{ marginBottom: 16 }}>
          <input value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') doSearch(keyword); }}
            placeholder="搜索商品名称" />
          <button className="button" onClick={() => doSearch(keyword)}>搜索</button>
        </div>
        <div className="section-title">
          <h2>{categoryName}</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span>共 {goods.length} 件商品</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input type="number" placeholder="¥最低" value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                style={{ width: 64, minHeight: 28, border: '1px solid var(--outline)', borderRadius: 4, padding: '0 6px', background: 'rgba(255,255,255,0.7)', fontSize: 13 }} />
              <span style={{ color: 'var(--on-surface-variant)', fontSize: 13 }}>—</span>
              <input type="number" placeholder="¥最高" value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                style={{ width: 64, minHeight: 28, border: '1px solid var(--outline)', borderRadius: 4, padding: '0 6px', background: 'rgba(255,255,255,0.7)', fontSize: 13 }} />
            </div>
            <button
              className="text-button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? '' : 'asc')}
            >
              价格{sortOrder === 'asc' ? ' ↓' : sortOrder === 'desc' ? ' ↑' : ''}
            </button>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">{keyword ? '未找到匹配商品' : '该分类暂无商品'}</div>
        ) : (
          <div className="product-grid compact">
            {filtered.map((good) => (
                <Link className="product-card" key={good.id} to={`/detail/${good.id}`}>
                  <img src={good.img} alt={good.name} />
                  <div className="product-card-body">
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
