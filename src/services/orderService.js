import { buildQuery, request } from './request';

class OrderService {
  getStatusText(status) {
    return ({ unpaid: '未支付', paid: '待发货', shipped: '已发货', received: '已收货', closed: '已关闭' })[status] || '未知状态';
  }

  createOrder(userId, items, address, addressId = null) {
    return request('/orders', { method: 'POST', body: JSON.stringify({ userId, items, address, addressId }) });
  }

  getOrdersByUser(userId) {
    return request(`/orders${buildQuery({ userId })}`);
  }

  getOrderList() {
    return request('/orders');
  }

  getOrderById(orderId) {
    return request(`/orders/${orderId}`);
  }

  getLogistics(orderId) {
    return request(`/orders/${orderId}/logistics`);
  }

  payOrder(orderId) {
    return request(`/orders/${orderId}/pay`, { method: 'PATCH' });
  }

  shipOrder(orderId, payload = {}) {
    return request(`/orders/${orderId}/ship`, { method: 'PATCH', body: JSON.stringify(payload) });
  }

  receiveOrder(orderId) {
    return request(`/orders/${orderId}/receive`, { method: 'PATCH' });
  }

  closeOrder(orderId) {
    return request(`/orders/${orderId}/close`, { method: 'PATCH' });
  }
}

const orderService = new OrderService();
export default orderService;
