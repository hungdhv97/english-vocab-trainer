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
      
      // Store JWT token if provided
      if (user.jwt_token) {
        localStorage.setItem('jwt_token', user.jwt_token);
      }
      
      onRegister(user.user_id);
      
      // T061: Check if response contains validated redirect_to
      if (user.redirect_to) {
        // Backend validated the redirect URL - navigate to it
        navigate(user.redirect_to);
      } else {
        // No redirect or invalid redirect - navigate to default dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Register failed';
      toast.error(message);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
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
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
