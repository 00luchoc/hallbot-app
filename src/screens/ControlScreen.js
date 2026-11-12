import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BrokerCard } from '../components/BrokerCard';
import { CameraControls } from '../components/CameraControls';
import { Header } from '../components/Header';
import { MovementPad } from '../components/MovementPad';
import { TOPICS } from '../constants/mqttConfig';
import { COLORS } from '../constants/theme';
import { useMqttClient } from '../hooks/useMqttClient';

export function ControlScreen({ operator, onLogout }) {
  const {
    url,
    setUrl,
    status,
    err,
    lastMessage,
    isConnected,
    connect,
    disconnect,
    publish,
  } = useMqttClient();

  const handleLogout = () => {
    disconnect();
    onLogout();
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <StatusBar style="light" />

      <Header
        status={status}
        err={err}
        operator={operator}
        onLogout={handleLogout}
      />

      <BrokerCard
        url={url}
        onChangeUrl={setUrl}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      <View style={styles.card}>
        <Text style={styles.label}>ÚLTIMO ENVÍO</Text>
        <Text style={styles.lastText}>{lastMessage}</Text>
      </View>

      <View
        style={!isConnected && styles.locked}
        pointerEvents={isConnected ? 'auto' : 'none'}
      >
        <MovementPad onCommand={publish} />
        <CameraControls onCommand={publish} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>TÓPICO MQTT</Text>
        <Text style={styles.lastText}>{TOPICS.movement}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 18,
    paddingTop: 56,
    paddingBottom: 40,
  },
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
  lastText: {
    color: COLORS.text,
    fontSize: 13,
  },
  locked: {
    opacity: 0.35,
  },
});