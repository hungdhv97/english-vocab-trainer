import CefrLevelSelector from '@/components/game/CefrLevelSelector';
import DirectionSelector from '@/components/game/DirectionSelector';
import type { CefrLevel, TranslationDirection } from '@/types';
import type { GameState } from '@/stores/gameStore';

interface GameConfigFlowProps {
  gameState: GameState;
  levels: CefrLevel[];
  selectedLevel: CefrLevel | null;
  onSelectLevel: (level: CefrLevel) => void;
  onSelectDirection: (direction: TranslationDirection) => void;
  onBack: () => void;
  onReset: () => void;
}

export function GameConfigFlow({
  gameState,
  levels,
  selectedLevel,
  onSelectLevel,
  onSelectDirection,
  onBack,
  onReset,
}: GameConfigFlowProps) {
  if (gameState === 'level-selection') {
    return <CefrLevelSelector levels={levels} onSelectLevel={onSelectLevel} onBack={onBack} />;
  }

  if (gameState === 'direction-selection') {
    if (!selectedLevel) {
      onReset();
      return null;
    }

    return (
      <DirectionSelector
        selectedLevel={selectedLevel}
        onSelectDirection={onSelectDirection}
        onBack={onBack}
      />
    );
  }

  return null;
}


