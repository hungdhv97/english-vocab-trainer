import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSessionDetails } from '@/lib/api';
import type { SessionDetails } from '@/types';
import { StatisticsOverview } from './StatisticsOverview';
import { StatisticsCharts } from './StatisticsCharts';
import { QuestionsList } from './QuestionsList';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function SessionStatisticsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessionDetails = async () => {
      if (!sessionId) {
        setError('Session ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const details = await getSessionDetails(sessionId);
        setSessionDetails(details);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session details');
        console.error('Failed to load session details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSessionDetails();
  }, [sessionId]);

  const handleWordClick = (wordId: number) => {
    // Navigate to word detail page with state to enable back navigation
    navigate(`/word/${wordId}`, {
      state: {
        fromStatisticsPage: true,
        sessionId: sessionId,
      },
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Loading state with skeleton - enhanced to match final layout structure
  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <Separator />

        {/* Statistics Overview skeleton - 5 cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts skeleton - 2 charts side by side, then 1 full width */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>

        {/* Questions List skeleton */}
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 w-12" />
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - comprehensive error handling
  if (error || !sessionDetails) {
    // Determine error type for better user messaging
    const getErrorTitle = (errorMsg: string | null): string => {
      if (!errorMsg) return 'Error';
      if (errorMsg.toLowerCase().includes('not found')) return 'Session Not Found';
      if (errorMsg.toLowerCase().includes('unauthorized') || errorMsg.toLowerCase().includes('forbidden')) return 'Access Denied';
      if (errorMsg.toLowerCase().includes('session id')) return 'Invalid Session';
      return 'Error';
    };

    const getErrorMessage = (errorMsg: string | null): string => {
      if (!errorMsg) return 'Failed to load session details. Please try again.';
      if (errorMsg.toLowerCase().includes('not found')) {
        return 'The requested session could not be found. It may have been deleted or the session ID is incorrect.';
      }
      if (errorMsg.toLowerCase().includes('unauthorized') || errorMsg.toLowerCase().includes('forbidden')) {
        return 'You do not have permission to view this session. You can only view your own sessions.';
      }
      if (errorMsg.toLowerCase().includes('session id')) {
        return 'Invalid session ID. Please check the URL and try again.';
      }
      return errorMsg;
    };

    return (
      <div className="container mx-auto py-6 px-4 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Session Statistics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Alert variant="destructive" role="alert">
          <AlertTitle>{getErrorTitle(error)}</AlertTitle>
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button 
            onClick={handleBack} 
            variant="outline"
            aria-label="Go back to previous page"
          >
            Go Back
          </Button>
          <Button
            onClick={() => {
              setError(null);
              setLoading(true);
              if (sessionId) {
                getSessionDetails(sessionId)
                  .then(setSessionDetails)
                  .catch((err) => {
                    setError(err instanceof Error ? err.message : 'Failed to load session details');
                  })
                  .finally(() => setLoading(false));
              }
            }}
            aria-label="Retry loading session details"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Handle edge cases: empty session or missing data
  if (sessionDetails.questions.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Session Statistics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Session Statistics</h1>
            <p className="text-muted-foreground mt-1">
              Session #{sessionDetails.session_id} - {sessionDetails.statistics.level_information?.cefr_level_code || 'N/A'}
            </p>
          </div>
          <Button onClick={handleBack} variant="outline">
            Go Back
          </Button>
        </div>
        <Separator />
        <StatisticsOverview statistics={sessionDetails.statistics} />
        <Alert>
          <AlertTitle>No Questions Available</AlertTitle>
          <AlertDescription>
            This session does not contain any questions. The session may still be in progress or no questions were generated.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Session Statistics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Session Statistics</h1>
          <p className="text-muted-foreground mt-1">
            Session #{sessionDetails.session_id} - {sessionDetails.statistics.level_information?.cefr_level_code || 'N/A'}
          </p>
        </div>
        <Button 
          onClick={handleBack} 
          variant="outline"
          aria-label="Go back to previous page"
        >
          Go Back
        </Button>
      </div>

      <Separator />

      {/* Statistics Overview */}
      <StatisticsOverview statistics={sessionDetails.statistics} />

      {/* Charts */}
      <StatisticsCharts
        statistics={sessionDetails.statistics}
        questions={sessionDetails.questions}
      />

      {/* Questions List */}
      <QuestionsList
        questions={sessionDetails.questions}
        onWordClick={handleWordClick}
      />
    </div>
  );
}

