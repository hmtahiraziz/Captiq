declare global {
  // React Native 0.82+ exposes requestIdleCallback on the global object.
  function requestIdleCallback(callback: () => void): number;
}

/** Waits one idle frame so gestures and transitions can settle. */
export function waitForUiReady(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => resolve());
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}
