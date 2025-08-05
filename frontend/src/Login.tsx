import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from '@/lib/api';

interface Props {
  onLogin: (id: number) => void;
  onSwitch: () => void;
}

export default function Login({ onLogin, onSwitch }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const user = await login(username, password);
      onLogin(user.user_id);
    } catch {
      alert('Login failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
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
        onClick={onSwitch}
      >
        Register
      </Button>
    </form>
  );
}
