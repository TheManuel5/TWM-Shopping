import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
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
  s,
} from "@/components/shopping/ui";
import { colors as c } from "@/theme/shopping";
import { useCatalog } from "./CatalogProvider";
import { ApiError, writeFeedback } from "./gateway";
import type { Question, Review } from "./types";

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { snapshot, loading, error, refresh } = useCatalog();
  const [tab, setTab] = useState("reviews");
  const [form, setForm] = useState(false);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const item = snapshot?.collections.catalog.find((row) => row.id === id);
  const reviews = (snapshot?.collections[`reviews:${id}`] || []) as Review[];
  const questions = (snapshot?.collections[`questions:${id}`] ||
    []) as Question[];
  const average = reviews.length
    ? reviews.reduce((sum, row) => sum + row.rating, 0) / reviews.length
    : 0;
  const isReview = tab === "reviews";
  const max = isReview ? 2000 : 1000;
  async function submit() {
    if (!snapshot || text.trim().length < 5 || text.trim().length > max) return;
    setSaving(true);
    setFeedback("");
    try {
      await writeFeedback(
        snapshot.revision,
        `${isReview ? "reviews" : "questions"}:${id}`,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          date: new Date().toISOString(),
          ...(isReview
            ? { rating, sellerRating: rating, comment: text.trim() }
            : { question: text.trim(), answer: null }),
        },
      );
      setForm(false);
      setText("");
      await refresh();
      setFeedback(isReview ? "Tu reseña se publicó." : "Tu pregunta se envió.");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        await refresh();
        setFeedback("La tienda cambió. Revisa tu mensaje y vuelve a enviarlo.");
      } else
        setFeedback(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }
  if (!item)
    return (
      <Page>
        <Header title="Reseñas y preguntas" back />
        <Message
          busy={loading}
          title={loading ? "Cargando opiniones" : "Publicación no disponible"}
          detail={error || undefined}
          action="Reintentar"
          onPress={refresh}
        />
      </Page>
    );
  return (
    <Page>
      <Header title="Reseñas y preguntas" subtitle={item.nombre} back />
      <View style={styles.tabs}>
        <Chip
          title={`Reseñas (${reviews.length})`}
          active={isReview}
          onPress={() => {
            setTab("reviews");
            setFeedback("");
          }}
        />
        <Chip
          title={`Preguntas (${questions.length})`}
          active={!isReview}
          onPress={() => {
            setTab("questions");
            setFeedback("");
          }}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {!!feedback && (
          <Text accessibilityLiveRegion="polite" style={styles.notice}>
            {feedback}
          </Text>
        )}
        {isReview ? (
          <>
            <View style={styles.summary}>
              <View style={{ alignItems: "center", gap: 8 }}>
                <Text style={styles.average}>
                  {average ? average.toFixed(1) : "—"}
                </Text>
                <Text style={{ color: c.primary }}>
                  {average
                    ? "★".repeat(Math.round(average)) +
                      "☆".repeat(5 - Math.round(average))
                    : "☆☆☆☆☆"}
                </Text>
                <Text style={styles.meta}>{reviews.length} reseñas</Text>
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviews.filter(
                    (row) => row.rating === stars,
                  ).length;
                  return (
                    <View key={stars} style={styles.barRow}>
                      <Text style={styles.meta}>{stars} ★</Text>
                      <View style={styles.bar}>
                        <View
                          style={[
                            styles.fill,
                            {
                              width: `${reviews.length ? (count / reviews.length) * 100 : 0}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.meta}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <Text style={s.h2}>Opiniones de clientes</Text>
            {reviews.map((row) => (
              <View key={row.id} style={styles.card}>
                <Text style={styles.author}>{row.author || "Cliente"}</Text>
                <Text style={{ color: "#986000" }}>
                  {"★".repeat(Math.max(0, Math.min(5, Math.round(row.rating))))}
                </Text>
                {row.verified && (
                  <Text style={styles.verified}>Compra verificada</Text>
                )}
                <Text style={s.body}>{row.comment}</Text>
                <Text style={styles.meta}>{formatDate(row.date)}</Text>
              </View>
            ))}
            {!reviews.length && (
              <Message
                title="Todavía no hay reseñas"
                detail="Las opiniones de compras entregadas aparecerán aquí."
              />
            )}
          </>
        ) : (
          <>
            {questions.map((row) => (
              <View key={row.id} style={styles.card}>
                <Text style={styles.author}>{row.user || "Cliente"}</Text>
                <Text style={s.body}>{row.question}</Text>
                <Text style={styles.meta}>{formatDate(row.date)}</Text>
                <View style={styles.answer}>
                  <Text style={styles.author}>
                    {row.answer
                      ? "Respuesta del vendedor"
                      : "Pendiente de respuesta"}
                  </Text>
                  {!!row.answer && <Text style={s.body}>{row.answer}</Text>}
                </View>
              </View>
            ))}
            {!questions.length && (
              <Message
                title="Aún no hay preguntas"
                detail="Consulta al vendedor sobre esta publicación."
              />
            )}
          </>
        )}
        {!snapshot?.isAuthenticated && (
          <Text style={styles.notice}>
            Inicia sesión desde Mi cuenta para publicar. Para escribir una
            reseña necesitas una compra entregada.
          </Text>
        )}
      </ScrollView>
      <View style={styles.bottom}>
        <Button
          title={isReview ? "Escribir reseña" : "Hacer una pregunta"}
          disabled={!snapshot?.isAuthenticated}
          onPress={() => {
            setText("");
            setFeedback("");
            setForm(true);
          }}
        />
      </View>
      <Modal
        visible={form}
        animationType="slide"
        onRequestClose={() => {
          if (!saving) setForm(false);
        }}
      >
        <Page>
          <Header
            title={isReview ? "Escribe tu reseña" : "Pregunta al vendedor"}
          />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <Text style={s.h2}>{item.nombre}</Text>
            {isReview && (
              <>
                <Text style={s.body}>
                  Solo puedes reseñar artículos de una compra entregada. El
                  servidor verificará tu compra.
                </Text>
                <View style={styles.tabs}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Chip
                      key={value}
                      title={`${value} ★`}
                      active={rating === value}
                      onPress={() => setRating(value)}
                    />
                  ))}
                </View>
              </>
            )}
            <TextInput
              accessibilityLabel={isReview ? "Tu reseña" : "Tu pregunta"}
              placeholder={
                isReview
                  ? "Cuéntanos cómo fue tu compra…"
                  : "¿Qué te gustaría saber?"
              }
              value={text}
              onChangeText={setText}
              maxLength={max}
              multiline
              style={styles.input}
              textAlignVertical="top"
            />
            <Text style={styles.meta}>
              {text.length}/{max} · mínimo 5 caracteres
            </Text>
            {!!feedback && (
              <Text accessibilityLiveRegion="polite" style={styles.notice}>
                {feedback}
              </Text>
            )}
            <Button
              title={saving ? "Enviando…" : "Publicar"}
              disabled={saving || text.trim().length < 5}
              onPress={submit}
            />
            <Button
              outline
              title="Cancelar"
              disabled={saving}
              onPress={() => setForm(false)}
            />
          </ScrollView>
        </Page>
      </Modal>
    </Page>
  );
}
function formatDate(date: string) {
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? "" : value.toLocaleDateString("es-CL");
}
const styles = StyleSheet.create({
  tabs: { padding: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  content: { padding: 18, gap: 16 },
  summary: {
    flexDirection: "row",
    padding: 18,
    gap: 24,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 16,
  },
  average: { color: c.ink, fontWeight: "900", fontSize: 42 },
  barRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  bar: { height: 6, flex: 1, borderRadius: 6, backgroundColor: c.primarySoft },
  fill: { height: "100%", backgroundColor: c.primary, borderRadius: 6 },
  card: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 14,
    padding: 16,
    gap: 9,
  },
  author: { color: c.ink, fontWeight: "700", fontSize: 13 },
  meta: { color: c.muted, fontSize: 11 },
  verified: { color: c.success, fontSize: 11 },
  answer: {
    backgroundColor: c.background,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  bottom: { padding: 14, borderTopWidth: 1, borderColor: c.border },
  input: {
    minHeight: 160,
    padding: 16,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 14,
    color: c.ink,
    fontSize: 15,
  },
  notice: { color: c.primary, fontSize: 13, lineHeight: 21 },
});
