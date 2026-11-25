import { useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import { list, request, type Order, type Profile } from '../api';
import { Action, LoadStatus, Screen, styles, useData, violet } from '../ui';

type Thread = {
    id: string;
    name: string;
    customerName: string;
    customerRut: string;
    sellerRut: string;
    lastMsg: string;
    unread: number;
};

const filters = ['Todos', 'No leídos', 'Pedidos'] as const;

async function loadInbox() {
    const [profile, threads, orders] = await Promise.all([
        request<Profile>('/auth/me'),
        list<Thread>('conversaciones'),
        list<Order>('pedidos'),
    ]);
    return { profile, threads: threads.items, orders: orders.items };
}

export default function InboxScreen() {
    const query = useData(loadInbox);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<(typeof filters)[number]>('Todos');

    const visible = (query.data?.threads ?? []).flatMap((thread) => {
        const name = query.data?.profile.rut === thread.sellerRut
            ? thread.customerName : thread.name;
        const matchesText = `${name} ${thread.lastMsg}`.toLowerCase()
            .includes(search.trim().toLowerCase());
        const hasOrder = query.data?.orders.some(
            (order) =>
                order.customerRut === thread.customerRut &&
                order.sellerRut === thread.sellerRut,
        );
        if (!matchesText || (filter === 'No leídos' && !thread.unread)
            || (filter === 'Pedidos' && !hasOrder)) return [];

        return [{ ...thread, displayName: name }];
    });

    return (
        <Screen title="Mensajes">
            <Text style={styles.secondary}>Conversa sobre tus pedidos, productos y cotizaciones.</Text>
            <TextInput
                accessibilityLabel="Buscar conversaciones"
                placeholder="Buscar conversaciones…"
                value={search}
                onChangeText={setSearch}
                style={styles.input}
            />
            <View style={styles.row}>
                {filters.map((label) => (
                    <Action key={label} label={label} active={filter === label} onPress={() => setFilter(label)} />
                ))}
            </View>
            <LoadStatus {...query} />
            {!query.loading && !query.error && visible.length === 0 && (
                <Text style={styles.secondary}>No hay conversaciones para mostrar.</Text>
            )}
            {!query.loading && !query.error && visible.map((thread) => (
                <Link key={thread.id} href={{ pathname: '/mensajes/[id]', params: { id: thread.id } }} asChild>
                    <Pressable style={[
                        styles.card, styles.row, thread.unread > 0 && { backgroundColor: '#EDE7FF' },
                    ]}>
                        <Text style={{ color: violet, fontWeight: '700' }}>
                            {thread.displayName.slice(0, 2).toUpperCase()}
                        </Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.strong}>{thread.displayName}</Text>
                            <Text style={styles.secondary} numberOfLines={1}>{thread.lastMsg}</Text>
                        </View>
                        {thread.unread > 0 && <Text style={styles.strong}>{thread.unread}</Text>}
                    </Pressable>
                </Link>
            ))}
        </Screen>
    );
}