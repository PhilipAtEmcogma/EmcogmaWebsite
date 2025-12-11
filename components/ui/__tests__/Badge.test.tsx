import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('should render children', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('should apply default variant by default', () => {
    render(<Badge>Badge</Badge>)
    const badge = screen.getByText('Badge')
    expect(badge.className).toContain('bg-gray-800')
    expect(badge.className).toContain('text-gray-300')
  })

  it('should apply success variant', () => {
    render(<Badge variant="success">Success</Badge>)
    const badge = screen.getByText('Success')
    expect(badge.className).toContain('bg-green-500/20')
    expect(badge.className).toContain('text-green-400')
  })

  it('should apply warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>)
    const badge = screen.getByText('Warning')
    expect(badge.className).toContain('bg-yellow-500/20')
    expect(badge.className).toContain('text-yellow-400')
  })

  it('should apply error variant', () => {
    render(<Badge variant="error">Error</Badge>)
    const badge = screen.getByText('Error')
    expect(badge.className).toContain('bg-red-500/20')
    expect(badge.className).toContain('text-red-400')
  })

  it('should apply info variant', () => {
    render(<Badge variant="info">Info</Badge>)
    const badge = screen.getByText('Info')
    expect(badge.className).toContain('bg-blue-500/20')
    expect(badge.className).toContain('text-blue-400')
  })

  it('should apply custom className', () => {
    render(<Badge className="custom-badge">Badge</Badge>)
    const badge = screen.getByText('Badge')
    expect(badge.className).toContain('custom-badge')
  })

  it('should maintain base classes', () => {
    render(<Badge>Badge</Badge>)
    const badge = screen.getByText('Badge')
    expect(badge.className).toContain('inline-flex')
    expect(badge.className).toContain('items-center')
    expect(badge.className).toContain('rounded-full')
    expect(badge.className).toContain('text-xs')
    expect(badge.className).toContain('border')
  })

  it('should render as span element', () => {
    render(<Badge>Badge</Badge>)
    const badge = screen.getByText('Badge')
    expect(badge.tagName).toBe('SPAN')
  })

  it('should render JSX children', () => {
    render(
      <Badge>
        <span data-testid="icon">✓</span>
        <span>Success</span>
      </Badge>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
