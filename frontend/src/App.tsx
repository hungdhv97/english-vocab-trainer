import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Game from '@/components/game/Game';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
import History from '@/components/history/History';
import { HomePage } from '@/components/home/HomePage';
import { LeaderboardPage } from '@/components/leaderboard/LeaderboardPage';
import { Layout } from '@/components/layout/Layout';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';
import { isAuthenticated } from '@/lib/api';

function AppRoutes() {
  const [userId, setUserId] = useState<number | null>(null);
  const location = useLocation();
  const isLoggingOut = useRef(false);

  // T048 Fix: Check localStorage for existing JWT token on mount
  useEffect(() => {
    // If there's a valid JWT token in localStorage, try to restore user session
    if (isAuthenticated()) {
      const storedUserId = localStorage.getItem('user_id');
      if (storedUserId) {
        setUserId(parseInt(storedUserId, 10));
      }
    }
  }, []);

  // T063 Fix: Clear state when we're on a public route after logout
  useEffect(() => {
    if (isLoggingOut.current && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register')) {
      setUserId(null);
      isLoggingOut.current = false;
    }
  }, [location.pathname]);

  function handleLoggedIn(id: number) {
    setUserId(id);
    // T048 Fix: Store user_id in localStorage to persist across page refreshes
    localStorage.setItem('user_id', id.toString());
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="fixed top-4 right-4 z-[9999]">
        <ModeToggle />
      </div>
      <Toaster position="top-center" />
      <Layout>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLoggedIn} />} />
          <Route
            path="/register"
            element={<Register onRegister={handleLoggedIn} />}
          />
          <Route
            path="/game"
            element={
              userId !== null && !isLoggingOut.current ? (
                <Game userId={userId} />
              ) : isLoggingOut.current ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/* T048 Fix: Add route for /game/:code to handle game-specific navigation */}
          <Route
            path="/game/:code"
            element={
              userId !== null && !isLoggingOut.current ? (
                <Game userId={userId} />
              ) : isLoggingOut.current ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to={`/login?redirect_to=${encodeURIComponent(location.pathname)}`} />
              )
            }
          />
          <Route
            path="/history"
            element={
              userId !== null && !isLoggingOut.current ? (
                <History userId={userId} />
              ) : isLoggingOut.current ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/* Home Page - Public route (no authentication required) */}
          <Route path="/" element={<HomePage />} />
          
          {/* Leaderboard Page - Public route (no authentication required) */}
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          
          {/* Fallback - redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
