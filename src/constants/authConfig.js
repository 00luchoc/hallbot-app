export const SECURITY_CONFIG = {
  maxAttempts: 3,
  lockoutSeconds: 15,
};

export const AUTHORIZED_OPERATORS = [
  {
    username: process.env.EXPO_PUBLIC_ADMIN_USER,
    password: process.env.EXPO_PUBLIC_ADMIN_PASS,
    displayName: 'LUCIANO',
    role: 'ADMIN · PILOTO',
  },
  {
    username: process.env.EXPO_PUBLIC_OP_USER,
    password: process.env.EXPO_PUBLIC_OP_PASS,
    displayName: 'OPERADOR ETEC',
    role: 'TÉCNICO',
  },
];

export function authenticateOperator(usernameInput, passwordInput) {
  const cleanUser = usernameInput.trim().toLowerCase();
  const cleanPass = passwordInput;

  if (!cleanUser || !cleanPass) {
    return null;
  }

  return (
    AUTHORIZED_OPERATORS.find(
      (op) =>
        op.username.toLowerCase() === cleanUser && op.password === cleanPass
    ) || null
  );
}