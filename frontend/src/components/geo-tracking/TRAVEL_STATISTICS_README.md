# TravelStatistics Component

## Overview

The `TravelStatistics` component displays comprehensive travel statistics including distance traveled, journey statistics, speed metrics, and anomaly detection. It provides a responsive, accessible interface for visualizing travel data with support for multiple journey statuses and travel allowance calculations.

## Features

- **Distance Statistics**: Total, average, minimum, and maximum distances
- **Speed Metrics**: Average speed calculation and display
- **Journey Status Summary**: Breakdown of journey statuses with percentages
- **Travel Allowance Summary**: Total and average allowance calculations
- **Anomaly Detection**: Identifies and displays journeys with unusual speed patterns
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels
- **Loading States**: Displays loading indicator while data is being fetched
- **Empty States**: Customizable empty state messages

## Props

### `TravelStatisticsProps`

```typescript
interface TravelStatisticsProps {
  journeys: Journey[];           // Array of journey data
  loading?: boolean;             // Loading state (default: false)
  emptyMessage?: string;         // Custom empty state message
}
```

### `Journey` Interface

```typescript
interface Journey {
  id: string;                    // Unique journey identifier
  startLocation: GeoPoint;       // Starting location
  endLocation: GeoPoint;         // Ending location
  waypoints: GeoPoint[];         // Array of waypoints along the journey
  totalDistance: number;         // Total distance in kilometers
  totalDuration: number;         // Total duration in milliseconds
  startTime: Date;               // Journey start time
  endTime: Date;                 // Journey end time
  purpose?: string;              // Purpose of the journey
  travelAllowance: number;       // Travel allowance amount
  status: 'In Progress' | 'Completed' | 'Cancelled' | 'Pending' | 'Approved' | 'Rejected';
}
```

### `GeoPoint` Interface

```typescript
interface GeoPoint {
  latitude: number;              // Latitude in degrees
  longitude: number;             // Longitude in degrees
}
```

## Usage Examples

### Basic Usage

```typescript
import { TravelStatistics } from '@/components/geo-tracking';

export function MyComponent() {
  const journeys = [
    {
      id: '1',
      startLocation: { latitude: 40.7128, longitude: -74.006 },
      endLocation: { latitude: 40.7580, longitude: -73.9855 },
      waypoints: [
        { latitude: 40.7128, longitude: -74.006 },
        { latitude: 40.7580, longitude: -73.9855 }
      ],
      totalDistance: 5.2,
      totalDuration: 1200000, // 20 minutes
      startTime: new Date('2024-01-15T09:00:00'),
      endTime: new Date('2024-01-15T09:20:00'),
      purpose: 'Client meeting',
      travelAllowance: 26,
      status: 'Completed'
    }
  ];

  return <TravelStatistics journeys={journeys} />;
}
```

### With Loading State

```typescript
import { TravelStatistics } from '@/components/geo-tracking';
import { useGeoTrackingStore } from '@/store/geoTrackingStore';

export function TravelStatsPage() {
  const { travelLogs, loadingTravelLogs } = useGeoTrackingStore();

  return (
    <TravelStatistics
      journeys={travelLogs}
      loading={loadingTravelLogs}
    />
  );
}
```

### With Custom Empty Message

```typescript
<TravelStatistics
  journeys={journeys}
  emptyMessage="No journeys recorded for this period. Start tracking your travels!"
/>
```

### Integration with Date Range Filter

```typescript
import { TravelStatistics } from '@/components/geo-tracking';
import { useGeoTrackingStore } from '@/store/geoTrackingStore';
import { useState } from 'react';

export function TravelStatsWithFilter() {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const { travelLogs, loadingTravelLogs, fetchJourneysByDateRange } = useGeoTrackingStore();
  const employeeId = 'emp-123';

  const handleDateChange = async () => {
    await fetchJourneysByDateRange(
      employeeId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="date"
          value={startDate.toISOString().split('T')[0]}
          onChange={(e) => setStartDate(new Date(e.target.value))}
        />
        <input
          type="date"
          value={endDate.toISOString().split('T')[0]}
          onChange={(e) => setEndDate(new Date(e.target.value))}
        />
        <button onClick={handleDateChange}>Filter</button>
      </div>
      <TravelStatistics
        journeys={travelLogs}
        loading={loadingTravelLogs}
      />
    </div>
  );
}
```

## Component Sections

### 1. Distance Statistics Cards

Displays four key metrics in a responsive grid:

- **Total Distance**: Sum of all journey distances with journey count
- **Average Distance**: Average distance per journey
- **Average Speed**: Overall average speed across all journeys
- **Total Duration**: Total travel time in hours

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Total Distance  │ Average Distance│ Average Speed   │ Total Duration  │
│ 13.50 km        │ 4.50 km         │ 15.3 km/h       │ 0.9h            │
│ 3 journeys      │ per journey     │ overall average │ travel time     │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### 2. Distance Range Card

Shows minimum and maximum distances between consecutive waypoints:

```
┌──────────────────────────────────────┐
│ Distance Range                       │
├──────────────────────────────────────┤
│ Minimum Distance: 3.80 km            │
│ Maximum Distance: 5.20 km            │
└──────────────────────────────────────┘
```

### 3. Journey Status Summary

Displays breakdown of journey statuses with percentages:

```
┌──────────────────────────────────────┐
│ Journey Status Summary                │
├──────────────────────────────────────┤
│ Completed: 1 (33%)                   │
│ Approved:  1 (33%)                   │
│ Pending:   1 (33%)                   │
└──────────────────────────────────────┘
```

