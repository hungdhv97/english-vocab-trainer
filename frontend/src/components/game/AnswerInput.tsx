import { Input } from '@/components/ui/input';

interface AnswerInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AnswerInput({ value, onChange, onSubmit }: AnswerInputProps) {
  return (
    <form onSubmit={onSubmit}>
      <Input
        value={value}
        onChange={onChange}
        className="text-center"
        autoFocus
      />
    </form>
  );
}
