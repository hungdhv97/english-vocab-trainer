# Quick Start: Session Statistics Page

**Feature**: Session Statistics Page  
**Date**: 2025-01-27  
**Branch**: `008-session-statistics-page`

## Overview

This guide provides step-by-step instructions for implementing the session statistics page feature. The feature includes a dedicated statistics page with visual charts, questions/answers list, and word detail page navigation.

## Prerequisites

- Backend: Go 1.24+, PostgreSQL 15+, Gin framework
- Frontend: Node.js 18+, React 19+, TypeScript 5.8+, Vite 5+
- shadcn UI components installed
- Recharts library installed (via shadcn chart component)
- Existing vocab quiz game session functionality

## Implementation Steps

### Phase 1: Backend API Endpoint

#### Step 1: Add SessionDetailsResponse Model

**File**: `backend/internal/modules/vocab_quiz/model/question.go`

Add the following models to the existing file:

```go
// SessionDetailsResponse represents the comprehensive session data response.
type SessionDetailsResponse struct {
    SessionID   int64                  `json:"session_id"`
    Statistics  SessionStatistics      `json:"statistics"`
    Questions   []SessionQuestionDetail `json:"questions"`
    SessionInfo SessionInfo            `json:"session_info"`
}

// SessionQuestionDetail represents a question with answer details.
type SessionQuestionDetail struct {
    QuestionID        int64           `json:"question_id"`
    SessionQuestionID int64           `json:"session_question_id"`
    QuestionNumber    int             `json:"question_number"`
    WordID            int64           `json:"word_id"`
    WordText          string          `json:"word_text"`
    TranslationID     int64           `json:"translation_id"`
    Options           []QuestionOption `json:"options"`
    CorrectAnswer     string          `json:"correct_answer"` // "a", "b", "c", or "d"
    UserAnswer        *UserAnswer     `json:"user_answer,omitempty"`
    TimeSpentMs       *int            `json:"time_spent_ms,omitempty"`
}

// UserAnswer represents the user's answer to a question.
type UserAnswer struct {
    ChosenOption string    `json:"chosen_option"` // "A", "B", "C", or "D"
    IsCorrect    bool      `json:"is_correct"`
    AnsweredAt   time.Time `json:"answered_at"`
    TimeSpentMs  *int      `json:"time_spent_ms,omitempty"`
}

// SessionInfo represents session metadata.
type SessionInfo struct {
    SessionID           int64     `json:"session_id"`
    UserID              int64     `json:"user_id"`
    GameID              int64     `json:"game_id"`
    CefrLevelID         int64     `json:"cefr_level_id"`
    CefrLevelCode       string    `json:"cefr_level_code"`
    TranslationDirection string   `json:"translation_direction"`
    TotalQuestions      int       `json:"total_questions"`
    StartedAt           time.Time `json:"started_at"`
    FinishedAt          *time.Time `json:"finished_at,omitempty"`
}

// LevelInformation represents CEFR level information.
type LevelInformation struct {
    CefrLevelID   int64  `json:"cefr_level_id"`
    CefrLevelCode string `json:"cefr_level_code"`
    LevelName     string `json:"level_name"`
    GroupName     string `json:"group_name"`
}
```

#### Step 2: Extend SessionStatistics Model

**File**: `backend/internal/modules/vocab_quiz/model/question.go`

Update the existing `SessionStatistics` model to include additional fields:

```go
// SessionStatistics represents statistics for a game session (extended).
type SessionStatistics struct {
    SessionID          int64             `json:"session_id"`
    TotalScore         int               `json:"total_score"`
    CorrectCount       int               `json:"correct_count"`
    IncorrectCount     int               `json:"incorrect_count"`
    AccuracyPercentage float64           `json:"accuracy_percentage"`
    TimeElapsed        *float64          `json:"time_elapsed,omitempty"`
    SessionStartTime   time.Time         `json:"session_start_time"`
    SessionEndTime     *time.Time        `json:"session_end_time,omitempty"`
    LevelInformation   *LevelInformation `json:"level_information,omitempty"`
    TranslationDirection string          `json:"translation_direction"`
}
```

#### Step 3: Implement GetSessionDetails Service Method

