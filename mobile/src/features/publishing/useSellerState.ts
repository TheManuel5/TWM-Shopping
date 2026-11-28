import { useCallback, useEffect, useState } from 'react';
import { ApiError, fetchStateSnapshot, getSessionProfile } from './api';
import type { StateSnapshot, UserProfile } from './types';

export function useSellerState({
  requireSeller = true,
  requireAdmin = false,
}: {
  requireSeller?: boolean;
  requireAdmin?: boolean;
} = {}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [snapshot, setSnapshot] = useState<StateSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    const me = await getSessionProfile();
    if (requireAdmin && !me.canAdmin) {
      throw new ApiError('Esta sección requiere permisos de administrador.', 403);
    }
    if (requireSeller && !me.canSell && !me.canAdmin) {
      throw new ApiError('Se requiere una cuenta de vendedor o administrador.', 403);
    }
    const state = await fetchStateSnapshot();
    return { me, state };
  }, [requireAdmin, requireSeller]);

  useEffect(() => {
    let active = true;
    fetchAll()
      .then(({ me, state }) => {
        if (!active) return;
        setProfile(me);
        setSnapshot(state);
        setError('');
      })
      .catch((cause) => {
        if (!active) return;
        setError(
          cause instanceof Error
            ? cause.message
            : 'No se pudo cargar la información desde la API.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchAll]);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      try {
        const { me, state } = await fetchAll();
        setProfile(me);
        setSnapshot(state);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'No se pudo cargar la información desde la API.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchAll],
  );

  return {
    profile,
    snapshot,
    setSnapshot,
    revision: snapshot?.revision ?? 0,
    collections: snapshot?.collections ?? {},
    loading,
    refreshing,
    error,
    reload: () => load(false),
    refresh: () => load(true),
  };
}
