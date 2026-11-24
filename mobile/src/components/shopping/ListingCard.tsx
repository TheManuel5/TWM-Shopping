import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import type { Listing } from "@/features/catalog/types";
import { gallery } from "@/features/catalog/images";
import { discount } from "@/features/catalog/model";
import { colors as c, money } from "@/theme/shopping";

export function openListing(item: Listing) {
  router.push({
    pathname: item.tipo === "Servicio" ? "/servicio/[id]" : "/producto/[id]",
    params: { id: item.id },
  });
}
export function ListingCard({ item }: { item: Listing }) {
  const photo = gallery(item);
  const offer = discount(item);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${item.nombre}, ${money(item.precio)}`}
      onPress={() => openListing(item)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.photo}>
        {photo.sources.length ? (
          <Image
            source={photo.sources[0]}
            style={styles.image}
            contentFit="cover"
            accessibilityLabel={item.nombre}
          />
        ) : (
          <Text style={styles.placeholder}>Sin fotografía</Text>
        )}
        {offer > 0 && <Text style={styles.offer}>−{offer}%</Text>}
      </View>
      {photo.reference && (
        <Text style={styles.reference}>Imagen referencial</Text>
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {item.nombre}
        </Text>
        <Text style={styles.vendor} numberOfLines={1}>
          por {item.vendedor}
        </Text>
        <Text style={styles.rating}>
          {item.rating
            ? `★ ${item.rating.toFixed(1)} · ${item.reviews || 0} opiniones`
            : "Sin valoraciones"}
        </Text>
        <Text style={styles.price}>{money(item.precio)}</Text>
        <Text style={styles.location} numberOfLines={1}>
          {item.comuna || item.categoria}
        </Text>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>
            {item.tipo === "Servicio" ? "Ver servicio" : "Ver producto"} →
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "white",
  },
  photo: {
    height: 140,
    backgroundColor: c.background,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%" },
  placeholder: { color: c.muted, fontSize: 12 },
  reference: { fontSize: 9, color: c.muted, paddingLeft: 10, marginTop: 5 },
  content: { padding: 10, gap: 7 },
  name: { fontSize: 13, fontWeight: "700", color: c.ink, minHeight: 34 },
  vendor: { color: c.muted, fontSize: 10 },
  rating: { fontSize: 10, color: "#986000" },
  price: { fontSize: 19, fontWeight: "800", color: c.ink },
  location: { fontSize: 10, color: c.primary },
  cta: {
    backgroundColor: c.primary,
    padding: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  ctaText: { color: "white", fontSize: 11, fontWeight: "700" },
  offer: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: c.primary,
    color: "white",
    padding: 5,
    borderRadius: 6,
    fontSize: 11,
  },
});
