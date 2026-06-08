import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const emptyForm = { name: '', phone: '', province: '北京市', city: '海淀区', detail: '', isDefault: false };

const AddressPage = () => {
  const services = useContext(ServiceContext);
  const user = services.user.getCurrentUser();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    if (user) setAddresses(await services.address.getAddresses(user.id));
  };

  useEffect(() => {
    load();
  }, []);

  if (!user) return <section className="empty-state">请先登录后管理收货地址 <Link to="/login">去登录</Link></section>;

  const submit = async (event) => {
    event.preventDefault();
    if (editingId) await services.address.updateAddress({ ...form, id: editingId });
    else await services.address.addAddress({ ...form, userId: user.id });
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  return (
    <section className="section address-page">
      <div className="section-title">
        <h1>收货地址</h1>
        <span>下单时可选择默认地址</span>
      </div>
      <form className="admin-form" onSubmit={submit}>
        <input placeholder="收货人" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="手机号" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input placeholder="省份" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} required />
        <input placeholder="城市/区" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        <input placeholder="详细地址" value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} required />
        <button className="button" type="submit">{editingId ? '保存地址' : '新增地址'}</button>
      </form>
      <div className="address-list">
        {addresses.map((address) => (
          <div className="address-item" key={address.id}>
            <div>
              <strong>{address.name} {address.phone}</strong>
              <p>{address.province}{address.city}{address.detail}</p>
              {address.isDefault && <span className="tag">默认地址</span>}
            </div>
            <div className="row-actions">
              <button className="text-button" onClick={() => { setEditingId(address.id); setForm(address); }}>编辑</button>
              <button className="text-button" onClick={async () => { await services.address.setDefault(address.id); load(); }}>设为默认</button>
              <button className="text-button danger" onClick={async () => { await services.address.deleteAddress(address.id); load(); }}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AddressPage;
