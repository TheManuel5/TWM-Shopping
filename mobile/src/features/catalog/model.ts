import type { Category, CategoryTree, Listing } from "./types";

export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function flatten(tree: CategoryTree): Category[] {
  const visit = (nodes: Category[]): Category[] =>
    nodes.flatMap((node) => [node, ...visit(node.children || [])]);
  return Object.values(tree).flatMap(visit);
}
export function descendants(category: Category): Set<string> {
  return new Set([
    String(category.id),
    ...(category.children || []).flatMap((child) => [...descendants(child)]),
  ]);
}
export type Filters = {
  query?: string;
  category?: Category;
  type?: string;
  available?: boolean;
  min?: number;
  max?: number;
  sort?: string;
};
export function filterCatalog(items: Listing[], filters: Filters): Listing[] {
  const ids = filters.category ? descendants(filters.category) : null;
  const query = normalize(filters.query?.trim() || "");
  const filtered = items.filter(
    (item) =>
      item.estado !== "Borrador" &&
      (!query ||
        normalize(
          `${item.nombre} ${item.categoria} ${item.vendedor} ${item.marca || ""}`,
        ).includes(query)) &&
      (!ids || ids.has(String(item.categoryId))) &&
      (!filters.type || item.tipo === filters.type) &&
      (!filters.available || item.tipo === "Servicio" || item.stock > 0) &&
      (filters.min === undefined || item.precio >= filters.min) &&
      (filters.max === undefined || item.precio <= filters.max),
  );
  return [...filtered].sort((a, b) =>
    filters.sort === "price-up"
      ? a.precio - b.precio
      : filters.sort === "price-down"
        ? b.precio - a.precio
        : filters.sort === "rating"
          ? (b.rating || 0) - (a.rating || 0)
          : a.nombre.localeCompare(b.nombre, "es", { numeric: true }),
  );
}
export function discount(item: Listing): number {
  const variant = item.variantes?.find(
    (row) => row.price === item.precio && (row.regularPrice || 0) > row.price,
  );
  return variant?.regularPrice
    ? Math.floor(
        ((variant.regularPrice - item.precio) * 100) / variant.regularPrice,
      )
    : 0;
}
