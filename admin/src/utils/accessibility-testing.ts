/**
 * Accessibility Testing Configuration
 * Axe-core rules and configuration for WCAG 2.1 AA compliance
 */

import { configureAxe, getViolations, Result } from '@axe-core/react';

/**
 * Axe-core configuration for testing
 */
export const axeConfig = {
  // WCAG 2.1 AA compliance rules
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  
  // Additional rules for better accessibility
  rules: {
    // Color contrast rules (WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text)
    'color-contrast': { enabled: true },
    'color-contrast-enhanced': { enabled: false }, // This is for AAA level
    
    // Keyboard navigation
    'keyboard': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'tabindex': { enabled: true },
    
    // Form accessibility
    'label': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'input-button-name': { enabled: true },
    'select-name': { enabled: true },
    
    // ARIA usage
    'aria-allowed-attr': { enabled: true },
    'aria-command-name': { enabled: true },
    'aria-hidden-body': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    'aria-input-field-name': { enabled: true },
    'aria-label': { enabled: true },
    'aria-labelledby': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    
    // Structure and semantics
    'heading-order': { enabled: true },
    'landmark-one-main': { enabled: true },
    'landmark-unique': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    
    // Images and media
    'image-alt': { enabled: true },
    'input-image-alt': { enabled: true },
    'object-alt': { enabled: true },
    
    // Tables
    'table-duplicate-name': { enabled: true },
    'table-fake-caption': { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },
    
    // Links and navigation
    'link-name': { enabled: true },
    'link-in-text-block': { enabled: true },
    
    // Language
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'valid-lang': { enabled: true },
    
    // Document structure
    'document-title': { enabled: true },
    'duplicate-id': { enabled: true },
    'duplicate-id-active': { enabled: true },
    'duplicate-id-aria': { enabled: true },
    
    // Disable rules that may not apply to our SPA
    'region': { enabled: false }, // We handle this manually
    'page-has-heading-one': { enabled: false }, // SPA routing handles this
    'bypass': { enabled: false }, // We implement skip links manually
  },
  
  // Exclude certain elements from testing if needed
  exclude: [
    ['[data-testid="loading-spinner"]'], // Loading animations may have accessibility issues temporarily
  ],
  
  // Performance settings
  timeout: 10000,
};

/**
 * Initialize axe-core for development environment
 */
export const initializeAxe = () => {
  if (process.env.NODE_ENV === 'development') {
    configureAxe({
      ...axeConfig,
      // Log violations to console in development
      reporter: 'v2',
    });
  }
};

/**
 * Custom accessibility testing utilities
 */
