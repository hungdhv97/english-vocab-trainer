import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { getWordDetail } from '@/lib/api';
import type { WordDetail } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export default function WordDetailPage() {
  const { wordId } = useParams<{ wordId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [wordDetail, setWordDetail] = useState<WordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the referring page (statistics page) from location state
  const fromStatisticsPage = location.state?.fromStatisticsPage;
  const sessionId = location.state?.sessionId;

  useEffect(() => {
    const loadWordDetail = async () => {
      if (!wordId) {
        setError('Word ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const detail = await getWordDetail(wordId);
        setWordDetail(detail);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load word details');
        console.error('Failed to load word details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWordDetail();
  }, [wordId]);

  const handleBack = () => {
    if (fromStatisticsPage && sessionId) {
      navigate(`/session/${sessionId}/statistics`);
    } else {
      navigate(-1);
    }
  };

  // Loading state with skeleton - enhanced to match final layout structure
  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Header skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        
        <Separator />

        {/* Translations card skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-24 mt-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>

        {/* Examples card skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        {/* Word Information card skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - comprehensive error handling
  if (error || !wordDetail) {
    // Determine error type for better user messaging
    const getErrorTitle = (errorMsg: string | null): string => {
      if (!errorMsg) return 'Error';
      if (errorMsg.toLowerCase().includes('not found')) return 'Word Not Found';
      if (errorMsg.toLowerCase().includes('word id')) return 'Invalid Word ID';
      return 'Error';
    };

    const getErrorMessage = (errorMsg: string | null): string => {
      if (!errorMsg) return 'Failed to load word details. Please try again.';
      if (errorMsg.toLowerCase().includes('not found')) {
        return 'The requested word could not be found. It may have been deleted or the word ID is incorrect.';
      }
      if (errorMsg.toLowerCase().includes('word id')) {
        return 'Invalid word ID. Please check the URL and try again.';
      }
      return errorMsg;
    };

    return (
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {fromStatisticsPage && sessionId && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/session/${sessionId}/statistics`}>Session Statistics</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>Word Detail</BreadcrumbPage>
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
              if (wordId) {
                getWordDetail(wordId)
                  .then(setWordDetail)
                  .catch((err) => {
                    setError(err instanceof Error ? err.message : 'Failed to load word details');
                  })
                  .finally(() => setLoading(false));
              }
            }}
            aria-label="Retry loading word details"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Handle edge case: missing mandatory fields (translations are mandatory)
  if (!wordDetail.translations || wordDetail.translations.length === 0) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {fromStatisticsPage && sessionId && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/session/${sessionId}/statistics`}>Session Statistics</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>Word Detail</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{wordDetail.word_text}</h1>
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
        <Alert variant="destructive" role="alert">
          <AlertTitle>Incomplete Word Data</AlertTitle>
          <AlertDescription>
            This word is missing required information (translations). Please contact support if this issue persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Group translations by language
  const translationsByLanguage = wordDetail.translations.reduce((acc, trans) => {
    if (!acc[trans.target_language]) {
      acc[trans.target_language] = [];
    }
    acc[trans.target_language].push(trans);
    return acc;
  }, {} as Record<string, typeof wordDetail.translations>);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {fromStatisticsPage && sessionId && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/session/${sessionId}/statistics`}>Session Statistics</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>Word Detail</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header with Back Button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{wordDetail.word_text}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {wordDetail.phonetic && (
              <span className="text-muted-foreground text-sm">/{wordDetail.phonetic}/</span>
            )}
            {wordDetail.cefr_level_code && wordDetail.cefr_level_code !== '' && (
              <Badge variant="secondary">{wordDetail.cefr_level_code}</Badge>
            )}
            {wordDetail.part_of_speech && (
              <Badge variant="outline">{wordDetail.part_of_speech}</Badge>
            )}
          </div>
        </div>
        <Button onClick={handleBack} variant="outline">
          Go Back
        </Button>
      </div>

      <Separator />

      {/* Translations */}
      <Card>
        <CardHeader>
          <CardTitle>Translations</CardTitle>
          <CardDescription>Translations in different languages</CardDescription>
        </CardHeader>
        <CardContent>
          {wordDetail.translations.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(translationsByLanguage).map(([language, translations]) => (
                <div key={language}>
                  <h3 className="font-semibold text-lg mb-2 capitalize">{language}</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {translations.map((trans) => (
                      <li key={trans.translation_id} className="text-muted-foreground">
                        {trans.translation_text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No translations available.</p>
          )}
        </CardContent>
      </Card>

      {/* Examples */}
      {wordDetail.examples && wordDetail.examples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Examples</CardTitle>
            <CardDescription>Example usage of the word</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wordDetail.examples.map((example) => (
                <div key={example.example_id} className="border-l-4 border-primary pl-4">
                  <p className="font-medium">{example.example_text}</p>
                  {example.translation_text && (
                    <p className="text-muted-foreground text-sm mt-1">
                      {example.translation_text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Word Information */}
      <Card>
        <CardHeader>
          <CardTitle>Word Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Language</dt>
              <dd className="mt-1 text-sm font-semibold uppercase">{wordDetail.language_code}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">CEFR Level</dt>
              <dd className="mt-1">
                {wordDetail.cefr_level_code && wordDetail.cefr_level_code !== '' ? (
                  <Badge variant="secondary">{wordDetail.cefr_level_code}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Not available</span>
                )}
              </dd>
            </div>
            {wordDetail.part_of_speech && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Part of Speech</dt>
                <dd className="mt-1">
                  <Badge variant="outline">{wordDetail.part_of_speech}</Badge>
                </dd>
              </div>
            )}
            {wordDetail.phonetic && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Phonetic</dt>
                <dd className="mt-1 text-sm font-mono">/{wordDetail.phonetic}/</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

