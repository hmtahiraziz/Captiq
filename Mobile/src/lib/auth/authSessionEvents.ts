type Listener = () => void;

const listeners = new Set<Listener>();

/** Notify the auth store that tokens were cleared (refresh reuse / invalid session). */
export function emitAuthSessionInvalidated(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore listener errors
    }
  });
}

export function onAuthSessionInvalidated(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
