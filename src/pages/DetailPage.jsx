import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

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

  if (error) return <section className="empty-state">{error}</section>;
  if (!good) return <section className="empty-state">商品加载中...</section>;

  return (
    <>
      <section className="detail-layout">
        <img className="detail-image" src={good.img} alt={good.name} />
        <div className="detail-info">
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
      <section className="section review-section">
        <div className="section-title">
          <h2>商品评价</h2>
          <span>{reviews.length} 条评价</span>
        </div>
        <form className="review-form" onSubmit={submitReview}>
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="5">5 星</option>
            <option value="4">4 星</option>
            <option value="3">3 星</option>
          </select>
          <input placeholder="写下你的使用感受" value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
          <button className="button" type="submit">发布评价</button>
        </form>
        <div className="review-list">
          {reviews.map((review) => (
            <div className="review-item" key={review.id}>
              <strong>{review.nickname} · {review.rating} 星</strong>
              <p>{review.content}</p>
              <span>{review.createTime}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default DetailPage;
