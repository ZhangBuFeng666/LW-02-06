import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const LoginPage = () => {
  const services = useContext(ServiceContext);
  const navigate = useNavigate();
  const location = useLocation();
  const outletContext = useOutletContext();
  const isAdminLogin = location.pathname.startsWith('/admin/login');
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    username: isAdminLogin ? 'admin' : 'user',
    password: '123456',
    nickname: '商城用户',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isAdminLogin) {
        await services.admin.login(form.username, form.password);
        navigate('/admin/goods');
        return;
      }

      if (mode === 'login') {
        await services.user.login(form.username, form.password);
      } else {
        if (!form.nickname.trim()) {
          setError('请输入昵称');
          setLoading(false);
          return;
        }
        await services.user.register(form.username, form.password, form.nickname);
      }
      outletContext?.refreshUser?.();
      navigate('/mine');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-page">
      <form className="form-card animate-fade-rise" onSubmit={submit}>
        <h1 style={{ fontFamily: '"STKaiti", "KaiTi", "Noto Serif CJK SC", serif', fontWeight: 500 }}>
          {isAdminLogin ? '后台登录' : mode === 'login' ? '欢迎回来' : '创建账号'}
        </h1>
        {isAdminLogin && <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>管理员可增删改，运营只能查看。默认账号 admin / 123456。</p>}
        {!isAdminLogin && mode === 'login' && <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>登录后可使用购物车、下单和查看订单。</p>}
        {!isAdminLogin && mode === 'register' && <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>注册账号，开始你的购物之旅。</p>}

        <label>
          用户名
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="请输入用户名"
            required
          />
        </label>
        <label>
          密码
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="请输入密码（至少6位）"
            required
            minLength="6"
          />
        </label>
        {!isAdminLogin && mode === 'register' && (
          <label>
            昵称
            <input
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              placeholder="给自己取个名字吧"
              required
            />
          </label>
        )}

        {error && <p className="error-text" style={{ margin: 0 }}>{error}</p>}
        <button className="button" type="submit" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? '处理中...' : isAdminLogin ? '进入后台' : mode === 'login' ? '登录' : '注册并登录'}
        </button>

        {!isAdminLogin && (
          <>
            <button className="text-button" type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
              {mode === 'login' ? '没有账号？去注册' : '已有账号？去登录'}
            </button>
            <Link className="small-login-link" to="/admin/login">后台管理员登录</Link>
          </>
        )}
        {isAdminLogin && <Link className="small-login-link" to="/login">返回用户登录</Link>}
      </form>
    </section>
  );
};

export default LoginPage;
