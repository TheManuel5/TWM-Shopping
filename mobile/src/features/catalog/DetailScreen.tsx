import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
  Button,
  Chip,
  Header,
  Heading,
  Message,
  Page,
  s,
} from "@/components/shopping/ui";
import { ListingCard } from "@/components/shopping/ListingCard";
import { colors as c, money } from "@/theme/shopping";
import { useCatalog } from "./CatalogProvider";
import { gallery } from "./images";
import { discount } from "./model";

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DetailContent key={id} id={id} />;
}
function DetailContent({ id }: { id: string }) {
  const { snapshot, loading, error, refresh } = useCatalog();
  const item = snapshot?.collections.catalog.find((row) => row.id === id);
  const [photo, setPhoto] = useState(0);
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState(1);
  if (!item)
    return (
      <Page>
        <Header title="Publicación" back />
        <Message
          busy={loading}
          title={
            loading
              ? "Cargando publicación"
              : error
                ? "No pudimos cargar la publicación"
                : "Publicación no encontrada"
          }
          detail={error || undefined}
          action="Volver a intentar"
          onPress={refresh}
        />
      </Page>
    );
  const photos = gallery(item);
  const service = item.tipo === "Servicio";
  const variant =
    item.variantes?.find((row) => row.sku === sku) ||
    item.variantes?.find((row) => row.stock > 0);
  const price = variant?.price ?? item.precio;
  const stock = variant?.stock ?? item.stock;
  const offer = discount(item);
  const related = snapshot!.collections.catalog
    .filter(
      (row) =>
        row.id !== id &&
        row.categoryId === item.categoryId &&
        row.tipo === item.tipo,
    )
    .slice(0, 4);
  const purchase = () =>
    router.push({
      pathname: "/carrito",
      params: {
        productId: id,
        sku: variant?.sku || "",
        quantity: String(quantity),
      },
    });
  return (
    <Page>
      <Header
        title={service ? "Detalle del servicio" : "Detalle del producto"}
        subtitle={item.categoria}
        back
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.photo}>
          {photos.sources.length ? (
            <Image
              source={photos.sources[photo] || photos.sources[0]}
              contentFit="cover"
              style={styles.image}
              accessibilityLabel={item.nombre}
            />
          ) : (
            <Text style={s.body}>Esta publicación no tiene fotografía</Text>
          )}
          {offer > 0 && (
            <Text style={styles.offer}>Oferta · {offer}% de descuento</Text>
          )}
        </View>
        {photos.reference && (
          <Text style={styles.reference}>
            Imagen referencial de la categoría
          </Text>
        )}
        {photos.sources.length > 1 && (
          <ScrollView horizontal contentContainerStyle={{ gap: 10 }}>
            {photos.sources.map((source, index) => (
              <Pressable
                key={index}
                accessibilityRole="button"
                accessibilityLabel={`Ver foto ${index + 1}`}
                accessibilityState={{ selected: photo === index }}
                onPress={() => setPhoto(index)}
              >
                <Image
                  source={source}
                  style={[
                    styles.thumb,
                    photo === index && { borderColor: c.primary },
                  ]}
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
        <Text style={styles.title}>{item.nombre}</Text>
        <Text style={s.body}>
          Vendido por <Text style={s.link}>{item.vendedor}</Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({ pathname: "/resenas/[id]", params: { id } })
          }
        >
          <Text style={styles.rating}>
            {item.rating
              ? `★ ${item.rating.toFixed(1)} · ${item.reviews || 0} opiniones`
              : "Sin valoraciones todavía"}{" "}
            ›
          </Text>
        </Pressable>
        <Text style={styles.price}>{money(price)}</Text>
        {!service && !!item.variantes?.length && (
          <>
            <Heading>Selecciona una variante</Heading>
            <View style={styles.wrap}>
              {item.variantes.map((row) => (
                <Chip
                  key={row.sku}
                  title={`${row.size || "Única"} · ${row.color || "Sin color"}${row.stock < 1 ? " · Agotado" : ""}`}
                  active={variant?.sku === row.sku}
                  onPress={() => {
                    setSku(row.sku);
                    setQuantity(1);
                  }}
                />
              ))}
            </View>
          </>
        )}
        <View style={styles.facts}>
          {(service
            ? [
                ["Duración", item.duracion || "Consultar al vendedor"],
                ["Modalidad", item.modalidad || "Consultar"],
                [
                  "Edad mínima",
                  item.edad ? `${item.edad} años` : "Sin restricción indicada",
                ],
              ]
            : [
                ["Material", item.material || "No informado"],
                ["Marca", item.marca || "No informada"],
                ["Disponibilidad", stock > 0 ? `${stock} unidades` : "Agotado"],
              ]
          ).map(([label, value]) => (
            <View key={label} style={styles.fact}>
              <Text style={s.body}>{label}</Text>
              <Text style={styles.factValue}>{value}</Text>
            </View>
          ))}
        </View>
        {!service && stock > 0 && (
          <View style={styles.quantity}>
            <Text style={s.body}>Cantidad</Text>
            <Button
              outline
              title="−"
              disabled={quantity <= 1}
              onPress={() => setQuantity((n) => n - 1)}
            />
            <Text style={s.h2}>{quantity}</Text>
            <Button
              outline
              title="+"
              disabled={quantity >= stock}
              onPress={() => setQuantity((n) => n + 1)}
            />
          </View>
        )}
        <Heading>Descripción</Heading>
        <Text style={s.body}>
          {item.descripcion ||
            "El vendedor aún no ha agregado una descripción."}
        </Text>
        {item.comuna && (
          <View style={styles.delivery}>
            <Text style={s.h2}>Ubicación</Text>
            <Text style={s.body}>{item.comuna}</Text>
          </View>
        )}
        <Button
          outline
          title="Ver reseñas y preguntas"
          onPress={() =>
            router.push({ pathname: "/resenas/[id]", params: { id } })
          }
        />
        <Button
          outline
          title="Contactar al vendedor"
          onPress={() =>
            router.push({
              pathname: "/mensajes",
              params: { productId: id, sellerRut: item.ownerRut },
            })
          }
        />
        {!!related.length && (
          <>
            <Heading>También te puede interesar</Heading>
            <View style={styles.related}>
              {related.map((row) => (
                <View key={row.id} style={styles.relatedCell}>
                  <ListingCard item={row} />
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>{money(price * quantity)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title={
              service
                ? "Contratar servicio"
                : stock > 0
                  ? "Continuar compra"
                  : "Sin stock"
            }
            disabled={!service && stock < 1}
            onPress={purchase}
          />
        </View>
      </View>
    </Page>
  );
}
const styles = StyleSheet.create({
  content: { padding: 18, gap: 14 },
  photo: {
    height: 270,
    borderRadius: 20,
    backgroundColor: c.background,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%" },
  offer: {
    position: "absolute",
    top: 14,
    left: 14,
    color: c.primary,
    backgroundColor: c.primarySoft,
    padding: 8,
    borderRadius: 10,
    fontSize: 11,
    fontWeight: "700",
  },
  reference: { color: c.muted, fontSize: 11 },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: c.border,
  },
  title: { color: c.ink, fontSize: 24, fontWeight: "800", lineHeight: 30 },
  rating: { color: "#996600", fontSize: 13 },
  price: { color: c.primary, fontSize: 30, fontWeight: "900" },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  facts: {
    padding: 15,
    borderRadius: 14,
    backgroundColor: c.background,
    gap: 12,
  },
  fact: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  factValue: { flex: 1, textAlign: "right", fontWeight: "600", color: c.ink },
  quantity: { flexDirection: "row", alignItems: "center", gap: 14 },
  delivery: {
    backgroundColor: c.primarySoft,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  related: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  relatedCell: { width: "48%", flexGrow: 1 },
  footer: {
    flexDirection: "row",
    padding: 14,
    gap: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: c.border,
    backgroundColor: "white",
  },
  totalLabel: { color: c.muted, fontSize: 11 },
  total: { color: c.primary, fontSize: 20, fontWeight: "800" },
});
