import type {
  CategoryNode,
  CategoryTree,
  ManagedCompany,
  ManagedUser,
  ProductVariant,
} from './types';

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phonePattern = /^(?:\+?56[\s-]?[2-9](?:[\s-]?\d){8}|[2-9](?:[\s-]?\d){8})$/;
export const websitePattern = /^https?:\/\/[\w.-]+\.[a-z]{2,}/i;
export const streetNumberPattern = /^(.*\S)\s+(\d+)(?:\s+.*)?$/;

export function cleanRut(value: string): string {
  return value.replace(/[.\s-]/g, '').toUpperCase();
}

export function isValidRut(value: string): boolean {
  const rut = cleanRut(value);
  if (!/^\d{7,8}[\dK]$/.test(rut)) return false;
  let sum = 0;
  let multiplier = 2;
  for (const digit of rut
    .slice(0, -1)
    .split('')
    .reverse()) {
    sum += Number(digit) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const result = 11 - (sum % 11);
  const expected = result === 11 ? '0' : result === 10 ? 'K' : String(result);
  return rut.at(-1) === expected;
}

export function normalizeRut(value: string): string {
  const clean = cleanRut(value);
  if (clean.length < 2) return clean;
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
}

export function limitChileanPhone(value: string): string {
  const cleaned = value.replace(/[^\d+\s-]/g, '');
  const digits = cleaned.replace(/\D/g, '');
  const maxDigits = digits.startsWith('56') ? 11 : 9;
  const limitedDigits = digits.slice(0, maxDigits);
  return `${cleaned.startsWith('+') ? '+' : ''}${limitedDigits}`;
}

export function dateKey(input: Date | string = new Date()): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    return typeof input === 'string' ? input.slice(0, 10) : '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatCLP(value: number | string | null | undefined): string {
  const numeric = Number(value ?? 0);
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

export function validateOffer(
  regularPrice: number,
  offerPrice: number,
  start: string,
  end: string,
): string {
  if (!(Number(offerPrice) > 0 && Number(offerPrice) < Number(regularPrice))) {
    return 'La oferta debe ser mayor que cero y menor al precio oficial.';
  }
  if (!start || !end || end < start) {
    return 'El término de la oferta debe ser igual o posterior al inicio.';
  }
  return '';
}

export function validateVariants(variants: ProductVariant[]): string {
  if (!variants.length) {
    return 'Agrega al menos una variante con SKU, talla, color, precio y stock.';
  }
  const skus = new Set<string>();
  for (const variant of variants) {
    const sku = variant.sku.trim();
    if (!sku || !variant.size.trim() || !variant.color.trim()) {
      return 'Completa SKU, talla y color en todas las variantes.';
    }
    if (!Number.isInteger(Number(variant.stock)) || Number(variant.stock) < 0) {
      return 'El stock de cada variante debe ser un entero mayor o igual a cero.';
    }
    if (!Number.isFinite(Number(variant.price)) || Number(variant.price) <= 0) {
      return 'El precio de cada variante debe ser mayor que cero.';
    }
    if (skus.has(sku.toUpperCase())) {
      return 'No puedes repetir códigos SKU entre variantes.';
    }
    skus.add(sku.toUpperCase());
  }
  return '';
}

export function flattenCategoryNames(tree: CategoryTree | undefined): string[] {
  if (!tree) return [];
  const names: string[] = [];

  const visit = (nodes: CategoryNode[] | undefined) => {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      const label = (node.name ?? node.nombre ?? '').trim();
      if (label) names.push(label);
      if (Array.isArray(node.children)) visit(node.children);
    }
  };

  if (Array.isArray(tree)) {
    visit(tree);
  } else {
    Object.values(tree).forEach((branch) => visit(branch));
  }

  return [...new Set(names)];
}

export function flattenCategoryNamesByType(
  tree: CategoryTree | undefined,
  tipo: 'Producto' | 'Servicio',
): string[] {
  if (!tree) return [];
  if (Array.isArray(tree)) return flattenCategoryNames(tree);
  const key = tipo === 'Servicio' ? 'Servicios' : 'Productos';
  const scoped = tree[key];
  if (Array.isArray(scoped) && scoped.length > 0) {
    return flattenCategoryNames(scoped);
  }
  return flattenCategoryNames(tree);
}

