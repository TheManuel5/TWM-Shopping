import type {
  CartItem,
  DeliveryMode,
  PaymentMethod,
  PurchaseAddress,
  PurchaseOrder,
} from '../purchaseTypes';

export function createPurchaseOrder({
  items,
  vendor,
  address,
  deliveryMode,
  paymentMethod,
  cardLast4,
  transferCode,
  shipping,
}: {
  items: CartItem[];
  vendor: string;
  address: PurchaseAddress | undefined;
  deliveryMode: DeliveryMode;
  paymentMethod: PaymentMethod;
  cardLast4: string;
  transferCode: string;
  shipping: number;
}): PurchaseOrder {
  const createdAt = new Date();
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return {
    id: `TW-${createdAt.getTime().toString().slice(-4)}`,
    date: createdAt.toLocaleDateString('es-CL'),
    createdAt: createdAt.toISOString(),
    store: vendor,
    status: 'Recibido',
    products: items.map((item) => ({
      id: item.id,
      name: item.name,
      detail: item.detail,
      price: item.price,
      qty: item.quantity,
    })),
    total: subtotal + shipping,
    shipping,
    payment: paymentMethod === 'Tarjeta' ? 'Tarjeta de crédito o débito' : 'Transferencia',
    ...(paymentMethod === 'Tarjeta' ? { cardLast4 } : { transferCode: transferCode.trim() }),
    address: deliveryMode === 'Retiro'
      ? 'Retiro con el vendedor'
      : `${address?.street} ${address?.number}, ${address?.commune}, ${address?.region}`,
    dispatch: {},
    history: [{ date: createdAt.toISOString(), status: 'Recibido' }],
  };
}
