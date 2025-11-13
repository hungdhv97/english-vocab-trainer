import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MultipleChoice from '@/components/game/MultipleChoice';
import type { Question } from '@/types';

interface QuestionDisplayProps {
  question: Question;
  selectedAnswer: string | null;
  correctAnswer: string | null;
  onSelectAnswer: (letter: string) => void;
  disabled?: boolean;
  questionNumber: number;
  totalQuestions: number;
  onStop?: () => void;
  loading?: boolean;
}

export default function QuestionDisplay({
  question,
  selectedAnswer,
  correctAnswer,
  onSelectAnswer,
  disabled = false,
  questionNumber,
  totalQuestions,
  onStop,
  loading = false,
}: QuestionDisplayProps) {
  return (
    <Card className="w-full relative">
      {onStop && (
        <Button
          onClick={onStop}
          variant="outline"
          size="sm"
          disabled={loading}
          className="absolute top-4 right-4"
        >
          Stop
        </Button>
      )}
      <CardContent className="pt-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">{question.word_text}</h2>
        </div>
        <MultipleChoice
          options={question.options}
          selectedAnswer={selectedAnswer}
          correctAnswer={correctAnswer}
          onSelect={onSelectAnswer}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}

