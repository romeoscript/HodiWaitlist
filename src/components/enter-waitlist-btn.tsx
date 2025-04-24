// src/components/enter-waitlist-btn.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthClient } from '@dfinity/auth-client';

type EnterWaitlistBtnProps = {
  onLoginSuccess: () => void;
};

const EnterWaitlistBtn: React.FC<EnterWaitlistBtnProps> = ({ onLoginSuccess }) => {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principalId, setPrincipalId] = useState('');

  useEffect(() => {
    AuthClient.create().then(client => {
      setAuthClient(client);
      updateAuthenticationStatus(client);
    });
  }, []);

  const updateAuthenticationStatus = async (client: AuthClient) => {
    const authenticated = await client.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      const identity = client.getIdentity();
      const principal = identity.getPrincipal().toString();
      setPrincipalId(principal);
    } else {
      setPrincipalId('');
    }
  };

  const handleLogin = () => {
    if (!authClient) {
      console.error("AuthClient not init");
      return;
    }

    authClient.login({
      identityProvider: 'https://identity.ic0.app',
      onSuccess: () => {
        console.log("Success logIn");
        updateAuthenticationStatus(authClient);
        onLoginSuccess();
      },
      onError: (error) => {
        console.error("Login error:", error);
      },
      windowOpenerFeatures: "toolbar=0,location=0,menubar=0,width=500,height=500,left=100,top=100",
    });
  };

  const handleLogout = async () => {
    if (!authClient) {
      console.error("AuthClient not init");
      return;
    }

    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipalId('');
  };

  return (
    <Button
      onClick={isAuthenticated ? handleLogout : handleLogin}
      className="mt-4 text-2xl py-8 text-foreground font-bold w-96"
    >
      {isAuthenticated ? 'LogOut' : 'LogIn / Registration'}
    </Button>
  );
};

export default EnterWaitlistBtn;
