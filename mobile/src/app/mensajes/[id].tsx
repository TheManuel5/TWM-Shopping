import { useCallback, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Text, TextInput, View } from 'react-native';
import { list, request, save, type Profile } from '../../features/sales/api';
import { Action, LoadStatus, Screen, styles, useData } from '../../features/sales/ui';

type Message = { id: string; conversationId: string; senderRut: string; text: string };
type Thread = { id: string; name: string; customerName: string; sellerRut: string };

export default function ConversationScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        const [profile, threads, messages] = await Promise.all([
            request<Profile>('/auth/me'),
            list<Thread>('conversaciones'),
            list<Message>('mensajes'),
        ]);
        const thread = threads.items.find((item) => item.id === id);
        if (!thread) throw new Error('No se encontró la conversación.');
        return {
            profile, thread,
            messages: messages.items.filter((item) => item.conversationId === id),
        };
    }, [id]);
    const query = useData(load);

    async function send() {
        const text = draft.trim();
        if (!id || !text || sending) return;
        setSending(true);
        setError('');
        try {
            const current = await list<Message>('mensajes');
            await save('mensajes', current.revision, { conversationId: id, text });
            setDraft('');
            await query.reload();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'No se pudo enviar el mensaje.');
        } finally {
            setSending(false);
        }
    }

    const data = query.data;
    const title = data
        ? (data.profile.rut === data.thread.sellerRut ? data.thread.customerName : data.thread.name)
        : 'Conversación';

    return (
        <Screen title={title}>
            <LoadStatus {...query} />
            {data && !query.error && (
                <>
                    {data.messages.map((message) => {
                        const mine = message.senderRut === data.profile.rut;
                        return (
                            <View key={message.id} style={[
                                styles.card, { maxWidth: '85%' },
                                mine ? { alignSelf: 'flex-end', backgroundColor: '#EDE7FF' } : { alignSelf: 'flex-start' },
                            ]}>
                                <Text style={styles.strong}>{message.text}</Text>
                            </View>
                        );
                    })}
                    <TextInput
                        value={draft} onChangeText={setDraft} placeholder="Escribe un mensaje…"
                        accessibilityLabel="Escribir mensaje" style={styles.input} multiline maxLength={500}
                    />
                    {error ? <Text style={styles.error}>{error}</Text> : null}
                    <Action label={sending ? 'Enviando…' : 'Enviar'} onPress={send}
                        active disabled={sending || !draft.trim()} />
                </>
            )}
        </Screen>
    );
}