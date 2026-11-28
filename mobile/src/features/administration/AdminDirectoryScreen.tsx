import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import {
  deleteCompanyRecord,
  deleteUserRecord,
  resetUserPassword,
  saveCompanyRecord,
  saveUserRecord,
} from '../publishing/api';
import type { ManagedCompany, ManagedUser, UserRoleOption } from '../publishing/types';
import {
  ActionButton,
  Badge,
  Card,
  Field,
  FilterChips,
  MultiPickerModal,
  OptionPickerModal,
  palette,
  ScreenShell,
  SearchBar,
  SectionTitle,
  StatCard,
  StateGate,
  styles as uiStyles,
} from '../publishing/ui';
import { useSellerState } from '../publishing/useSellerState';
import {
  cleanRut,
  limitChileanPhone,
  normalizeRut,
  validateCompanyDraft,
  validateUserDraft,
} from '../publishing/validation';

const USER_STATUSES = ['Todos', 'Activo', 'Inactivo'] as const;
const USER_ROLES = ['Todos', 'Cliente', 'Emprendedor', 'Administrador'] as const;
const COMPANY_STATUSES = ['Todos', 'Activa', 'En revisión', 'Suspendida'] as const;

const ROLE_OPTIONS: { label: string; value: UserRoleOption }[] = [
  { label: 'Cliente', value: 'Cliente' },
  { label: 'Emprendedor', value: 'Emprendedor' },
];

function createBlankUser(): ManagedUser {
  return {
    id: '',
    rut: '',
    name: '',
    email: '',
    phones: [''],
    birthDate: '',
    address: '',
    communeId: '',
    roles: ['Cliente'],
    status: 'Activo',
  };
}

function createBlankCompany(): ManagedCompany {
  return {
    id: '',
    rut: '',
    name: '',
    email: '',
    phones: [''],
    address: '',
    website: '',
    category: '',
    comuna: '',
    status: 'Activa',
    hasPhysicalStore: true,
    owner: {
      name: '',
      run: '',
      email: '',
      phone: '',
      address: '',
    },
  };
}

