import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowSignUp(false);
  };

  const handleSignUp = () => {
    setIsLoggedIn(true);
    setShowSignUp(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    if (showSignUp) {
      return (
        <SignUpPage
          onSignUp={handleSignUp}
          onBackToLogin={() => setShowSignUp(false)}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToSignUp={() => setShowSignUp(true)}
      />
    );
  }

  return (
    <Dashboard
      onLogout={handleLogout}
    />
  );
}