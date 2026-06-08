import { buildQuery, request } from './request';

class AddressService {
  getAddresses(userId) {
    return request(`/addresses${buildQuery({ userId })}`);
  }

  addAddress(address) {
    return request('/addresses', { method: 'POST', body: JSON.stringify(address) });
  }

  updateAddress(address) {
    return request(`/addresses/${address.id}`, { method: 'PUT', body: JSON.stringify(address) });
  }

  deleteAddress(id) {
    return request(`/addresses/${id}`, { method: 'DELETE' });
  }

  setDefault(id) {
    return request(`/addresses/${id}/default`, { method: 'PATCH' });
  }
}

const addressService = new AddressService();
export default addressService;
