import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS, CONNECTION_STATUS } from '../constants/theme';

export function WelcomeTransition({ operator, onComplete }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Barra de carga de consola (1.6s)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1600,
      useNativeDriver: false,
    }).start();

    // Secuencia completa: Entrada (300ms) -> Pausa (1500ms) -> Salida (400ms) = 2.2s
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  }, [fadeAnim, slideAnim, progressAnim, onComplete]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logo}>
          <Text style={styles.logoBold}>.UBA</Text>
          <Text style={styles.logoThin}> TÉCNICA</Text>
        </View>

        <View style={styles.pill}>
          <Text style={styles.pillText}>● ACCESO CONCEDIDO</Text>
        </View>

        <Text style={styles.welcomeTitle}>
          BIENVENIDO, {operator.displayName}
        </Text>

        <Text style={styles.subtitle}>
          Inicializando consola de control · Rol: {operator.role}
        </Text>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    flexDirection: 'row',
    backgroundColor: COLORS.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 18,
  },
  logoBold: {
    color: COLORS.text,
    fontWeight: '900',
    fontSize: 16,
  },
  logoThin: {
    color: COLORS.logoAccent,
    fontWeight: '300',
    fontSize: 16,
  },
  pill: {
    backgroundColor: CONNECTION_STATUS.verificado.color,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  pillText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  welcomeTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 28,
  },
  progressTrack: {
    width: '72%',
    height: 4,
    backgroundColor: COLORS.panel,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.red,
  },
});