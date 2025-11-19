/**
 * Button Component Tests
 * Unit tests for the Button atom component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { Button } from '@/components/atoms/Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('renders button with correct variant classes', () => {
    render(<Button variant="primary">Primary Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600', 'text-white');
  });

  it('renders secondary variant correctly', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200', 'text-gray-900');
  });

  it('renders ghost variant correctly', () => {
    render(<Button variant="ghost">Ghost Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-transparent', 'text-gray-700');
  });

  it('renders different sizes correctly', () => {
    render(<Button size="sm">Small Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-2.5', 'py-1.5', 'text-sm');
  });

  it('renders large size correctly', () => {
    render(<Button size="lg">Large Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3', 'text-base');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('shows loading state correctly', () => {
    render(<Button isLoading>Loading Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    // Check for loading spinner
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('does not trigger click when loading', async () => {
    const handleClick = vi.fn();
    const { user } = render(
      <Button onClick={handleClick} isLoading>
        Loading Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders as different element when as prop is provided', () => {
    render(<Button as="a" href="/test">Link Button</Button>);
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('spreads additional props correctly', () => {
    render(
      <Button data-testid="test-button" aria-label="Test button">
        Test
      </Button>
    );
    
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
  });

  it('renders icon with text correctly', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    
    render(
      <Button>
        <TestIcon />
        Button with Icon
      </Button>
    );
    
    const button = screen.getByRole('button');
    const icon = screen.getByTestId('test-icon');
    
    expect(button).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(button).toHaveTextContent('Button with Icon');
  });

  it('has correct focus styles', () => {
    render(<Button>Focus me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
  });

  it('has correct hover styles for primary variant', () => {
    render(<Button variant="primary">Hover me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-blue-700');
  });

  it('has correct active styles', () => {
    render(<Button>Press me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('active:transform', 'active:scale-95');
  });
});