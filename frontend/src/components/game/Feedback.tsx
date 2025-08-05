import { cn } from '@/lib/utils';

interface FeedbackProps {
  feedback: 'correct' | 'incorrect' | '';
  feedbackKey: number;
}

export default function Feedback({ feedback, feedbackKey }: FeedbackProps) {
  return (
    <p
      key={feedbackKey}
      className={cn(
        'min-h-[1.5rem]',
        feedback === 'correct' && 'text-green-600 animate-in fade-in zoom-in',
        feedback === 'incorrect' && 'text-red-600 animate-shake',
      )}
    >
      {feedback === 'correct' && 'Correct!'}
      {feedback === 'incorrect' && 'Incorrect!'}
    </p>
  );
}
