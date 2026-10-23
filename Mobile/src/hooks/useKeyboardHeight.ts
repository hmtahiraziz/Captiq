import { useKeyboardState } from 'react-native-keyboard-controller';

/**
 * Reports keyboard height from react-native-keyboard-controller.
 * Prefer KeyboardStickyView / KeyboardAwareScrollView for layout;
 * use this when you only need height (e.g. scroll-to-end).
 */
export function useKeyboardHeight() {
  return useKeyboardState((state) => state.height);
}
