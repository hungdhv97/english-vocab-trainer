import { useParams } from 'react-router-dom';
import VocabQuizGame from './VocabQuizGame';
import ComingSoonGame from './ComingSoonGame';

interface GameRouterProps {
    userId: number;
}

/**
 * GameRouter - Routes to the correct game component based on :code parameter
 * 
 * Supported games:
 * - vocab-quiz: VocabQuizGame component
 * 
 * For unsupported game codes, shows ComingSoonGame component
 */
export default function GameRouter({ userId }: GameRouterProps) {
    const { code } = useParams<{ code: string }>();

    // Route based on game code
    switch (code) {
        case 'vocab-quiz':
            return <VocabQuizGame userId={userId} />;

        // Add more games here as they are implemented
        // case 'listening-quiz':
        //   return <ListeningQuizGame userId={userId} />;

        default:
            // Unknown/unimplemented game code - show Coming Soon page
            return <ComingSoonGame />;
    }
}

