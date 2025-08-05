import type { Word } from '@/types';

interface WordDisplayProps {
  word: Word;
}

export default function WordDisplay({ word }: WordDisplayProps) {
  return <p className="text-xl font-semibold">{word.english}</p>;
}
