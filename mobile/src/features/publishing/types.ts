export type UserProfile = {
  rut: string;
  run: string;
  nombre: string;
  fechaNacimiento?: string | null;
  role: string;
  canBuy: boolean;
  canSell: boolean;
  canAdmin: boolean;
  active: boolean;
  email: string;
  telefono: string;
  direccion: string;
};

export type ProductVariant = {
  sku: string;
  dbId?: number;
  size: string;
  color: string;
  stock: number;
  price: number;
  netPrice?: number;
  regularPrice?: number;
};

export type CatalogOffer = {
  id?: number;
  precio: number;
  inicio: string;
  fin?: string | null;
};

export type ProductDimensions = {
  ancho: number;
  alto: number;
  fondo: number;
};

export type CatalogItem = {
  id: string;
  dbId?: number;
  ownerRut: string;
  createdAt?: string;
  nombre: string;
  tipo: 'Producto' | 'Servicio';
  categoria: string;
  subcategoria?: string;
  categoryId?: number;
  precio: number;
  stock: number | null;
  available?: boolean;
  vendedor?: string;
  variantes?: ProductVariant[];
  estado: 'Publicado' | 'Borrador';
  imagen: string;
  imagenes?: string[];
  relacionados?: string[];
  descripcion: string;
  material?: string;
  marca?: string;
  color?: string;
  talla?: string;
  tamano?: string;
  peso?: number;
  dimensiones?: ProductDimensions;
  edad?: number;
  duracion?: string;
  modalidad?: string;
  comunas?: string[];
  oferta?: CatalogOffer | null;
};

export type CategoryNode = {
  id?: number | string;
  name?: string;
  nombre?: string;
  children?: CategoryNode[];
};

export type CategoryTree = Record<string, CategoryNode[]> | CategoryNode[];

export type Commune = {
  id: number;
  nombre: string;
  region?: string;
};

export type GeographyState = {
  communes: Commune[];
};

export type SellerOrder = {
  id: string;
  customerRut?: string;
  sellerRut?: string;
  customer: string;
  date: string;
  createdAt?: string;
  status: string;
  total: number;
};

export type SellerQuote = {
  id: string;
  status: string;
  sellerRut?: string;
  customerRut?: string;
  createdAt?: string;
};

export type SellerReturn = {
  id: string;
  orderId?: string;
  status: string;
  price?: number;
  reason?: string;
  sellerRut?: string;
};

export type UserRoleOption = 'Cliente' | 'Emprendedor';

export type ManagedUser = {
  id: string;
  rut: string;
  name: string;
  email: string;
  phones: string[];
  birthDate: string;
  address: string;
  communeId: number | string;
  roles: UserRoleOption[];
  canAdmin?: boolean;
  status: 'Activo' | 'Inactivo';
};

export type CompanyOwner = {
  name: string;
  run: string;
  email: string;
  phone: string;
  address: string;
};

export type ManagedCompany = {
  id: string;
  rut: string;
  name: string;
  email: string;
  phones: string[];
  address: string;
  website: string;
  category: string;
  comuna: string;
  status: 'Activa' | 'En revisión' | 'Suspendida';
  hasPhysicalStore: boolean;
  ownerRut?: string;
  owner: CompanyOwner;
};

export type StateCollections = {
  catalog: CatalogItem[];
  orders: SellerOrder[];
  quotes: SellerQuote[];
  returns: SellerReturn[];
  users: ManagedUser[];
  companies: ManagedCompany[];
  categories: CategoryTree;
  geography: GeographyState;
};

export type StateSnapshot = {
  collections: Partial<StateCollections>;
  revision: number;
  isAuthenticated: boolean;
  source?: string;
  dataMode?: string;
  partial?: boolean;
};
