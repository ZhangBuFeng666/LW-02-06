import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';

import App from './App';
import AdminRoute from './pages/AdminRoute';

const AddressPage = lazy(() => import('./pages/AddressPage'));
const AdminGoodsPage = lazy(() => import('./pages/AdminGoodsPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/AdminOrderDetailPage'));
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const CreateOrderPage = lazy(() => import('./pages/CreateOrderPage'));
const DetailPage = lazy(() => import('./pages/DetailPage'));
const FavoritePage = lazy(() => import('./pages/FavoritePage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const MinePage = lazy(() => import('./pages/MinePage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const OrderListPage = lazy(() => import('./pages/OrderListPage'));
const PayPage = lazy(() => import('./pages/PayPage'));

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
