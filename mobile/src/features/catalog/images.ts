import { normalize } from "./model";
import type { Listing } from "./types";
import { apiBaseUrl } from "./gateway";

const samples = {
  tecnologia: require("../../../assets/catalog/tecnologia.webp"),
  vestuario: require("../../../assets/catalog/vestuario.webp"),
  alimentos: require("../../../assets/catalog/alimentos.webp"),
  libros: require("../../../assets/catalog/libros.webp"),
  educacion: require("../../../assets/catalog/educacion.webp"),
  profesional: require("../../../assets/catalog/profesional.webp"),
  remoto: require("../../../assets/catalog/remoto.webp"),
};
export function gallery(item: Listing): {
  sources: (number | { uri: string })[];
  reference: boolean;
} {
  const own = [item.imagen, ...(item.imagenes || [])].filter(
    (image): image is string =>
      !!image &&
      !image.includes("placeholder.svg") &&
      !image.includes("/referenciales/") &&
      /^(https?:\/\/|data:image\/|\/catalog\/)/.test(image),
  );
  if (own.length)
    return {
      sources: [...new Set(own)].map((uri) => ({
        uri: uri.startsWith("/")
          ? `${apiBaseUrl.replace(/\/api$/, "")}${uri}`
          : uri,
      })),
      reference: false,
    };
  const name = normalize(item.categoria);
  const key = /remot/.test(name)
    ? "remoto"
    : /profesional/.test(name)
      ? "profesional"
      : /libro|material educativo/.test(name)
        ? "libros"
        : /educa|clase/.test(name)
          ? "educacion"
          : /alimenta|alimento/.test(name)
            ? "alimentos"
            : /ropa|vestuario|calzado|invierno/.test(name)
              ? "vestuario"
              : /tecnolog|comput|informatic|celular/.test(name)
                ? "tecnologia"
                : null;
  return { sources: key ? [samples[key]] : [], reference: true };
}
