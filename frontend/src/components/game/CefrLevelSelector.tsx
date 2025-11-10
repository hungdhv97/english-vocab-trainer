import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArrowLeft } from 'lucide-react';
import type { CefrLevel } from '@/types';

interface CefrLevelSelectorProps {
  levels: CefrLevel[];
  onSelectLevel: (level: CefrLevel) => void;
  onBack?: () => void;
}

export default function CefrLevelSelector({
  levels,
  onSelectLevel,
  onBack,
}: CefrLevelSelectorProps) {
  // CEFR levels in order: A1, A2, B1, B2, C1, C2
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const sortedLevels = [...levels].sort(
    (a, b) => levelOrder.indexOf(a.code) - levelOrder.indexOf(b.code),
  );

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <Card className="w-full max-w-2xl text-center relative">
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 z-10"
          >
            <ArrowLeft />
          </Button>
        )}
        <CardHeader className="relative">
          <CardTitle className="text-2xl">Select CEFR Level</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose your proficiency level. Questions will include words from this level and all
            previous levels.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <TooltipProvider>
            {sortedLevels.map((level) => (
              <Tooltip key={level.id}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onSelectLevel(level)}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-2xl font-bold">{level.code}</span>
                    <span className="text-xs text-muted-foreground break-words text-center px-1">{level.level_name}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="text-sm">
                    <p className="font-semibold">{level.group_name}</p>
                    <p className="mt-1">{level.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}

