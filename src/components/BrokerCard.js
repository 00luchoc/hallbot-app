import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { ActionButton } from './ActionButton';

export function BrokerCard({ url, onChangeUrl, onConnect, onDisconnect }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>BROKER (WebSocket)</Text>

      <TextInput
        style={styles.input}
        value={url}
        onChangeText={onChangeUrl}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="wss://host:puerto/mqtt"
        placeholderTextColor={COLORS.muted}
      />

      <View style={styles.row}>
        <ActionButton
          label="CONECTAR"
          onIn={onConnect}
          style={styles.flex}
          red
        />
        <ActionButton
          label="DESCONECTAR"
          onIn={onDisconnect}
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
  input: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
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