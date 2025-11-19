/**
 * Accessibility Utilities
 * Helper functions for WCAG 2.1 AA compliance
 */

/**
 * Generate a unique ID for form elements and ARIA labels
 */
export const generateA11yId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * ARIA live region announcer for screen readers
 */
export class A11yAnnouncer {
  private static instance: A11yAnnouncer;
  private liveRegion: HTMLElement | null = null;

  private constructor() {
    this.createLiveRegion();
  }

  static getInstance(): A11yAnnouncer {
    if (!A11yAnnouncer.instance) {
      A11yAnnouncer.instance = new A11yAnnouncer();
    }
    return A11yAnnouncer.instance;
  }

  private createLiveRegion(): void {
    if (this.liveRegion) return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('class', 'sr-only');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-10000px';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
}

/**
 * Keyboard navigation helpers
 */
export const KeyboardNavigation = {
  /**
   * Handle arrow key navigation in lists
   */
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (newIndex: number) => void
  ): void => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    onIndexChange(newIndex);
    items[newIndex]?.focus();
  },

  /**
   * Handle tab trapping in modals
   */
  trapFocus: (container: HTMLElement): (() => void) => {
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        // Find close button or trigger close action
        const closeButton = container.querySelector<HTMLElement>('[aria-label*="close"], [data-testid*="close"]');
        closeButton?.click();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }
};

/**
 * Focus management utilities
 */
export const FocusManager = {
  /**
   * Save and restore focus for modals and overlays
   */
  saveFocus: (): (() => void) => {
    const activeElement = document.activeElement as HTMLElement;
    
    return () => {
      activeElement?.focus();
    };
  },

  /**
   * Set focus to first interactive element in container
   */
  focusFirstInteractive: (container: HTMLElement): void => {
    const firstInteractive = container.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    firstInteractive?.focus();
  },

  /**
   * Check if element is focusable
   */
  isFocusable: (element: HTMLElement): boolean => {
    if (element.getAttribute('disabled') !== null) return false;
    if (element.getAttribute('tabindex') === '-1') return false;
    
    const focusableSelectors = [
      'button',
      'a[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]'
    ];

    return focusableSelectors.some(selector => element.matches(selector));
  }
};

/**
 * ARIA helpers
 */
export const AriaHelpers = {
  /**
   * Create ARIA describedby relationship
   */
  createDescribedBy: (elementId: string, descriptionId: string): void => {
    const element = document.getElementById(elementId);
    if (element) {
      const existingDescribedBy = element.getAttribute('aria-describedby');
      const newDescribedBy = existingDescribedBy 
        ? `${existingDescribedBy} ${descriptionId}`
        : descriptionId;
      element.setAttribute('aria-describedby', newDescribedBy);
    }
  },

  /**
   * Create ARIA labelledby relationship
   */
  createLabelledBy: (elementId: string, labelId: string): void => {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('aria-labelledby', labelId);
    }
  },

  /**
   * Set ARIA expanded state
   */
  setExpanded: (elementId: string, expanded: boolean): void => {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('aria-expanded', expanded.toString());
    }
  },

  /**
   * Set ARIA selected state
   */
  setSelected: (elementId: string, selected: boolean): void => {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('aria-selected', selected.toString());
    }
  },

  /**
   * Set ARIA busy state for loading states
   */
  setBusy: (elementId: string, busy: boolean): void => {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('aria-busy', busy.toString());
    }
  }
};

/**
 * Screen reader text utility
 */
export const ScreenReaderText = {
  /**
   * Create visually hidden text for screen readers
   */
  createSRText: (text: string): HTMLElement => {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'sr-only';
    return span;
  }
};

/**
 * Color contrast utilities
 */
export const ColorContrast = {
  /**
   * Check if color contrast meets WCAG AA standards
   */
  meetsContrastRatio: (foreground: string, background: string, isLargeText = false): boolean => {
    const minRatio = isLargeText ? 3 : 4.5;
    const ratio = calculateContrastRatio(foreground, background);
    return ratio >= minRatio;
  }
};

/**
 * Calculate luminance of a color
 */
function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Validate form input accessibility
 */
export const FormA11y = {
  /**
   * Validate that form inputs have proper labels
   */
  validateFormLabels: (form: HTMLFormElement): string[] => {
    const errors: string[] = [];
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach((input, index) => {
      const inputElement = input as HTMLInputElement;
      const hasLabel = inputElement.labels && inputElement.labels.length > 0;
      const hasAriaLabel = inputElement.getAttribute('aria-label');
      const hasAriaLabelledBy = inputElement.getAttribute('aria-labelledby');
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        errors.push(`Input ${index + 1} (${inputElement.name || inputElement.type}) lacks proper labeling`);
      }
    });
    
    return errors;
  },

  /**
   * Validate that error messages are properly associated
   */
  validateErrorMessages: (form: HTMLFormElement): string[] => {
    const errors: string[] = [];
    const errorElements = form.querySelectorAll('[role="alert"], .error-message');
    
    errorElements.forEach((error, index) => {
      const errorElement = error as HTMLElement;
      const errorId = errorElement.id;
      
      if (!errorId) {
        errors.push(`Error message ${index + 1} lacks an ID for association`);
        return;
      }
      
      const associatedInput = form.querySelector(`[aria-describedby*="${errorId}"]`);
      if (!associatedInput) {
        errors.push(`Error message ${index + 1} is not associated with any input`);
      }
    });
    
    return errors;
  }
};

/**
 * Table accessibility helpers
 */
export const TableA11y = {
  /**
   * Add proper table headers and scope attributes
   */
  enhanceTableAccessibility: (table: HTMLTableElement): void => {
    // Add table role if not present
    if (!table.getAttribute('role')) {
      table.setAttribute('role', 'table');
    }

    // Enhance headers
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
      if (!header.getAttribute('scope')) {
        // Determine scope based on position
        const row = header.closest('tr');
        const headerIndex = Array.from(row?.children || []).indexOf(header);
        header.setAttribute('scope', headerIndex === 0 ? 'row' : 'col');
      }
      
      // Add sort indicators for sortable columns
      const sortButton = header.querySelector('button');
      if (sortButton && !sortButton.getAttribute('aria-label')) {
        const columnName = header.textContent?.trim() || 'column';
        sortButton.setAttribute('aria-label', `Sort by ${columnName}`);
      }
    });

    // Add row/column information for screen readers
    const caption = table.querySelector('caption');
    if (!caption) {
      const newCaption = document.createElement('caption');
      newCaption.textContent = 'Data table';
      newCaption.className = 'sr-only';
      table.insertBefore(newCaption, table.firstChild);
    }
  },

  /**
   * Announce table changes to screen readers
   */
  announceTableUpdate: (message: string): void => {
    const announcer = A11yAnnouncer.getInstance();
    announcer.announce(message, 'polite');
  }
};