import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { list, request, save, type Order, type Profile } from '../features/sales/api';
import { Action, clp, LoadStatus, Screen, styles, useData } from '../features/sales/ui';

const nextStatus: Record<string, string> = {
    'En preparación': 'Enviado',
    Enviado: 'Entregado',
};

async function loadOrders() {
    const profile = await request<Profile>('/auth/me');
    if (!profile.canSell) throw new Error('Se requiere una cuenta de vendedor.');
    const result = await list<Order>('pedidos');
    return result.items.filter((order) => order.sellerRut === profile.rut);
}

export default function SellerOrdersScreen() {
    const query = useData(loadOrders);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('Todos');
    const [selected, setSelected] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const orders = query.data ?? [];
    const states = ['Todos', ...new Set(orders.map((order) => order.status))];

    async function update(order: Order) {
        if (saving || !nextStatus[order.status]) return;
        setSaving(true);
        setError('');
        try {
            const current = await request<{ revision: number; item: Order }>(
                `/pedidos/${encodeURIComponent(order.id)}`,
            );
            const next = nextStatus[current.item.status];
            if (!next || current.item.status !== order.status) {
                throw new Error('El estado cambió. Actualiza la lista antes de continuar.');
            }
            await save('pedidos', current.revision, { ...current.item, status: next }, order.id);
            await query.reload();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'No se pudo actualizar el pedido.');
        } finally {
            setSaving(false);
        }
    }

    const visible = orders.filter((order) =>
        (status === 'Todos' || order.status === status)
        && `${order.id} ${order.customer}`.toLowerCase().includes(search.trim().toLowerCase()));

    return (
        <Screen title="Gestión de pedidos">
            <TextInput
                placeholder="N.º de pedido o cliente" accessibilityLabel="Buscar pedidos"
                value={search} onChangeText={setSearch} style={styles.input}
            />
            <View style={[styles.row, { flexWrap: 'wrap' }]}>
                {states.map((value) => (
                    <Action key={value} label={value} active={value === status} onPress={() => setStatus(value)} />
                ))}
            </View>
            <LoadStatus {...query} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {!query.loading && !query.error && <Text>{visible.length} pedidos</Text>}
            {!query.loading && !query.error && visible.map((order) => (
                <View key={order.id} style={styles.card}>
                    <Text style={styles.strong}>#{order.id} · {order.status}</Text>
                    <Text>{order.customer} · {order.date}</Text>
                    <Text style={styles.strong}>{clp.format(order.total)}</Text>
                    <Action label={selected === order.id ? 'Cerrar detalle' : 'Ver pedido'}
                        onPress={() => setSelected(selected === order.id ? '' : order.id)} />
                    {selected === order.id && (
                        <>
                            <Text>{order.dispatch
                                ? `${order.dispatch.carrier} · ${order.dispatch.tracking || 'Sin seguimiento'}`
                                : 'Sin despacho asociado'}</Text>
                            {nextStatus[order.status] && (
                                <Action label={`Cambiar a ${nextStatus[order.status]}`}
                                    onPress={() => update(order)} active disabled={saving} />
                            )}
                        </>
                    )}
                </View>
            ))}
        </Screen>
    );
}