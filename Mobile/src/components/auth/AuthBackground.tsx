import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme/tokens';

/** Soft light canvas used across auth screens. */
export function AuthBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#F7F6FC', colors.background, '#EEF3FF']}
        locations={[0, 0.5, 1]}
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
    top: -120,
    right: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(66, 44, 216, 0.06)',
  },
  orbBottom: {
    position: 'absolute',
    bottom: 20,
    left: -110,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(91, 76, 240, 0.05)',
  },
});
