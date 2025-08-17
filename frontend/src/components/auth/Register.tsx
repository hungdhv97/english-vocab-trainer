import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const user = await register(username, password);
      onRegister(user.user_id);
      navigate('/game');
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
