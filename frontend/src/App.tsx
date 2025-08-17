import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Game from '@/Game';
import Login from '@/Login';
import Register from '@/Register';
import History from '@/History';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';

export default function App() {
  const [userId, setUserId] = useState<number | null>(null);

  function handleLoggedIn(id: number) {
    setUserId(id);
  }

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ModeToggle />
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLoggedIn} />} />
          <Route path="/register" element={<Register onRegister={handleLoggedIn} />} />
          <Route
            path="/game"
            element={
              userId !== null ? <Game userId={userId} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/history"
            element={
              userId !== null ? <History userId={userId} /> : <Navigate to="/login" />
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}