export function validateUserDraft(
  draft: ManagedUser,
  existing: ManagedUser[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (draft.name.trim().length < 3) errors.name = 'Ingresa al menos tres caracteres.';
  if (!isValidRut(draft.rut)) errors.rut = 'Ingresa un RUT válido.';
  if (!emailPattern.test(draft.email.trim())) errors.email = 'Ingresa un correo válido.';
  if (!draft.address.trim() || !streetNumberPattern.test(draft.address.trim())) {
    errors.address = 'Ingresa calle y número (ej: Av. Providencia 123).';
  }
  if (!draft.communeId) errors.communeId = 'Selecciona una comuna.';
  if (!draft.phones.length || draft.phones.some((phone) => !phonePattern.test(phone.trim()))) {
    errors.phones = 'Ingresa teléfonos chilenos válidos (9 dígitos o +569...).';
  } else if (
    new Set(draft.phones.map((phone) => phone.replace(/\D/g, ''))).size !== draft.phones.length
  ) {
    errors.phones = 'Los teléfonos no pueden repetirse.';
  }

  const today = dateKey();
  if (!draft.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(draft.birthDate) || draft.birthDate > today) {
    errors.birthDate = 'Fecha de nacimiento inválida (AAAA-MM-DD).';
  }
  if (!draft.roles.length) errors.roles = 'Selecciona al menos un rol.';

  const targetRut = cleanRut(draft.rut);
  if (existing.some((row) => row.id !== draft.id && cleanRut(row.rut) === targetRut)) {
    errors.rut = 'Este RUT ya existe.';
  }
  if (
    existing.some(
      (row) =>
        row.id !== draft.id &&
        row.email.trim().toLowerCase() === draft.email.trim().toLowerCase(),
    )
  ) {
    errors.email = 'Este correo ya existe.';
  }
  const phoneDigits = draft.phones.map((p) => p.replace(/\D/g, '')).filter(Boolean);
  if (
    existing.some(
      (row) =>
        row.id !== draft.id &&
        row.phones.some((p) => phoneDigits.includes(p.replace(/\D/g, ''))),
    )
  ) {
    errors.phones = 'Un teléfono ya pertenece a otro registro.';
  }

  return errors;
}

export function validateCompanyDraft(
  draft: ManagedCompany,
  existing: ManagedCompany[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (draft.name.trim().length < 3) errors.name = 'Ingresa al menos tres caracteres.';
  if (!isValidRut(draft.rut)) errors.rut = 'Ingresa un RUT de empresa válido.';
  if (!emailPattern.test(draft.email.trim())) errors.email = 'Ingresa un correo válido.';
  if (!draft.category.trim()) errors.category = 'Indica el giro o categoría de la empresa.';

  if (draft.hasPhysicalStore) {
    if (!draft.address.trim() || !streetNumberPattern.test(draft.address.trim())) {
      errors.address = 'Indica calle y número del local (ej: Los Leones 450).';
    }
    if (!draft.comuna.trim()) errors.comuna = 'Selecciona una comuna existente.';
  }

  if (!draft.phones.length || draft.phones.some((phone) => !phonePattern.test(phone.trim()))) {
    errors.phones = 'Ingresa teléfonos chilenos válidos.';
  } else if (
    new Set(draft.phones.map((phone) => phone.replace(/\D/g, ''))).size !== draft.phones.length
  ) {
    errors.phones = 'Los teléfonos no pueden repetirse.';
  }

  if (draft.website.trim() && !websitePattern.test(draft.website.trim())) {
    errors.website = 'Usa una URL válida que comience con http:// o https://.';
  }

  if (
    !draft.owner.name.trim() ||
    !isValidRut(draft.owner.run) ||
    !emailPattern.test(draft.owner.email.trim()) ||
    !phonePattern.test(draft.owner.phone.trim()) ||
    !draft.owner.address.trim()
  ) {
    errors.owner =
      'Completa datos válidos del emprendedor: nombre, RUN, correo, teléfono y dirección.';
  }

  const targetRut = cleanRut(draft.rut);
  if (existing.some((row) => row.id !== draft.id && cleanRut(row.rut) === targetRut)) {
    errors.rut = 'Este RUT de empresa ya existe.';
  }
  if (
    existing.some(
      (row) =>
        row.id !== draft.id &&
        row.email.trim().toLowerCase() === draft.email.trim().toLowerCase(),
    )
  ) {
    errors.email = 'Este correo ya existe.';
  }

  return errors;
}
