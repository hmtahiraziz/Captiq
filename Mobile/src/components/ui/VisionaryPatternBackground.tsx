import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/tokens';

export function VisionaryPatternBackground() {
  return (
    <>
      <View style={styles.base} />
      <View pointerEvents="none" style={styles.dotLayer} />
      <View pointerEvents="none" style={styles.glowPrimary} />
      <View pointerEvents="none" style={styles.glowSecondary} />
    </>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
  },
  dotLayer: {
    ...StyleSheet.absoluteFill,
    opacity: 0.55,
    backgroundColor: 'transparent',
    // Subtle dot-grid feel using layered translucency
    borderWidth: 0,
  },
  glowPrimary: {
    position: 'absolute',
    top: 420,
    left: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(81, 65, 230, 0.05)',
  },
  glowSecondary: {
    position: 'absolute',
    top: 120,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(81, 65, 230, 0.04)',
  },
});
