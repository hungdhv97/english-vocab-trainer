import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Option } from '@/types';

interface MultipleChoiceProps {
  options: Option[];
  selectedAnswer: string | null;
  correctAnswer: string | null;
  onSelect: (letter: string) => void;
  disabled?: boolean;
}

export default function MultipleChoice({
  options,
  selectedAnswer,
  correctAnswer,
  onSelect,
  disabled = false,
}: MultipleChoiceProps) {
  const getButtonClassName = (letter: string) => {
    if (!selectedAnswer) {
      return '';
    }

    if (letter === correctAnswer) {
      return '!bg-green-600 text-white';
    }
    else if (letter === selectedAnswer && letter !== correctAnswer) {
      return '!bg-red-600 text-white';
    }
    return '';
  };

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {options.map((option) => (
        <Button
          key={option.letter}
          onClick={() => !disabled && onSelect(option.letter)}
          disabled={disabled}
          variant="outline"
          className={cn(
            'h-auto min-h-[4rem] py-4 text-left justify-start whitespace-normal break-words',
            getButtonClassName(option.letter),
          )}
        >
          <span className="font-semibold mr-2 shrink-0">{option.letter.toUpperCase()}.</span>
          <span className="font-semibold">{option.text}</span>
        </Button>
      ))}
    </div>
  );
}

