import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Level } from '@/types';

interface LevelSelectorProps {
  levels: Level[];
  onSelectLevel: (level: Level) => void;
}

export default function LevelSelector({
  levels,
  onSelectLevel,
}: LevelSelectorProps) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md text-center h-80 flex flex-col justify-center">
        <CardHeader>
          <CardTitle className="text-2xl">Select level</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          <TooltipProvider>
            {levels.map((lvl) => (
              <Tooltip key={lvl.level_id}>
                <TooltipTrigger asChild>
                  <Button onClick={() => onSelectLevel(lvl)}>{lvl.name}</Button>
                </TooltipTrigger>
                <TooltipContent>{lvl.description}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
