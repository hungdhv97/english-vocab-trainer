import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Option } from '@/types';

interface MultipleChoiceProps {
  options: Option[];
  selectedAnswer: string | null;
  correctAnswer: string | null;
  onSelect: (letter: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
}

export default function MultipleChoice({
  options,
  selectedAnswer,
  correctAnswer,
  onSelect,
  disabled = false,
  showFeedback = false,
}: MultipleChoiceProps) {
  const getButtonVariant = (letter: string) => {
    if (!showFeedback || !selectedAnswer) {
      return selectedAnswer === letter ? 'default' : 'outline';
    }

    // Show feedback after answer is submitted
    if (letter === correctAnswer) {
      return 'default'; // Green for correct (handled by className)
    }
    if (letter === selectedAnswer && letter !== correctAnswer) {
      return 'destructive'; // Red for incorrect
    }
    return 'outline';
  };

  const getButtonClassName = (letter: string) => {
    if (!showFeedback || !selectedAnswer) {
      return '';
    }

    if (letter === correctAnswer) {
      return 'bg-green-500 hover:bg-green-600 text-white';
    }
    return '';
  };

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {options.map((option) => {
        const isSelected = selectedAnswer === option.letter;
        const isCorrect = showFeedback && option.letter === correctAnswer;
        const isIncorrect = showFeedback && isSelected && option.letter !== correctAnswer;

        return (
          <Button
            key={option.letter}
            onClick={() => !disabled && onSelect(option.letter)}
            disabled={disabled}
            variant={getButtonVariant(option.letter)}
            className={cn(
              'h-auto py-4 text-left justify-start',
              getButtonClassName(option.letter),
              isSelected && !showFeedback && 'ring-2 ring-primary',
            )}
          >
            <span className="font-semibold mr-2">{option.letter.toUpperCase()}.</span>
            <span>{option.text}</span>
          </Button>
        );
      })}
    </div>
  );
}

