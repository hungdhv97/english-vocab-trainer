import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Game from '@/components/game/Game';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
import History from '@/components/history/History';
import Dashboard from '@/components/Dashboard';
import { HomePage } from '@/components/home/HomePage';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';

export default function App() {
  const [userId, setUserId] = useState<number | null>(null);

  function handleLoggedIn(id: number) {
    setUserId(id);
  }

  function handleLogout() {
    setUserId(null);
  }

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="fixed top-4 right-4 z-[9999]">
          <ModeToggle />
        </div>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLoggedIn} />} />
          <Route
            path="/register"
            element={<Register onRegister={handleLoggedIn} />}
          />
          <Route
            path="/dashboard"
            element={
              userId !== null ? (
                <Dashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/game"
            element={
              userId !== null ? (
                <Game userId={userId} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/history"
            element={
              userId !== null ? (
                <History userId={userId} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/* Home Page - Public route (no authentication required) */}
          <Route path="/" element={<HomePage />} />
          
          {/* Fallback - redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}
