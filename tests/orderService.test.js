import { describe, it, expect, vi, beforeEach } from 'vitest';
import orderService from '../src/services/orderService';

describe('OrderService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return correct status text', () => {
    expect(orderService.getStatusText('unpaid')).toBe('未支付');
    expect(orderService.getStatusText('invalid')).toBe('未知状态');
  });

  it('should manage orders', async () => {
    const mockOrder = { id: 1, orderNo: '123' };
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockOrder,
    });
    vi.stubGlobal('fetch', globalFetch);

    expect(await orderService.createOrder(123, [], 'address')).toEqual(mockOrder);
    expect(await orderService.getOrdersByUser(123)).toEqual(mockOrder);
    expect(await orderService.getOrderList()).toEqual(mockOrder);
    expect(await orderService.getOrderById(1)).toEqual(mockOrder);
    expect(await orderService.getLogistics(1)).toEqual(mockOrder);
    expect(await orderService.payOrder(1)).toEqual(mockOrder);
    expect(await orderService.shipOrder(1, { company: 'YT' })).toEqual(mockOrder);
    expect(await orderService.receiveOrder(1)).toEqual(mockOrder);
    expect(await orderService.closeOrder(1)).toEqual(mockOrder);
  });
});
