import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart3, User, LogOut, Menu } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { useAuthStore } from '@/stores/authStore';
import { useProfile } from '@/hooks/queries';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const authUser = useAuthStore((state) => state.user);
  const { data: profile } = useProfile({ enabled: authenticated });
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (authenticated) {
      setUsername(localStorage.getItem('username') ?? '');
    } else {
      setUsername('');
    }
  }, [authenticated]);

  const handleLogout = () => {
    // Call logout from Zustand store (which handles localStorage and events)
    logout();

    // Clear local component state
    setProfile(null);
    setUsername('');

    if (onLogout) {
      onLogout();
    } else {
      // Fallback: navigate to home
      navigate('/', { replace: true });
    }
  };

  const resolvedProfile = authenticated ? profile ?? authUser ?? null : null;

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
    if (resolvedProfile?.display_name) {
      return resolvedProfile.display_name;
    }
    if (username) {
      return username;
    }
    return 'User';
  };

  // Get avatar URL or null
  const getAvatarUrl = (): string | null => {
    if (resolvedProfile?.avatar_url) {
      if (resolvedProfile.avatar_url.startsWith('http')) {
        return resolvedProfile.avatar_url;
      }
      return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8180'}${resolvedProfile.avatar_url}`;
    }
    return null;
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-row items-center justify-between py-4 sm:py-6">
          {/* Mobile Menu Button - Left on mobile, hidden on desktop */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo Section - Center on mobile, Left on desktop */}
          <div className="flex items-center md:absolute md:left-0">
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

          {/* Navigation Section (Middle) - Hidden on mobile, visible on desktop, Centered */}
          <nav className="hidden md:flex items-center justify-center gap-2 sm:gap-4 flex-1" aria-label="Main navigation">
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

          {/* Auth/User Section (Right) - Always visible */}
          <div className="flex items-center gap-2 md:absolute md:right-0">
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
                      {getInitials(resolvedProfile?.display_name || null, username)}
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

        {/* Mobile Menu - Collapsible navigation for mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Games
              </Link>
              <Link
                to="/leaderboard"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/leaderboard'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Leaderboard
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