### 4. Travel Allowance Summary

Shows total and average travel allowance:

```
┌──────────────────────────────────────┐
│ Travel Allowance Summary              │
├──────────────────────────────────────┤
│ Total Allowance: ₹67.50              │
│ Average: ₹22.50 per journey          │
└──────────────────────────────────────┘
```

### 5. Anomalies Section (Conditional)

Displays when journeys with unusual speeds are detected:

```
┌──────────────────────────────────────┐
│ ⚠️ Anomalies Detected                 │
│ 1 journey(ies) with unusual patterns  │
├──────────────────────────────────────┤
│ Journey 1                             │
│ 500.00 km at 30000.0 km/h [High Speed]
└──────────────────────────────────────┘
```

## Calculated Metrics

### Total Distance
Sum of all journey distances:
```
Total Distance = Σ(journey.totalDistance)
```

### Average Distance
Average distance per journey:
```
Average Distance = Total Distance / Journey Count
```

### Average Speed
Overall average speed across all journeys:
```
Average Speed = Total Distance / Total Duration (in hours)
```

### Journey Status Percentages
Percentage of journeys in each status:
```
Status Percentage = (Count of Status / Total Journeys) × 100
```

### Total Allowance
Sum of all journey allowances:
```
Total Allowance = Σ(journey.travelAllowance)
```

### Average Allowance
Average allowance per journey:
```
Average Allowance = Total Allowance / Journey Count
```

### Anomaly Detection
Journeys with speeds exceeding 120 km/h are flagged as anomalies:
```
Speed = Distance / Duration (in hours)
Anomaly if Speed > 120 km/h
```

## Styling and Theming

The component uses Tailwind CSS with shadcn/ui components and supports light/dark mode:

- **Cards**: `rounded-lg border bg-card text-card-foreground shadow-sm`
- **Headings**: `text-2xl font-semibold leading-none tracking-tight`
- **Badges**: Color-coded by status (default, secondary, outline, destructive)
- **Anomaly Section**: Yellow background with warning styling

### Dark Mode Support

The component automatically adapts to dark mode:
- Anomaly section: `dark:bg-yellow-950 dark:border-yellow-800`
- Text colors: `dark:text-yellow-100`

## Accessibility Features

- **Semantic HTML**: Uses proper heading hierarchy
- **ARIA Labels**: Icons have descriptive labels
- **Color Contrast**: Meets WCAG AA standards
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Descriptive text for all metrics
- **Responsive**: Works on all screen sizes

## Performance Considerations

- **Memoization**: Statistics are calculated using `useMemo` to prevent unnecessary recalculations
- **Efficient Rendering**: Only re-renders when journey data changes
- **Lazy Loading**: Component can be lazy-loaded with React.lazy()

## Testing

The component includes comprehensive tests covering:

- Rendering of all sections
- Distance statistics calculations
- Speed metrics
- Journey status summaries
- Travel allowance calculations
- Anomaly detection and display
- Edge cases (zero distance, zero duration, large values)
- Accessibility features

Run tests with:
```bash
npm test -- TravelStatistics.test.tsx --run
```

## Integration with Other Components

### With TravelAllowanceSummary

The `TravelStatistics` component complements `TravelAllowanceSummary`:

- **TravelAllowanceSummary**: Shows monthly allowance breakdown with journey table
- **TravelStatistics**: Shows comprehensive statistics and anomalies

```typescript
<div className="space-y-6">
  <TravelAllowanceSummary employeeId={employeeId} />
  <TravelStatistics journeys={journeys} />
</div>
```

### With TravelHistoryMap

Combine with map visualization:

```typescript
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <TravelHistoryMap journeys={journeys} />
  <TravelStatistics journeys={journeys} />
</div>
```

## Error Handling

The component handles various error scenarios gracefully:

- **Empty journeys array**: Displays empty state message
- **Missing data**: Gracefully handles undefined or null values
- **Zero values**: Displays "0.00 km" or "0.0 km/h" appropriately
- **Large values**: Formats correctly without overflow

## Best Practices

1. **Provide meaningful journey data**: Ensure all required fields are populated
2. **Handle loading states**: Show loading indicator while fetching data
3. **Use custom empty messages**: Provide context-specific messages
4. **Monitor anomalies**: Review flagged journeys for data quality
5. **Combine with filters**: Allow users to filter by date range or status
6. **Export data**: Integrate with export functionality for reporting

## Troubleshooting

### Statistics not updating
- Ensure journey data is being passed correctly
- Check that `useMemo` dependencies are correct
- Verify journey objects have all required fields

### Anomalies not displaying
- Check that journey speeds exceed 120 km/h threshold
- Verify `totalDuration` is in milliseconds
- Ensure waypoints are valid geographic coordinates

### Styling issues
- Verify Tailwind CSS is properly configured
- Check that shadcn/ui components are installed
- Ensure dark mode is enabled if needed

## Future Enhancements

- Export statistics to PDF/CSV
- Comparison with previous periods
- Custom anomaly thresholds
- Journey filtering by status
- Interactive charts for trends
- Real-time updates via WebSocket

## Related Components

- `TravelAllowanceSummary`: Monthly allowance breakdown
- `TravelHistoryMap`: Map visualization of journeys
- `TravelLogViewer`: Detailed journey logs
- `TravelApproval`: Journey approval workflow
- `GeolocationCapture`: Real-time location capture
