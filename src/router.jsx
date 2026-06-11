import { createBrowserRouter } from 'react-router-dom';

import App from './App';
import AddressPage from './pages/AddressPage';
import AdminGoodsPage from './pages/AdminGoodsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminOrderDetailPage from './pages/AdminOrderDetailPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminRoute from './pages/AdminRoute';
import CartPage from './pages/CartPage';
import CategoryPage from './pages/CategoryPage';
import CreateOrderPage from './pages/CreateOrderPage';
import DetailPage from './pages/DetailPage';
import FavoritePage from './pages/FavoritePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MinePage from './pages/MinePage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderListPage from './pages/OrderListPage';
import PayPage from './pages/PayPage';

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: HomePage },
      { path: 'home', Component: HomePage },
      { path: 'category', Component: CategoryPage },
      { path: 'cart', Component: CartPage },
      { path: 'mine', Component: MinePage },
      { path: 'addresses', Component: AddressPage },
      { path: 'favorites', Component: FavoritePage },
      { path: 'login', Component: LoginPage },
      { path: 'detail/:goodId', Component: DetailPage },
      { path: 'createOrder/:goodId?', Component: CreateOrderPage },
      { path: 'pay/:orderId', Component: PayPage },
      { path: 'orderList', Component: OrderListPage },
      { path: 'orderDetail/:orderId', Component: OrderDetailPage },
      { path: 'admin/login', Component: AdminLoginPage },
      { path: 'admin/goods', element: <AdminRoute><AdminGoodsPage /></AdminRoute> },
      { path: 'admin/orders', element: <AdminRoute><AdminOrdersPage /></AdminRoute> },
      { path: 'admin/orders/:orderId', element: <AdminRoute><AdminOrderDetailPage /></AdminRoute> },
    ],
  },
]);

export default router;
