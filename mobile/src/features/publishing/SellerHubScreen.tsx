import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  getApiBaseUrl,
  getSessionProfile,
  loginWithRut,
  logoutSession,
  setApiBaseUrl,
} from './api';
import type { UserProfile } from './types';
import {
  ActionButton,
  Badge,
  Card,
  Field,
  palette,
  ScreenShell,
  SectionTitle,
  styles as uiStyles,
} from './ui';

type ModuleRoute = {
  title: string;
  description: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const SELLER_ROUTES: ModuleRoute[] = [
  {
    title: 'Mis productos y servicios',
    description: 'Listado, búsqueda, filtros por categoría, edición y eliminación.',
    route: '/vendedor/mis-productos',
    icon: 'bag-outline',
  },
  {
    title: 'Publicar producto',
    description: 'Formulario completo con variantes SKU, imágenes, oferta y envío.',
    route: '/vendedor/publicar-producto',
    icon: 'cube-outline',
  },
  {
    title: 'Publicar servicio',
    description: 'Modalidad, duración, comunas de cobertura y vista previa.',
    route: '/vendedor/publicar-servicio',
    icon: 'construct-outline',
  },
  {
    title: 'Inventario y ofertas',
    description: 'Stock por variante, alertas críticas (< 10) y ajustes con motivo.',
    route: '/vendedor/inventario',
    icon: 'layers-outline',
  },
  {
    title: 'Panel de control',
    description: 'KPIs mensuales, gráfico de ventas diarias y alertas de tienda.',
    route: '/vendedor/panel',
    icon: 'bar-chart-outline',
  },
];

const ADMIN_ROUTES: ModuleRoute[] = [
  {
    title: 'Gestión de usuarios',
    description: 'Directorio de compradores, vendedores, edición y cambio de clave.',
    route: '/admin/usuarios',
    icon: 'people-outline',
  },
  {
    title: 'Empresas y emprendedores',
    description: 'Tiendas registradas, dueño, dirección física y permisos Admin.',
    route: '/admin/empresas',
    icon: 'business-outline',
  },
];

export function SellerHubScreen() {
  const [apiUrl, setApiUrl] = useState(() => getApiBaseUrl());
  const [urlSaved, setUrlSaved] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);
  const [authError, setAuthError] = useState('');

  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const loadSession = useCallback(async () => {
    setChecking(true);
    setAuthError('');
    try {
      const me = await getSessionProfile();
      setProfile(me);
    } catch (cause) {
      setProfile(null);
      const msg = cause instanceof Error ? cause.message : '';
      if (msg && !msg.includes('Inicia sesión')) {
        setAuthError(msg);
      }
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getSessionProfile()
      .then((me) => {
        if (!active) return;
        setProfile(me);
        setAuthError('');
      })
      .catch((cause) => {
        if (!active) return;
        setProfile(null);
        const msg = cause instanceof Error ? cause.message : '';
        if (msg && !msg.includes('Inicia sesión')) {
          setAuthError(msg);
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSaveApi = () => {
    const saved = setApiBaseUrl(apiUrl);
    setUrlSaved(saved ? `API configurada en ${saved}` : 'URL limpiada');
    void loadSession();
  };

  const handleLogin = async () => {
    if (busy) return;
    setBusy(true);
    setAuthError('');
    try {
      const me = await loginWithRut(rut.trim(), password);
      setProfile(me);
      setPassword('');
    } catch (cause) {
      setAuthError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logoutSession();
      setProfile(null);
    } finally {
      setBusy(false);
    }
  };

  const renderTile = (item: ModuleRoute) => (
    <Pressable
      key={item.route}
      onPress={() => router.push(item.route as never)}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.tileIcon}>
        <Ionicons name={item.icon} size={22} color={palette.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.tileTitle}>{item.title}</Text>
        <Text style={uiStyles.hintText}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={palette.muted} />
    </Pressable>
  );

  return (
    <ScreenShell
      title="Publicaciones y Administración"
      subtitle="Módulo de Manuel · Shopping Mobile"
      back={false}
      refreshing={checking}
      onRefresh={loadSession}
    >
      <Card>
        <SectionTitle
          title="Conexión con backend (.NET)"
          subtitle="Para Expo Go en celular usa la IP local de tu PC (ej: http://192.168.1.50:5156/api)"
        />
        <Field
          label="URL base de la API"
          value={apiUrl}
          onChangeText={setApiUrl}
          autoCapitalize="none"
          placeholder="http://192.168.1.50:5156/api"
        />
        <ActionButton label="Aplicar URL y probar conexión" variant="outline" onPress={handleSaveApi} />
        {urlSaved ? <Text style={styles.okText}>{urlSaved}</Text> : null}
      </Card>

      <Card>
        <SectionTitle
          title="Sesión actual"
          right={
            profile ? (
              <Badge
                label={profile.canAdmin ? 'Admin' : profile.canSell ? 'Vendedor' : 'Comprador'}
                tone={profile.canAdmin ? 'primary' : profile.canSell ? 'success' : 'neutral'}
              />
            ) : (
              <Badge label="Sin sesión" tone="neutral" />
            )
          }
        />

        {profile ? (
          <View style={{ gap: 8 }}>
            <Text style={styles.profileName}>{profile.nombre}</Text>
            <Text style={uiStyles.hintText}>
              RUT: {profile.rut} · {profile.email}
            </Text>
            <View style={styles.permRow}>
              {profile.canSell && <Badge label="Permiso Vendedor" tone="success" />}
              {profile.canAdmin && <Badge label="Permiso Admin" tone="primary" />}
              {profile.canBuy && <Badge label="Permiso Comprador" tone="neutral" />}
            </View>
            <ActionButton
              label="Cerrar sesión"
              variant="outline"
              loading={busy}
              onPress={handleLogout}
            />
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Field
              label="RUT"
              value={rut}
              onChangeText={setRut}
              autoCapitalize="characters"
              placeholder="12345678-9"
            />
            <Field
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            {authError ? <Text style={uiStyles.errorText}>{authError}</Text> : null}
            <ActionButton
              label="Iniciar sesión para probar módulo"
              icon="log-in-outline"
              loading={busy}
              onPress={handleLogin}
            />
          </View>
        )}
      </Card>

      <SectionTitle title="Publicaciones del vendedor" />
      {SELLER_ROUTES.map(renderTile)}

      <SectionTitle
        title="Administración"
        subtitle="Gestión de usuarios y empresas según permisos"
      />
      {ADMIN_ROUTES.map(renderTile)}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  okText: {
    fontSize: 12,
    color: palette.success,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.ink,
  },
  permRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: palette.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
  tileIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: palette.ink,
  },
});
