import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  authenticateOperator,
  SECURITY_CONFIG,
} from '../constants/authConfig';
import { COLORS } from '../constants/theme';

export function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasError, setHasError] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);

  const isLocked = lockRemaining > 0;

  // Animaciones nativas (shake horizontal y barra de enfriamiento)
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lockProgressAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 7,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -7,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 55,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startLockout = () => {
    const durationSec = SECURITY_CONFIG.lockoutSeconds;
    setLockRemaining(durationSec);

    lockProgressAnim.setValue(1);
    Animated.timing(lockProgressAnim, {
      toValue: 0,
      duration: durationSec * 1000,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (lockRemaining <= 0) return;

    const timer = setInterval(() => {
      setLockRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAttempts(0);
          setHasError(false);
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockRemaining]);

  const handleLogin = () => {
    if (isLocked) return;

    const operator = authenticateOperator(username, password);

    if (operator) {
      setHasError(false);
      setErrorMsg('');
      setAttempts(0);
      onLoginSuccess(operator);
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setHasError(true);
    triggerShake();

    if (nextAttempts >= SECURITY_CONFIG.maxAttempts) {
      setErrorMsg(
        `Demasiados intentos fallidos. Acceso bloqueado por ${SECURITY_CONFIG.lockoutSeconds}s.`
      );
      startLockout();
    } else {
      setErrorMsg(
        `Credenciales inválidas (Intento ${nextAttempts}/${SECURITY_CONFIG.maxAttempts})`
      );
    }
  };

  const progressWidth = lockProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ENCABEZADO INSTITUCIONAL */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoBold}>.UBA</Text>
            <Text style={styles.logoThin}> TÉCNICA</Text>
          </View>

          <Text style={styles.title}>HALLBOT</Text>
          <Text style={styles.subtitle}>
            Sistema de Teleoperación · UGV
          </Text>

          <View style={styles.pill}>
            <Text style={styles.pillText}>● ACCESO RESTRINGIDO</Text>
          </View>
        </View>

        {/* TARJETA DE AUTENTICACIÓN */}
        <Animated.View
          style={[
            styles.card,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          <Text style={styles.label}>AUTENTICACIÓN DE OPERADOR</Text>
          <Text style={styles.hint}>
            Ingresá tus credenciales autorizadas para habilitar el control del
            vehículo.
          </Text>

          <Text style={styles.fieldLabel}>USUARIO</Text>
          <TextInput
            style={[styles.input, hasError && styles.inputError]}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (hasError && !isLocked) setHasError(false);
            }}
            placeholder="Ej: luciano"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLocked}
          />

          <Text style={styles.fieldLabel}>CONTRASEÑA</Text>
          <View
            style={[
              styles.passwordWrapper,
              hasError && styles.inputError,
            ]}
          >
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (hasError && !isLocked) setHasError(false);
              }}
              placeholder="••••••••"
              placeholderTextColor={COLORS.muted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLocked}
              onSubmitEditing={handleLogin}
            />

            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.toggleBtn}
              disabled={isLocked}
            >
              <Text style={styles.toggleText}>
                {showPassword ? 'OCULTAR' : 'MOSTRAR'}
              </Text>
            </Pressable>
          </View>

          {errorMsg !== '' && (
            <Text style={styles.errText}>{errorMsg}</Text>
          )}

          {/* BOTÓN CON BARRA DE BLOQUEO INTEGRADA */}
          <Pressable
            onPress={handleLogin}
            disabled={isLocked}
            style={({ pressed }) => [
              styles.loginBtn,
              isLocked && styles.loginBtnLocked,
              pressed && !isLocked && styles.loginBtnPressed,
            ]}
          >
            {isLocked && (
              <Animated.View
                style={[styles.lockFill, { width: progressWidth }]}
              />
            )}
            <Text style={styles.loginBtnText}>
              {isLocked
                ? `SISTEMA BLOQUEADO · ${lockRemaining}s`
                : 'INICIAR SESIÓN'}
            </Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.footerNote}>
          ACL Local · Sesión volátil por seguridad operativa
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
    paddingTop: 48,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    flexDirection: 'row',
    backgroundColor: COLORS.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 14,
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
  title: {
    color: COLORS.text,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 2,
  },
  pill: {
    marginTop: 12,
    backgroundColor: COLORS.pillRestricted,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pillText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },
  label: {
    color: COLORS.red,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  hint: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 17,
  },
  fieldLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    fontSize: 14,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toggleText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  inputError: {
    borderColor: COLORS.redBorder,
  },
  errText: {
    color: COLORS.errorText,
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    overflow: 'hidden',
  },
  loginBtnLocked: {
    backgroundColor: COLORS.redDark,
  },
  loginBtnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  lockFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.red,
    opacity: 0.35,
  },
  loginBtnText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  footerNote: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.7,
  },
});