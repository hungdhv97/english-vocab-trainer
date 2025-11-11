# Research: Session Statistics Page

**Feature**: Session Statistics Page  
**Date**: 2025-01-27  
**Branch**: `008-session-statistics-page`

## Research Questions

### 1. Which shadcn UI components should be used for the statistics page?

**Decision**: Use the following shadcn UI components:
- **Card**: For statistics overview, chart containers, and question items
- **Chart**: For visualizations (Recharts via shadcn chart component)
- **Skeleton**: For loading states (skeleton screens matching final layout)
- **Table**: For questions/answers list (structured data display)
- **Badge**: For correct/incorrect indicators and status badges
- **Button**: For navigation and actions
- **Breadcrumb**: For navigation back to statistics page from word detail
- **Separator**: For visual separation between sections

**Rationale**: 
- shadcn UI components provide accessible, well-designed, and maintainable React components
- All components are already available or can be added via `npx shadcn@latest add [component]`
- Components follow WCAG 2.1 AA accessibility standards
- Consistent design language with existing application
- No custom components needed when shadcn equivalents exist (per constitution)

**Alternatives considered**:
- Custom components: Rejected - violates constitution principle III (Latest shadcn UI Components)
- Other UI libraries: Rejected - not in approved technology stack
- Plain HTML/CSS: Rejected - lacks accessibility features and design consistency

### 2. How to implement charts using shadcn UI Chart component?

**Decision**: Use shadcn UI Chart component (wrapper around Recharts) for all three charts:
- **Accuracy Breakdown Chart**: Pie chart (Recharts `PieChart` component)
- **Time Analysis Chart**: Bar chart (Recharts `BarChart` component) showing time per question
- **Performance Over Time Chart**: Dual-axis chart (Recharts `LineChart` with dual Y-axis) showing running accuracy and correct/incorrect indicators

**Rationale**:
- Recharts is already installed and used via shadcn chart component
- Recharts supports all required chart types (pie, bar, line, dual-axis)
- shadcn chart component provides consistent styling and theme support
- Recharts is well-maintained, performant, and accessible
- No additional dependencies required

**Implementation Details**:
- Use `ChartContainer` from shadcn chart component for consistent styling
- Use `ChartTooltip` and `ChartTooltipContent` for interactive tooltips
- Use `ChartLegend` and `ChartLegendContent` for chart legends
- Configure chart colors using theme-aware CSS variables
- Ensure charts are responsive and mobile-friendly

**Alternatives considered**:
- Chart.js: Rejected - not in approved technology stack, would require new dependency
- D3.js: Rejected - too low-level, requires significant custom code
- Custom SVG charts: Rejected - violates constitution principle III, requires custom implementation

### 3. How to implement skeleton loading states?

**Decision**: Use shadcn UI Skeleton component to create skeleton screens that match the final layout structure:
- Skeleton placeholders for overview statistics cards (4 cards)
- Skeleton placeholders for chart containers (3 charts)
- Skeleton placeholders for questions list (multiple rows)

**Rationale**:
- shadcn UI Skeleton component provides accessible, animated loading placeholders
- Skeleton screens improve perceived performance and user experience
- Matches final layout structure to reduce layout shift when data loads
- No additional dependencies required (skeleton component already available)

**Implementation Details**:
- Use `Skeleton` component with appropriate width/height to match final content
- Create skeleton components for each section (overview, charts, questions list)
- Show skeleton screens while API data is being fetched
- Replace skeletons with actual content when data loads

**Alternatives considered**:
- Loading spinner: Rejected - doesn't provide layout preview, worse UX
- Progressive loading: Rejected - skeleton screens provide better perceived performance
- No loading state: Rejected - poor UX, users don't know if page is loading

### 4. How to structure the questions/answers list display?

**Decision**: Use shadcn UI Table component for structured display of questions and answers:
- Table columns: Question number, Word (clickable), Options, Selected answer, Correct answer, Status, Time spent
- Use Badge component for correct/incorrect status indicators
- Make word text clickable to navigate to word detail page
- Highlight selected answer and correct answer for easy comparison

**Rationale**:
- shadcn UI Table component provides accessible, structured data display
- Table format is familiar and easy to scan for users
- Badge component provides clear visual indicators for status
- Supports keyboard navigation and screen readers
- Mobile-responsive with horizontal scrolling if needed