**File**: `backend/internal/modules/vocab_quiz/service/service.go`

Add the following method to retrieve detailed session data:

```go
// GetSessionDetails retrieves comprehensive session data including statistics, questions, and answers.
func (s *Service) GetSessionDetails(ctx context.Context, sessionID int64, userID int64) (*model.SessionDetailsResponse, error) {
    // 1. Get session and verify ownership
    session, err := s.vocabGameSvc.GetSession(ctx, sessionID)
    if err != nil {
        return nil, fmt.Errorf("failed to get session: %w", err)
    }
    
    if session.UserID != userID {
        return nil, fmt.Errorf("unauthorized: session belongs to another user")
    }
    
    // 2. Get session statistics
    stats, err := s.GetSessionStatistics(ctx, sessionID)
    if err != nil {
        return nil, fmt.Errorf("failed to get statistics: %w", err)
    }
    
    // 3. Get CEFR level information
    cefrLevel, err := s.cefrLevelSvc.GetByID(session.CefrLevelID)
    if err != nil {
        return nil, fmt.Errorf("failed to get CEFR level: %w", err)
    }
    
    // 4. Get questions with options and answers
    questions, err := s.getSessionQuestionsWithAnswers(ctx, sessionID, session)
    if err != nil {
        return nil, fmt.Errorf("failed to get questions: %w", err)
    }
    
    // 5. Build response
    response := &model.SessionDetailsResponse{
        SessionID: sessionID,
        Statistics: model.SessionStatistics{
            SessionID:          stats.SessionID,
            TotalScore:         stats.TotalScore,
            CorrectCount:       stats.CorrectCount,
            IncorrectCount:     stats.IncorrectCount,
            AccuracyPercentage: stats.AccuracyPercentage,
            TimeElapsed:        stats.TimeElapsed,
            SessionStartTime:   session.StartedAt,
            SessionEndTime:     session.FinishedAt,
            LevelInformation: &model.LevelInformation{
                CefrLevelID:   cefrLevel.ID,
                CefrLevelCode: cefrLevel.Code,
                LevelName:     cefrLevel.LevelName,
                GroupName:     cefrLevel.GroupName,
            },
            TranslationDirection: s.getTranslationDirection(session.FromLanguageID, session.ToLanguageID),
        },
        Questions: questions,
        SessionInfo: model.SessionInfo{
            SessionID:           sessionID,
            UserID:              session.UserID,
            GameID:              session.GameID,
            CefrLevelID:         session.CefrLevelID,
            CefrLevelCode:       cefrLevel.Code,
            TranslationDirection: s.getTranslationDirection(session.FromLanguageID, session.ToLanguageID),
            TotalQuestions:      session.TotalQuestions,
            StartedAt:           session.StartedAt,
            FinishedAt:          session.FinishedAt,
        },
    }
    
    return response, nil
}

// Helper method to get questions with answers
func (s *Service) getSessionQuestionsWithAnswers(ctx context.Context, sessionID int64, session *vocabgamemodel.VocabGameSession) ([]model.SessionQuestionDetail, error) {
    // Implementation: Query vocab_game_session_questions and vocab_game_session_answers
    // Join with translations and words tables to get word texts and option texts
    // Order by question_no
    // Return []model.SessionQuestionDetail
}

// Helper method to get translation direction
func (s *Service) getTranslationDirection(fromLangID, toLangID int64) string {
    // Implementation: Query languages table to get language codes
    // Return "en-to-vi" or "vi-to-en"
}
```

#### Step 4: Add GetSessionDetails Handler

**File**: `backend/internal/modules/vocab_quiz/handler/http.go`

Add the following handler method:

```go
// GetSessionDetails retrieves comprehensive session data.
func (h *Handler) GetSessionDetails(c *gin.Context) {
    sessionIDStr := c.Param("sessionId")
    sessionID, err := strconv.ParseInt(sessionIDStr, 10, 64)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session_id"})
        return
    }
    
    // Get user ID from context (set by authentication middleware)
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }
    
    ctx := c.Request.Context()
    details, err := h.svc.GetSessionDetails(ctx, sessionID, userID.(int64))
    if err != nil {
        if strings.Contains(err.Error(), "unauthorized") {
            c.JSON(http.StatusForbidden, gin.H{"error": "forbidden", "message": "You don't have access to this session"})
            return
        }
        if strings.Contains(err.Error(), "not found") {
            c.JSON(http.StatusNotFound, gin.H{"error": "session_not_found", "message": "Session not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "internal_server_error", "message": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, details)
}
```

