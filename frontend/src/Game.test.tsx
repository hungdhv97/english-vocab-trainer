import { render, screen, fireEvent } from '@testing-library/react';
import Game from './Game';
import { vi } from 'vitest';

test('level 2 scoring', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    json: async () => [{ english: 'apple', vietnamese: 'táo' }],
  });
  vi.stubGlobal('fetch', fetchMock);

  const spy = vi.spyOn(Math, 'random').mockReturnValue(0);

  render(<Game />);

  fireEvent.click(screen.getByText('Level 2'));
  await screen.findByText('apple');

  const input = screen.getByRole('textbox');
  const submit = screen.getByText('Submit');

  fireEvent.change(input, { target: { value: 'táo' } });
  fireEvent.click(submit);
  expect(screen.getByText(/Score: 1/)).toBeInTheDocument();

  fireEvent.change(input, { target: { value: 'wrong' } });
  fireEvent.click(submit);
  expect(screen.getByText(/Score: 0/)).toBeInTheDocument();

  spy.mockRestore();
  vi.unstubAllGlobals();
});
