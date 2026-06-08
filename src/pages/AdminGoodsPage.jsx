import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const emptyForm = { name: '', price: '', categoryId: 'phone', stock: '', status: 'on', img: '', desc: '' };

const AdminGoodsPage = () => {
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const admin = services.admin.getCurrentAdmin();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [goods, setGoods] = useState([]);
  const [categories, setCategories] = useState([]);

  const canManage = services.admin.canManageGoods();
  const load = async () => {
    setGoods(await services.good.getGoodList({ includeOff: true }));
    setCategories(await services.good.getCategories());
  };

  useEffect(() => {
    if (admin) load();
  }, []);

  if (!admin) return <section className="empty-state">请先登录后台 <Link to="/admin/login">去登录</Link></section>;

  const edit = (good) => {
    setEditingId(good.id);
    setForm(good);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!canManage) return alert('运营角色只能查看商品');
    if (editingId) await services.good.updateGood({ ...form, id: editingId });
    else await services.good.addGood(form);
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const logout = () => {
    services.admin.logout();
    navigate('/admin/login');
  };

  return (
    <section className="admin-page">
      <div className="admin-head">
        <div>
          <h1>后台商品管理</h1>
          <p>当前角色：{admin.roleName}；商品上下架会影响前台展示。</p>
        </div>
        <div className="row-actions">
          <Link className="text-button" to="/admin/orders">订单管理</Link>
          <button className="text-button" onClick={logout}>退出后台</button>
        </div>
      </div>

      <form className="admin-form" onSubmit={submit}>
        <input placeholder="商品名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required disabled={!canManage} />
        <input placeholder="价格" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required disabled={!canManage} />
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} disabled={!canManage}>
          {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
        </select>
        <input placeholder="库存" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} disabled={!canManage} />
        <input placeholder="图片地址" value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} disabled={!canManage} />
        <input placeholder="商品描述" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} disabled={!canManage} />
        <button className="button" type="submit" disabled={!canManage}>{editingId ? '保存修改' : '新增商品'}</button>
      </form>

      {!canManage && <p className="notice">运营角色只有查看权限，无法新增、编辑、删除或上下架。</p>}

      <div className="admin-table">
        <div className="admin-row admin-row-head">
          <span>商品</span><span>分类</span><span>价格</span><span>库存</span><span>状态</span><span>操作</span>
        </div>
        {goods.map((good) => (
          <div className="admin-row" key={good.id}>
            <span>{good.name}</span>
            <span>{services.good.getCategoryName(categories, good.categoryId)}</span>
            <span>￥{good.price}</span>
            <span>{good.stock}</span>
            <span>{good.status === 'off' ? '下架' : '上架'}</span>
            <span className="row-actions">
              <button className="text-button" onClick={() => edit(good)} disabled={!canManage}>编辑</button>
              <button className="text-button" onClick={async () => { await services.good.toggleStatus(good.id); load(); }} disabled={!canManage}>
                {good.status === 'off' ? '上架' : '下架'}
              </button>
              <button className="text-button danger" onClick={async () => { await services.good.deleteGood(good.id); load(); }} disabled={!canManage}>删除</button>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminGoodsPage;
