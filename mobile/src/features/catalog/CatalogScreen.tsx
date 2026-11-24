import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  Button,
  Chip,
  Header,
  Message,
  Page,
  SearchField,
  s,
} from "@/components/shopping/ui";
import { ListingCard } from "@/components/shopping/ListingCard";
import { colors as c } from "@/theme/shopping";
import { useCatalog } from "./CatalogProvider";
import { filterCatalog, flatten } from "./model";

const PAGE_SIZE = 20;
export default function CatalogScreen() {
  const params = useLocalSearchParams<{
    q?: string;
    category?: string;
    type?: string;
    group?: string;
  }>();
  return <CatalogContent key={JSON.stringify(params)} params={params} />;
}
function CatalogContent({
  params,
}: {
  params: { q?: string; category?: string; type?: string; group?: string };
}) {
  const { snapshot, loading, error, refresh } = useCatalog();
  const [query, setQuery] = useState(params.q || "");
  const [type, setType] = useState(params.type || "");
  const [sort, setSort] = useState("name");
  const [available, setAvailable] = useState(false);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [filters, setFilters] = useState(false);
  const category = flatten(snapshot?.collections.categories || {}).find(
    (node) => String(node.id) === params.category,
  );
  const groupType =
    params.group === "Productos"
      ? "Producto"
      : params.group === "Servicios"
        ? "Servicio"
        : "";
  const items = useMemo(
    () =>
      filterCatalog(snapshot?.collections.catalog || [], {
        query,
        category,
        type: type || groupType,
        sort,
        available,
        min: min.trim() ? Number(min) : undefined,
        max: max.trim() ? Number(max) : undefined,
      }),
    [snapshot, query, category, type, groupType, sort, available, min, max],
  );
  const badRange = !!min && !!max && Number(min) > Number(max);
  return (
    <Page>
      <Header
        title={category?.name || "Catálogo"}
        back
        subtitle={groupType || "Productos y servicios"}
        search={
          <SearchField
            placeholder="¿Qué estás buscando hoy?"
            value={query}
            onChangeText={setQuery}
          />
        }
      />
      <View style={styles.tools}>
        <Text style={styles.count}>{items.length} resultados</Text>
        <Chip title="Filtros y orden" onPress={() => setFilters(true)} />
      </View>
      {!groupType && (
        <ScrollView
          horizontal
          contentContainerStyle={styles.types}
          showsHorizontalScrollIndicator={false}
        >
          {[
            ["", "Todos"],
            ["Producto", "Productos"],
            ["Servicio", "Servicios"],
          ].map(([value, label]) => (
            <Chip
              key={value}
              title={label}
              active={type === value}
              onPress={() => setType(value)}
            />
          ))}
        </ScrollView>
      )}
      {loading && !snapshot ? (
        <Message busy title="Cargando publicaciones" />
      ) : error ? (
        <Message
          title="No pudimos actualizar el catálogo"
          detail={error}
          action="Reintentar"
          onPress={refresh}
        />
      ) : params.category && !category ? (
        <Message title="La categoría no existe" />
      ) : (
        <FlatList
          data={items.slice(0, visible)}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <ListingCard item={item} />
            </View>
          )}
          refreshing={loading}
          onRefresh={refresh}
          onEndReached={() =>
            setVisible((n) => Math.min(n + PAGE_SIZE, items.length))
          }
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <Message
              title="No encontramos publicaciones"
              detail="Prueba con otra búsqueda o ajusta los filtros."
              action="Limpiar filtros"
              onPress={() => {
                setQuery("");
                setType("");
                setMin("");
                setMax("");
                setAvailable(false);
              }}
            />
          }
          ListFooterComponent={
            visible < items.length ? (
              <Button
                outline
                title="Cargar más"
                onPress={() => setVisible((n) => n + PAGE_SIZE)}
              />
            ) : (
              <Text style={styles.end}>
                {items.length ? "Has visto todas las publicaciones" : ""}
              </Text>
            )
          }
        />
      )}
      <Modal
        visible={filters}
        animationType="slide"
        onRequestClose={() => setFilters(false)}
      >
        <Page>
          <Header title="Filtrar y ordenar" />
          <ScrollView contentContainerStyle={styles.filterContent}>
            <Text style={s.h2}>Ordenar por</Text>
            {[
              ["name", "Nombre"],
              ["price-up", "Menor precio"],
              ["price-down", "Mayor precio"],
              ["rating", "Mejor valoración"],
            ].map(([value, label]) => (
              <Chip
                key={value}
                title={label}
                active={sort === value}
                onPress={() => setSort(value)}
              />
            ))}
            <Text style={s.h2}>Precio en pesos chilenos</Text>
            <TextInput
              accessibilityLabel="Precio mínimo"
              placeholder="Desde"
              keyboardType="numeric"
              value={min}
              onChangeText={(v) => setMin(v.replace(/\D/g, ""))}
              style={styles.priceInput}
            />
            <TextInput
              accessibilityLabel="Precio máximo"
              placeholder="Hasta"
              keyboardType="numeric"
              value={max}
              onChangeText={(v) => setMax(v.replace(/\D/g, ""))}
              style={styles.priceInput}
            />
            {badRange && (
              <Text style={{ color: c.danger }}>
                El mínimo debe ser menor o igual al máximo.
              </Text>
            )}
            <View style={styles.tools}>
              <Text style={s.body}>Solo disponibles</Text>
              <Switch
                accessibilityLabel="Solo publicaciones disponibles"
                value={available}
                onValueChange={setAvailable}
                trackColor={{ true: c.primary }}
              />
            </View>
            <Button
              title={`Ver ${items.length} resultados`}
              disabled={badRange}
              onPress={() => setFilters(false)}
            />
            <Button
              outline
              title="Restablecer filtros"
              onPress={() => {
                setSort("name");
                setMin("");
                setMax("");
                setAvailable(false);
              }}
            />
            <Button outline title="Cerrar" onPress={() => setFilters(false)} />
          </ScrollView>
        </Page>
      </Modal>
    </Page>
  );
}
const styles = StyleSheet.create({
  tools: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  count: { fontSize: 12, color: c.muted },
  types: { paddingHorizontal: 18, paddingBottom: 14, gap: 8 },
  list: { paddingHorizontal: 18, paddingBottom: 20, gap: 12 },
  cell: { flex: 1, maxWidth: "49%" },
  end: {
    textAlign: "center",
    fontSize: 12,
    color: c.muted,
    paddingVertical: 20,
  },
  filterContent: { padding: 20, gap: 14 },
  priceInput: {
    borderWidth: 1,
    borderColor: c.border,
    padding: 14,
    borderRadius: 12,
    color: c.ink,
  },
});
