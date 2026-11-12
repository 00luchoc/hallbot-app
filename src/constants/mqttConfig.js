export const DEFAULT_BROKER_URL = 'wss://mqtt-dashboard.com:8884/mqtt';

export const APP_ID = 'etec-uba-hallbot-cambiame123';

export const TOPICS = {
  movement: 'robot/movimiento/lucho2024abc',
  ping: `${APP_ID}/ping`,
};

export const COMMANDS = {
  forward: 'adelante',
  back: 'atras',
  turnLeft: 'giro_izq',
  turnRight: 'giro_der',
  stop: 'stop',
  camLeft: 'camara_izq',
  camRight: 'camara_der',
};