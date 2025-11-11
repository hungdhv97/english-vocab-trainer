import { useMemo, memo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessionQuestionDetail } from '@/types';

interface QuestionsListProps {
  questions: SessionQuestionDetail[];
  onWordClick?: (wordId: number) => void;
}

function QuestionsListComponent({ questions, onWordClick }: QuestionsListProps) {
  // Memoize format function to avoid recreating on each render
  const formatTimeSpent = useCallback((ms?: number): string => {
    if (!ms) return 'N/A';
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  }, []);

  // Memoize option text lookup function
  const getOptionText = useCallback((options: SessionQuestionDetail['options'], letter: string): string => {
    const option = options.find(opt => opt.letter.toLowerCase() === letter.toLowerCase());
    return option?.text || letter;
  }, []);

  // Memoize word click handler to prevent unnecessary re-renders
  const handleWordClick = useCallback((wordId: number) => {
    onWordClick?.(wordId);
  }, [onWordClick]);

  // Memoize sorted questions to avoid re-sorting on every render
  // Questions are already sorted by question_number from the backend, but ensure stability
  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => a.question_number - b.question_number);
  }, [questions]);

  if (sortedQuestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Questions and Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No questions available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions and Answers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Word</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Your Answer</TableHead>
                <TableHead>Correct Answer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedQuestions.map((question) => (
                <TableRow key={question.question_id}>
                  <TableCell className="font-medium">
                    {question.question_number}
                  </TableCell>
                  <TableCell>
                    {onWordClick ? (
                      <button
                        onClick={() => handleWordClick(question.word_id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleWordClick(question.word_id);
                          }
                        }}
                        className="text-primary hover:underline font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                        type="button"
                        aria-label={`View details for word: ${question.word_text}`}
                      >
                        {question.word_text}
                      </button>
                    ) : (
                      <span className="font-medium">{question.word_text}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      {question.options.map((opt) => (
                        <div key={opt.letter}>
                          <span className="font-medium">{opt.letter.toUpperCase()}:</span> {opt.text}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {question.user_answer ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {question.user_answer.chosen_option}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({getOptionText(question.options, question.user_answer.chosen_option)})
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not answered</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{question.correct_answer}</span>
                      <span className="text-sm text-muted-foreground">
                        ({getOptionText(question.options, question.correct_answer)})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {question.user_answer ? (
                      <Badge
                        variant={question.user_answer.is_correct ? 'default' : 'destructive'}
                        className={
                          question.user_answer.is_correct
                            ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                            : ''
                        }
                      >
                        {question.user_answer.is_correct ? 'Correct' : 'Incorrect'}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not answered</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatTimeSpent(question.time_spent_ms)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize the component to prevent unnecessary re-renders
// Only re-render when questions or onWordClick props change
export const QuestionsList = memo(QuestionsListComponent);

