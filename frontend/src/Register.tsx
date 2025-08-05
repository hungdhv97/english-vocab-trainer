import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { register } from '@/lib/api';

interface Props {
  onRegister: (id: number) => void;
  onSwitch: () => void;
}

export default function Register({ onRegister, onSwitch }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const user = await register(username, password);
      onRegister(user.user_id);
    } catch {
      alert('Register failed');
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
        Register
      </Button>
      <Button
        type="button"
        variant="link"
        className="w-full"
        onClick={onSwitch}
      >
        Login
      </Button>
    </form>
  );
}
