# Mobile Responsiveness Plan — Pharma ERP

## Context

The project is a React + TypeScript PWA using **Tailwind CSS** with **Radix UI** components across **19 pages** and **22 feature domains** (~439 files). The `MainLayout` already has a basic mobile sidebar overlay, but the inner page content — tables, forms, modals, charts, and grids — is largely desktop-only.

---

## Phase 1 — Foundation & Global Fixes *(~1–2 days)*

These changes affect every page and must be done first.

| Task | File(s) | What to fix |
|---|---|---|
| Verify viewport meta tag | `frontend/index.html` | Ensure `<meta name="viewport" content="width=device-width, initial-scale=1">` exists |
| Refine MainLayout padding/scrolling | `components/layout/MainLayout.tsx` | Add `overflow-x-hidden` on root; ensure content area scrolls independently |
| Sidebar mobile polish | `components/layout/Sidebar.tsx` | Ensure overlay closes on route change; swipe-to-close gesture support |
| Header mobile layout | `components/layout/Header.tsx` | Collapse notification bell + user menu into a single icon group on small screens |
| Touch target sizing | Global (Tailwind config / `index.css`) | Enforce minimum `44×44px` touch targets on buttons, nav items, and icons |
| Typography scale | `index.css` / `tailwind.config.js` | Slightly reduce heading sizes on `sm` screens to prevent overflow |

---

## Phase 2 — Core UI Component Library *(~2–3 days)*

The 29 Radix-based UI components in `components/ui/` are shared across every feature. Fixing them once fixes every consumer.

| Component | Problem | Fix |
|---|---|---|
| **Table** | Overflows viewport horizontally | Add `overflow-x-auto` wrapper; add card-list view variant for `sm` screens |
| **Dialog / Modal** | Clips off screen on mobile | Add `sm:max-w-full sm:h-full sm:rounded-none` for full-screen sheet on mobile |
| **Tabs** | Tab bar overflows on many tabs | Make tab list horizontally scrollable with `overflow-x-auto` |
| **Select / Combobox** | Dropdown mispositioned on mobile | Ensure portal renders with proper z-index and viewport-aware positioning |
| **DatePicker / DateTimePicker** | Calendar too wide for phone | Constrain calendar to `max-w-[320px]`; ensure it doesn't overflow parent |
| **Card** | Fixed widths in some variants | Remove fixed `w-` values, use `w-full` with max constraints |
| **SearchableSelect** | Full-width on desktop only | Add `w-full` to all instances |
| **Tooltip** | Hover-only, invisible on touch | Add long-press fallback or convert informational tooltips to visible helper text |

---

## Phase 3 — Dashboard Page *(~1 day)*

`pages/Dashboard.tsx` and its 12 sub-components.

- **KPI stat cards grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- **Chart components** (Recharts): Wrap in `ResponsiveContainer` with `width="100%"`; reduce legend font size on `sm`
- **Quick-action buttons**: Stack vertically on mobile
- **Activity feed / tables**: Switch to card list view on `sm`
- **Announcement banners**: Full width, reduced padding

---

## Phase 4 — Employee Management *(~1–2 days)*

Pages: `Employees.tsx`, `EmployeeDetail.tsx`, `EmployeeCreate.tsx`

- **Employee list table** → Card list on mobile (avatar, name, department, status badge, action button)
- **Filter/search bar** → Stack filters vertically; collapse advanced filters into an expandable drawer
- **EmployeeCreate multi-column form** → All `grid-cols-2` / `grid-cols-3` sections → `grid-cols-1` on mobile
- **EmployeeDetail tabs** → Scrollable tab list; each tab's content forms collapse to single column
- **Document upload sections** → Full-width drop zones

---

## Phase 5 — Attendance & Leave *(~1–2 days)*

Pages: `Attendance.tsx`, `Leave.tsx` and their ~21 combined sub-components.

