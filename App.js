
import { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Paho from 'paho-mqtt';

const C = {
  bg: '#0B1230',
  panel: '#141D45',
  blue: '#1F2F7A',
  red: '#FF3B2F',
  text: '#FFFFFF',
  muted: '#8B95C9',
};

// Identificador de la aplicación
const ID = 'etec-uba-hallbot-cambiame123';

// Único tópico MQTT
const TOPIC = 'robot/movimiento/lucho2024abc';

// Mensajes MQTT
const MSG = {
  forward: 'adelante',
  back: 'atras',
  turn: 'giro',
  stop: 'stop',
  camLeft: 'camara_izq',
  camRight: 'camara_der',
};

const STATUS = {
  desconectado: { text: 'DESCONECTADO', color: '#5A2230' },
  conectando: { text: 'CONECTANDO…', color: '#8A6D12' },
  conectado: { text: 'CONECTADO · VERIFICANDO…', color: '#8A6D12' },
  verificado: { text: 'VERIFICADO ✓', color: '#1B7F4B' },
  error: { text: 'ERROR', color: '#A01E2E' },
};

function Btn({ label, onIn, onOut, style, red }) {
  return (
    <Pressable
      onPressIn={onIn}
      onPressOut={onOut}
      style={({ pressed }) => [
        s.btn,
        red && s.btnRed,
        pressed && s.btnPressed,
        style,
      ]}
    >
      <Text style={s.btnText}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  const [url, setUrl] = useState(
    'wss://mqtt-dashboard.com:8884/mqtt'
  );

  const [status, setStatusState] = useState('desconectado');
  const [err, setErr] = useState('');
  const [last, setLast] = useState('—');

  const client = useRef(null);
  const statusRef = useRef('desconectado');

  const setStatus = (v) => {
    statusRef.current = v;
    setStatusState(v);
  };

  const ok = status === 'conectado' || status === 'verificado';
  const st = STATUS[status];

  // Desconectar del broker
  const disconnect = () => {
    setStatus('desconectado');
    setErr('');

    try {
      if (client.current) client.current.disconnect();
    } catch (e) {}

    client.current = null;
  };

  // Conectar al broker MQTT
  const connect = () => {
    try {
      if (client.current) client.current.disconnect();
    } catch (e) {}

    client.current = null;
    setErr('');

    const parsed = url.trim().match(
      /^(wss?):\/\/([^:/]+):(\d+)(\/.*)?$/
    );

    if (!parsed) {
      setErr('URL inválida. Formato: wss://host:puerto/mqtt');
      setStatus('error');
      return;
    }

    const [, proto, host, port, path] = parsed;

    setStatus('conectando');

    const pingTopic = `${ID}/ping`;

    const c = new Paho.Client(
      host,
      Number(port),
      path || '/mqtt',
      'hallbot-app-' + Math.random().toString(16).slice(2, 8)
    );

    client.current = c;

    c.onMessageArrived = (msg) => {
      if (msg.destinationName === pingTopic) {
        setStatus('verificado');
        setErr('');

        try {
          c.unsubscribe(pingTopic);
        } catch (e) {}
      }
    };

    c.onConnectionLost = (res) => {
      if (
        statusRef.current !== 'desconectado' &&
        res.errorCode !== 0
      ) {
        setErr(
          'Se perdió la conexión: ' +
          (res.errorMessage || '')
        );

        setStatus('error');
      }
    };

    c.connect({
      useSSL: proto === 'wss',
      timeout: 8,
      keepAliveInterval: 30,
      cleanSession: true,

      onSuccess: () => {
        setStatus('conectado');

        c.subscribe(pingTopic, {
          onSuccess: () => {
            const ping = new Paho.Message('ping');
            ping.destinationName = pingTopic;

            c.send(ping);

            setTimeout(() => {
              if (statusRef.current === 'conectado') {
                setErr(
                  'Conectó, pero no volvió el mensaje de prueba.'
                );
              }
            }, 5000);
          },

          onFailure: (e) => {
            setErr(
              'Conectó, pero no pudo suscribirse: ' +
              e.errorMessage
            );
          },
        });
      },

      onFailure: (e) => {
        setErr(
          'No se pudo conectar: ' +
          (e.errorMessage || 'revisá la URL y tu internet')
        );

        setStatus('error');
      },
    });
  };

  // Publicar mensajes MQTT
  const send = (message) => {
    if (client.current && client.current.isConnected()) {
      const mqttMessage = new Paho.Message(message);

      mqttMessage.destinationName = TOPIC;

      client.current.send(mqttMessage);

      setLast(`${TOPIC} → ${message}`);

      console.log('PUBLICADO:', TOPIC, message);
    } else {
      setLast('✗ NO ENVIADO (sin conexión)');
      setErr('No estás conectado al broker.');
    }
  };

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
    >
      <StatusBar style="light" />

      {/* ENCABEZADO */}
      <View style={s.header}>
        <View style={s.logo}>
          <Text style={s.logoBold}>.UBA</Text>
          <Text style={s.logoThin}> TÉCNICA</Text>
        </View>

        <Text style={s.title}>HALLBOT</Text>

        <Text style={s.subtitle}>
          Escuela Técnica · Control remoto
        </Text>

        <View
          style={[
            s.pill,
            { backgroundColor: st.color },
          ]}
        >
          <Text style={s.pillText}>
            ● {st.text}
          </Text>
        </View>

        {err !== '' && (
          <Text style={s.errText}>{err}</Text>
        )}
      </View>

      {/* CONEXIÓN MQTT */}
      <View style={s.card}>
        <Text style={s.label}>BROKER (WebSocket)</Text>

        <TextInput
          style={s.input}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={s.row}>
          <Btn
            label="CONECTAR"
            onIn={connect}
            style={s.flex}
            red
          />

          <Btn
            label="DESCONECTAR"
            onIn={disconnect}
            style={s.flex}
          />
        </View>
      </View>

      {/* ÚLTIMO MENSAJE */}
      <View style={s.card}>
        <Text style={s.label}>ÚLTIMO ENVÍO</Text>
        <Text style={s.lastText}>{last}</Text>
      </View>

      {/* CONTROLES */}
      <View
        style={!ok && s.locked}
        pointerEvents={ok ? 'auto' : 'none'}
      >

        {/* MOVIMIENTO DEL ROBOT */}
        <View style={s.card}>
          <Text style={s.label}>
            MOVIMIENTO DEL ROBOT
          </Text>

          <Text style={s.hint}>
            Mantené presionado para mover el vehículo
          </Text>

          <View style={s.dpad}>
            <Btn
              label="▲"
              onIn={() => send(MSG.forward)}
              onOut={() => send(MSG.stop)}
            />

            <View style={s.row}>
              <Btn
                label="↻ GIRO"
                onIn={() => send(MSG.turn)}
                onOut={() => send(MSG.stop)}
                style={s.flex}
              />

              <Btn
                label="■"
                onIn={() => send(MSG.stop)}
                red
              />
            </View>

            <Btn
              label="▼"
              onIn={() => send(MSG.back)}
              onOut={() => send(MSG.stop)}
            />
          </View>
        </View>

        {/* CONTROL DEL MOTOR DE CÁMARA */}
        <View style={s.card}>
          <Text style={s.label}>
            CONTROL DE CÁMARA
          </Text>

          <Text style={s.hint}>
            Movimiento horizontal del motor de la cámara
          </Text>

          <View style={s.row}>
            <Btn
              label="⟲ IZQUIERDA"
              onIn={() => send(MSG.camLeft)}
              style={s.flex}
            />

            <Btn
              label="DERECHA ⟳"
              onIn={() => send(MSG.camRight)}
              style={s.flex}
            />
          </View>
        </View>

      </View>

      {/* TÓPICO UTILIZADO */}
      <View style={s.card}>
        <Text style={s.label}>TÓPICO MQTT</Text>
        <Text style={s.lastText}>{TOPIC}</Text>
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  content: {
    padding: 18,
    paddingTop: 56,
    paddingBottom: 40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },

  logo: {
    flexDirection: 'row',
    backgroundColor: C.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 14,
  },

  logoBold: {
    color: C.text,
    fontWeight: '900',
    fontSize: 16,
  },

  logoThin: {
    color: '#FFB4AE',
    fontWeight: '300',
    fontSize: 16,
  },

  title: {
    color: C.text,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 4,
  },

  subtitle: {
    color: C.muted,
    fontSize: 13,
    marginTop: 2,
  },

  pill: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },

  pillText: {
    color: C.text,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },

  errText: {
    color: '#FF8A80',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },

  lastText: {
    color: C.text,
    fontSize: 13,
  },

  hint: {
    color: C.muted,
    fontSize: 12,
    marginBottom: 14,
  },

  locked: {
    opacity: 0.35,
  },

  card: {
    backgroundColor: C.panel,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  label: {
    color: C.red,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  input: {
    backgroundColor: C.bg,
    color: C.text,
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

  dpad: {
    alignItems: 'center',
    gap: 10,
  },

  btn: {
    backgroundColor: C.blue,
    borderRadius: 12,
    minWidth: 80,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  btnRed: {
    backgroundColor: C.red,
  },

  btnPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.96 }],
  },

  btnText: {
    color: C.text,
    fontSize: 16,
    fontWeight: '800',
  },
});