export const AccessibilityTester = {
  /**
   * Test a single component for accessibility violations
   */
  testComponent: async (container: HTMLElement): Promise<Result[]> => {
    const violations = await getViolations(container, axeConfig);
    return violations;
  },

  /**
   * Format accessibility violations for better readability
   */
  formatViolations: (violations: Result[]): string => {
    if (violations.length === 0) {
      return 'No accessibility violations found.';
    }

    return violations.map(violation => {
      const impact = violation.impact ? ` (${violation.impact.toUpperCase()})` : '';
      const help = violation.help;
      const helpUrl = violation.helpUrl;
      const nodeCount = violation.nodes.length;
      
      return `${help}${impact}\n  Affects ${nodeCount} element(s)\n  Learn more: ${helpUrl}`;
    }).join('\n\n');
  },

  /**
   * Check color contrast programmatically
   */
  checkColorContrast: (foreground: string, background: string, isLargeText = false): {
    isValid: boolean;
    ratio: number;
    level: string;
  } => {
    const ratio = calculateContrastRatio(foreground, background);
    const requiredRatio = isLargeText ? 3.0 : 4.5;
    const isValid = ratio >= requiredRatio;
    
    let level = 'FAIL';
    if (ratio >= (isLargeText ? 4.5 : 7.0)) {
      level = 'AAA';
    } else if (ratio >= requiredRatio) {
      level = 'AA';
    }
    
    return { isValid, ratio, level };
  },

  /**
   * Test keyboard navigation for a container
   */
  testKeyboardNavigation: (container: HTMLElement): {
    focusableElements: HTMLElement[];
    tabOrder: HTMLElement[];
    issues: string[];
  } => {
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );

    const tabOrder = focusableElements
      .map(el => ({ element: el, tabIndex: el.tabIndex || 0 }))
      .sort((a, b) => {
        if (a.tabIndex === b.tabIndex) return 0;
        if (a.tabIndex === 0) return 1;
        if (b.tabIndex === 0) return -1;
        return a.tabIndex - b.tabIndex;
      })
      .map(item => item.element);

    const issues: string[] = [];

    // Check for proper ARIA labels on interactive elements
    focusableElements.forEach((el, index) => {
      const hasLabel = el.getAttribute('aria-label') || 
                      el.getAttribute('aria-labelledby') || 
                      el.textContent?.trim() ||
                      (el as HTMLInputElement).labels?.length;

      if (!hasLabel) {
        issues.push(`Focusable element ${index + 1} lacks proper labeling`);
      }
    });

    // Check for logical tab order
    tabOrder.forEach((el, index) => {
      if (index > 0) {
        const current = el.getBoundingClientRect();
        const previous = tabOrder[index - 1].getBoundingClientRect();
        
        // Basic check for reading order (top to bottom, left to right)
        if (current.top < previous.bottom && current.left < previous.left) {
          issues.push(`Tab order may not follow logical reading order at element ${index + 1}`);
        }
      }
    });

    return { focusableElements, tabOrder, issues };
  },

  /**
   * Test form accessibility
   */
  testFormAccessibility: (form: HTMLFormElement): {
    hasLabels: boolean;
    hasErrorAssociation: boolean;
    hasRequiredIndication: boolean;
    issues: string[];
  } => {
    const issues: string[] = [];
    const formControls = Array.from(form.querySelectorAll('input, select, textarea'));

    // Check labels
    const unlabeledControls = formControls.filter(control => {
      const input = control as HTMLInputElement;
      return !input.labels?.length && 
             !input.getAttribute('aria-label') && 
             !input.getAttribute('aria-labelledby');
    });

    const hasLabels = unlabeledControls.length === 0;
    if (!hasLabels) {
      issues.push(`${unlabeledControls.length} form controls lack proper labels`);
    }

    // Check error association
    const errorElements = Array.from(form.querySelectorAll('[role="alert"], .error-message'));
    const hasErrorAssociation = errorElements.every(error => {
      const errorId = error.id;
      return errorId && form.querySelector(`[aria-describedby*="${errorId}"]`);
    });

    if (!hasErrorAssociation && errorElements.length > 0) {
      issues.push('Error messages are not properly associated with form controls');
    }

    // Check required field indication
    const requiredFields = Array.from(form.querySelectorAll('[required], [aria-required="true"]'));
    const hasRequiredIndication = requiredFields.every(field => {
      const label = field.getAttribute('aria-label') || 
                   document.querySelector(`label[for="${field.id}"]`)?.textContent;
      return label?.includes('*') || 
             label?.includes('required') || 
             field.getAttribute('aria-describedby')?.includes('required');
    });

    if (!hasRequiredIndication && requiredFields.length > 0) {
      issues.push('Required fields are not clearly indicated to screen readers');
    }

    return { hasLabels, hasErrorAssociation, hasRequiredIndication, issues };
  }
};

/**
 * Utility functions
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * React Hook for accessibility testing
 */
export const useAccessibilityTesting = () => {
  return {
    testElement: AccessibilityTester.testComponent,
    formatViolations: AccessibilityTester.formatViolations,
    checkContrast: AccessibilityTester.checkColorContrast,
    testKeyboardNav: AccessibilityTester.testKeyboardNavigation,
    testForm: AccessibilityTester.testFormAccessibility,
  };
};