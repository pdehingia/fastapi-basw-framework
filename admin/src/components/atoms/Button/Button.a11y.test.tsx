/**
 * Accessibility Tests for Button Component
 * WCAG 2.1 AA compliance testing
 */

import { render, screen, fireEvent } from '@/test/utils';
import Button from '@/components/atoms/Button/Button';
import { axe } from 'vitest-axe';
import { vi } from 'vitest';

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <Button>Click me</Button>
    );
    
    const results = await axe(container);
    expect(results).toHaveLength(0);
  });

  it('should have proper ARIA attributes for icon-only button', async () => {
    const { container } = render(
      <Button 
        ariaLabel="Delete item"
        leftIcon={<span>🗑️</span>}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Delete item' });
    expect(button).toHaveAttribute('aria-label', 'Delete item');
    
    const results = await axe(container);
    expect(results).toHaveLength(0);
  });

  it('should announce loading state to screen readers', async () => {
    const { container } = render(
      <Button isLoading>Submit</Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    const results = await axe(container);
    expect(results).toHaveLength(0);
  });

  it('should have proper disabled state', async () => {
    const { container } = render(
      <Button disabled>Disabled button</Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('disabled');
    
    const results = await axe(container);
    expect(results).toHaveLength(0);
  });

  it('should support keyboard navigation', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick}>Keyboard accessible</Button>
    );
    
    const button = screen.getByRole('button');
    
    // Test Enter key
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ' });
    
    // Click handler should be called for both keys
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should have proper focus management', () => {
    render(<Button>Focus me</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    // Button should be focused
    expect(button).toHaveFocus();
    expect(document.activeElement).toBe(button);
  });

  it('should provide additional context when needed', async () => {
    const { container } = render(
      <Button 
        ariaDescription="This action cannot be undone"
        announceOnClick="Item deleted successfully"
      >
        Delete
      </Button>
    );
    
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveAttribute('aria-describedby');
    
    // Check if description is present
    const descriptionId = button.getAttribute('aria-describedby');
    const description = container.querySelector(`#${descriptionId}`);
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('This action cannot be undone');
    
    const results = await axe(container);
    expect(results).toHaveLength(0);
  });

  it('should render all button variants accessibly', async () => {
    const { container } = render(
      <div>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="outline">Outline</Button>
      </div>
    );
    
    // All buttons should be present and accessible
    expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Danger' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ghost' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Outline' })).toBeInTheDocument();
    
    const results = await axe(container);
    expect(results).toHaveLength(0);
  });

  it('should have minimum touch target size', () => {
    const { container } = render(<Button size="sm">Small button</Button>);
    
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    
    // Check that button has min-height class (from CSS)
    expect(button).toHaveAttribute('class');
    const classes = button?.className || '';
    expect(classes).toMatch(/min-h-/); // Should have min-height class
  });

  it('should handle icon accessibility correctly', async () => {
    const { container } = render(
      <Button 
        leftIcon={<span aria-hidden="true">📧</span>}
        rightIcon={<span aria-hidden="true">→</span>}
      >
        Send Email
      </Button>
    );
    
    // Icons should be marked as decorative
    const icons = container.querySelectorAll('span[aria-hidden="true"]');
    expect(icons).toHaveLength(2);
    
    const results = await axe(container);
    expect(results).toHaveLength(0);
  });

  it('should work with screen reader announcements', async () => {
    const { container } = render(
      <div>
        <Button announceOnClick="Save completed">Save</Button>
        <div aria-live="polite" className="sr-only" />
      </div>
    );
    
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeInTheDocument();
    
    // Click the button
    fireEvent.click(button);
    
    // Check that live region exists
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
    
    const results = await axe(container);
    expect(results).toHaveLength(0);
  });

  it('should handle tooltip accessibility', async () => {
    const { container } = render(
      <Button tooltip="This is additional information">
        Tooltip Button
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'This is additional information');
    expect(button).toHaveAttribute('aria-describedby');
    
    const results = await axe(container);
    expect(results).toHaveLength(0);
  });

  it('should maintain accessibility during loading state', async () => {
    const { container, rerender } = render(
      <Button>Submit</Button>
    );
    
    // Initial state should be accessible
    let results = await axe(container);
    expect(results).toHaveLength(0);
    
    // Loading state should also be accessible
    rerender(<Button isLoading>Submit</Button>);
    results = await axe(container);
    expect(results).toHaveLength(0);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('should handle complex button content accessibly', async () => {
    const { container } = render(
      <Button>
        <span>Click</span>
        <span aria-hidden="true"> → </span>
        <span>Action</span>
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName('Click Action');
    
    const results = await axe(container);
    expect(results).toHaveLength(0);
  });
});