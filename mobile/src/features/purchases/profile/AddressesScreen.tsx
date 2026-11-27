import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import OrdersReturnsHeader from '../OrdersReturnsHeader';
import { CHILE_GEOGRAPHY } from './chileGeography';
import type { PurchaseAddress } from '../purchaseTypes';
import { deleteAddress, saveAddress } from '../services/profileApi';
import {
  AppText,
  EmptyState,
  OutlineButton,
  PrimaryButton,
  purchaseTextScale,
} from '../components/PurchaseUi';

const purple = '#5B32EC';
const ink = '#25243A';
const muted = '#77768A';
type GeographyField = 'region' | 'province' | 'commune';

function lettersAndSpaces(value: string) {
  return value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, '');
}

export default function AddressesScreen({
  addresses,
  accountName,
  selectedAddressId,
  returnToCheckout = false,
  onAddressesChange,
  onSelectAddress,
  onBack,
  onUseSelectedAddress,
}: {
  addresses: PurchaseAddress[];
  accountName: string;
  selectedAddressId: string | null;
  returnToCheckout?: boolean;
  onAddressesChange: (addresses: PurchaseAddress[]) => void;
  onSelectAddress: (id: string | null) => void;
  onBack: () => void;
  onUseSelectedAddress?: () => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState('');
  const [regionInput, setRegionInput] = useState('');
  const [provinceInput, setProvinceInput] = useState('');
  const [communeInput, setCommuneInput] = useState('');
  const [streetInput, setStreetInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('');
  const [referenceInput, setReferenceInput] = useState('');
  const [geoPicker, setGeoPicker] = useState<GeographyField | null>(null);

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId);
  const geographyOptions = geoPicker === 'region'
    ? Object.keys(CHILE_GEOGRAPHY)
    : geoPicker === 'province'
      ? Object.keys(CHILE_GEOGRAPHY[regionInput] ?? {})
      : geoPicker === 'commune'
        ? CHILE_GEOGRAPHY[regionInput]?.[provinceInput] ?? []
        : [];
  const addressGeographyIsValid = Boolean(
    CHILE_GEOGRAPHY[regionInput]?.[provinceInput]?.includes(communeInput),
  );

  const openAddressEditor = (address?: PurchaseAddress) => {
    setEditingAddressId(address?.id ?? null);
    setAddressLabel(address?.label ?? '');
    setRegionInput(address?.region ?? '');
    setProvinceInput(address?.province ?? '');
    setCommuneInput(address?.commune ?? '');
    setStreetInput(address?.street ?? '');
    setNumberInput(address?.number ?? '');
    setDepartmentInput(address?.department ?? '');
    setReferenceInput(address?.reference ?? '');
    setGeoPicker(null);
    setFormOpen(true);
  };

  const closeEditor = () => {
    setFormOpen(false);
    setEditingAddressId(null);
  };

  const selectGeography = (field: GeographyField, value: string) => {
    if (field === 'region') {
      const provinces = CHILE_GEOGRAPHY[value] ?? {};
      const province = Object.keys(provinces)[0] ?? '';
      setRegionInput(value);
      setProvinceInput(province);
      setCommuneInput(provinces[province]?.[0] ?? '');
    } else if (field === 'province') {
      setProvinceInput(value);
      setCommuneInput(CHILE_GEOGRAPHY[regionInput]?.[value]?.[0] ?? '');
    } else {
      setCommuneInput(value);
    }
    setGeoPicker(null);
  };

  const handleDeleteAddress = (id: string) => {
    const remaining = deleteAddress(addresses, id);
    onAddressesChange(remaining);
    if (selectedAddressId === id) onSelectAddress(remaining[0]?.id ?? null);
  };

  const saveEditedAddress = () => {
    const requiredFields = [
      addressLabel,
      regionInput,
      provinceInput,
      communeInput,
      streetInput,
      numberInput,
    ];
    if (requiredFields.some((value) => !value.trim()) || !addressGeographyIsValid) return;

    const updatedAddress: PurchaseAddress = {
      id: editingAddressId ?? `address-${Date.now()}`,
      label: addressLabel.trim(),
      region: regionInput.trim(),
      province: provinceInput.trim(),
      commune: communeInput.trim(),
      street: streetInput.trim(),
      number: numberInput.trim(),
      department: departmentInput.trim(),
      reference: referenceInput.trim(),
    };
    onAddressesChange(saveAddress(addresses, updatedAddress));
    onSelectAddress(updatedAddress.id);
    closeEditor();
  };

  return (
    <>
      <OrdersReturnsHeader
        title={formOpen
          ? editingAddressId ? 'Editar dirección' : 'Agregar dirección'
          : 'Mis direcciones'}
        accountName={accountName}
        onBack={formOpen ? closeEditor : onBack}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {formOpen ? (
          <>
            <View style={styles.card}>
              <AppText style={styles.inputLabel}>Etiqueta</AppText>
              <TextInput
                value={addressLabel}
                onChangeText={(value) => setAddressLabel(lettersAndSpaces(value))}
                placeholder="Casa u oficina"
                placeholderTextColor="#9696A5"
                autoCapitalize="words"
                style={styles.input}
              />
              <AppText style={styles.inputLabel}>Región</AppText>
              <GeographySelect
                value={regionInput}
                placeholder="Selecciona una región"
                onPress={() => setGeoPicker('region')}
              />
              <AppText style={styles.inputLabel}>Provincia</AppText>
              <GeographySelect
                value={provinceInput}
                placeholder="Selecciona una provincia"
                disabled={!regionInput}
                onPress={() => setGeoPicker('province')}
              />
              <AppText style={styles.inputLabel}>Comuna</AppText>
              <GeographySelect
                value={communeInput}
                placeholder="Selecciona una comuna"
                disabled={!provinceInput}
                onPress={() => setGeoPicker('commune')}
              />
              <AppText style={styles.inputLabel}>Calle</AppText>
              <TextInput
                value={streetInput}
                onChangeText={setStreetInput}
                placeholder="Nombre de la calle"
                placeholderTextColor="#9696A5"
                autoCapitalize="words"
                style={styles.input}
              />
              <AppText style={styles.inputLabel}>Número</AppText>
              <TextInput
                value={numberInput}
                onChangeText={(value) => setNumberInput(value.replace(/\D/g, '').slice(0, 8))}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={8}
                placeholder="Número exterior"
                placeholderTextColor="#9696A5"
                style={styles.input}
              />
              <AppText style={styles.inputLabel}>Departamento (opcional)</AppText>
              <TextInput
                value={departmentInput}
                onChangeText={setDepartmentInput}
                placeholder="Depto. / oficina"
                placeholderTextColor="#9696A5"
                style={styles.input}
              />
              <AppText style={styles.inputLabel}>Referencia (opcional)</AppText>
              <TextInput
                value={referenceInput}
                onChangeText={setReferenceInput}
                placeholder="Indicaciones para llegar"
                placeholderTextColor="#9696A5"
                multiline
                style={styles.textArea}
              />
            </View>
            <PrimaryButton
              label={editingAddressId ? 'Guardar cambios' : 'Guardar dirección'}
              disabled={
                !addressLabel.trim() ||
                !regionInput.trim() ||
                !provinceInput.trim() ||
                !communeInput.trim() ||
                !streetInput.trim() ||
                !numberInput.trim() ||
                !addressGeographyIsValid
              }
              onPress={saveEditedAddress}
            />
            <OutlineButton label="Cancelar" onPress={closeEditor} />
          </>
        ) : (
          <>
            {addresses.length ? (
              addresses.map((address) => {
                const selected = address.id === selectedAddressId;
                return (
                  <View
                    key={address.id}
                    style={[styles.addressCard, selected && styles.addressCardSelected]}>
                    <View style={styles.addressCardHeader}>
                      <AppText style={styles.addressName}>{address.label}</AppText>
                      <View style={styles.addressActions}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Editar dirección ${address.label}`}
                          onPress={() => openAddressEditor(address)}
                          style={styles.addressIconButton}>
                          <MaterialIcons name="edit" size={17} color={purple} />
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Eliminar dirección ${address.label}`}
                          onPress={() => handleDeleteAddress(address.id)}
                          style={styles.addressIconButton}>
                          <MaterialIcons name="delete-outline" size={18} color={muted} />
                        </Pressable>
                        {selected ? (
                          <View
                            accessible
                            accessibilityLabel="Dirección seleccionada"
                            style={styles.selectedAddressCheck}>
                            <MaterialIcons name="check" size={17} color="#FFFFFF" />
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => onSelectAddress(address.id)}
                      style={styles.addressDetails}>
                      <AppText style={styles.secondaryText}>
                        {address.region}, Provincia de {address.province}, Comuna de {address.commune}
                      </AppText>
                      <AppText style={styles.addressText}>
                        {address.street} {address.number}
                        {address.department ? `, ${address.department}` : ''}
                      </AppText>
                      {address.reference ? (
                        <AppText style={styles.secondaryText}>
                          Referencia: {address.reference}
                        </AppText>
                      ) : null}
                      {selected ? (
                        <AppText style={styles.selectedLabel}>Dirección seleccionada</AppText>
                      ) : null}
                    </Pressable>
                  </View>
                );
              })
            ) : (
              <EmptyState
                title="Aún no tienes direcciones"
                description="Agrega una dirección para recibir tus compras."
              />
            )}
            <OutlineButton
              label="＋　Agregar dirección"
              onPress={() => openAddressEditor()}
            />
            {returnToCheckout ? (
              <PrimaryButton
                label="Usar dirección seleccionada"
                disabled={!selectedAddress}
                onPress={onUseSelectedAddress ?? onBack}
              />
            ) : null}
          </>
        )}
      </ScrollView>
      <Modal
        visible={geoPicker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setGeoPicker(null)}>
        <View style={styles.geoPickerBackdrop}>
          <View style={styles.geoPickerCard}>
            <View style={styles.geoPickerHeader}>
              <AppText style={styles.geoPickerTitle}>
                {geoPicker === 'region'
                  ? 'Selecciona una región'
                  : geoPicker === 'province'
                    ? 'Selecciona una provincia'
                    : 'Selecciona una comuna'}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar selector"
                onPress={() => setGeoPicker(null)}
                style={styles.geoPickerClose}>
                <MaterialIcons name="close" size={20} color={muted} />
              </Pressable>
            </View>
            <ScrollView style={styles.geoPickerOptions}>
              {geographyOptions.map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected:
                      (geoPicker === 'region' && option === regionInput) ||
                      (geoPicker === 'province' && option === provinceInput) ||
                      (geoPicker === 'commune' && option === communeInput),
                  }}
                  onPress={() => geoPicker && selectGeography(geoPicker, option)}
                  style={styles.geoPickerOption}>
                  <AppText style={styles.geoPickerOptionText}>{option}</AppText>
                  {((geoPicker === 'region' && option === regionInput) ||
                    (geoPicker === 'province' && option === provinceInput) ||
                    (geoPicker === 'commune' && option === communeInput)) ? (
                    <MaterialIcons name="check" size={19} color={purple} />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function GeographySelect({
  value,
  placeholder,
  onPress,
  disabled = false,
}: {
  value: string;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.geoSelect, disabled && styles.geoSelectDisabled]}>
      <AppText style={[styles.geoSelectText, !value && styles.geoSelectPlaceholder]}>
        {value || placeholder}
      </AppText>
      <MaterialIcons name="keyboard-arrow-down" size={21} color={muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#EEEAF5' },
  inputLabel: { color: muted, fontSize: 11, marginTop: 12, marginBottom: 6 },
  input: { height: 43, borderWidth: 1, borderColor: '#E6E3ED', borderRadius: 10, paddingHorizontal: 12, color: ink, fontSize: purchaseTextScale.body },
  textArea: { minHeight: 82, borderWidth: 1, borderColor: '#E6E3ED', borderRadius: 10, padding: 11, textAlignVertical: 'top', color: ink, fontSize: purchaseTextScale.body },
  geoSelect: { minHeight: 45, borderWidth: 1, borderColor: '#E6E3ED', borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF' },
  geoSelectDisabled: { backgroundColor: '#F6F5F8', opacity: 0.6 },
  geoSelectText: { color: ink, fontSize: purchaseTextScale.body },
  geoSelectPlaceholder: { color: '#9696A5' },
  addressCard: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 16, borderWidth: 1, borderColor: '#EEEAF5', gap: 8 },
  addressCardSelected: { backgroundColor: '#F7F4FF', borderWidth: 2, borderColor: purple },
  addressCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  addressName: { color: ink, fontSize: purchaseTextScale.sectionTitle, fontWeight: '700' },
  addressActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressIconButton: { width: 31, height: 31, borderWidth: 1, borderColor: '#E9E7F0', borderRadius: 9, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  selectedAddressCheck: { width: 29, height: 29, borderRadius: 15, backgroundColor: purple, alignItems: 'center', justifyContent: 'center' },
  addressDetails: { gap: 2 },
  addressText: { color: ink, fontSize: purchaseTextScale.body, marginTop: 3 },
  secondaryText: { color: muted, fontSize: purchaseTextScale.body, lineHeight: 18 },
  selectedLabel: { color: purple, fontSize: 11, fontWeight: '700', marginTop: 4 },
  geoPickerBackdrop: { flex: 1, backgroundColor: 'rgba(27,24,40,0.42)', justifyContent: 'center', padding: 24 },
  geoPickerCard: { maxHeight: '80%', borderRadius: 18, padding: 16, backgroundColor: '#FFFFFF' },
  geoPickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  geoPickerTitle: { color: ink, fontSize: purchaseTextScale.sectionTitle, fontWeight: '700' },
  geoPickerClose: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#F4F2F7' },
  geoPickerOptions: { flexGrow: 0 },
  geoPickerOption: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE9F0', paddingHorizontal: 4 },
  geoPickerOptionText: { color: ink, fontSize: purchaseTextScale.body },
});
