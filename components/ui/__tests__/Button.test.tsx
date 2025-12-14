import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('should apply primary variant by default', () => {
    render(<Button>Button</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-cyber-primary')
  })

  it('should apply secondary variant', () => {
    render(<Button variant="secondary">Button</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-cyber-secondary')
  })

  it('should apply danger variant', () => {
    render(<Button variant="danger">Button</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-red-500/20')
  })

  it('should apply ghost variant', () => {
    render(<Button variant="ghost">Button</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-transparent')
  })

  it('should apply small size', () => {
    render(<Button size="sm">Button</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('px-3')
  })

  it('should apply medium size by default', () => {
    render(<Button>Button</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('px-6')
  })

  it('should apply large size', () => {
    render(<Button size="lg">Button</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('px-8')
  })

  it('should render with icon', () => {
    const icon = <span data-testid="icon">→</span>
    render(<Button icon={icon}>Button</Button>)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<Button loading>Button</Button>)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Button')).not.toBeInTheDocument()
  })

  it('should disable button when loading', () => {
    render(<Button loading>Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should disable button when disabled prop is true', () => {
    render(<Button disabled>Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should apply full width', () => {
    render(<Button fullWidth>Button</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('w-full')
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Button</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-class')
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not trigger click when disabled', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>
    )
    const button = screen.getByRole('button')

    // Try to click disabled button
    await user.click(button).catch(() => {})

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should forward ref', () => {
    const ref = vi.fn()
    render(<Button ref={ref}>Button</Button>)
    expect(ref).toHaveBeenCalled()
  })

  it('should pass through additional props', () => {
    render(
      <Button type="submit" data-testid="submit-button">
        Submit
      </Button>
    )
    const button = screen.getByTestId('submit-button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})
