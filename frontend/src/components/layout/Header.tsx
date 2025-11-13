import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, getProfile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import type { UserProfile } from '@/types';

interface HeaderProps {
  onLogout?: () => void;
}

/**
 * Header component with navigation links.
 * Displays authentication-aware navigation (Login/Register for unauthenticated users,
 * Logout for authenticated users).
 * Always displays Home and Leaderboard links.
 */
export function Header({ onLogout }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState<string>('');

  // Update authentication state when location changes, storage events occur, or focus events
  useEffect(() => {
    const updateAuthState = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
    };

    // Update immediately on mount and location change (navigation)
    // Use a small delay to ensure localStorage is read correctly after navigation
    updateAuthState();
    const immediateTimeout = setTimeout(updateAuthState, 100);

    // Listen for storage changes (logout/login from other tabs/components)
    const handleStorage = () => updateAuthState();
    window.addEventListener('storage', handleStorage);
    
    // Listen for focus events (when user returns to tab after login in same tab)
    const handleFocus = () => updateAuthState();
    window.addEventListener('focus', handleFocus);
    
    // Listen for custom auth events (triggered by login/logout in same tab)
    const handleAuthChange = () => {
      // Multiple checks with delays to ensure we catch the state change
      updateAuthState();
      setTimeout(updateAuthState, 50);
      setTimeout(updateAuthState, 150);
    };
    window.addEventListener('auth-state-changed', handleAuthChange);

    // Poll localStorage periodically to catch changes in same tab
    // This is a fallback for cases where events don't fire
    // Using 300ms interval for better responsiveness
    const intervalId = setInterval(updateAuthState, 300);

    return () => {
      clearTimeout(immediateTimeout);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('auth-state-changed', handleAuthChange);
      clearInterval(intervalId);
    };
  }, [location]);

  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authenticated) {
        setProfile(null);
        setUsername('');
        return;
      }

      try {
        const userIdStr = localStorage.getItem('user_id');
        if (userIdStr) {
          const userProfile = await getProfile();
          setProfile(userProfile);
          // Get username from localStorage as fallback
          const storedUsername = localStorage.getItem('username');
          if (storedUsername) {
            setUsername(storedUsername);
          }
        }
      } catch (error) {
        // Silently fail - profile might not exist yet
        setProfile(null);
      }
    };

    fetchProfile();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchProfile();
    };
    window.addEventListener('auth-state-changed', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleProfileUpdate);
    };
  }, [authenticated, location]);

  const handleLogout = () => {
    // Remove auth data from localStorage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    
    // Update local state
    setAuthenticated(false);
    setProfile(null);
    setUsername('');
    
    // Dispatch custom event to notify other components of auth state change
    window.dispatchEvent(new Event('auth-state-changed'));
    
    if (onLogout) {
      onLogout();
    } else {
      // Fallback: navigate to home
      navigate('/', { replace: true });
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 gap-4">
          {/* Title and Subtitle */}
          <div className="flex flex-col">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                English Vocabulary Trainer
              </h1>
            </Link>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Choose a game to start learning and improving your English skills
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center gap-2 sm:gap-4" aria-label="Main navigation">
            {/* Public Navigation */}
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              Home
            </Link>
            <Link
              to="/leaderboard"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive('/leaderboard')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              aria-current={isActive('/leaderboard') ? 'page' : undefined}
            >
              Leaderboard
            </Link>

            {/* Authentication-aware Navigation */}
            {authenticated ? (
              <div className="flex items-center gap-3">
                {/* User Indicator - Avatar only */}
                {profile?.avatar_url && (
                  <img
                    src={profile.avatar_url.startsWith('http') ? profile.avatar_url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8180'}${profile.avatar_url}`}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                  />
                )}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-gray-700 dark:text-gray-300"
                  aria-label="Logout"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive('/login')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  aria-current={isActive('/login') ? 'page' : undefined}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive('/register')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  aria-current={isActive('/register') ? 'page' : undefined}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