#### Step 5: Register Route

**File**: `backend/internal/modules/vocab_quiz/wiring.go`

Add the new route:

```go
// RegisterRoutes wires vocab quiz handlers to the router.
func RegisterRoutes(r *gin.RouterGroup, d *deps.Deps) {
    // ... existing code ...
    
    // Session management
    r.POST("/vocab-quiz/session", h.CreateSession)
    r.POST("/vocab-quiz/session/:sessionId/finish", h.FinishSession)
    r.GET("/vocab-quiz/session/:sessionId/statistics", h.GetSessionStatistics)
    r.GET("/vocab-quiz/session/:sessionId/details", h.GetSessionDetails) // NEW
    
    // ... existing code ...
}
```

### Phase 2: Frontend Implementation

#### Step 1: Install Required shadcn UI Components

Run the following commands to install additional shadcn UI components:

```bash
cd frontend
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add breadcrumb
```

#### Step 2: Add TypeScript Types

**File**: `frontend/src/types/index.ts`

Add the following types:

```typescript
// Session details types
export interface SessionDetails {
  session_id: number;
  statistics: SessionStatisticsDetail;
  questions: SessionQuestionDetail[];
  session_info: SessionInfo;
}

export interface SessionStatisticsDetail extends SessionStatistics {
  session_start_time: string;
  session_end_time?: string;
  level_information?: LevelInformation;
  translation_direction: TranslationDirection;
}

export interface SessionQuestionDetail {
  question_id: number;
  session_question_id: number;
  question_number: number;
  word_id: number;
  word_text: string;
  translation_id: number;
  options: Option[];
  correct_answer: string;
  user_answer?: UserAnswer;
  time_spent_ms?: number;
}

export interface UserAnswer {
  chosen_option: string;
  is_correct: boolean;
  answered_at: string;
  time_spent_ms?: number;
}

export interface SessionInfo {
  session_id: number;
  user_id: number;
  game_id: number;
  cefr_level_id: number;
  cefr_level_code: string;
  translation_direction: TranslationDirection;
  total_questions: number;
  started_at: string;
  finished_at?: string;
}

export interface LevelInformation {
  cefr_level_id: number;
  cefr_level_code: string;
  level_name: string;
  group_name: string;
}

// Word detail types
export interface WordDetail {
  word_id: number;
  word_text: string;
  language_code: string;
  translations: WordTranslation[];
  difficulty_level: string;
  examples?: WordExample[];
  part_of_speech?: string;
  phonetic?: string;
  concept_id?: string;
  related_words?: RelatedWord[];
}

export interface WordTranslation {
  translation_id: number;
  target_language: string;
  translation_text: string;
}

export interface WordExample {
  example_id: number;
  example_text: string;
  translation_text: string;
}

export interface RelatedWord {
  word_id: number;
  word_text: string;
  relationship_type: string;
}
```

#### Step 3: Add API Function

**File**: `frontend/src/lib/api.ts`

Add the following function:

```typescript
export async function getSessionDetails(
  sessionId: string,
): Promise<SessionDetails> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${API_BASE_URL}/vocab-quiz/session/${sessionId}/details`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: You don\'t have access to this session');
    }
    if (response.status === 404) {
      throw new Error('Session not found');
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to get session details');
  }

  return response.json();
}
```

#### Step 4: Create Statistics Page Component

**File**: `frontend/src/components/statistics/SessionStatisticsPage.tsx`

Create the main statistics page component:

```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { getSessionDetails } from '@/lib/api';
import type { SessionDetails } from '@/types';
import StatisticsOverview from './StatisticsOverview';
import StatisticsCharts from './StatisticsCharts';
import QuestionsList from './QuestionsList';
import { ArrowLeft } from 'lucide-react';

