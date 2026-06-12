import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import { SearchIcon } from '../components/icons';

const CategoryPage = () => {
  const services = useContext(ServiceContext);
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState(() => searchParams.get('cat') || '');
  const [prevCat, setPrevCat] = useState(() => searchParams.get('cat') || '');
  const [goods, setGoods] = useState([]);
  const [sortOrder, setSortOrder] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [keyword, setKeyword] = useState(() => searchParams.get('search') || '');
  const timerRef = useRef(null);

  // 顶栏分类跳转只改 URL，组件不会重挂载，按 React 推荐方式在渲染期同步 active
  const catParam = searchParams.get('cat') || '';
  if (catParam !== prevCat) {
    setPrevCat(catParam);
    setActive(catParam);
  }

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
    <section className="section">
      <div className="content-panel">
        <div className="search-row">
          <span className="search-pill">
            <SearchIcon className="search-pill-icon" width={18} height={18} />
            <input value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') doSearch(keyword); }}
              placeholder="搜索商品名称" />
          </span>
        </div>
        <div className="section-title">
          <h2>{categoryName}</h2>
          <div className="filter-bar">
            <span className="filter-count">共 {goods.length} 件</span>
            <span className="filter-pill filter-range">
              <input type="number" placeholder="¥最低" value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)} />
              <span className="filter-range-sep">—</span>
              <input type="number" placeholder="¥最高" value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)} />
            </span>
            <button
              className={`filter-pill filter-sort${sortOrder ? ' active' : ''}`}
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
                  <div className="product-card-media">
                    <img src={good.img} alt={good.name} />
                  </div>
                  <div className="product-card-body">
                    <strong className="product-card-name">{good.name}</strong>
                    <span className="product-card-price"><i className="cny">￥</i>{good.price}</span>
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
