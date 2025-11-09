import { Card, CardContent } from '@/components/ui/card';
import MultipleChoice from '@/components/game/MultipleChoice';
import type { Question } from '@/types';

interface QuestionDisplayProps {
  question: Question;
  selectedAnswer: string | null;
  correctAnswer: string | null;
  onSelectAnswer: (letter: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionDisplay({
  question,
  selectedAnswer,
  correctAnswer,
  onSelectAnswer,
  disabled = false,
  showFeedback = false,
  questionNumber,
  totalQuestions,
}: QuestionDisplayProps) {
  return (
    <Card className="w-full max-w-2xl">
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
          showFeedback={showFeedback}
        />
      </CardContent>
    </Card>
  );
}

