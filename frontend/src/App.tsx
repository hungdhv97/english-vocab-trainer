import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Game from '@/components/game/Game';
import Login from '@/components/auth/Login';
import Register from '@/components/auth/Register';
// Note: History component has been removed as it was used with the old plays and game_sessions tables.
// History functionality will be reimplemented using the new vocab_game tables if needed.
import { HomePage } from '@/components/home/HomePage';
import { LeaderboardPage } from '@/components/leaderboard/LeaderboardPage';
import SessionStatisticsPage from '@/components/statistics/SessionStatisticsPage';
import WordDetailPage from '@/components/word/WordDetailPage';
import { Layout } from '@/components/layout/Layout';
import { ModeToggle } from '@/components/mode-toggle';
import { ThemeProvider } from '@/components/theme-provider';

function AppRoutes() {
  // Initialize userId from localStorage synchronously to avoid redirect before auth check completes
  // This ensures that when accessing protected routes directly via URL, the userId is available immediately
  const getInitialUserId = (): number | null => {
    // Check localStorage directly for user_id (more reliable than isAuthenticated() which may have token validation logic)
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      const userId = parseInt(storedUserId, 10);
      if (!isNaN(userId)) {
        return userId;
      }
    }
    return null;
  };

  const [userId, setUserId] = useState<number | null>(getInitialUserId);
  const location = useLocation();
  const isLoggingOut = useRef(false);

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
          {/* Note: History route has been removed as it was used with the old plays and game_sessions tables.
              History functionality will be reimplemented using the new vocab_game tables if needed. */}
          {/* Home Page - Public route (no authentication required) */}
          <Route path="/" element={<HomePage />} />
          
          {/* Leaderboard Page - Public route (no authentication required) */}
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          
          {/* Session Statistics Page - Requires authentication */}
          <Route
            path="/session/:sessionId/statistics"
            element={
              userId !== null && !isLoggingOut.current ? (
                <SessionStatisticsPage />
              ) : isLoggingOut.current ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to={`/login?redirect_to=${encodeURIComponent(location.pathname)}`} />
              )
            }
          />
          
          {/* Word Detail Page - Public route (no authentication required) */}
          <Route path="/word/:wordId" element={<WordDetailPage />} />
          
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
