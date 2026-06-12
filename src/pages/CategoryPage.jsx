import { useContext, useEffect, useRef, useState, memo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import { SearchIcon } from '../components/icons';
import { optimizeImageUrl } from '../utils/imageUtil';

const ProductCard = memo(({ good }) => {
  return (
    <Link className="product-card" to={`/detail/${good.id}`}>
      <div className="product-card-media">
        <img src={optimizeImageUrl(good.img, 400)} alt={good.name} loading="lazy" />
      </div>
      <div className="product-card-body">
        <strong className="product-card-name">{good.name}</strong>
        <span className="product-card-price"><i className="cny">￥</i>{good.price}</span>
      </div>
    </Link>
  );
});

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
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;
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

  useEffect(() => {
    setCurrentPage(1);
  }, [active, priceMin, priceMax, sortOrder, keyword]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const paginatedGoods = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
            <span className="filter-count">共 {filtered.length} 件</span>
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
          <>
            <div className="product-grid compact">
              {paginatedGoods.map((good) => (
                <ProductCard key={good.id} good={good} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info" style={{ marginRight: '12px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>第 {currentPage} / {totalPages} 页</span>
                <button
                  className="pagination-btn pagination-arrow"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <span className="arrow">←</span> 上一页
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination-btn${currentPage === p ? ' active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="pagination-btn pagination-arrow"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  下一页 <span className="arrow">→</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default CategoryPage;
