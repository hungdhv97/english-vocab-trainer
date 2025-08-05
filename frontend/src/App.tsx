import { useState } from 'react';
import Game from '@/Game';
import Login from '@/Login';
import Register from '@/Register';
import History from '@/History';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';

export default function App() {
  const [userId, setUserId] = useState<number | null>(null);
  const [view, setView] = useState<'login' | 'register' | 'game' | 'history'>(
    'login',
  );

  function handleLoggedIn(id: number) {
    setUserId(id);
    setView('game');
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ModeToggle />
      {view === 'login' && (
        <Login onLogin={handleLoggedIn} onSwitch={() => setView('register')} />
      )}
      {view === 'register' && (
        <Register
          onRegister={handleLoggedIn}
          onSwitch={() => setView('login')}
        />
      )}
      {view === 'game' && userId !== null && (
        <Game userId={userId} onShowHistory={() => setView('history')} />
      )}
      {view === 'history' && userId !== null && (
        <History userId={userId} onBack={() => setView('game')} />
      )}
    </ThemeProvider>
  );
}
