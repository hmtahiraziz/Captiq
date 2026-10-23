import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme/tokens';

/** Soft Captiq gradient used across auth screens (matches Home). */
export function AuthBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#F5F2FF', colors.background, '#E8F4FF']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  orbTop: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(66, 44, 216, 0.08)',
  },
  orbBottom: {
    position: 'absolute',
    bottom: 40,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(71, 165, 255, 0.08)',
  },
});
