# TODO Application Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from Todoist and Notion's task management interfaces, emphasizing clean organization, priority-based visual hierarchy, and modern material design principles.

## Core Design Elements

### Typography
- **Primary Font**: Inter (fallback: system-ui, sans-serif)
- **Hierarchy**:
  - Page Headings: 2xl/3xl, semibold (font-semibold)
  - Section Titles: xl, semibold
  - Task Titles: base/lg, medium (font-medium)
  - Task Descriptions: sm, regular
  - Metadata (dates, labels): xs/sm, regular, muted text

### Color System
- **Primary**: #2563EB (blue) - primary actions, links, active states
- **Secondary**: #10B981 (green) - success states, completion indicators
- **Priority Colors**:
  - High: #EF4444 (red)
  - Medium: #F59E0B (amber)
  - Low: #6B7280 (grey)
- **Backgrounds**:
  - Page: #F9FAFB (light grey)
  - Cards: #FFFFFF (white)
- **Text**: #111827 (dark) - primary text
- **Borders**: Use light grey variations for subtle separation

### Layout System
- **Spacing Units**: Tailwind spacing - primarily use units of 2, 4, 6, and 8 (e.g., p-4, m-6, gap-8)
- **Base Spacing**: 16px standard (p-4/m-4)
- **Border Radius**: 8px standard (rounded-lg)
- **Container**: max-w-7xl centered with px-4/px-6 side padding
- **Grid System**: Responsive grid with 1 column mobile, 2-3 columns tablet/desktop for task cards

### Component Library

#### Navigation
- Top navigation bar with app branding, user profile, and logout
- Clean, minimal header with subtle shadow/border

#### Task Cards
- White background cards with 8px border radius
- Left border (4px width) colored by priority level
- Checkbox for completion status (styled with secondary green when complete)
- Task title (bold when incomplete, strikethrough when complete)
- Task description in muted text
- Due date with calendar icon
- Priority badge (pill-shaped, filled with priority color)
- Edit/delete action buttons (subtle, appear on hover)
- Card shadow on hover for depth

#### Task Input Form
- Clean modal or inline form with white background
- Input fields: title (required), description (textarea), due date (date picker), priority (dropdown/radio)
- Primary blue submit button
- Cancel action in muted text/secondary button

#### Filter & Sort Controls
- Horizontal button group for status filters (All, Active, Completed)
- Dropdown for sort options (Priority, Due Date, Created Date)
- Active filter highlighted with primary blue background
- Positioned above task list

#### Empty States
- Centered message with icon when no tasks exist
- Friendly, encouraging copy

### Visual Feedback
- **Task Completion**: Smooth transition with strikethrough text and opacity reduction
- **Priority Indicators**: Colored left border on cards + colored badge
- **Interactive States**:
  - Hover: subtle shadow increase on cards
  - Active filters: solid background with white text
  - Buttons: standard material design elevation changes

### Layout Structure
1. **Header**: Navigation with branding and user controls
2. **Main Content Area**:
   - Filter/sort controls bar
   - Task input section (+ Add Task button or inline form)
   - Task list in card grid (responsive columns)
3. **Footer**: Minimal or none (utility-focused app)

### Responsive Behavior
- **Mobile**: Single column stack, full-width cards, collapsed filters
- **Tablet**: 2-column grid for tasks
- **Desktop**: 2-3 column grid with more spacious layout

## Images
No hero images required. This is a utility-focused application where functionality takes precedence over decorative imagery. Use icons throughout (checkboxes, calendar, priority indicators, empty state illustrations).