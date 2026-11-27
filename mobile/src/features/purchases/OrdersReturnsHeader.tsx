import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const purple = '#5B32EC';

export default function OrdersReturnsHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={onBack}
        style={styles.backButton}>
        <MaterialIcons name="arrow-back-ios-new" size={18} color="#FFFFFF" />
      </Pressable>
      <View>
        <View style={styles.identity}>
          <MaterialIcons name="shopping-bag" size={14} color="#E5DEFF" />
          <Text style={styles.eyebrow}>Mi cuenta · Gaby</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    backgroundColor: purple,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  eyebrow: { color: '#D9D0FF', fontSize: 10 },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
});
