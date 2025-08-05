import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AnswerInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AnswerInput({ value, onChange, onSubmit }: AnswerInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex space-x-2">
      <Input value={value} onChange={onChange} className="flex-1" />
      <Button type="submit">Submit</Button>
    </form>
  );
}
