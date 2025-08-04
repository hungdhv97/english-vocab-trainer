import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Words from '@/pages/Words'

describe('Words page', () => {
  it('renders the page title', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    render(<Words />)
    expect(await screen.findByText('Words')).toBeInTheDocument()

    vi.restoreAllMocks()
  })
})
