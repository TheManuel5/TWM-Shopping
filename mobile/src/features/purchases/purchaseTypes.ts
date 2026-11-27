export type PurchaseProduct = {
  id: number;
  name: string;
  detail: string;
  price: number;
  qty: number;
  sku?: string;
};

export type CartItem = {
  id: number;
  name: string;
  detail: string;
  price: number;
  vendor: string;
  emoji: string;
  color: string;
  quantity: number;
  type?: 'Producto' | 'Servicio';
  category?: string;
  originalPrice?: number;
  savedAt?: number;
};

export type PurchaseAddress = {
  id: string;
  label: string;
  region: string;
  province: string;
  commune: string;
  street: string;
  number: string;
  department: string;
  reference: string;
};

export type DeliveryMode = 'Despacho' | 'Retiro';
export type PaymentMethod = 'Tarjeta' | 'Transferencia';

export type PurchaseOrder = {
  id: string;
  date: string;
  createdAt: string;
  store: string;
  status: string;
  products: PurchaseProduct[];
  total: number;
  shipping: number;
  payment: string;
  cardLast4?: string;
  transferCode?: string;
  address: string;
  dispatch: {
    carrier?: string;
    tracking?: string;
  };
  history: { date: string; status: string }[];
};

export type ReturnStatus =
  | 'Solicitada'
  | 'Aprobada'
  | 'Rechazada'
  | 'Finalizada';

export type ReturnRequest = {
  id: string;
  orderId: string;
  itemKey: string;
  productId: number;
  product: string;
  qty: number;
  price: number;
  reason: string;
  date: string;
  status: ReturnStatus;
  images: string[];
  history: { date: string; status: ReturnStatus }[];
};
