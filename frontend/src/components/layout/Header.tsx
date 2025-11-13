import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAuthenticated, getProfile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart3, User, LogOut } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import type { UserProfile } from '@/types';

interface HeaderProps {
  onLogout?: () => void;
}

/**
 * Header component with navigation links.
 * Displays authentication-aware navigation (Login/Register for unauthenticated users,
 * User menu with Avatar for authenticated users).
 * Layout: Logo (left), Navigation (middle), Auth/User (right)
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
      } catch {
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

  // Get user initials for avatar fallback
  const getInitials = (displayName: string | null, username: string): string => {
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    if (username) {
      return username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get display name with fallback
  const getDisplayName = (): string => {
    if (profile?.display_name) {
      return profile.display_name;
    }
    if (username) {
      return username;
    }
    return 'User';
  };

  // Get avatar URL or null
  const getAvatarUrl = (): string | null => {
    if (profile?.avatar_url) {
      if (profile.avatar_url.startsWith('http')) {
        return profile.avatar_url;
      }
      return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8180'}${profile.avatar_url}`;
    }
    return null;
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col sm:flex-row sm:items-center py-4 sm:py-6 gap-2 sm:gap-4">
          {/* Logo Section (Left) */}
          <div className="flex items-center sm:absolute sm:left-0">
            <Link to="/" className="hover:opacity-80 transition-opacity flex items-center">
              <img
                src="/logo.png"
                alt="English Coach"
                className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded"
                onError={(e) => {
                  // Hide image on error
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
          </div>

          {/* Navigation Section (Middle) - Centered */}
          <nav className="flex items-center justify-center gap-2 sm:gap-4 flex-1" aria-label="Main navigation">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/'
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              aria-current={location.pathname === '/' ? 'page' : undefined}
            >
              Games
            </Link>
            <Link
              to="/leaderboard"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/leaderboard'
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              aria-current={location.pathname === '/leaderboard' ? 'page' : undefined}
            >
              Leaderboard
            </Link>
          </nav>

          {/* Auth/User Section (Right) */}
          <div className="flex items-center gap-2 sm:gap-4 sm:absolute sm:right-0">
            {/* Theme Toggle - First element */}
            <ModeToggle />
            {authenticated ? (
              /* Authenticated: Avatar with User Menu */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    aria-label="User menu"
                  >
                    {getAvatarUrl() ? (
                      <img
                        src={getAvatarUrl()!}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          // Hide image on error and show initials fallback
                          e.currentTarget.style.display = 'none';
                          const initialsFallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (initialsFallback) {
                            initialsFallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-medium ${getAvatarUrl() ? 'hidden' : ''
                        }`}
                    >
                      {getInitials(profile?.display_name || null, username)}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Display Name (non-clickable) */}
                  <div className="px-2 py-1.5 text-sm font-medium text-foreground">
                    {getDisplayName()}
                  </div>
                  <DropdownMenuSeparator />
                  {/* My Progress */}
                  <DropdownMenuItem asChild>
                    <Link to="/my-progress" className="cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      My Progress
                    </Link>
                  </DropdownMenuItem>
                  {/* Profile */}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Logout */}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Unauthenticated: Login and Sign Up */
              <>
                <Link
                  to="/login"
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/login'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  aria-current={location.pathname === '/login' ? 'page' : undefined}
                >
                  Login
                </Link>
                <Button variant="default" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
