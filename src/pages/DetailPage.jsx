import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';
import { optimizeImageUrl } from '../utils/imageUtil';

const DetailPage = () => {
  const { goodId } = useParams();
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const [good, setGood] = useState(null);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favorite, setFavorite] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [zoomed, setZoomed] = useState(false);
  const user = services.user.getCurrentUser();

  const loadSideData = async () => {
    setReviews(await services.review.getReviews(goodId));
    if (user) {
      const list = await services.favorite.getFavorites(user.id, goodId);
      setFavorite(list[0] || null);
    }
  };

  useEffect(() => {
    services.good.getCategories().then(setCategories);
    services.good.getGoodById(goodId).then(setGood).catch((err) => setError(err.message));
    loadSideData();
  }, [goodId]);

  const requireLogin = () => {
    if (!user) {
      navigate('/login');
      return null;
    }
    return user;
  };

  const addCart = async () => {
    if (!requireLogin() || !good) return;
    await services.cart.addItem(user.id, good.id, 1);
    setMessage('已加入购物车');
  };

  const toggleFavorite = async () => {
    if (!requireLogin() || !good) return;
    if (favorite) await services.favorite.removeFavorite(favorite.id);
    else await services.favorite.addFavorite(user.id, good.id);
    await loadSideData();
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!requireLogin()) return;
    await services.review.addReview({ userId: user.id, goodId: Number(goodId), rating, content: reviewText });
    setReviewText('');
    setRating(5);
    await loadSideData();
  };

  const buyNow = () => {
    if (!requireLogin() || !good) return;
    navigate(`/createOrder/${good.id}`);
  };

  if (error) return (
    <section className="empty-state">
      <p>商品不存在或已下架</p>
      <Link to="/home" className="primary-link" style={{ marginTop: 12 }}>返回首页</Link>
    </section>
  );
  if (!good) return <section className="empty-state">商品加载中...</section>;

  return (
    <>
      <section className="detail-layout animate-fade-rise">
        <img className="detail-image img-hover-zoom" src={optimizeImageUrl(good.img, 800)} alt={good.name}
          onClick={() => setZoomed(true)} style={{ cursor: 'zoom-in' }}
        />
        <div className="detail-info animate-stagger">
          <span className="tag">{services.good.getCategoryName(categories, good.categoryId)}</span>
          <h1>{good.name}</h1>
          <p>{good.desc}</p>
          <div className="price">￥{good.price}</div>
          <p>库存：{good.stock}</p>
          <div className="actions">
            <button className="button secondary" onClick={addCart}>加入购物车</button>
            <button className="button" onClick={buyNow}>立即购买</button>
            <button className="button ghost" onClick={toggleFavorite}>{favorite ? '已收藏' : '收藏'}</button>
          </div>
          {message && <p className="success-text">{message}</p>}
        </div>
      </section>
      <section className="section review-section animate-fade-rise" style={{ animationDelay: '200ms' }}>
        <div className="section-title">
          <h2>商品评价</h2>
          <span>{reviews.length} 条评价</span>
        </div>
        <form className="review-form" onSubmit={submitReview}>
          <div className="star-picker">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`star-btn${n <= rating ? ' active' : ''}`}
                onClick={() => setRating(n)}
                aria-label={`${n} 星`}
              >
                {n <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
          <input placeholder="写下你的使用感受" value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
          <button className="button" type="submit">发布评价</button>
        </form>
        <div className="review-list animate-stagger">
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--on-surface-variant)', padding: '12px 0' }}>
              暂无评价，成为第一个评价的人
            </p>
          ) : (
            reviews.map((review) => (
              <div className="review-item" key={review.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{review.nickname}</strong>
                  <span className="status-badge paid">{review.rating} 星</span>
                </div>
                <p>{review.content}</p>
                <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{review.createTime}</span>
              </div>
            ))
          )}
        </div>
      </section>
      {zoomed && (
        <div className="image-zoom-overlay" onClick={() => setZoomed(false)}>
          <img className="image-zoom-preview" src={optimizeImageUrl(good.img, 1200)} alt={good.name} />
        </div>
      )}
    </>
  );
};

export default DetailPage;
