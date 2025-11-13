import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { register } from '@/lib/api';

interface Props {
  onRegister: (id: number) => void;
}

export default function Register({ onRegister }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // T057 [US4]: Extract redirect_to from URL query params
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const redirect = searchParams.get('redirect_to');
    if (redirect) {
      setRedirectTo(redirect);
    }
  }, [searchParams]);

  // T059 & T061 [US4]: Send redirect_to to backend and handle validated response
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Call register with redirect_to parameter
      const user = await register(username, password, redirectTo);
      
      // T048 Fix: Store both JWT token and user_id in localStorage
      if (user.jwt_token) {
        localStorage.setItem('jwt_token', user.jwt_token);
      }
      if (user.user_id) {
        localStorage.setItem('user_id', user.user_id.toString());
      }
      if (user.username) {
        localStorage.setItem('username', user.username);
      }
      
      onRegister(user.user_id);
      
      // Dispatch custom event to notify Header and other components of auth state change
      // Use a small delay to ensure localStorage is fully written before navigation
      setTimeout(() => {
        window.dispatchEvent(new Event('auth-state-changed'));
        
        // Check if response contains validated redirect_to
        // Only navigate if redirect_to is a non-empty string (backend validates it)
        if (user.redirect_to && typeof user.redirect_to === 'string' && user.redirect_to.trim() !== '') {
          // Backend validated the redirect URL - navigate to it
          navigate(user.redirect_to);
        } else if (user.profile_incomplete) {
          // Profile incomplete - redirect to profile page with onboarding context
          navigate('/profile?onboarding=true');
        } else {
          // No redirect or invalid redirect - navigate to home page
          navigate('/');
        }
      }, 50);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Register failed';
      toast.error(message);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <Card className="w-full max-w-md text-center h-80 flex flex-col justify-center">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Register
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => {
                // T062 Fix: Preserve redirect_to parameter when switching to login
                if (redirectTo) {
                  navigate(`/login?redirect_to=${encodeURIComponent(redirectTo)}`);
                } else {
                  navigate('/login');
                }
              }}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
