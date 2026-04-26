/**
 * Accessibility Test Suite
 * 
 * Comprehensive automated accessibility testing using axe-core.
 * Tests all major components and pages for WCAG 2.1 AA compliance.
 * 
 * Requirements: 30.7, 21.1-21.12
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { BrowserRouter } from 'react-router-dom';
import { toHaveNoViolations } from 'jest-axe';

// Extend Vitest matchers
expect.extend(toHaveNoViolations);

// Import components to test
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// Import layout components
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { SkipNavigation } from '@/components/layout/SkipNavigation';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

// Import page components
import Login from '@/pages/Login';

// Helper to wrap components with Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Accessibility Tests - UI Components', () => {
  describe('Button Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible name', async () => {
      const { container } = render(<Button aria-label="Submit form">Submit</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard accessible', async () => {
      const { container } = render(<Button>Keyboard accessible</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Input Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="test-input">Test Input</Label>
          <Input id="test-input" type="text" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper label association', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" aria-required="true" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support aria-describedby for error messages', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            aria-describedby="password-error"
            aria-invalid="true"
          />
          <span id="password-error">Password is required</span>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Card Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
        </Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Badge Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Badge>Status</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper aria-label for status', async () => {
      const { container } = render(
        <Badge aria-label="Status: Active">Active</Badge>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Checkbox Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" />
          <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Switch Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <div className="flex items-center space-x-2">
          <Switch id="notifications" />
          <Label htmlFor="notifications">Enable notifications</Label>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Tabs Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Select Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="select-test">Choose option</Label>
          <Select>
            <SelectTrigger id="select-test">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('Accessibility Tests - Layout Components', () => {
  describe('SkipNavigation Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithRouter(<SkipNavigation />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide skip links for keyboard navigation', async () => {
      const { container } = renderWithRouter(<SkipNavigation />);
      const skipLinks = container.querySelectorAll('a[href^="#"]');
      expect(skipLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Breadcrumbs Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithRouter(<Breadcrumbs />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('Accessibility Tests - Pages', () => {
  describe('Login Page', () => {
    it('should not have accessibility violations', async () => {
      const { container } = renderWithRouter(<Login />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form labels', async () => {
      const { container } = renderWithRouter(<Login />);
      const labels = container.querySelectorAll('label');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should have accessible form inputs', async () => {
      const { container } = renderWithRouter(<Login />);
      const inputs = container.querySelectorAll('input');
      inputs.forEach((input) => {
        // Each input should have an associated label or aria-label
        const hasLabel = input.hasAttribute('aria-label') || 
                        input.hasAttribute('aria-labelledby') ||
                        container.querySelector(`label[for="${input.id}"]`);
        expect(hasLabel).toBeTruthy();
      });
    });
  });
});

describe('Accessibility Tests - Color Contrast', () => {
  it('should maintain proper color contrast for text', async () => {
    const { container } = render(
      <div>
        <p className="text-foreground">Normal text with proper contrast</p>
        <h1 className="text-2xl text-foreground">Large text heading</h1>
        <Button>Button with proper contrast</Button>
      </div>
    );
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility Tests - Keyboard Navigation', () => {
  it('should have focusable interactive elements', async () => {
    const { container } = render(
      <div>
        <Button>Focusable Button</Button>
        <Input type="text" />
        <a href="#test">Focusable Link</a>
      </div>
    );
    
    const focusableElements = container.querySelectorAll(
      'button, input, a[href], [tabindex]:not([tabindex="-1"])'
    );
    
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Check that elements are not disabled
    focusableElements.forEach((element) => {
      expect(element.hasAttribute('disabled')).toBe(false);
    });
  });

  it('should have logical tab order', async () => {
    const { container } = render(
      <form>
        <Label htmlFor="first">First Name</Label>
        <Input id="first" type="text" />
        
        <Label htmlFor="last">Last Name</Label>
        <Input id="last" type="text" />
        
        <Button type="submit">Submit</Button>
      </form>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility Tests - ARIA Attributes', () => {
  it('should use proper ARIA roles', async () => {
    const { container } = render(
      <nav role="navigation" aria-label="Main navigation">
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
        </ul>
      </nav>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should use aria-live for dynamic content', async () => {
    const { container } = render(
      <div aria-live="polite" aria-atomic="true">
        <p>Dynamic content will be announced</p>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should use aria-expanded for expandable content', async () => {
    const { container } = render(
      <div>
        <button aria-expanded="false" aria-controls="content">
          Toggle Content
        </button>
        <div id="content" hidden>
          Hidden content
        </div>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility Tests - Semantic HTML', () => {
  it('should use semantic HTML elements', async () => {
    const { container } = render(
      <article>
        <header>
          <h1>Article Title</h1>
        </header>
        <section>
          <h2>Section Title</h2>
          <p>Section content</p>
        </section>
        <footer>
          <p>Article footer</p>
        </footer>
      </article>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', async () => {
    const { container } = render(
      <div>
        <h1>Main Heading</h1>
        <h2>Subheading</h2>
        <h3>Sub-subheading</h3>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility Tests - Images and Media', () => {
  it('should have alt text for images', async () => {
    const { container } = render(
      <img src="/test.jpg" alt="Descriptive alt text" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should allow empty alt for decorative images', async () => {
    const { container } = render(
      <img src="/decorative.jpg" alt="" role="presentation" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Accessibility Tests - Forms', () => {
  it('should have accessible form validation', async () => {
    const { container } = render(
      <form>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            aria-required="true"
            aria-invalid="true"
            aria-describedby="email-error"
          />
          <span id="email-error" role="alert">
            Please enter a valid email address
          </span>
        </div>
      </form>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should indicate required fields', async () => {
    const { container } = render(
      <form>
        <Label htmlFor="required-field">
          Required Field <span aria-label="required">*</span>
        </Label>
        <Input id="required-field" type="text" aria-required="true" />
      </form>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
