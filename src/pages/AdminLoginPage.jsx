import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const AdminLoginPage = () => {
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: 'admin', password: '123456' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await services.admin.login(form.username, form.password);
      navigate('/admin/goods');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="form-page">
      <form className="form-card" onSubmit={submit}>
        <h1>后台登录</h1>
        <p>管理员可增删改，运营只能查看。</p>
        <label>账号<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
        <label>密码<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        {error && <p className="error-text">{error}</p>}
        <button className="button" type="submit">进入后台</button>
      </form>
    </section>
  );
};

export default AdminLoginPage;
