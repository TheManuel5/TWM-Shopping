export type PurchaseProduct = {
  id: number;
  name: string;
  detail: string;
  price: number;
  qty: number;
  sku?: string;
};

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
