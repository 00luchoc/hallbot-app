import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, CONNECTION_STATUS } from '../constants/theme';

export function Header({ status, err, operator, onLogout }) {
  const st = CONNECTION_STATUS[status];

  return (
    <View style={styles.header}>
      <View style={styles.logo}>
        <Text style={styles.logoBold}>.UBA</Text>
        <Text style={styles.logoThin}> TÉCNICA</Text>
      </View>

      <Text style={styles.title}>HALLBOT</Text>
      <Text style={styles.subtitle}>Escuela Técnica · Control remoto</Text>

      <View style={[styles.pill, { backgroundColor: st.color }]}>
        <Text style={styles.pillText}>● {st.text}</Text>
      </View>

      {operator && (
        <View style={styles.operatorBar}>
          <Text style={styles.operatorText}>
            OPERADOR: {operator.displayName} ({operator.role})
          </Text>
          <Pressable
            onPress={onLogout}
            style={({ pressed }) => [
              styles.logoutBtn,
              pressed && styles.logoutPressed,
            ]}
          >
            <Text style={styles.logoutText}>SALIR</Text>
          </Pressable>
        </View>
      )}

      {err !== '' && <Text style={styles.errText}>{err}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 20,
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
  operatorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.panel,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    width: '100%',
  },
  operatorText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  logoutBtn: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  logoutPressed: {
    opacity: 0.65,
  },
  logoutText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  errText: {
    color: COLORS.errorText,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});