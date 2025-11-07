import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/lib/api';

interface Props {
  onLogin: (id: number) => void;
}

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // T056 [US4]: Extract redirect_to from URL query params
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const redirect = searchParams.get('redirect_to');
    if (redirect) {
      setRedirectTo(redirect);
    }
  }, [searchParams]);

  // T058 & T060 [US4]: Send redirect_to to backend and handle validated response
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Call login with redirect_to parameter
      const user = await login(username, password, redirectTo);
      
      // T048 Fix: Store both JWT token and user_id in localStorage
      if (user.jwt_token) {
        localStorage.setItem('jwt_token', user.jwt_token);
      }
      if (user.user_id) {
        localStorage.setItem('user_id', user.user_id.toString());
      }
      
      onLogin(user.user_id);
      
      // T060 & T065: Check if response contains validated redirect_to
      // Only navigate if redirect_to is a non-empty string (backend validates it)
      // T065: Backend validates redirect_to and only includes it in response if valid
      // Invalid redirects (like https://evil.com) are rejected and not included in response
      if (user.redirect_to && typeof user.redirect_to === 'string' && user.redirect_to.trim() !== '') {
        // Backend validated the redirect URL - navigate to it
        navigate(user.redirect_to);
      } else {
        // No redirect or invalid redirect - navigate to default dashboard
        // T065: Backend rejected invalid redirect_to (like https://evil.com) and didn't include it in response
        // Check backend logs for "[SECURITY] Rejected" messages
        navigate('/');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md text-center h-80 flex flex-col justify-center">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
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
              Login
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => {
                // T062 Fix: Preserve redirect_to parameter when switching to register
                if (redirectTo) {
                  navigate(`/register?redirect_to=${encodeURIComponent(redirectTo)}`);
                } else {
                  navigate('/register');
                }
              }}
            >
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
