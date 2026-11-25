import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import {
    deleteRate,
    list,
    request,
    save,
    type Order,
    type Profile,
} from '../features/sales/api';
import {
    Action,
    clp,
    LoadStatus,
    Screen,
    styles,
    useData,
} from '../features/sales/ui';

type Zone = {
    id: string | number;
    ownerRut: string;
    region: string;
    provincia: string;
    comuna: string;
    rate: number;
};

type ZoneForm = {
    region: string;
    provincia: string;
    comuna: string;
    rate: string;
};

const emptyForm: ZoneForm = {
    region: '',
    provincia: '',
    comuna: '',
    rate: '',
};

const locationFields = [
    { key: 'region', label: 'Región' },
    { key: 'provincia', label: 'Provincia' },
    { key: 'comuna', label: 'Comuna' },
] as const;

const packageFields = [
    { key: 'weight', label: 'Peso real (g)' },
    { key: 'width', label: 'Ancho (cm)' },
    { key: 'height', label: 'Alto (cm)' },
    { key: 'depth', label: 'Fondo (cm)' },
] as const;

function normalize(value: string) {
    return value.trim().toLocaleLowerCase('es-CL')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

async function loadShipping() {
    const profile = await request<Profile>('/auth/me');
    if (!profile.canSell) {
        throw new Error('Se requiere una cuenta de vendedor.');
    }

    const [zones, orders] = await Promise.all([
        list<Zone>('tarifas'),
        list<Order>('pedidos'),
    ]);

    return {
        rut: profile.rut,
        zones: zones.items.filter((zone) => zone.ownerRut === profile.rut),
        orders: orders.items.filter(
            (order) => order.sellerRut === profile.rut && order.dispatch !== null,
        ),
    };
}

export default function ShippingScreen() {
    const query = useData(loadShipping);
    const [tab, setTab] = useState<'Seguimiento' | 'Tarifas'>('Tarifas');
    const [editor, setEditor] = useState<Zone | 'new' | null>(null);
    const [form, setForm] = useState<ZoneForm>(emptyForm);
    const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [method, setMethod] = useState<'comuna' | 'dimensiones'>('comuna');
    const [destination, setDestination] = useState('');
    const [parcel, setParcel] = useState({
        weight: '', width: '', height: '', depth: '',
    });

    const zoneEstimate = query.data?.zones.find(
        (zone) => normalize(zone.comuna) === normalize(destination),
    );

    const [weight, width, height, depth] = packageFields.map(({ key }) =>
        Number(parcel[key].trim().replace(',', '.')),
    );
    const volume = width * height * depth;
    const validParcel = [weight, width, height, depth, volume].every(
        (value) => Number.isFinite(value) && value > 0,
    );

    const volumetricKg = volume / 5000;
    // Misma fórmula de estimación por dimensiones que usa la web.
    const dimensionalEstimate = Math.round(2000 + volume * 0.25);

    function openEditor(zone?: Zone) {
        setError('');
        setEditor(zone ?? 'new');
        setForm(zone ? {
            region: zone.region,
            provincia: zone.provincia,
            comuna: zone.comuna,
            rate: String(zone.rate),
        } : emptyForm);
    }

    async function saveZone() {
        if (!editor || saving || !query.data) return;

        const region = form.region.trim();
        const provincia = form.provincia.trim();
        const comuna = form.comuna.trim();
        const rate = Number(form.rate);

        if (!region || !provincia || !comuna) {
            setError('Completa la región, la provincia y la comuna.');
            return;
        }
        if (!/^\d+$/.test(form.rate.trim()) || !Number.isSafeInteger(rate)) {
            setError('Escribe una tarifa entera en pesos, desde 0.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const current = await list<Zone>('tarifas');
            const ownZones = current.items.filter(
                (zone) => zone.ownerRut === query.data?.rut,
            );
            const id = editor === 'new' ? undefined : String(editor.id);
            const fields = { region, provincia, comuna, rate };

            if (ownZones.some((zone) =>
                String(zone.id) !== id && normalize(zone.comuna) === normalize(comuna)
            )) {
                throw new Error('Ya hay una tarifa para esa comuna. Puedes editarla.');
            }

            if (editor === 'new') {
                await save('tarifas', current.revision, fields);
            } else {
                const latest = ownZones.find((zone) => String(zone.id) === id);

                if (!latest || latest.rate !== editor.rate ||
                    latest.comuna !== editor.comuna || latest.region !== editor.region ||
                    latest.provincia !== editor.provincia) {
                    throw new Error('La zona cambió. Recarga la pantalla y selecciónala otra vez.');
                }

                await save('tarifas', current.revision, { ...latest, ...fields }, id);
            }

            setEditor(null);
            await query.reload();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'No se pudo guardar la zona.');
        } finally {
            setSaving(false);
        }
    }

    async function confirmDelete() {
        if (!zoneToDelete || saving || !query.data) return;

        setSaving(true);
        setError('');

        try {
            const current = await list<Zone>('tarifas');
            const latest = current.items.find(
                (zone) => String(zone.id) === String(zoneToDelete.id)
                    && zone.ownerRut === query.data?.rut,
            );

            if (!latest || latest.rate !== zoneToDelete.rate ||
                latest.comuna !== zoneToDelete.comuna || latest.region !== zoneToDelete.region ||
                latest.provincia !== zoneToDelete.provincia) {
                throw new Error('La zona cambió. Recarga la pantalla y selecciónala otra vez.');
            }

            await deleteRate(latest.id, current.revision);
            setZoneToDelete(null);
            await query.reload();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'No se pudo eliminar la zona.');
        } finally {
            setSaving(false);
        }
    }

    const busy = saving || editor !== null || zoneToDelete !== null;

    return (
        <Screen title="Despachos y costos de envío">
            <View style={styles.row}>
                <Action
                    label="Seguimiento"
                    active={tab === 'Seguimiento'}
                    disabled={busy}
                    onPress={() => setTab('Seguimiento')}
                />
                <Action
                    label="Tarifas"
                    active={tab === 'Tarifas'}
                    disabled={busy}
                    onPress={() => setTab('Tarifas')}
                />
            </View>

            <LoadStatus {...query} />

            {!query.loading && !query.error && tab === 'Seguimiento' && (
                <>
                    {!query.data?.orders.length && (
                        <Text style={styles.secondary}>No hay pedidos con despacho.</Text>
                    )}
                    {query.data?.orders.map((order) => (
                        <View key={order.id} style={styles.card}>
                            <Text style={styles.strong}>Pedido #{order.id}</Text>
                            <Text>{order.customer}</Text>
                            <Text>{order.dispatch?.carrier} · {order.dispatch?.status}</Text>
                            <Text>{order.dispatch?.tracking || 'Sin código de seguimiento'}</Text>
                        </View>
                    ))}
                </>
            )}

            {!query.loading && !query.error && tab === 'Tarifas' && (
                <>
                    <Text style={styles.strong}>Zonas y tarifas</Text>
                    <Action
                        label="Agregar zona"
                        active
                        disabled={busy}
                        onPress={() => openEditor()}
                    />

                    {!query.data?.zones.length && (
                        <Text style={styles.secondary}>No hay zonas registradas para tu cuenta.</Text>
                    )}
                    {query.data?.zones.map((zone) => (
                        <View key={zone.id} style={styles.card}>
                            <Text style={styles.strong}>
                                {zone.comuna} · {clp.format(zone.rate)}
                            </Text>
                            <Text style={styles.secondary}>{zone.region} · {zone.provincia}</Text>
                            <View style={[styles.row, { flexWrap: 'wrap' }]}>
                                <Action
                                    label="Editar tarifa"
                                    disabled={busy}
                                    onPress={() => openEditor(zone)}
                                />
                                <Action
                                    label="Eliminar"
                                    disabled={busy}
                                    onPress={() => {
                                        setError('');
                                        setZoneToDelete(zone);
                                    }}
                                />
                            </View>
                        </View>
                    ))}

                    {editor && (
                        <View style={styles.card}>
                            <Text style={styles.strong}>
                                {editor === 'new' ? 'Nueva zona' : `Editar zona de ${editor.comuna}`}
                            </Text>
                            {locationFields.map(({ key, label }) => (
                                <TextInput
                                    key={key}
                                    accessibilityLabel={label}
                                    placeholder={label}
                                    value={form[key]}
                                    editable={!saving}
                                    onChangeText={(value) =>
                                        setForm((previous) => ({ ...previous, [key]: value }))
                                    }
                                    style={styles.input}
                                />
                            ))}
                            <TextInput
                                accessibilityLabel="Tarifa en pesos"
                                placeholder="Tarifa en pesos"
                                value={form.rate}
                                editable={!saving}
                                keyboardType="number-pad"
                                onChangeText={(rate) => setForm((previous) => ({ ...previous, rate }))}
                                style={styles.input}
                            />
                            {error ? <Text style={styles.error}>{error}</Text> : null}
                            <View style={[styles.row, { flexWrap: 'wrap' }]}>
                                <Action label="Cancelar" disabled={saving}
                                    onPress={() => setEditor(null)} />
                                <Action label={saving ? 'Guardando…' : 'Guardar zona'}
                                    active disabled={saving} onPress={saveZone} />
                            </View>
                        </View>
                    )}

                    {zoneToDelete && (
                        <View style={styles.card}>
                            <Text style={styles.strong}>
                                ¿Eliminar la tarifa de {zoneToDelete.comuna}?
                            </Text>
                            {error ? <Text style={styles.error}>{error}</Text> : null}
                            <View style={[styles.row, { flexWrap: 'wrap' }]}>
                                <Action label="Cancelar" disabled={saving}
                                    onPress={() => setZoneToDelete(null)} />
                                <Action label={saving ? 'Eliminando…' : 'Confirmar'}
                                    active disabled={saving} onPress={confirmDelete} />
                            </View>
                        </View>
                    )}

                    <View style={styles.card}>
                        <Text style={styles.strong}>Simulador de costo de envío</Text>
                        <View style={[styles.row, { flexWrap: 'wrap' }]}>
                            <Action label="Por comuna" active={method === 'comuna'}
                                onPress={() => setMethod('comuna')} />
                            <Action label="Por dimensiones" active={method === 'dimensiones'}
                                onPress={() => setMethod('dimensiones')} />
                        </View>

                        {method === 'comuna' ? (
                            <>
                                <TextInput
                                    placeholder="Comuna de destino"
                                    accessibilityLabel="Comuna de destino"
                                    value={destination}
                                    onChangeText={setDestination}
                                    style={styles.input}
                                />
                                {destination.trim() ? (
                                    <Text style={styles.strong}>
                                        {zoneEstimate
                                            ? `Costo estimado: ${clp.format(zoneEstimate.rate)}`
                                            : 'Sin tarifa para esa comuna'}
                                    </Text>
                                ) : null}
                            </>
                        ) : (
                            <>
                                {packageFields.map(({ key, label }) => (
                                    <TextInput
                                        key={key}
                                        accessibilityLabel={label}
                                        placeholder={label}
                                        keyboardType="decimal-pad"
                                        value={parcel[key]}
                                        onChangeText={(value) =>
                                            setParcel((previous) => ({ ...previous, [key]: value }))
                                        }
                                        style={styles.input}
                                    />
                                ))}
                                {validParcel ? (
                                    <>
                                        <Text style={styles.secondary}>
                                            Peso real: {weight / 1000} kg · Peso volumétrico:{' '}
                                            {volumetricKg.toFixed(2)} kg
                                        </Text>
                                        <Text style={styles.strong}>
                                            Costo estimado: {clp.format(dimensionalEstimate)}
                                        </Text>
                                    </>
                                ) : (
                                    <Text style={styles.secondary}>
                                        Ingresa el peso y las tres medidas con valores mayores que cero.
                                    </Text>
                                )}
                            </>
                        )}
                    </View>
                </>
            )}
        </Screen>
    );
}