**Implementation Details**:
- Use `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from shadcn UI
- Use `Badge` component with variant="success" for correct, variant="destructive" for incorrect
- Add click handlers to word text cells to navigate to word detail page
- Apply conditional styling to highlight selected vs correct answers
- Ensure table is scrollable on mobile devices

**Alternatives considered**:
- Card-based list: Rejected - less structured, harder to scan for tabular data
- Custom list component: Rejected - violates constitution principle III
- Plain div-based layout: Rejected - lacks accessibility features

### 5. How to implement the performance over time chart with dual metrics?

**Decision**: Use Recharts `LineChart` with dual Y-axis to display both running accuracy percentage and correct/incorrect indicators:
- Left Y-axis: Running accuracy percentage (0-100%)
- Right Y-axis: Correct/incorrect indicator (binary: 0 or 1)
- X-axis: Question number (1 to N)
- Two line series: One for running accuracy (line), one for correctness (scatter/line with markers)

**Rationale**:
- Recharts supports dual Y-axis charts natively
- Dual-axis allows displaying both metrics on the same chart for easy comparison
- Line chart is appropriate for trend data (running accuracy over time)
- Scatter/line with markers shows individual question correctness
- Provides comprehensive performance visualization

**Implementation Details**:
- Use `LineChart` with `YAxis` components (left and right)
- Use `Line` component for running accuracy trend
- Use `Line` or `Scatter` component with markers for correct/incorrect indicators
- Configure colors: Green for correct, red for incorrect, blue for accuracy trend
- Add tooltips to show exact values on hover

**Alternatives considered**:
- Two separate charts: Rejected - less efficient use of space, harder to compare
- Single metric only: Rejected - doesn't meet specification requirement
- Bar chart: Rejected - less suitable for trend visualization

### 6. How to structure the backend API endpoint for detailed session data?

**Decision**: Create new endpoint `GET /api/v1/vocab-quiz/session/:sessionId/details` with optional query parameters:
- Query parameters: `include=statistics,questions,answers` (comma-separated list)
- Default behavior: Return all data (statistics + questions + answers) if no query parameters
- Response includes: Session statistics, questions with word texts and options, answers with user selections and correctness, word information

**Rationale**:
- Single endpoint with optional parameters provides flexibility
- Allows future optimization (fetch only needed data)
- Maintains backward compatibility with existing statistics endpoint
- Follows RESTful API design patterns
- Reduces number of API calls from frontend

**Implementation Details**:
- Endpoint: `GET /api/v1/vocab-quiz/session/:sessionId/details?include=statistics,questions,answers`
- Query parameter parsing: Split by comma, validate against allowed values
- Database queries: Join vocab_game_sessions, vocab_game_session_questions, vocab_game_session_answers, translations, words tables
- Response structure: Nested JSON with statistics, questions array (each with answers array)
- Authorization: Verify session belongs to authenticated user

**Alternatives considered**:
- Multiple endpoints: Rejected - requires multiple API calls, worse performance
- Always return all data: Rejected - less flexible, potentially inefficient for large sessions
- GraphQL: Rejected - not in approved technology stack, adds complexity

### 7. How to implement word detail page?

**Decision**: Create new route `/word/:wordId` with WordDetailPage component:
- Display mandatory fields: Word text, translations (both languages), difficulty level
- Display optional fields if available: Examples, part of speech, phonetic information, related words
- Use shadcn UI Card component for structured display
- Use Breadcrumb component for navigation back to statistics page
- Handle cases where word details are unavailable gracefully

**Rationale**:
- Dedicated page provides focused view of word information
- Card component provides structured, accessible layout
- Breadcrumb provides clear navigation context
- Graceful handling of missing data ensures good UX
- Follows existing application patterns

**Implementation Details**:
- Route: `/word/:wordId` in App.tsx
- Component: `WordDetailPage.tsx` in `frontend/src/components/word/`
- API: Use existing word API endpoint or create new one if needed
- Layout: Card with sections for mandatory and optional fields
- Navigation: Breadcrumb with "Statistics" → "Word Detail" path
- Error handling: Display error message if word not found or mandatory fields missing

**Alternatives considered**:
- Modal/dialog: Rejected - specification requires separate page, not popup
- Inline expansion: Rejected - doesn't meet specification requirement for dedicated page
- No word detail page: Rejected - doesn't meet specification requirement

## Technology Decisions

### Frontend

- **Chart Library**: Recharts (via shadcn chart component)
- **UI Components**: shadcn UI (Card, Chart, Skeleton, Table, Badge, Button, Breadcrumb, Separator)
- **Routing**: React Router 7+ (existing)
- **State Management**: React hooks (useState, useEffect)
- **API Client**: Existing API functions in `lib/api.ts`

### Backend

- **API Framework**: Gin (existing)
- **Database**: PostgreSQL 15+ (existing)
- **Data Access**: pgx/v5 (existing)
- **Authorization**: JWT authentication (existing)

## Implementation Patterns

### Chart Implementation Pattern

```typescript
// Example: Accuracy breakdown pie chart
<ChartContainer config={chartConfig}>
  <PieChart>
    <Pie
      data={accuracyData}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
    />
    <ChartTooltip />
    <ChartLegend />
  </PieChart>
</ChartContainer>
```

### Skeleton Loading Pattern

```typescript
// Example: Statistics overview skeleton
{loading ? (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    ))}
  </div>
) : (
  <StatisticsOverview data={statistics} />
)}
```

### API Call Pattern

```typescript
// Example: Fetch session details
const fetchSessionDetails = async (sessionId: string) => {
  const response = await fetch(
    `/api/v1/vocab-quiz/session/${sessionId}/details?include=statistics,questions,answers`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.json();
};
```

## References

- [shadcn UI Documentation](https://ui.shadcn.com/)
- [Recharts Documentation](https://recharts.org/)
- [shadcn Chart Component](https://ui.shadcn.com/docs/components/chart)
- [React Router Documentation](https://reactrouter.com/)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?levels=aaa)

## Conclusion

All research questions have been resolved. The implementation will use shadcn UI components exclusively for frontend UI, Recharts (via shadcn chart component) for visualizations, and follow existing backend patterns for the new API endpoint. The design ensures accessibility, performance, and maintainability while adhering to constitution principles.

