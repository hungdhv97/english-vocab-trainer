import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';

/**
 * ComingSoonGame - Placeholder for games that are not yet implemented
 * Shows a friendly message and provides navigation back to homepage
 */
export default function ComingSoonGame() {
    const navigate = useNavigate();
    const { code } = useParams<{ code: string }>();

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
            <Card className="w-full max-w-2xl text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Construction className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-2xl">Coming Soon!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-lg">
                        The game <span className="font-semibold text-foreground">"{code}"</span> is currently under development.
                    </p>
                    <p className="text-muted-foreground">
                        We're working hard to bring you this exciting new game experience.
                        Check back soon!
                    </p>
                    <div className="mt-6 space-x-4">
                        <Button onClick={() => navigate('/')} variant="default">
                            Back to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