export function AdminDirectoryScreen({ kind }: { kind: 'users' | 'companies' }) {
  const isCompany = kind === 'companies';
  const { profile, collections, revision, loading, refreshing, error, reload, refresh } =
    useSellerState({
      requireSeller: isCompany,
      requireAdmin: !isCompany,
    });

  const isAdmin = Boolean(profile?.canAdmin);

  const rows = useMemo(
    () => (isCompany ? collections.companies ?? [] : collections.users ?? []),
    [collections.companies, collections.users, isCompany],
  );

  const communeOptions = useMemo(
    () =>
      (collections.geography?.communes ?? []).map((commune) => ({
        label: commune.nombre,
        value: isCompany ? commune.nombre : String(commune.id),
      })),
    [collections.geography?.communes, isCompany],
  );

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [selectedId, setSelectedId] = useState('');

  const [userDraft, setUserDraft] = useState<ManagedUser | null>(null);
  const [companyDraft, setCompanyDraft] = useState<ManagedCompany | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const [passwordTarget, setPasswordTarget] = useState<ManagedUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const text = [row.name, row.rut, row.email, ...(row.phones ?? [])]
        .join(' ')
        .toLowerCase();
      if (q && !text.includes(q)) return false;
      if (statusFilter !== 'Todos' && row.status !== statusFilter) return false;
      if (!isCompany && roleFilter !== 'Todos') {
        const userRow = row as ManagedUser;
        if (roleFilter === 'Administrador') return Boolean(userRow.canAdmin);
        return userRow.roles.includes(roleFilter as UserRoleOption);
      }
      return true;
    });
  }, [isCompany, query, roleFilter, rows, statusFilter]);

  const startCreate = () => {
    setFormErrors({});
    setActionError('');
    if (isCompany) {
      setCompanyDraft(createBlankCompany());
    } else {
      setUserDraft(createBlankUser());
    }
  };

  const startEdit = (row: ManagedUser | ManagedCompany) => {
    setFormErrors({});
    setActionError('');
    if (isCompany) {
      const comp = row as ManagedCompany;
      setCompanyDraft({
        ...comp,
        phones: comp.phones?.length ? [...comp.phones] : [''],
        owner: { ...comp.owner },
      });
    } else {
      const usr = row as ManagedUser;
      setUserDraft({
        ...usr,
        phones: usr.phones?.length ? [...usr.phones] : [''],
        roles: [...usr.roles],
      });
    }
  };

  const handleSaveUser = async () => {
    if (!userDraft || saving) return;
    const errors = validateUserDraft(userDraft, rows as ManagedUser[]);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const normalizedRut = normalizeRut(userDraft.rut);
    const payload: ManagedUser = {
      ...userDraft,
      id: userDraft.id || normalizedRut,
      rut: normalizedRut,
      name: userDraft.name.trim(),
      email: userDraft.email.trim().toLowerCase(),
      address: userDraft.address.trim(),
      communeId: Number(userDraft.communeId),
      phones: userDraft.phones.map((p) => p.trim()).filter(Boolean),
    };

    setSaving(true);
    setActionError('');
    try {
      await saveUserRecord(revision, payload);
      setUserDraft(null);
      await reload();
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : 'No se pudo guardar el usuario.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!companyDraft || saving) return;
    const errors = validateCompanyDraft(companyDraft, rows as ManagedCompany[]);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const normalizedRut = normalizeRut(companyDraft.rut);
    const payload: ManagedCompany = {
      ...companyDraft,
      id: companyDraft.id || normalizedRut,
      rut: normalizedRut,
      name: companyDraft.name.trim(),
      email: companyDraft.email.trim().toLowerCase(),
      address: companyDraft.address.trim(),
      website: companyDraft.website.trim(),
      category: companyDraft.category.trim(),
      phones: companyDraft.phones.map((p) => p.trim()).filter(Boolean),
      ownerRut: normalizeRut(companyDraft.owner.run),
      owner: {
        ...companyDraft.owner,
        name: companyDraft.owner.name.trim(),
        run: normalizeRut(companyDraft.owner.run),
        email: companyDraft.owner.email.trim().toLowerCase(),
        phone: companyDraft.owner.phone.trim(),
        address: companyDraft.owner.address.trim(),
      },
    };

    setSaving(true);
    setActionError('');
    try {
      await saveCompanyRecord(revision, payload);
      setCompanyDraft(null);
      await reload();
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : 'No se pudo guardar la empresa.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (row: ManagedUser | ManagedCompany) => {
    if (!isAdmin) return;
    if (!isCompany && profile && cleanRut(row.rut) === cleanRut(profile.rut)) {
      Alert.alert('Acción no permitida', 'No puedes desactivar tu propia cuenta.');
      return;
    }

    Alert.alert(
      isCompany ? 'Eliminar empresa' : 'Desactivar usuario',
      isCompany
        ? `¿Eliminar "${row.name}"? PostgreSQL conservará las referencias históricas.`
        : `¿Desactivar a "${row.name}"? Su historial se conservará y no podrá iniciar sesión.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: isCompany ? 'Eliminar' : 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            setActionError('');
            try {
              if (isCompany) {
                await deleteCompanyRecord(revision, row.id);
              } else {
                await deleteUserRecord(revision, row.id);
              }
              setSelectedId('');
              await reload();
            } catch (cause) {
              setActionError(
                cause instanceof Error ? cause.message : 'No se pudo completar la acción.',
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  const handlePasswordSave = async () => {
    if (!passwordTarget || saving) return;
    if (newPassword.length < 8 || newPassword.length > 72) {
      setPasswordError('La contraseña debe tener entre 8 y 72 caracteres.');
      return;
    }
    setSaving(true);
    setPasswordError('');
    try {
      await resetUserPassword(passwordTarget.rut, newPassword);
      setPasswordTarget(null);
      setNewPassword('');
      Alert.alert('Contraseña actualizada', `Se actualizó el acceso de ${passwordTarget.rut}.`);
    } catch (cause) {
      setPasswordError(
        cause instanceof Error ? cause.message : 'No se pudo actualizar la contraseña.',
      );
    } finally {
      setSaving(false);
    }
  };

  const userRows = rows as ManagedUser[];

  return (
    <ScreenShell
      title={isCompany ? 'Empresas y emprendedores' : 'Gestión de usuarios'}
      subtitle={
        isCompany
          ? 'Directorio de tiendas y propietarios'
          : 'Administración de cuentas y roles'
      }
      refreshing={refreshing}
      onRefresh={refresh}
      right={
        isAdmin ? (
          <Pressable
            accessibilityLabel={isCompany ? 'Nueva empresa' : 'Nuevo usuario'}
            onPress={startCreate}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: palette.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        ) : undefined
      }
    >
      <StateGate loading={loading} error={error} onRetry={reload}>
        {!isCompany && (
          <View style={uiStyles.statGrid}>
            <StatCard label="Usuarios" value={String(userRows.length)} />
            <StatCard
              label="Compradores"
              value={String(userRows.filter((u) => u.roles.includes('Cliente')).length)}
            />
            <StatCard
              label="Vendedores"
              value={String(userRows.filter((u) => u.roles.includes('Emprendedor')).length)}
              tone="success"
            />
            <StatCard
              label="Admins"
              value={String(userRows.filter((u) => u.canAdmin).length)}
            />
          </View>
        )}

        {isCompany && !isAdmin && (
          <Card style={{ backgroundColor: palette.primarySoft }}>
            <Text style={uiStyles.hintText}>
              Modo vendedor: ves únicamente las empresas asociadas a tu RUT. Solo un administrador puede crear o eliminar empresas.
            </Text>
          </Card>
        )}

        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nombre, RUT, correo o teléfono..."
        />

        <FilterChips
          options={isCompany ? COMPANY_STATUSES : USER_STATUSES}
          selected={statusFilter}
          onSelect={setStatusFilter}
        />

        {!isCompany && (
          <FilterChips
            options={USER_ROLES}
            selected={roleFilter}
            onSelect={setRoleFilter}
          />
        )}

        {actionError ? <Text style={uiStyles.errorText}>{actionError}</Text> : null}

        {filtered.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
            <Text style={uiStyles.hintText}>No se encontraron registros.</Text>
          </Card>
        ) : (
          filtered.map((row) => {
            const expanded = selectedId === row.id;
            const active = row.status === 'Activo' || row.status === 'Activa';
            const userRow = row as ManagedUser;
            const companyRow = row as ManagedCompany;

            return (
              <Card key={row.id}>
                <Pressable
                  onPress={() => setSelectedId(expanded ? '' : row.id)}
                  style={{ gap: 4 }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: '800', color: palette.ink }}>
                      {row.name}
                    </Text>
                    <Badge label={row.status} tone={active ? 'success' : 'neutral'} />
                  </View>
                  <Text style={uiStyles.hintText}>
                    RUT: {row.rut} · {row.email}
                  </Text>
                  <Text style={uiStyles.hintText}>
                    {isCompany
                      ? `Dueño: ${companyRow.owner?.name || '—'} · Giro: ${companyRow.category || '—'}`
                      : `Roles: ${[
                          ...userRow.roles,
                          ...(userRow.canAdmin ? ['Administrador'] : []),
                        ].join(' · ')}`}
                  </Text>
                </Pressable>

                {expanded && (
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: palette.border,
                      paddingTop: 10,
                      marginTop: 4,
                      gap: 6,
                    }}
                  >
                    <Text style={uiStyles.hintText}>
                      Teléfonos: {row.phones?.join(', ') || 'Sin registro'}
                    </Text>
                    <Text style={uiStyles.hintText}>
                      Dirección: {row.address || 'Solo en línea'}
                    </Text>
                    {isCompany && companyRow.website ? (
                      <Text style={uiStyles.hintText}>Web: {companyRow.website}</Text>
                    ) : null}

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                      <ActionButton
                        label="Editar"
                        icon="create-outline"
                        variant="outline"
                        onPress={() => startEdit(row)}
                        style={{ flex: 1, paddingVertical: 8 }}
                      />
                      {!isCompany && isAdmin && (
                        <ActionButton
                          label="Contraseña"
                          icon="key-outline"
                          variant="outline"
                          onPress={() => {
                            setNewPassword('');
                            setPasswordError('');
                            setPasswordTarget(userRow);
                          }}
                          style={{ flex: 1, paddingVertical: 8 }}
                        />
                      )}
                      {isAdmin && (
                        <ActionButton
                          label={isCompany ? 'Eliminar' : 'Desactivar'}
                          icon="trash-outline"
                          variant="danger"
                          onPress={() => handleDelete(row)}
                          style={{ flex: 1, paddingVertical: 8 }}
                        />
                      )}
                    </View>
                  </View>
                )}
              </Card>
            );
          })
        )}

        <Modal
          visible={Boolean(userDraft)}
          transparent
          animationType="slide"
          onRequestClose={() => setUserDraft(null)}
        >
          <View style={uiStyles.modalBackdrop}>
            <View style={[uiStyles.modalCard, { maxHeight: '90%' }]}>
              <SectionTitle
                title={userDraft?.id ? 'Editar usuario' : 'Nuevo usuario'}
                right={
                  <Pressable onPress={() => setUserDraft(null)}>
                    <Ionicons name="close" size={22} color={palette.ink} />
                  </Pressable>
                }
              />
              {userDraft && (
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
                >
                  <Field
                    label="Nombre completo *"
                    value={userDraft.name}
                    onChangeText={(val) => setUserDraft({ ...userDraft, name: val })}
                    error={formErrors.name}
                  />
                  <Field
                    label="RUN / RUT *"
                    value={userDraft.rut}
                    editable={!userDraft.id}
                    autoCapitalize="characters"
                    onChangeText={(val) => setUserDraft({ ...userDraft, rut: val })}
                    error={formErrors.rut}
                  />
                  <Field
                    label="Correo electrónico *"
                    value={userDraft.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={(val) => setUserDraft({ ...userDraft, email: val })}
                    error={formErrors.email}
                  />
                  <Field
                    label="Fecha de nacimiento (AAAA-MM-DD) *"
                    value={userDraft.birthDate}
                    placeholder="1995-08-20"
                    onChangeText={(val) => setUserDraft({ ...userDraft, birthDate: val })}
                    error={formErrors.birthDate}
                  />

                  {userDraft.phones.map((phone, idx) => (
                    <View
                      key={`u-phone-${idx}`}
                      style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}
                    >
                      <View style={{ flex: 1 }}>
                        <Field
                          label={`Teléfono ${idx + 1} *`}
                          value={phone}
                          keyboardType="phone-pad"
                          onChangeText={(val) =>
                            setUserDraft({
                              ...userDraft,
                              phones: userDraft.phones.map((p, i) =>
                                i === idx ? limitChileanPhone(val) : p,
                              ),
                            })
                          }
                          error={idx === 0 ? formErrors.phones : undefined}
                        />
                      </View>
                      {userDraft.phones.length > 1 && (
                        <Pressable
                          onPress={() =>
                            setUserDraft({
                              ...userDraft,
                              phones: userDraft.phones.filter((_, i) => i !== idx),
                            })
                          }
                          style={{ paddingBottom: 10 }}
                        >
                          <Ionicons name="trash-outline" size={20} color={palette.danger} />
                        </Pressable>
                      )}
                    </View>
                  ))}
                  <ActionButton
                    label="Agregar teléfono"
                    variant="outline"
                    icon="add"
                    onPress={() =>
                      setUserDraft({ ...userDraft, phones: [...userDraft.phones, ''] })
                    }
                    style={{ paddingVertical: 8 }}
                  />

                  <OptionPickerModal
                    label="Comuna de despacho *"
                    value={String(userDraft.communeId || '')}
                    options={communeOptions}
                    onSelect={(val) => setUserDraft({ ...userDraft, communeId: val })}
                    error={formErrors.communeId}
                  />
                  <Field
                    label="Dirección (calle y número) *"
                    value={userDraft.address}
                    onChangeText={(val) => setUserDraft({ ...userDraft, address: val })}
                    error={formErrors.address}
                  />
                  <MultiPickerModal
                    label="Roles *"
                    selected={userDraft.roles}
                    options={ROLE_OPTIONS}
                    onChange={(vals) =>
                      setUserDraft({ ...userDraft, roles: vals as UserRoleOption[] })
                    }
                    error={formErrors.roles}
                  />
                  <OptionPickerModal
                    label="Estado"
                    value={userDraft.status}
                    options={[
                      { label: 'Activo', value: 'Activo' },
                      { label: 'Inactivo', value: 'Inactivo' },
                    ]}
                    onSelect={(val) =>
                      setUserDraft({ ...userDraft, status: val as 'Activo' | 'Inactivo' })
                    }
                  />

                  <ActionButton
                    label="Guardar cambios"
                    loading={saving}
                    onPress={handleSaveUser}
                  />
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={Boolean(companyDraft)}
          transparent
          animationType="slide"
          onRequestClose={() => setCompanyDraft(null)}
        >
          <View style={uiStyles.modalBackdrop}>
            <View style={[uiStyles.modalCard, { maxHeight: '90%' }]}>
              <SectionTitle
                title={companyDraft?.id ? 'Editar empresa' : 'Nueva empresa'}
                right={
                  <Pressable onPress={() => setCompanyDraft(null)}>
                    <Ionicons name="close" size={22} color={palette.ink} />
                  </Pressable>
                }
              />
              {companyDraft && (
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
                >
                  <Field
                    label="Nombre de la empresa *"
                    value={companyDraft.name}
                    onChangeText={(val) => setCompanyDraft({ ...companyDraft, name: val })}
                    error={formErrors.name}
                  />
                  <Field
                    label="RUT empresa *"
                    value={companyDraft.rut}
                    editable={!companyDraft.id}
                    autoCapitalize="characters"
                    onChangeText={(val) => setCompanyDraft({ ...companyDraft, rut: val })}
                    error={formErrors.rut}
                  />
                  <Field
                    label="Giro / Categoría *"
                    value={companyDraft.category}
                    onChangeText={(val) => setCompanyDraft({ ...companyDraft, category: val })}
                    error={formErrors.category}
                  />
                  <Field
                    label="Correo empresa *"
                    value={companyDraft.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={(val) => setCompanyDraft({ ...companyDraft, email: val })}
                    error={formErrors.email}
                  />
                  <Field
                    label="Teléfono empresa *"
                    value={companyDraft.phones[0] ?? ''}
                    keyboardType="phone-pad"
                    onChangeText={(val) =>
                      setCompanyDraft({
                        ...companyDraft,
                        phones: [limitChileanPhone(val), ...companyDraft.phones.slice(1)],
                      })
                    }
                    error={formErrors.phones}
                  />
                  <Field
                    label="Sitio web (opcional)"
                    value={companyDraft.website}
                    autoCapitalize="none"
                    onChangeText={(val) => setCompanyDraft({ ...companyDraft, website: val })}
                    error={formErrors.website}
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={uiStyles.fieldLabel}>Tiene tienda física</Text>
                    <Switch
                      value={companyDraft.hasPhysicalStore}
                      onValueChange={(val) =>
                        setCompanyDraft({ ...companyDraft, hasPhysicalStore: val })
                      }
                      trackColor={{ false: palette.border, true: palette.primarySoft }}
                      thumbColor={companyDraft.hasPhysicalStore ? palette.primary : '#F4F4F6'}
                    />
                  </View>

                  {companyDraft.hasPhysicalStore && (
                    <>
                      <OptionPickerModal
                        label="Comuna del local *"
                        value={companyDraft.comuna}
                        options={communeOptions}
                        onSelect={(val) => setCompanyDraft({ ...companyDraft, comuna: val })}
                        error={formErrors.comuna}
                      />
                      <Field
                        label="Dirección del local *"
                        value={companyDraft.address}
                        onChangeText={(val) =>
                          setCompanyDraft({ ...companyDraft, address: val })
                        }
                        error={formErrors.address}
                      />
                    </>
                  )}

                  <SectionTitle title="Datos del emprendedor propietario" />
                  {formErrors.owner ? <Text style={uiStyles.errorText}>{formErrors.owner}</Text> : null}
                  <Field
                    label="Nombre propietario *"
                    value={companyDraft.owner.name}
                    onChangeText={(val) =>
                      setCompanyDraft({
                        ...companyDraft,
                        owner: { ...companyDraft.owner, name: val },
                      })
                    }
                  />
                  <Field
                    label="RUN propietario *"
                    value={companyDraft.owner.run}
                    autoCapitalize="characters"
                    onChangeText={(val) =>
                      setCompanyDraft({
                        ...companyDraft,
                        owner: { ...companyDraft.owner, run: val },
                      })
                    }
                  />
                  <Field
                    label="Correo propietario *"
                    value={companyDraft.owner.email}
                    autoCapitalize="none"
                    onChangeText={(val) =>
                      setCompanyDraft({
                        ...companyDraft,
                        owner: { ...companyDraft.owner, email: val },
                      })
                    }
                  />
                  <Field
                    label="Teléfono propietario *"
                    value={companyDraft.owner.phone}
                    keyboardType="phone-pad"
                    onChangeText={(val) =>
                      setCompanyDraft({
                        ...companyDraft,
                        owner: { ...companyDraft.owner, phone: limitChileanPhone(val) },
                      })
                    }
                  />
                  <Field
                    label="Dirección propietario *"
                    value={companyDraft.owner.address}
                    editable={!companyDraft.id}
                    onChangeText={(val) =>
                      setCompanyDraft({
                        ...companyDraft,
                        owner: { ...companyDraft.owner, address: val },
                      })
                    }
                  />

                  <ActionButton
                    label="Guardar empresa"
                    loading={saving}
                    onPress={handleSaveCompany}
                  />
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={Boolean(passwordTarget)}
          transparent
          animationType="fade"
          onRequestClose={() => setPasswordTarget(null)}
        >
          <View style={uiStyles.modalBackdrop}>
            <View style={uiStyles.modalCard}>
              <SectionTitle
                title="Configurar contraseña"
                subtitle={passwordTarget ? `Cuenta: ${passwordTarget.rut}` : undefined}
                right={
                  <Pressable onPress={() => setPasswordTarget(null)}>
                    <Ionicons name="close" size={22} color={palette.ink} />
                  </Pressable>
                }
              />
              <Field
                label="Nueva contraseña (8 a 72 caracteres)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
                error={passwordError}
              />
              <ActionButton
                label="Guardar contraseña"
                loading={saving}
                onPress={handlePasswordSave}
              />
            </View>
          </View>
        </Modal>
      </StateGate>
    </ScreenShell>
  );
}
