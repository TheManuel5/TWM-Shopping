import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const violet = '#5B2CF4';

export const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F7F7FB' },
    content: { padding: 18, gap: 12 },
    title: { fontSize: 26, fontWeight: '800', color: '#111936' },
    strong: { fontWeight: '700', color: '#111936' },
    secondary: { color: '#59617A' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, gap: 5 },
    input: {
        backgroundColor: '#FFFFFF', borderColor: '#DCE0EC', borderWidth: 1,
        borderRadius: 10, padding: 12, color: '#111936',
    },
    button: { backgroundColor: '#EDE7FF', borderRadius: 18, padding: 10 },
    active: { backgroundColor: violet },
    error: { color: '#A61B36' },
});

export const clp = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
});

export function Action({
    label, onPress, active = false, disabled = false,
}: {
    label: string;
    onPress: () => void;
    active?: boolean;
    disabled?: boolean;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={onPress}
            style={[styles.button, active && styles.active, disabled && { opacity: 0.5 }]}
        >
            <Text style={{ color: active ? '#FFFFFF' : violet, fontWeight: '700' }}>{label}</Text>
        </Pressable>
    );
}

export function Screen({ title, children }: { title: string; children: ReactNode }) {
    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Text accessibilityRole="header" style={styles.title}>{title}</Text>
                {children}
            </ScrollView>
        </SafeAreaView>
    );
}

export function useData<T>(load: () => Promise<T>) {
    const [data, setData] = useState<T>();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            setData(await load());
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los datos.');
        } finally {
            setLoading(false);
        }
    }, [load]);

    useEffect(() => { void reload(); }, [reload]);

    return { data, error, loading, reload };
}

export function LoadStatus({
    loading, error, reload,
}: {
    loading: boolean;
    error: string;
    reload: () => void;
}) {
    if (loading) return <ActivityIndicator color={violet} />;
    if (!error) return null;

    return (
        <>
            <Text style={styles.error}>{error}</Text>
            <Action label="Reintentar" onPress={reload} />
        </>
    );
}