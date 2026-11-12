import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/theme';

export function ActionButton({ label, onIn, onOut, style, red }) {
  return (
    <Pressable
      onPressIn={onIn}
      onPressOut={onOut}
      style={({ pressed }) => [
        styles.btn,
        red && styles.btnRed,
        pressed && styles.btnPressed,
        style,
      ]}
    >
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    minWidth: 80,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  btnRed: {
    backgroundColor: COLORS.red,
  },
  btnPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.96 }],
  },
  btnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
});