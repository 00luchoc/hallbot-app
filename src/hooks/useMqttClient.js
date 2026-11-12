import { useEffect, useRef, useState } from 'react';
import Paho from 'paho-mqtt';
import { DEFAULT_BROKER_URL, TOPICS } from '../constants/mqttConfig';

export function useMqttClient() {
  const [url, setUrl] = useState(DEFAULT_BROKER_URL);
  const [status, setStatusState] = useState('desconectado');
  const [err, setErr] = useState('');
  const [lastMessage, setLastMessage] = useState('—');

  const client = useRef(null);
  const statusRef = useRef('desconectado');

  const setStatus = (nextStatus) => {
    statusRef.current = nextStatus;
    setStatusState(nextStatus);
  };

  const disconnect = () => {
    setStatus('desconectado');
    setErr('');

    try {
      if (client.current && client.current.isConnected()) {
        client.current.disconnect();
      }
    } catch (e) {}

    client.current = null;
  };

  const connect = () => {
    try {
      if (client.current) client.current.disconnect();
    } catch (e) {}

    client.current = null;
    setErr('');

    const parsed = url.trim().match(/^(wss?):\/\/([^:/]+):(\d+)(\/.*)?$/);

    if (!parsed) {
      setErr('URL inválida. Formato: wss://host:puerto/mqtt');
      setStatus('error');
      return;
    }

    const [, proto, host, port, path] = parsed;
    setStatus('conectando');

    const c = new Paho.Client(
      host,
      Number(port),
      path || '/mqtt',
      'hallbot-app-' + Math.random().toString(16).slice(2, 8)
    );

    client.current = c;

    c.onMessageArrived = (msg) => {
      if (msg.destinationName === TOPICS.ping) {
        setStatus('verificado');
        setErr('');
        try {
          c.unsubscribe(TOPICS.ping);
        } catch (e) {}
      }
    };

    c.onConnectionLost = (res) => {
      if (statusRef.current !== 'desconectado' && res.errorCode !== 0) {
        setErr('Se perdió la conexión: ' + (res.errorMessage || ''));
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

        c.subscribe(TOPICS.ping, {
          onSuccess: () => {
            const ping = new Paho.Message('ping');
            ping.destinationName = TOPICS.ping;
            c.send(ping);

            setTimeout(() => {
              if (statusRef.current === 'conectado') {
                setErr('Conectó, pero no volvió el mensaje de prueba.');
              }
            }, 5000);
          },
          onFailure: (e) => {
            setErr('Conectó, pero no pudo suscribirse: ' + e.errorMessage);
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

  const publish = (message, topic = TOPICS.movement) => {
    if (client.current && client.current.isConnected()) {
      const mqttMessage = new Paho.Message(message);
      mqttMessage.destinationName = topic;
      client.current.send(mqttMessage);

      setLastMessage(`${topic} → ${message}`);
    } else {
      setLastMessage('✗ NO ENVIADO (sin conexión)');
      setErr('No estás conectado al broker.');
    }
  };

  // Limpieza automática al desmontar la app
  useEffect(() => {
    return () => {
      try {
        if (client.current && client.current.isConnected()) {
          client.current.disconnect();
        }
      } catch (e) {}
    };
  }, []);

  const isConnected = status === 'conectado' || status === 'verificado';

  return {
    url,
    setUrl,
    status,
    err,
    lastMessage,
    isConnected,
    connect,
    disconnect,
    publish,
  };
}