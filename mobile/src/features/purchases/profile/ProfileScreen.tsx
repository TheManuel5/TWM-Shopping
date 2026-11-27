import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { purchaseTextScale } from '../components/PurchaseUi';

type Props = {
  onBack: () => void;
  onAddresses: () => void;
  addressSummary: string;
  hasSelectedAddress: boolean;
  fullName: string;
  onFullNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  role: 'Comprar' | 'Vender';
  onRoleChange: (role: 'Comprar' | 'Vender') => void;
};

type Phone = {
  id: string;
  number: string;
  label: string;
};

type SaveNotice = {
  tone: 'success' | 'error';
  message: string;
};

const purple = '#5B32EC';
const ink = '#25243A';
const muted = '#77768A';
const border = '#E9E7F0';
const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function ProfileScreen({
  onBack,
  onAddresses,
  addressSummary,
  hasSelectedAddress,
  fullName,
  onFullNameChange,
  email,
  onEmailChange,
  role,
  onRoleChange,
}: Props) {
  const [emailEditable, setEmailEditable] = useState(false);
  const [phones, setPhones] = useState<Phone[]>([
    { id: 'phone-1', number: '998765432', label: 'Principal' },
    { id: 'phone-2', number: '912345678', label: 'Secundario' },
  ]);
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [addingPhone, setAddingPhone] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState('');
  const [birthDay, setBirthDay] = useState('14');
  const [birthMonth, setBirthMonth] = useState('Marzo');
  const [birthYear, setBirthYear] = useState('1990');
  const [notice, setNotice] = useState<SaveNotice | null>(null);
  const today = new Date();
  const currentYear = today.getFullYear();
  const selectedYear = Number(birthYear);
  const latestMonthIndex =
    selectedYear === currentYear ? today.getMonth() : months.length - 1;
  const availableMonths = months.slice(0, latestMonthIndex + 1);
  const selectedMonthIndex = Math.min(
    Math.max(months.indexOf(birthMonth), 0),
    latestMonthIndex,
  );
  const availableDays = Array.from(
    { length: daysInMonth(selectedYear, selectedMonthIndex, today) },
    (_, index) => String(index + 1),
  );
  const availableYears = Array.from(
    { length: currentYear - 1940 + 1 },
    (_, index) => String(currentYear - index),
  );
  const hasIncompletePhone = phones.some(
    (phone) =>
      phone.number.length > 0 &&
      (phone.number.length !== 9 || !phone.number.startsWith('9')),
  );

  const addPhone = () => {
    const number = normalizeChileanPhone(phoneDraft);
    if (number.length !== 9 || !number.startsWith('9')) return;
    setPhones((current) => [
      ...current,
      { id: `phone-${current.length + 1}`, number, label: 'Secundario' },
    ]);
    setPhoneDraft('');
    setAddingPhone(false);
    setNotice(null);
  };

  const updatePhone = (id: string, value: string) => {
    const number = normalizeChileanPhone(value);
    setPhones((current) =>
      current.map((phone) => (phone.id === id ? { ...phone, number } : phone)),
    );
    setNotice(null);
  };

  const saveProfile = () => {
    const errors: string[] = [];
    const enteredPhones = phones.filter((phone) => phone.number.length > 0);

    if (fullName.trim().length < 3) errors.push('Complete su nombre completo.');
    if (!email.trim()) errors.push('Complete su correo.');
    if (!enteredPhones.length) {
      errors.push('Añada por lo menos un número.');
    } else if (hasIncompletePhone) {
      errors.push('Complete el número celular con 9 dígitos después del +56.');
    }
    if (addingPhone && phoneDraft.length > 0) {
      errors.push('Agregue o complete el número que está ingresando.');
    }
    if (!hasSelectedAddress) {
      errors.push('Seleccione una dirección o añada una antes de guardar.');
    }

    if (errors.length) {
      setNotice({ tone: 'error', message: errors.join(' ') });
      return;
    }

    setNotice({ tone: 'success', message: 'Cambios guardados con éxito.' });
    setEmailEditable(false);
    setEditingPhoneId(null);
    setAddingPhone(false);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={onBack}
            style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View>
            <View style={styles.headerIdentity}>
              <MaterialIcons name="shopping-bag" size={14} color="#E5DEFF" />
              <Text style={styles.headerEyebrow}>Mi cuenta · {fullName}</Text>
            </View>
            <Text style={styles.headerTitle}>Mi perfil</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>Administra y actualiza los datos de tu cuenta.</Text>

        <View style={styles.roleSwitch}>
          <RoleButton
            active={role === 'Comprar'}
            icon="shopping-cart"
            label="Comprar"
            onPress={() => onRoleChange('Comprar')}
          />
          <RoleButton
            active={role === 'Vender'}
            icon="store"
            label="Vender"
            onPress={() => onRoleChange('Vender')}
          />
        </View>
        <Text style={styles.roleHint}>Puedes cambiar de rol en cualquier momento.</Text>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <View style={styles.cardTitleIcon}>
              <MaterialIcons name="person-outline" size={20} color={purple} />
            </View>
            <Text style={styles.cardTitle}>Información personal</Text>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.halfField}>
              <FieldLabel>Nombre completo</FieldLabel>
              <TextInput
                value={fullName}
                maxLength={80}
                autoCapitalize="words"
                textContentType="name"
                style={styles.input}
                onChangeText={(value) => {
                  onFullNameChange(value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g, ''));
                  setNotice(null);
                }}
              />
            </View>
            <View style={styles.halfField}>
              <FieldLabel>RUT (no editable)</FieldLabel>
              <TextInput
                editable={false}
                defaultValue="12.345.678-9"
                style={[styles.input, styles.readOnlyInput]}
              />
            </View>
          </View>

          <FieldLabel>Fecha de nacimiento</FieldLabel>
          <View style={styles.fieldRow}>
            <DateSelect
              label="Día"
              value={birthDay}
              options={availableDays}
              onSelect={(value) => {
                setBirthDay(value);
                setNotice(null);
              }}
            />
            <DateSelect
              label="Mes"
              value={birthMonth}
              options={availableMonths}
              onSelect={(value) => {
                setBirthMonth(value);
                const nextMonthIndex = months.indexOf(value);
                const maximumDay = daysInMonth(selectedYear, nextMonthIndex, today);
                if (Number(birthDay) > maximumDay) {
                  setBirthDay(String(maximumDay));
                }
                setNotice(null);
              }}
            />
            <DateSelect
              label="Año"
              value={birthYear}
              options={availableYears}
              onSelect={(value) => {
                const nextYear = Number(value);
                const nextLatestMonthIndex =
                  nextYear === currentYear ? today.getMonth() : months.length - 1;
                const nextMonthIndex = Math.min(
                  Math.max(months.indexOf(birthMonth), 0),
                  nextLatestMonthIndex,
                );
                const nextMonth = months[nextMonthIndex];
                const maximumDay = daysInMonth(nextYear, nextMonthIndex, today);
                setBirthYear(value);
                if (nextMonth !== birthMonth) {
                  setBirthMonth(nextMonth);
                }
                if (Number(birthDay) > maximumDay) {
                  setBirthDay(String(maximumDay));
                }
                setNotice(null);
              }}
            />
          </View>

          <FieldLabel>Correo electrónico</FieldLabel>
          <View style={styles.emailRow}>
            <TextInput
              editable={emailEditable}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(value) => {
                onEmailChange(value);
                setNotice(null);
              }}
              style={[styles.input, styles.emailInput, !emailEditable && styles.readOnlyInput]}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setEmailEditable((editable) => !editable)}
              style={styles.editEmailButton}>
              <MaterialIcons name="edit" size={16} color={purple} />
              <Text style={styles.editEmailText}>{emailEditable ? 'Listo' : 'Editar'}</Text>
            </Pressable>
          </View>

          <FieldLabel>Teléfonos</FieldLabel>
          <View style={styles.phoneList}>
            {phones.map((phone) => (
              <View key={phone.id} style={styles.phoneCard}>
                <View style={styles.phoneCardHeader}>
                  <View style={styles.phoneLabel}>
                    <Text style={styles.phoneLabelText}>{phone.label}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${editingPhoneId === phone.id ? 'Terminar edición de' : 'Editar'} teléfono ${phone.label.toLowerCase()}`}
                    onPress={() => {
                      setEditingPhoneId((current) => current === phone.id ? null : phone.id);
                      setNotice(null);
                    }}
                    style={styles.phoneEditButton}>
                    <MaterialIcons
                      name={editingPhoneId === phone.id ? 'check' : 'edit'}
                      size={16}
                      color={purple}
                    />
                    <Text style={styles.phoneEditText}>
                      {editingPhoneId === phone.id ? 'Listo' : 'Editar'}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Eliminar ${phone.label.toLowerCase()}`}
                    onPress={() => {
                      setPhones((current) => current.filter((item) => item.id !== phone.id));
                      if (editingPhoneId === phone.id) setEditingPhoneId(null);
                      setNotice(null);
                    }}
                    style={styles.deleteButton}>
                    <MaterialIcons name="delete-outline" size={18} color="#8B8998" />
                  </Pressable>
                </View>
                <View style={styles.phoneNumberRow}>
                  <View style={styles.phonePrefix}>
                    <Text style={styles.phonePrefixText}>+56</Text>
                  </View>
                  <TextInput
                    editable={editingPhoneId === phone.id}
                    value={phone.number}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="912345678"
                    placeholderTextColor="#A4A2AE"
                    style={[
                      styles.phoneInput,
                      editingPhoneId !== phone.id && styles.readOnlyPhoneInput,
                    ]}
                    onChangeText={(value) => updatePhone(phone.id, value)}
                  />
                </View>
              </View>
            ))}
          </View>
          {hasIncompletePhone ? (
            <Text style={styles.phoneHint}>Ingresa 9 dígitos y comienza con 9 después del prefijo +56.</Text>
          ) : null}

          {addingPhone ? (
            <>
              <View style={styles.addPhoneRow}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>+56</Text>
                </View>
                <TextInput
                  autoFocus
                  value={phoneDraft}
                  onChangeText={(value) => {
                    setPhoneDraft(normalizeChileanPhone(value));
                    setNotice(null);
                  }}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="912345678"
                  placeholderTextColor="#A4A2AE"
                  style={[styles.input, styles.phoneDraft]}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={phoneDraft.length !== 9 || !phoneDraft.startsWith('9')}
                  onPress={addPhone}
                  style={[
                    styles.smallAddButton,
                    (phoneDraft.length !== 9 || !phoneDraft.startsWith('9')) && styles.disabledButton,
                  ]}>
                  <Text style={styles.smallAddText}>＋</Text>
                </Pressable>
              </View>
              {phoneDraft.length > 0 && (phoneDraft.length !== 9 || !phoneDraft.startsWith('9')) ? (
                <Text style={styles.phoneHint}>Ingresa 9 dígitos y comienza con 9.</Text>
              ) : null}
            </>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => setAddingPhone(true)}
              style={styles.addPhoneButton}>
              <Text style={styles.addPhoneText}>＋  Agregar teléfono</Text>
            </Pressable>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onAddresses}
          style={({ pressed }) => [styles.addressAction, pressed && styles.pressed]}>
          <View style={styles.addressIcon}>
            <MaterialIcons name="location-on" size={19} color={purple} />
          </View>
          <View style={styles.addressCopy}>
            <Text style={styles.addressTitle}>Mis direcciones</Text>
            <Text style={styles.addressDescription}>{addressSummary}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={21} color={muted} />
        </Pressable>

      </ScrollView>

      <View style={styles.footer}>
        {notice ? (
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[
              styles.notice,
              notice.tone === 'success' ? styles.successNotice : styles.errorNotice,
            ]}>
            <MaterialIcons
              name={notice.tone === 'success' ? 'check-circle-outline' : 'error-outline'}
              size={18}
              color={notice.tone === 'success' ? '#16835B' : '#B23B36'}
            />
            <Text
              style={[
                styles.noticeText,
                notice.tone === 'success' ? styles.successNoticeText : styles.errorNoticeText,
              ]}>
              {notice.message}
            </Text>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={saveProfile}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.saveButtonText}>Guardar cambios</Text>
        </Pressable>
      </View>
    </View>
  );
}

function RoleButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: 'shopping-cart' | 'store';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.roleButton, active && styles.roleButtonActive]}>
      <MaterialIcons name={icon} size={19} color={active ? purple : muted} />
      <Text style={[styles.roleText, active && styles.roleTextActive]}>{label}</Text>
    </Pressable>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function normalizeChileanPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  const nationalNumber = digits.startsWith('56') ? digits.slice(2) : digits;
  return nationalNumber.slice(0, 9);
}

function daysInMonth(year: number, monthIndex: number, today: Date) {
  const days = new Date(year, monthIndex + 1, 0).getDate();
  return year === today.getFullYear() && monthIndex === today.getMonth()
    ? Math.min(days, today.getDate())
    : days;
}

function DateSelect({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const optionLayout =
    label === 'Día' ? styles.dayOption : label === 'Mes' ? styles.monthOption : styles.yearOption;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Seleccionar ${label.toLowerCase()}`}
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen((open) => !open)}
        style={styles.dateSelect}>
        <Text style={styles.dateText}>{value}</Text>
        <Text style={styles.dateChevron}>{isOpen ? '⌃' : '⌄'}</Text>
      </Pressable>
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}>
        <View style={styles.dateModalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar selector"
            onPress={() => setIsOpen(false)}
            style={[StyleSheet.absoluteFill, styles.dateModalDismiss]}
          />
          <View style={styles.datePickerCard}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Seleccionar {label.toLowerCase()}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar selector"
                onPress={() => setIsOpen(false)}
                style={styles.datePickerClose}>
                <MaterialIcons name="close" size={20} color={muted} />
              </Pressable>
            </View>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={styles.dateOptionsScroll}
              contentContainerStyle={styles.dateOptionsGrid}>
              {options.map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: option === value }}
                  onPress={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  style={[
                    styles.dateOption,
                    optionLayout,
                    option === value && styles.dateOptionSelected,
                  ]}>
                  <Text style={[styles.dateText, option === value && styles.dateOptionTextSelected]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    backgroundColor: '#FAF9FD',
  },
  header: {
    height: 92,
    width: '100%',
    backgroundColor: purple,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: '#FFFFFF', fontSize: 30, lineHeight: 34, marginTop: -3 },
  headerIdentity: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  headerEyebrow: { color: '#D9D0FF', fontSize: 10 },
  headerTitle: { color: '#FFFFFF', fontSize: purchaseTextScale.pageTitle, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 20 },
  intro: { color: muted, fontSize: purchaseTextScale.subtitle, marginBottom: 12 },
  roleSwitch: { flexDirection: 'row', gap: 10 },
  roleButton: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: border,
    backgroundColor: '#FFFFFF',
  },
  roleButtonActive: { backgroundColor: '#F3F0FF', borderColor: '#E1DAFF' },
  roleText: { color: '#6E6B7E', fontSize: purchaseTextScale.body, fontWeight: '600' },
  roleTextActive: { color: purple },
  roleHint: { color: '#8C8A98', fontSize: 10, marginTop: 7, marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: border,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  addressAction: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  addressIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#F1EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressCopy: { flex: 1, gap: 3 },
  addressTitle: { color: ink, fontSize: purchaseTextScale.body, fontWeight: '600' },
  addressDescription: { color: muted, fontSize: 11, lineHeight: 16 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 13 },
  cardTitleIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F1EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: ink, fontSize: purchaseTextScale.sectionTitle, fontWeight: '700' },
  fieldRow: { flexDirection: 'row', gap: 9, marginBottom: 11 },
  halfField: { flex: 1 },
  fieldLabel: { color: '#3A394C', fontSize: 11, fontWeight: '600', marginBottom: 6 },
  input: {
    height: 38,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 10,
    paddingHorizontal: 11,
    color: ink,
    fontSize: 12,
    backgroundColor: '#FFFFFF',
  },
  readOnlyInput: { backgroundColor: '#F2F1F5', color: '#9B99A7' },
  dateSelect: {
    height: 38,
    flex: 1,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: { color: '#4B495B', fontSize: 12 },
  dateChevron: { color: '#777487', fontSize: 14 },
  dateModalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: 'rgba(27, 24, 43, 0.32)',
  },
  dateModalDismiss: { zIndex: 0 },
  datePickerCard: {
    zIndex: 1,
    width: '100%',
    maxWidth: 390,
    maxHeight: '68%',
    borderWidth: 1,
    borderColor: border,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 14,
    shadowColor: '#25243A',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  datePickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 6, marginBottom: 8 },
  datePickerTitle: { color: ink, fontSize: 16, fontWeight: '700' },
  datePickerClose: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F4F8' },
  dateOptionsScroll: { maxHeight: 300 },
  dateOptionsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dateOption: { minHeight: 42, justifyContent: 'center', alignItems: 'center', marginBottom: 3, borderRadius: 10 },
  dayOption: { width: '14.28%' },
  monthOption: { width: '50%' },
  yearOption: { width: '25%' },
  dateOptionSelected: { backgroundColor: '#F3F0FF' },
  dateOptionTextSelected: { color: purple, fontWeight: '700' },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 11 },
  emailInput: { flex: 1 },
  editEmailButton: { width: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  editEmailText: { color: purple, fontSize: 11, fontWeight: '600' },
  phoneList: { gap: 9 },
  phoneCard: { padding: 10, borderWidth: 1, borderColor: border, borderRadius: 12, backgroundColor: '#FFFFFF', gap: 8 },
  phoneCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phoneEditButton: { marginLeft: 'auto', minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#F3F0FF' },
  phoneEditText: { color: purple, fontSize: 11, fontWeight: '600' },
  phoneNumberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phonePrefix: {
    height: 38,
    minWidth: 54,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: '#F8F7FB',
  },
  phonePrefixText: { color: '#5D5A6D', fontSize: 11, fontWeight: '600' },
  phoneInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 12,
    color: ink,
  },
  readOnlyPhoneInput: { backgroundColor: '#F8F7FB', color: '#59576A' },
  phoneLabel: { minWidth: 58, alignItems: 'center', paddingHorizontal: 7, paddingVertical: 5, borderRadius: 9, backgroundColor: '#F0EFF4' },
  phoneLabelText: { color: '#777587', fontSize: 10, fontWeight: '600' },
  deleteButton: { width: 32, height: 32, borderWidth: 1, borderColor: border, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  addPhoneButton: {
    minHeight: 36,
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: purple,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoneText: { color: purple, fontSize: 11, fontWeight: '600' },
  addPhoneRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  phoneDraft: { flex: 1 },
  phoneHint: { color: '#A34E26', fontSize: 10, marginTop: 5 },
  smallAddButton: { width: 38, height: 38, borderRadius: 10, backgroundColor: purple, alignItems: 'center', justifyContent: 'center' },
  smallAddText: { color: '#FFFFFF', fontSize: 20, lineHeight: 23 },
  disabledButton: { opacity: 0.45 },
  footer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EEF4',
    backgroundColor: '#FFFFFF',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 11,
    borderWidth: 1,
    marginBottom: 8,
  },
  successNotice: { backgroundColor: '#EAF8F1', borderColor: '#C8EAD8' },
  errorNotice: { backgroundColor: '#FFF1EF', borderColor: '#F1D1CD' },
  noticeText: { flex: 1, fontSize: 11, lineHeight: 16 },
  successNoticeText: { color: '#16835B' },
  errorNoticeText: { color: '#B23B36' },
  saveButton: { minHeight: 42, borderRadius: 22, backgroundColor: purple, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
