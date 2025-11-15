import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuestionDisplay from './QuestionDisplay';
import type { Question } from '@/types';

interface QuizPlayProps {
  question: Question | null;
  correctCount: number;
  incorrectCount: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeElapsedMs: number;
  selectedAnswer: string | null;
  submittedAnswer: string | null;
  correctAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  onReset: () => void;
}

export function QuizPlay({
  question,
  correctCount,
  incorrectCount,
  currentQuestionIndex,
  totalQuestions,
  timeElapsedMs,
  selectedAnswer,
  submittedAnswer,
  correctAnswer,
  onSelectAnswer,
  onReset,
}: QuizPlayProps) {
  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p>No questions available</p>
            <Button onClick={onReset} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
      <div className="w-full max-w-2xl space-y-4">
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Correct: {correctCount} | Incorrect: {incorrectCount}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Time: {(timeElapsedMs / 1000).toFixed(2)}s
                </p>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <QuestionDisplay
          question={question}
          selectedAnswer={selectedAnswer}
          correctAnswer={submittedAnswer ? correctAnswer : null}
          onSelectAnswer={onSelectAnswer}
          disabled={submittedAnswer !== null}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
        />
      </div>
    </div>
  );
}


