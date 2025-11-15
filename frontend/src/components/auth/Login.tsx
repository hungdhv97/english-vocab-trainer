import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { loginSchema, type LoginFormData } from '@/schemas';

interface Props {
  onLogin: (id: number) => void;
}

export default function Login({ onLogin }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loginToStore = useAuthStore((state) => state.login);
  
  // T056 [US4]: Extract redirect_to from URL query params
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const redirect = searchParams.get('redirect_to');
    if (redirect) {
      setRedirectTo(redirect);
    }
  }, [searchParams]);

  const onSubmit = async (values: LoginFormData) => {
    try {
      // Call login with redirect_to parameter
      const user = await login(values.username, values.password, redirectTo);
      
      // Update Zustand store (this also handles localStorage and events)
      loginToStore(user);
      
      onLogin(user.user_id);
      
      // Check if response contains validated redirect_to
      // Only navigate if redirect_to is a non-empty string (backend validates it)
      // Backend validates redirect_to and only includes it in response if valid
      // Invalid redirects (like https://evil.com) are rejected and not included in response
      if (user.redirect_to && typeof user.redirect_to === 'string' && user.redirect_to.trim() !== '') {
        // Backend validated the redirect URL - navigate to it
        navigate(user.redirect_to);
      } else {
        // No redirect or invalid redirect - navigate to home page
        // Note: Profile completion banner will show if profile is incomplete (User Story 2)
        navigate('/');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
      <Card className="w-full max-w-md text-center h-80 flex flex-col justify-center">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                placeholder="Username"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
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
