export interface Category {
  id: string | number;
  name: string;
  children?: Category[];
}
export type CategoryTree = Record<string, Category[]>;
export interface Variant {
  sku: string;
  size?: string;
  color?: string;
  price: number;
  regularPrice?: number;
  stock: number;
}
export interface Listing {
  id: string;
  nombre: string;
  tipo: string;
  categoria: string;
  categoryId?: number;
  precio: number;
  stock: number;
  vendedor: string;
  ownerRut: string;
  estado: string;
  imagen?: string;
  imagenes?: string[];
  descripcion?: string;
  marca?: string;
  material?: string;
  color?: string;
  talla?: string;
  duracion?: string;
  modalidad?: string;
  edad?: number;
  comuna?: string;
  rating?: number | null;
  reviews?: number;
  variantes?: Variant[];
  oferta?: { precio: number; inicio: string; fin: string };
}
export interface Review {
  id: string | number;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
}
export interface Question {
  id: string | number;
  user: string;
  question: string;
  date: string;
  answer?: string | null;
}
export interface Snapshot {
  revision: number;
  isAuthenticated: boolean;
  collections: {
    catalog: Listing[];
    categories: CategoryTree;
    [key: string]: unknown;
  };
}
