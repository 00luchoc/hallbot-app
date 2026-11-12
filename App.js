import { useState } from 'react';
import { WelcomeTransition } from './src/components/WelcomeTransition';
import { ControlScreen } from './src/screens/ControlScreen';
import { LoginScreen } from './src/screens/LoginScreen';

export default function App() {
  const [operator, setOperator] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const handleLoginSuccess = (authenticatedOperator) => {
    setOperator(authenticatedOperator);
    setShowWelcome(true);
  };

  const handleLogout = () => {
    setShowWelcome(false);
    setOperator(null);
  };

  if (!operator) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (showWelcome) {
    return (
      <WelcomeTransition
        operator={operator}
        onComplete={() => setShowWelcome(false)}
      />
    );
  }

  return (
    <ControlScreen
      operator={operator}
      onLogout={handleLogout}
    />
  );
}