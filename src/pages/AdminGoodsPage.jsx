import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const emptyForm = { name: '', price: '', categoryId: 'phone', stock: '', status: 'on', img: '', desc: '' };
const initialFilters = { keyword: '', categoryId: '', status: 'all' };

const AdminGoodsPage = () => {
  const services = useContext(ServiceContext);
  const goodService = services.good;
  const adminService = services.admin;
  const navigate = useNavigate();
  const admin = adminService.getCurrentAdmin();
  const canManage = adminService.canManageGoods();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [goods, setGoods] = useState([]);
  const [allGoods, setAllGoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchGoodsData = useCallback(() => (
    Promise.all([
      goodService.getGoodList({ includeOff: true, keyword: filters.keyword, categoryId: filters.categoryId }),
      goodService.getGoodList({ includeOff: true }),
      goodService.getCategories(),
    ])
  ), [goodService, filters.keyword, filters.categoryId]);

  const loadGoods = useCallback(async () => {
    const [nextGoods, nextAllGoods, nextCategories] = await fetchGoodsData();
    setGoods(nextGoods);
    setAllGoods(nextAllGoods);
    setCategories(nextCategories);
  }, [fetchGoodsData]);

  useEffect(() => {
    let active = true;
    fetchGoodsData().then(([nextGoods, nextAllGoods, nextCategories]) => {
      if (!active) return;
      setGoods(nextGoods);
      setAllGoods(nextAllGoods);
      setCategories(nextCategories);
    });
    return () => {
      active = false;
    };
  }, [fetchGoodsData]);

  const filteredGoods = useMemo(() => {
    if (filters.status === 'all') return goods;
    return goods.filter((good) => (filters.status === 'off' ? good.status === 'off' : good.status !== 'off'));
  }, [goods, filters.status]);

  const stats = useMemo(() => ({
    total: allGoods.length,
    on: allGoods.filter((good) => good.status !== 'off').length,
    off: allGoods.filter((good) => good.status === 'off').length,
    warning: allGoods.filter((good) => Number(good.stock) <= 50).length,
  }), [allGoods]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowModal(false);
  };

  const edit = (good) => {
    if (!canManage) {
      setMessage('运营角色只能查看商品，不能编辑。');
      return;
    }
    setEditingId(good.id);
    setForm({
      name: good.name || '',
      price: String(good.price ?? ''),
      categoryId: good.categoryId || 'phone',
      stock: String(good.stock ?? ''),
      status: good.status || 'on',
      img: good.img || '',
      desc: good.desc || '',
    });
    setMessage('');
    setError('');
    setShowModal(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!canManage) {
      setMessage('运营角色只有查看权限，无法保存商品。');
      return;
    }
    if (Number(form.price) <= 0) {
      setError('商品价格必须大于 0。');
      return;
    }
    if (Number(form.stock) < 0) {
      setError('库存不能小于 0。');
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock || 0),
    };

    if (editingId) await goodService.updateGood({ ...payload, id: editingId });
    else await goodService.addGood(payload);
    resetForm();
    setMessage(editingId ? '商品已更新，前台重新进入列表即可看到最新信息。' : '商品已新增，上架状态商品会出现在前台列表。');
    await loadGoods();
  };

  const toggleStatus = async (good) => {
    if (!canManage) {
      setMessage('运营角色只能查看商品，不能上下架。');
      return;
    }
    await goodService.toggleStatus(good.id);
    setMessage(`${good.name} 已${good.status === 'off' ? '上架' : '下架'}。`);
    await loadGoods();
  };

  const remove = async (good) => {
    if (!canManage) {
      setMessage('运营角色只能查看商品，不能删除。');
      return;
    }
    if (!window.confirm(`确认删除商品「${good.name}」？删除后购物车和收藏中的关联项也会被清理。`)) return;
    await goodService.deleteGood(good.id);
    setMessage(`已删除商品：${good.name}`);
    await loadGoods();
  };

  const logout = () => {
    adminService.logout();
    navigate('/admin/login');
  };

  return (
    <section className="admin-page">
      <div className="admin-head">
        <div>
          <h1>后台商品管理</h1>
          <p>{admin.username} · {admin.roleName} · 权限：{adminService.getPermissionText(admin)}</p>
        </div>
        <div className="row-actions">
          {canManage && (
            <button className="button" onClick={() => { resetForm(); setShowModal(true); }}>
              + 新增商品
            </button>
          )}
          <Link className="button secondary" to="/admin/orders">订单管理</Link>
          <button className="button ghost" onClick={logout}>退出后台</button>
        </div>
      </div>

      <div className="admin-stats">
        <div><span>商品总数</span><strong>{stats.total}</strong></div>
        <div><span>已上架</span><strong>{stats.on}</strong></div>
        <div><span>已下架</span><strong>{stats.off}</strong></div>
        <div><span>库存预警</span><strong>{stats.warning}</strong></div>
      </div>

      <div className="admin-filters">
        <input
          placeholder="搜索商品名称"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
        <select value={filters.categoryId} onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}>
          <option value="">全部分类</option>
          {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="all">全部状态</option>
          <option value="on">只看上架</option>
          <option value="off">只看下架</option>
        </select>
        <button className="button ghost" type="button" onClick={() => setFilters(initialFilters)}>重置筛选</button>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={resetForm}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <form className="admin-modal-form" onSubmit={submit}>
              <div className="admin-form-title">
                <strong>{editingId ? '编辑商品' : '新增商品'}</strong>
                <button className="text-button" type="button" onClick={resetForm}>关闭</button>
              </div>
              
              <label className="admin-field">
                <span>商品名称</span>
                <input placeholder="例如：静音便携小风扇" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={!canManage} />
              </label>
              
              <label className="admin-field">
                <span>商品价格（元）</span>
                <input placeholder="例如：99.00" type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required disabled={!canManage} />
              </label>
              
              <label className="admin-field">
                <span>所属分类</span>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} disabled={!canManage}>
                  {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
                </select>
              </label>
              
              <label className="admin-field">
                <span>库存数量</span>
                <input placeholder="例如：100" type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required disabled={!canManage} />
              </label>
              
              <label className="admin-field">
                <span>上下架状态</span>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} disabled={!canManage}>
                  <option value="on">上架</option>
                  <option value="off">下架</option>
                </select>
              </label>
              
              <label className="admin-field">
                <span>商品图片地址</span>
                <input placeholder="https://..." value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} disabled={!canManage} />
              </label>
              
              <label className="admin-field admin-form-wide">
                <span>商品描述</span>
                <input placeholder="填写商品卖点、规格或说明" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} disabled={!canManage} />
              </label>
              
              {error && <p className="error-text admin-form-wide">{error}</p>}
              
              <div className="admin-form-actions">
                <button className="button ghost" type="button" onClick={resetForm}>取消</button>
                <button className="button" type="submit" disabled={!canManage}>
                  {editingId ? '保存修改' : '确认新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!canManage && <p className="notice">运营角色只有查看权限，无法新增、编辑、删除或上下架。</p>}
      {message && <p className="success-text">{message}</p>}

      <div className="admin-table">
        <div className="admin-row admin-row-head">
          <span>商品</span><span>分类</span><span>价格</span><span>库存</span><span>状态</span><span>操作</span>
        </div>
        {filteredGoods.map((good) => (
          <div className="admin-row" key={good.id}>
            <div className="admin-product-cell">
              <img 
                src={good.img || '/icons.svg'} 
                alt={good.name} 
                className="admin-product-img" 
                onError={(e) => { e.target.src = '/icons.svg'; }} 
              />
              <div className="admin-product-info">
                <span className="admin-product-name">{good.name}</span>
                {good.desc && <span className="admin-product-desc">{good.desc}</span>}
              </div>
            </div>
            <span>{goodService.getCategoryName(categories, good.categoryId)}</span>
            <span>￥{good.price}</span>
            <span>
              {Number(good.stock) <= 50 ? (
                <span className="badge badge-danger" title="库存紧张">{good.stock}</span>
              ) : (
                <span>{good.stock}</span>
              )}
            </span>
            <span>
              {good.status === 'off' ? (
                <span className="badge badge-neutral">已下架</span>
              ) : (
                <span className="badge badge-success">已上架</span>
              )}
            </span>
            <span className="row-actions">
              <button className="text-button" onClick={() => edit(good)} disabled={!canManage} title={!canManage ? '运营角色只能查看' : ''}>编辑</button>
              <button className="text-button" onClick={() => toggleStatus(good)} disabled={!canManage} title={!canManage ? '运营角色只能查看' : ''}>
                {good.status === 'off' ? '上架' : '下架'}
              </button>
              <button className="text-button danger" onClick={() => remove(good)} disabled={!canManage} title={!canManage ? '运营角色只能查看' : ''}>删除</button>
            </span>
          </div>
        ))}
      </div>
      {filteredGoods.length === 0 && <div className="empty-state admin-empty">没有符合条件的商品</div>}
    </section>
  );
};

export default AdminGoodsPage;
