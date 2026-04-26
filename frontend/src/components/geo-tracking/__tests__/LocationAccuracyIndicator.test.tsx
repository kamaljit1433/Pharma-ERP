/**
 * Tests for LocationAccuracyIndicator Component
 * Tests accuracy level display and visual feedback
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocationAccuracyIndicator } from '../LocationAccuracyIndicator';

describe('LocationAccuracyIndicator Component', () => {
  describe('Accuracy Levels', () => {
    it('should display Excellent level for accuracy < 10m', () => {
      render(<LocationAccuracyIndicator accuracy={5} showDescription={false} />);

      expect(screen.getByText('Excellent')).toBeInTheDocument();
      expect(screen.getByText('±5.0m')).toBeInTheDocument();
    });

    it('should display Good level for accuracy 10-50m', () => {
      render(<LocationAccuracyIndicator accuracy={25} showDescription={false} />);

      expect(screen.getByText('Good')).toBeInTheDocument();
      expect(screen.getByText('±25.0m')).toBeInTheDocument();
    });

    it('should display Fair level for accuracy 50-100m', () => {
      render(<LocationAccuracyIndicator accuracy={75} showDescription={false} />);

      expect(screen.getByText('Fair')).toBeInTheDocument();
      expect(screen.getByText('±75.0m')).toBeInTheDocument();
    });

    it('should display Poor level for accuracy > 100m', () => {
      render(<LocationAccuracyIndicator accuracy={150} showDescription={false} />);

      expect(screen.getByText('Poor')).toBeInTheDocument();
      expect(screen.getByText('±150.0m')).toBeInTheDocument();
    });
  });

  describe('Display Options', () => {
    it('should show description when showDescription is true', () => {
      render(
        <LocationAccuracyIndicator
          accuracy={5}
          showDescription={true}
        />
      );

      expect(
        screen.getByText('Very precise location - ideal for attendance marking')
      ).toBeInTheDocument();
    });

    it('should hide description when showDescription is false', () => {
      render(
        <LocationAccuracyIndicator
          accuracy={5}
          showDescription={false}
        />
      );

      expect(
        screen.queryByText('Very precise location - ideal for attendance marking')
      ).not.toBeInTheDocument();
    });

    it('should show meters when showMeters is true', () => {
      render(
        <LocationAccuracyIndicator
          accuracy={5}
          showMeters={true}
          showDescription={false}
        />
      );

      expect(screen.getByText('±5.0m')).toBeInTheDocument();
    });

    it('should hide meters when showMeters is false', () => {
      render(
        <LocationAccuracyIndicator
          accuracy={5}
          showMeters={false}
          showDescription={false}
        />
      );

      expect(screen.queryByText('±5.0m')).not.toBeInTheDocument();
    });
  });

  describe('Accuracy Bar', () => {
    it('should display accuracy range bar', () => {
      const { container } = render(
        <LocationAccuracyIndicator accuracy={25} showDescription={false} />
      );

      const accuracyBar = container.querySelector('.h-2');
      expect(accuracyBar).toBeInTheDocument();
    });

    it('should display correct accuracy range text', () => {
      render(
        <LocationAccuracyIndicator accuracy={25} showDescription={false} />
      );

      expect(screen.getByText('25.0m / 50m')).toBeInTheDocument();
    });
  });

  describe('Descriptions', () => {
    it('should show excellent description for excellent accuracy', () => {
      render(
        <LocationAccuracyIndicator
          accuracy={5}
          showDescription={true}
        />
      );

      expect(
        screen.getByText('Very precise location - ideal for attendance marking')
      ).toBeInTheDocument();
    });

    it('should show good description for good accuracy', () => {
      render(
        <LocationAccuracyIndicator
          accuracy={25}
          showDescription={true}
        />
      );

      expect(
        screen.getByText('Accurate location - suitable for attendance marking')
      ).toBeInTheDocument();
    });

    it('should show fair description for fair accuracy', () => {
      render(
        <LocationAccuracyIndicator
          accuracy={75}
          showDescription={true}
        />
      );

      expect(
        screen.getByText(
          'Moderate accuracy - consider moving to an open area for better precision'
        )
      ).toBeInTheDocument();
    });

    it('should show poor description for poor accuracy', () => {
      render(
        <LocationAccuracyIndicator
          accuracy={150}
          showDescription={true}
        />
      );

      expect(
        screen.getByText('Low accuracy - move to an open area with clear sky view')
      ).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <LocationAccuracyIndicator
          accuracy={5}
          className="custom-class"
          showDescription={false}
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Precision', () => {
    it('should display accuracy with one decimal place', () => {
      render(
        <LocationAccuracyIndicator accuracy={5.678} showDescription={false} />
      );

      expect(screen.getByText('±5.7m')).toBeInTheDocument();
    });

    it('should handle very small accuracy values', () => {
      render(
        <LocationAccuracyIndicator accuracy={0.5} showDescription={false} />
      );

      expect(screen.getByText('±0.5m')).toBeInTheDocument();
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    it('should handle very large accuracy values', () => {
      render(
        <LocationAccuracyIndicator accuracy={1000} showDescription={false} />
      );

      expect(screen.getByText('±1000.0m')).toBeInTheDocument();
      expect(screen.getByText('Poor')).toBeInTheDocument();
    });
  });
});
