import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Words from '@/pages/Words';

describe('Words page', () => {
  it('renders the page title', () => {
    render(<Words />);
    expect(screen.getByText('Words')).toBeInTheDocument();
  });
});
