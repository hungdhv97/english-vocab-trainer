import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import History from '@/pages/History';

describe('History page', () => {
  it('renders the page title', () => {
    render(<History />);
    expect(screen.getByText('History')).toBeInTheDocument();
  });
});