export default function SessionStatisticsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('Session ID is required');
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const details = await getSessionDetails(sessionId);
        setSessionDetails(details);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [sessionId]);

  if (loading) {
    return <SessionStatisticsPageSkeleton />;
  }

  if (error || !sessionDetails) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{error || 'Session not found'}</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            Session Statistics
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-6">
        <StatisticsOverview statistics={sessionDetails.statistics} />
        <StatisticsCharts 
          statistics={sessionDetails.statistics}
          questions={sessionDetails.questions}
        />
        <QuestionsList questions={sessionDetails.questions} />
      </div>
    </div>
  );
}

function SessionStatisticsPageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

#### Step 5: Create Statistics Overview Component

**File**: `frontend/src/components/statistics/StatisticsOverview.tsx`

Create component to display overview statistics:

```typescript
import { Card, CardContent } from '@/components/ui/card';
import type { SessionStatisticsDetail } from '@/types';

interface Props {
  statistics: SessionStatisticsDetail;
}

export default function StatisticsOverview({ statistics }: Props) {
  const totalQuestions = statistics.correct_count + statistics.incorrect_count;
  const accuracy = statistics.accuracy_percentage.toFixed(1);
  const timeMinutes = statistics.time_elapsed
    ? Math.floor(statistics.time_elapsed / 60)
    : 0;
  const timeSeconds = statistics.time_elapsed
    ? Math.floor(statistics.time_elapsed % 60)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {statistics.correct_count}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Correct Answers</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {statistics.incorrect_count}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Incorrect Answers</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {totalQuestions}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Total Questions</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {accuracy}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">Accuracy</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Step 6: Create Statistics Charts Component

**File**: `frontend/src/components/statistics/StatisticsCharts.tsx`

Create component to display three charts:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import type { SessionStatisticsDetail, SessionQuestionDetail } from '@/types';

interface Props {
  statistics: SessionStatisticsDetail;
  questions: SessionQuestionDetail[];
}

export default function StatisticsCharts({ statistics, questions }: Props) {
  // Prepare accuracy breakdown data
  const accuracyData = [
    { name: 'Correct', value: statistics.correct_count, color: 'hsl(var(--chart-1))' },
    { name: 'Incorrect', value: statistics.incorrect_count, color: 'hsl(var(--chart-2))' },
  ];

  // Prepare time analysis data
  const timeData = questions
    .filter(q => q.time_spent_ms !== undefined)
    .map(q => ({
      question_number: q.question_number,
      time_spent_seconds: (q.time_spent_ms || 0) / 1000,
    }));

  // Prepare performance over time data
  const performanceData = questions.map((q, index) => {
    const answeredQuestions = questions.slice(0, index + 1);
    const correctCount = answeredQuestions.filter(aq => aq.user_answer?.is_correct).length;
    const runningAccuracy = (correctCount / answeredQuestions.length) * 100;
    return {
      question_number: q.question_number,
      running_accuracy: runningAccuracy,
      is_correct: q.user_answer?.is_correct ? 1 : 0,
    };
  });

  const chartConfig = {
    correct: { label: 'Correct', color: 'hsl(var(--chart-1))' },
    incorrect: { label: 'Incorrect', color: 'hsl(var(--chart-2))' },
    accuracy: { label: 'Accuracy', color: 'hsl(var(--chart-3))' },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Accuracy Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Accuracy Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <PieChart>
              <Pie
                data={accuracyData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {accuracyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip />
              <ChartLegend />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Time Analysis Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Time Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question_number" />
              <YAxis />
              <ChartTooltip />
              <Bar dataKey="time_spent_seconds" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Performance Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question_number" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="running_accuracy" 
                stroke="hsl(var(--chart-1))" 
                name="Running Accuracy"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="is_correct" 
                stroke="hsl(var(--chart-2))" 
                name="Correct/Incorrect"
              />
              <ChartLegend />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Step 7: Create Questions List Component

**File**: `frontend/src/components/statistics/QuestionsList.tsx`

Create component to display questions and answers list:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import type { SessionQuestionDetail } from '@/types';

interface Props {
  questions: SessionQuestionDetail[];
}

export default function QuestionsList({ questions }: Props) {
  const navigate = useNavigate();

  const handleWordClick = (wordId: number) => {
    navigate(`/word/${wordId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions and Answers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Word</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Your Answer</TableHead>
              <TableHead>Correct Answer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.question_id}>
                <TableCell>{question.question_number}</TableCell>
                <TableCell>
                  <button
                    onClick={() => handleWordClick(question.word_id)}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {question.word_text}
                  </button>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {question.options.map((option) => (
                      <div key={option.letter} className="text-sm">
                        {option.letter.toUpperCase()}. {option.text}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {question.user_answer ? (
                    <span className={question.user_answer.is_correct ? 'text-green-600' : 'text-red-600'}>
                      {question.user_answer.chosen_option}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not answered</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-green-600">{question.correct_answer.toUpperCase()}</span>
                </TableCell>
                <TableCell>
                  {question.user_answer ? (
                    <Badge variant={question.user_answer.is_correct ? 'default' : 'destructive'}>
                      {question.user_answer.is_correct ? 'Correct' : 'Incorrect'}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Not answered</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {question.time_spent_ms
                    ? `${(question.time_spent_ms / 1000).toFixed(1)}s`
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

#### Step 8: Create Word Detail Page Component

**File**: `frontend/src/components/word/WordDetailPage.tsx`

Create component to display word details:

```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import type { WordDetail } from '@/types';

export default function WordDetailPage() {
  const { wordId } = useParams<{ wordId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wordDetail, setWordDetail] = useState<WordDetail | null>(null);

  useEffect(() => {
    if (!wordId) {
      setError('Word ID is required');
      setLoading(false);
      return;
    }

    // TODO: Implement API call to get word details
    // const fetchWordDetail = async () => {
    //   try {
    //     setLoading(true);
    //     const detail = await getWordDetail(wordId);
    //     setWordDetail(detail);
    //     setError(null);
    //   } catch (err) {
    //     setError(err instanceof Error ? err.message : 'Failed to load word details');
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchWordDetail();
    
    // Placeholder for now
    setLoading(false);
  }, [wordId]);

  if (loading) {
    return <WordDetailPageSkeleton />;
  }

  if (error || !wordDetail) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{error || 'Word not found'}</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <Button variant="link" onClick={() => navigate(-1)}>
              Statistics
            </Button>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Word Detail</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{wordDetail.word_text}</CardTitle>
          <div className="flex gap-2 mt-2">
            <Badge>{wordDetail.difficulty_level}</Badge>
            {wordDetail.part_of_speech && (
              <Badge variant="secondary">{wordDetail.part_of_speech}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Translations */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Translations</h3>
            <div className="space-y-2">
              {wordDetail.translations.map((translation) => (
                <div key={translation.translation_id}>
                  <span className="font-medium">{translation.target_language}:</span>{' '}
                  {translation.translation_text}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Examples */}
          {wordDetail.examples && wordDetail.examples.length > 0 && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">Examples</h3>
                <div className="space-y-2">
                  {wordDetail.examples.map((example) => (
                    <div key={example.example_id}>
                      <p>{example.example_text}</p>
                      <p className="text-sm text-muted-foreground">{example.translation_text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Phonetic */}
          {wordDetail.phonetic && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">Phonetic</h3>
                <p>{wordDetail.phonetic}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Related Words */}
          {wordDetail.related_words && wordDetail.related_words.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Related Words</h3>
              <div className="flex flex-wrap gap-2">
                {wordDetail.related_words.map((word) => (
                  <Badge key={word.word_id} variant="outline">
                    {word.word_text}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WordDetailPageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Skeleton className="h-6 w-48 mb-6" />
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### Step 9: Update Game Component

**File**: `frontend/src/components/game/Game.tsx`

Update the "View Statistics" button to navigate to the new page:

```typescript
import { useNavigate } from 'react-router-dom';

// In the component:
const navigate = useNavigate();

const handleViewStatistics = () => {
  if (sessionId) {
    navigate(`/session/${sessionId}/statistics`);
  }
};

// Update the button:
<Button onClick={handleViewStatistics} variant="outline">
  View Statistics
</Button>
```

#### Step 10: Add Routes

**File**: `frontend/src/App.tsx`

Add new routes for statistics and word detail pages:

```typescript
import SessionStatisticsPage from '@/components/statistics/SessionStatisticsPage';
import WordDetailPage from '@/components/word/WordDetailPage';

// Add routes:
<Route
  path="/session/:sessionId/statistics"
  element={
    userId !== null && !isLoggingOut.current ? (
      <SessionStatisticsPage />
    ) : isLoggingOut.current ? (
      <Navigate to="/" replace />
    ) : (
      <Navigate to="/login" />
    )
  }
/>
<Route
  path="/word/:wordId"
  element={
    userId !== null && !isLoggingOut.current ? (
      <WordDetailPage />
    ) : isLoggingOut.current ? (
      <Navigate to="/" replace />
    ) : (
      <Navigate to="/login" />
    )
  }
/>
```

## Manual Verification Steps

### 1. Backend API Verification

1. Start the backend server
2. Complete a vocabulary quiz session
3. Get the session ID from the completion screen
4. Test the API endpoint:
   ```bash
   curl -X GET "http://localhost:8180/api/v1/vocab-quiz/session/{sessionId}/details" \
     -H "Authorization: Bearer {token}"
   ```
5. Verify the response includes:
   - Session statistics
   - Questions with options
   - User answers
   - Session information

### 2. Frontend Page Verification

1. Start the frontend development server
2. Complete a vocabulary quiz session
3. Click "View Statistics" button
4. Verify navigation to `/session/{sessionId}/statistics`
5. Verify the page displays:
   - Overview statistics (4 cards)
   - Three charts (accuracy breakdown, time analysis, performance over time)
   - Questions and answers list
6. Verify skeleton loading states appear while data loads
7. Verify charts render correctly with data
8. Verify questions list displays all questions with correct/incorrect indicators

### 3. Word Detail Page Verification

1. On the statistics page, click on a word in the questions list
2. Verify navigation to `/word/{wordId}`
3. Verify the word detail page displays:
   - Word text
   - Translations
   - Difficulty level
   - Optional fields if available (examples, part of speech, phonetic)
4. Verify breadcrumb navigation works
5. Verify back button returns to statistics page

### 4. Error Handling Verification

1. Test with invalid session ID:
   - Verify 404 error message displays
   - Verify navigation back to home works
2. Test with session from another user:
   - Verify 403 error message displays
   - Verify unauthorized access is prevented
3. Test with missing data:
   - Verify graceful handling of missing optional fields
   - Verify charts handle empty data gracefully

### 5. Performance Verification

1. Verify page loads in under 3 seconds for sessions with 20 questions
2. Verify navigation to statistics page in under 2 seconds
3. Verify word detail page loads in under 2 seconds
4. Verify charts render without performance issues
5. Verify questions list scrolls smoothly for sessions with many questions

### 6. Mobile Responsiveness Verification

1. Test on mobile device or browser dev tools
2. Verify statistics page is responsive
3. Verify charts are readable on mobile
4. Verify questions list is scrollable on mobile
5. Verify word detail page is responsive

## Troubleshooting

### Common Issues

1. **Charts not rendering**:
   - Verify Recharts is installed: `npm list recharts`
   - Verify shadcn chart component is properly imported
   - Check browser console for errors

2. **API endpoint returns 401/403**:
   - Verify authentication token is valid
   - Verify user owns the session
   - Check backend authorization logic

3. **Skeleton loading states not showing**:
   - Verify Skeleton component is imported
   - Verify loading state is properly managed
   - Check React state updates

4. **Word detail page not navigating**:
   - Verify route is registered in App.tsx
   - Verify word ID is passed correctly
   - Check browser console for errors

## Next Steps

After implementing this feature:

1. Test all manual verification steps
2. Verify accessibility (keyboard navigation, screen readers)
3. Verify mobile responsiveness
4. Update documentation if needed
5. Deploy to staging environment
6. Perform final manual testing
7. Deploy to production

## References

- [shadcn UI Documentation](https://ui.shadcn.com/)
- [Recharts Documentation](https://recharts.org/)
- [React Router Documentation](https://reactrouter.com/)
- [OpenAPI Specification](./contracts/openapi.yaml)
- [Data Model Documentation](./data-model.md)

