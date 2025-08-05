import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Difficulty } from '@/types';

interface LevelSelectorProps {
  onSelectLevel: (level: Difficulty) => void;
}

const levelDescriptions: Record<Difficulty, React.ReactNode> = {
  1: (
    <>
      Correct answer +1 point. <br /> Incorrect answer does not deduct points.
    </>
  ),
  2: (
    <>
      Correct answer +1 point. <br /> Incorrect answer -1 point.
    </>
  ),
  3: (
    <>
      Correct answer +1 point. <br /> Incorrect answer -2 points.
    </>
  ),
  4: (
    <>
      Correct answer +1 point. <br /> Incorrect answer resets score to 0.
    </>
  ),
  5: (
    <>
      Correct answer +1 point. <br /> Incorrect answer deducts points equal to the
      current wrong streak.
    </>
  ),
  6: (
    <>
      Correct answer +1 point. <br /> Incorrect answer deducts points equal to the
      square of the current wrong streak.
    </>
  ),
};

export default function LevelSelector({ onSelectLevel }: LevelSelectorProps) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Select level</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          <TooltipProvider>
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <Tooltip key={l}>
                <TooltipTrigger asChild>
                  <Button onClick={() => onSelectLevel(l as Difficulty)}>
                    Level {l}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={l > 3 ? 'bottom' : 'top'}>
                  {levelDescriptions[l as Difficulty]}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
