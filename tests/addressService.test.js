import { describe, it, expect, vi, beforeEach } from 'vitest';
import addressService from '../src/services/addressService';

describe('AddressService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should manage addresses', async () => {
    const mockAddress = [{ id: 1, name: 'address1' }];
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockAddress,
    });
    vi.stubGlobal('fetch', globalFetch);

    expect(await addressService.getAddresses(123)).toEqual(mockAddress);
    expect(globalFetch).toHaveBeenCalledWith('/api/addresses?userId=123', expect.any(Object));

    expect(await addressService.addAddress(mockAddress[0])).toEqual(mockAddress);
    expect(await addressService.updateAddress(mockAddress[0])).toEqual(mockAddress);
    expect(await addressService.deleteAddress(1)).toEqual(mockAddress);
    expect(await addressService.setDefault(1)).toEqual(mockAddress);
  });
});
