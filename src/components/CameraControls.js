import { StyleSheet, Text, View } from 'react-native';
import { COMMANDS } from '../constants/mqttConfig';
import { COLORS } from '../constants/theme';
import { ActionButton } from './ActionButton';

export function CameraControls({ onCommand }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>CONTROL DE CÁMARA</Text>
      <Text style={styles.hint}>
        Movimiento horizontal del motor de la cámara
      </Text>

      <View style={styles.row}>
        <ActionButton
          label="⟲ IZQUIERDA"
          onIn={() => onCommand(COMMANDS.camLeft)}
          style={styles.flex}
        />
        <ActionButton
          label="DERECHA ⟳"
          onIn={() => onCommand(COMMANDS.camRight)}
          style={styles.flex}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  label: {
    color: COLORS.red,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  hint: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});