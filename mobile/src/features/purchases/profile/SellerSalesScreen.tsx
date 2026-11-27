import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import {
  AppText,
  PrimaryButton,
  SectionTitle,
  purchaseTextScale,
} from '../components/PurchaseUi';

const purple = '#5B32EC';
const muted = '#77768A';

export default function SellerSalesScreen({
  onSwitchToBuyer,
}: {
  onSwitchToBuyer: () => void;
}) {
  return (
    <View style={styles.content}>
      <View style={styles.sectionIntro}>
        <SectionTitle title="Panel de vendedor" />
        <AppText style={styles.storeDescription}>
          Resumen comercial, publicaciones y operaciones de tu tienda.
        </AppText>
      </View>

      <View style={styles.stats}>
        <SellerStat label="Ventas del mes" value="0" />
        <SellerStat label="Pedidos pendientes" value="0" />
      </View>
      <View style={styles.stats}>
        <SellerStat label="Publicaciones activas" value="0" />
        <SellerStat label="Cotizaciones por responder" value="0" />
      </View>

      <View style={styles.panel}>
        <SectionTitle title="Actividad de vendedor" />
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <MaterialIcons name="storefront" size={25} color={purple} />
          </View>
          <AppText style={styles.emptyTitle}>Aún no hay actividad de vendedor</AppText>
          <AppText style={styles.emptyDescription}>
            Tus ventas, pedidos y publicaciones aparecerán aquí cuando estén asociados a tu cuenta.
          </AppText>
        </View>
      </View>

      <View style={styles.note}>
        <MaterialIcons name="info-outline" size={18} color={purple} />
        <AppText style={styles.noteText}>
          El panel muestra los indicadores de vendedor disponibles para esta cuenta.
        </AppText>
      </View>
      <PrimaryButton label="Cambiar a modo comprador" onPress={onSwitchToBuyer} />
    </View>
  );
}

function SellerStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <AppText style={styles.statValue}>{value}</AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 13, paddingBottom: 24, backgroundColor: '#FAF9FD' },
  sectionIntro: { gap: 5 },
  storeDescription: { color: muted, fontSize: purchaseTextScale.subtitle, lineHeight: 19 },
  stats: { flexDirection: 'row', gap: 9 },
  statCard: { flex: 1, minHeight: 75, alignItems: 'center', justifyContent: 'center', gap: 5, padding: 8, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEEAF5' },
  statValue: { color: purple, fontSize: purchaseTextScale.pageTitle, fontWeight: '800' },
  statLabel: { color: muted, fontSize: purchaseTextScale.body, textAlign: 'center' },
  panel: { padding: 14, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEEAF5' },
  emptyState: { alignItems: 'center', gap: 8, paddingVertical: 28, paddingHorizontal: 10 },
  emptyIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 29, backgroundColor: '#EFEAFF' },
  emptyTitle: { color: '#25243A', fontSize: purchaseTextScale.sectionTitle, fontWeight: '700', textAlign: 'center' },
  emptyDescription: { color: muted, fontSize: purchaseTextScale.body, lineHeight: 18, textAlign: 'center' },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 12, borderRadius: 12, backgroundColor: '#F0EDFF' },
  noteText: { flex: 1, color: '#5E5973', fontSize: purchaseTextScale.body, lineHeight: 18 },
});