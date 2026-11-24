import test from "node:test";
import assert from "node:assert/strict";
import {
  filterCatalog,
  flatten,
  descendants,
  discount,
} from "../src/features/catalog/model.ts";

const root = {
  id: 1,
  name: "Tecnología",
  children: [
    { id: 11, name: "Computación", children: [{ id: 21, name: "Accesorios" }] },
  ],
};
const base = {
  tipo: "Producto",
  estado: "Publicado",
  stock: 1,
  vendedor: "Tienda Sur",
  categoria: "Accesorios",
  categoryId: 21,
};
const items = [
  { ...base, id: "p1", nombre: "Teléfono", precio: 150, rating: 4 },
  { ...base, id: "p2", nombre: "Teclado", precio: 90, rating: 5, stock: 0 },
  {
    ...base,
    id: "s1",
    nombre: "Reparación",
    precio: 30,
    rating: null,
    tipo: "Servicio",
    stock: 0,
  },
  { ...base, id: "draft", nombre: "Borrador", precio: 1, estado: "Borrador" },
];
test("incluye nietos de categorías numéricas sin depender del nombre ni del formato del ID", () => {
  assert.deepEqual([...descendants(root)], ["1", "11", "21"]);
  assert.equal(flatten({ Productos: [root] }).length, 3);
  assert.equal(filterCatalog(items, { category: root }).length, 3);
});
test("combina búsqueda sin acentos, tipo, disponibilidad y rango; excluye borradores", () => {
  assert.deepEqual(
    filterCatalog(items, {
      query: "telefono",
      category: root,
      type: "Producto",
      available: true,
      min: 100,
      max: 200,
    }).map((x) => x.id),
    ["p1"],
  );
  assert.deepEqual(
    filterCatalog(items, { type: "Servicio", available: true }).map(
      (x) => x.id,
    ),
    ["s1"],
  );
  assert.equal(filterCatalog(items, { min: 200, max: 100 }).length, 0);
});
test("ordena una copia sin cambiar el catálogo original", () => {
  const original = items.map((x) => x.id);
  assert.deepEqual(
    filterCatalog(items, { sort: "price-up" }).map((x) => x.id),
    ["s1", "p2", "p1"],
  );
  assert.deepEqual(
    items.map((x) => x.id),
    original,
  );
});
test("el descuento corresponde al precio de la variante que se muestra", () => {
  assert.equal(
    discount({
      ...items[0],
      precio: 80,
      variantes: [{ price: 80, regularPrice: 100 }],
    }),
    20,
  );
  assert.equal(
    discount({
      ...items[0],
      precio: 80,
      variantes: [{ price: 50, regularPrice: 100 }],
    }),
    0,
  );
});
test("un ID de categoría inexistente nunca se inventa", () => {
  assert.equal(
    flatten({ Productos: [root] }).find((x) => String(x.id) === "999"),
    undefined,
  );
});
