import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { readCatalog } from "./gateway";
import type { Snapshot } from "./types";

function useCatalogState() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const id = ++request.current;
    setLoading(true);
    setError("");
    try {
      const next = await readCatalog();
      if (request.current === id) setSnapshot(next);
    } catch (e) {
      if (request.current === id)
        setError(
          e instanceof Error ? e.message : "No pudimos cargar la tienda.",
        );
    } finally {
      if (request.current === id) setLoading(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    const id = ++request.current;
    readCatalog()
      .then((next) => {
        if (active && request.current === id) setSnapshot(next);
      })
      .catch((e) => {
        if (active && request.current === id)
          setError(
            e instanceof Error ? e.message : "No pudimos cargar la tienda.",
          );
      })
      .finally(() => {
        if (active && request.current === id) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return { snapshot, loading, error, refresh };
}
const Context = createContext<ReturnType<typeof useCatalogState> | null>(null);
export function CatalogProvider({ children }: { children: ReactNode }) {
  const value = useCatalogState();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCatalog() {
  const value = useContext(Context);
  if (!value) throw new Error("CatalogProvider no está montado.");
  return value;
}
