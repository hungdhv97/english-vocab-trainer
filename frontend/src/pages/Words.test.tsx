import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Words from '@/pages/Words';

describe('Words page', () => {
  it('renders the page title', async () => {
    render(<Words />);
    expect(await screen.findByText('Words')).toBeInTheDocument();
  });
});
