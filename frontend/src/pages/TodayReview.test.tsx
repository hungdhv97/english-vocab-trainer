import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TodayReview from '@/pages/TodayReview';

describe('TodayReview page', () => {
  it('renders the page title', () => {
    render(<TodayReview />);
    expect(screen.getByText("Today's Review")).toBeInTheDocument();
  });
});
