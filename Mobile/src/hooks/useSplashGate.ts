import { useEffect, useState } from 'react';

const MIN_SPLASH_MS = 1600;

export function useSplashGate(isBootstrapping: boolean) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  return isBootstrapping || !minTimeElapsed;
}
