import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ServiceContext } from '../contexts/ServiceContext';

const AdminRoute = ({ children }) => {
  const services = useContext(ServiceContext);
  const admin = services.admin.getCurrentAdmin();

  if (!admin) {
    return (
      <section className="empty-state admin-auth-state">
        <strong>请先登录后台</strong>
        <span>后台管理功能需要管理员或运营账号。</span>
        <Link className="primary-link" to="/admin/login">去后台登录</Link>
      </section>
    );
  }

  return children;
};

export default AdminRoute;