- **Attendance table** → Card view on mobile (employee, date, clock-in/out, status)
- **Calendar view** → Reduce cell size on `sm`; consider a list-day view toggle
- **Geo-tracking map panel** → Full-width, collapsible on mobile
- **Face detection UI** → Ensure camera feed container is `w-full`, centered
- **Leave request form** → Single-column layout; date pickers full-width
- **Leave balance cards** → `grid-cols-2` on mobile, `grid-cols-4` on desktop

---

## Phase 6 — Payroll *(~1 day)*

Pages: `Payroll.tsx`, `SalaryStructureEdit.tsx`

- **Payslip table** → Card view on mobile; key columns: name, period, net pay, status
- **Payroll summary stats** → `grid-cols-1 sm:grid-cols-2`
- **SalaryStructureEdit form** → Full single-column layout on mobile
- **Earnings/deductions component grid** → Stack on mobile

---

## Phase 7 — Recruitment *(~1 day)*

Pages: `Recruitment.tsx`, `JobPostingCreate.tsx` and 15 sub-components.

- **Job posting cards** → Already card-based; ensure `w-full` on mobile
- **Kanban pipeline board** → Horizontal scroll with snap points on mobile; or collapse to accordion list
- **Candidate table** → Card view on mobile
- **JobPostingCreate form** → Single column, full-width rich text editor

---

## Phase 8 — Performance, Training, Benefits, Separation *(~2 days)*

Pages: `Performance.tsx`, `Training.tsx`, `Benefits.tsx`, `Separation.tsx`

- All data tables → card list view on mobile
- All multi-column forms → single column on mobile
- Review cycle progress bars → full-width on mobile
- Training calendar → list view fallback on `sm`
- Benefits enrollment forms → single column; grouped sections

---

## Phase 9 — Assets, Organization & Settings *(~1 day)*

Pages: `Assets.tsx`, `Organization.tsx`, `Settings.tsx`, `Profile.tsx`

- **Asset table** → Card view on mobile
- **Org hierarchy (XY Flow diagram)** → Pinch-to-zoom enabled; minimap hidden on mobile; fit-to-screen default
- **Settings page tabs** → Scrollable tab list; sections single-column
- **Profile page** → Avatar + form single-column

---

## Phase 10 — PWA Mobile UX Polish *(~1 day)*

Since this is already a PWA:

- **Bottom navigation bar** — Add a sticky bottom nav (Home, Employees, Attendance, Leave, Profile) for mobile replacing the sidebar for the 5 most-used routes
- **Scroll restoration** — Ensure page scroll resets on route change
- **Pull-to-refresh** — On list pages (Attendance, Leave)
- **Safe area insets** — Add `pb-safe` / `env(safe-area-inset-*)` padding for notched phones
- **Install banner** — Ensure the PWA install prompt is mobile-friendly

---

## Execution Order Summary

```
Phase 1  → Foundation (viewport, layout, touch targets)
Phase 2  → UI component library (Table, Dialog, Tabs, etc.)
Phase 3  → Dashboard
Phase 4  → Employees
Phase 5  → Attendance & Leave
Phase 6  → Payroll
Phase 7  → Recruitment
Phase 8  → Performance / Training / Benefits / Separation
Phase 9  → Assets / Org / Settings / Profile
Phase 10 → PWA polish
```

---

## Key Patterns Applied Throughout

1. **Tables → Cards on mobile**: Every data table gets an alternate card-list rendering below `md` breakpoint
2. **Multi-column forms → single column**: All `grid-cols-N` form layouts get `grid-cols-1` at `sm`
3. **Modals → full-screen sheets on mobile**: Dialogs use `sm:inset-0 sm:rounded-none`
4. **Overflow-x-auto on table wrappers**: As a safe fallback where card view isn't added
5. **Responsive grid pattern**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

---

**Total estimated effort: ~10–14 working days** for one developer working systematically phase by phase.
