import { StyleSheet, Text, View } from 'react-native';
import { COMMANDS } from '../constants/mqttConfig';
import { COLORS } from '../constants/theme';
import { ActionButton } from './ActionButton';

export function MovementPad({ onCommand }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>MOVIMIENTO DEL ROBOT</Text>
      <Text style={styles.hint}>
        Mantené presionado para mover el vehículo
      </Text>

      <View style={styles.dpad}>
        <ActionButton
          label="▲"
          onIn={() => onCommand(COMMANDS.forward)}
          onOut={() => onCommand(COMMANDS.stop)}
          style={styles.verticalBtn}
        />

        <View style={styles.row}>
          <ActionButton
            label="↺ IZQ"
            onIn={() => onCommand(COMMANDS.turnLeft)}
            onOut={() => onCommand(COMMANDS.stop)}
            style={styles.flex}
          />

          <ActionButton
            label="■"
            onIn={() => onCommand(COMMANDS.stop)}
            style={styles.stopBtn}
            red
          />

          <ActionButton
            label="DER ↻"
            onIn={() => onCommand(COMMANDS.turnRight)}
            onOut={() => onCommand(COMMANDS.stop)}
            style={styles.flex}
          />
        </View>

        <ActionButton
          label="▼"
          onIn={() => onCommand(COMMANDS.back)}
          onOut={() => onCommand(COMMANDS.stop)}
          style={styles.verticalBtn}
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
  dpad: {
    alignItems: 'center',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  verticalBtn: {
    minWidth: 96,
  },
  stopBtn: {
    minWidth: 68,
  },
});