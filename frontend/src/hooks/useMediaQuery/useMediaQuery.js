import { useCallback, useSyncExternalStore } from 'react';

const useMediaQuery = (query) => {
  const subscribe = useCallback((notifyChange) => {
    const media = window.matchMedia(query);
    media.addEventListener('change', notifyChange);

    return () => media.removeEventListener('change', notifyChange);
  }, [query]);

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
};

export default useMediaQuery;
