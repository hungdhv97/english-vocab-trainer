import { render, screen, fireEvent } from '@testing-library/react';
import Game from './Game';
import { vi } from 'vitest';

test('level 2 scoring', () => {
  const spy = vi.spyOn(Math, 'random').mockReturnValue(0);

  render(<Game />);

  fireEvent.click(screen.getByText('Mức 2'));
  const input = screen.getByRole('textbox');
  const submit = screen.getByText('Trả lời');

  fireEvent.change(input, { target: { value: 'táo' } });
  fireEvent.click(submit);
  expect(screen.getByText(/Điểm: 1/)).toBeInTheDocument();

  fireEvent.change(input, { target: { value: 'sai' } });
  fireEvent.click(submit);
  expect(screen.getByText(/Điểm: 0/)).toBeInTheDocument();

  spy.mockRestore();
});
