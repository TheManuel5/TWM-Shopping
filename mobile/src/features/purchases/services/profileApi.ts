import type { PurchaseAddress } from '../purchaseTypes';

export function saveAddress(
  addresses: PurchaseAddress[],
  address: PurchaseAddress,
): PurchaseAddress[] {
  if (addresses.some((item) => item.id === address.id)) {
    return addresses.map((item) => item.id === address.id ? address : item);
  }
  return [...addresses, address];
}

export function deleteAddress(
  addresses: PurchaseAddress[],
  addressId: string,
): PurchaseAddress[] {
  return addresses.filter((address) => address.id !== addressId);
}
