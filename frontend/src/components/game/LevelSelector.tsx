import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Difficulty } from '@/types';

interface LevelSelectorProps {
  onSelectLevel: (level: Difficulty) => void;
}

export default function LevelSelector({ onSelectLevel }: LevelSelectorProps) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Select level</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((l) => (
            <Button key={l} onClick={() => onSelectLevel(l as Difficulty)}>
              Level {l}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
