import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import type { CefrLevel, TranslationDirection } from '@/types';

interface DirectionSelectorProps {
  selectedLevel: CefrLevel;
  onSelectDirection: (direction: TranslationDirection) => void;
  onBack: () => void;
}

export default function DirectionSelector({
  selectedLevel,
  onSelectDirection,
  onBack,
}: DirectionSelectorProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <Card className="w-full max-w-md text-center relative">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="absolute top-[10px] left-[10px]"
        >
          <ArrowLeft />
        </Button>
        <CardHeader>
          <CardTitle className="text-2xl">Select Translation Direction</CardTitle>
          <p className="text-sm text-muted-foreground">
            Level: <span className="font-semibold">{selectedLevel.code}</span> -{' '}
            {selectedLevel.level_name}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 mt-4">
          <Button
            onClick={() => onSelectDirection('en-to-vi')}
            variant="outline"
            className="w-full h-20 text-lg"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="font-semibold">English → Vietnamese</span>
              <span className="text-sm text-muted-foreground">
                Question in English, answer in Vietnamese
              </span>
            </div>
          </Button>
          <Button
            onClick={() => onSelectDirection('vi-to-en')}
            variant="outline"
            className="w-full h-20 text-lg"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="font-semibold">Vietnamese → English</span>
              <span className="text-sm text-muted-foreground">
                Question in Vietnamese, answer in English
              </span>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

