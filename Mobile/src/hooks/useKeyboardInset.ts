import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform, type KeyboardEvent } from 'react-native';

/** Samsung / OEM keyboards often add a toolbar row not included in `height`. */
const ANDROID_KEYBOARD_BUFFER = 52;
const IOS_KEYBOARD_BUFFER = 8;

function resolveKeyboardInset(event: KeyboardEvent): number {
  if (Platform.OS === 'android') {
    const screenHeight = Dimensions.get('screen').height;
    const fromScreenY = Math.max(0, screenHeight - event.endCoordinates.screenY);
    return fromScreenY + ANDROID_KEYBOARD_BUFFER;
  }

  return event.endCoordinates.height + IOS_KEYBOARD_BUFFER;
}

/**
 * Tracks visible keyboard height so screens can lift composers above it.
 */
export function useKeyboardInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const onShow = (event: KeyboardEvent) => {
      setInset(resolveKeyboardInset(event));
    };

    const onHide = () => {
      setInset(0);
    };

    const showEvents =
      Platform.OS === 'ios'
        ? (['keyboardWillShow', 'keyboardDidShow'] as const)
        : (['keyboardDidShow'] as const);
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubs = showEvents.map((eventName) =>
      Keyboard.addListener(eventName, onShow),
    );
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSubs.forEach((sub) => sub.remove());
      hideSub.remove();
    };
  }, []);

  return inset;
}
