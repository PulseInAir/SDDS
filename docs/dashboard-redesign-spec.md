# Dashboard Redesign Specification

This document serves as the visual and operational specification for the SDDS dashboard redesign. 
**Note:** \SDDS_SOURCE.md\ is authoritative. The design reference image (\public/design-reference/sdds-dashboard-target.webp\) serves as the visual source only and must not override product or operational rules.

## Core Principles
- Treat the reference image as the visual source only; it must not override product or operational rules.
- Require every dashboard section to have a stated operational purpose.
- Require every displayed metric to have a defined real-data source.
- Do not allow fake fallback rows, invented trends, placeholder percentages, or fabricated totals.
- Require loading, empty, error, and zero-value states for all data-driven components.
- Interactive elements require a real action or route.

## Canvas Rules
- The application sits within a stylized outer canvas background frame.
- The background behind the app frame features a soft, colorful gradient (purple/blue blur).

## Outer App Frame
- The main application container has a thick outer padding area (light purple/blue tint).
- The inner content wrapper is solid white/off-white.
- The app container has extremely rounded corners (approx. \32px\ to \40px\ border radius).
- Features a distinct soft drop shadow elevating the frame from the canvas background.

## Sidebar
- Solid deep royal blue background.
- Features the logo area at the top.
- Navigation links stack vertically with left-aligned icons.
- Bottom section contains a prominent "Sign Out" button with an exit icon.
- Text color is white/light gray for all inactive items.

## Active Sidebar Cut-Out
- The active navigation item (e.g., "Dashboard") has a white background that merges seamlessly with the main content area on the right.
- The active item's background has rounded corners on the left side (top-left and bottom-left) but is completely flat on the right edge.
- Above and below the right edge of the active item, the sidebar background has inverse rounded corners to create a fluid, organic cut-out shape.
- The text and icon for the active item are deep blue.

## Header
- **Left**: Page Title ("Dashboard") and subtitle.
- **Controls**: Search bar with a magnifying glass icon, Assessment Year dropdown, Privacy Mode toggle, and a solid blue pill-shaped "+ Add Client" button.
- Do not include the environment status pill, user avatar, or SSL status pill.

## Operational Overview Area
- Replaces the decorative chart with a functional, data-driven area spanning the top-left content area.
- Deep blue gradient background.
- **Content**: 
  - Real dashboard metrics.
  - Next-30-day filings, invoice dues, and follow-ups where existing data supports them.
  - Working navigation to corresponding filtered records.
- **Restrictions**:
  - No SVG trend chart.
  - No Monthly selector.
  - No Jan–Oct labels.
  - No April highlight.
  - No decorative tooltip.
  - No invented historical values.
- Bottom section of the area displays key metrics separated by subtle vertical dividers, which must link to real filtered records.

## Functional Stacked Stat Cards
- Positioned to the right of the Overview area.
- **Top Card**: "Refunds Pending" - vibrant solid blue background. Includes a circular icon wrapper.
- **Bottom Card**: "Outstanding Amount" - vibrant pink/coral gradient background. Includes a circular icon wrapper.
- **Rules**:
  - Values must come from existing real data.
  - The complete card or its visible action must navigate to the corresponding records.
  - No hardcoded zero values.
  - No non-functional arrow buttons.

## Lower Summary Cards
- Three equal-width cards below the Overview area.
- Deep blue gradient backgrounds.
- Distinctive overlapping icons at the top center of each card, housed in fully rounded shapes that break the top border of the card.
- **Cards**:
  1. "Filed This AY"
  2. "Intimations Pending"
  3. "Revenue / Collections"
- **Rules**:
  - Remove mandatory progress bars and percentages.
  - Permit a progress indicator only when its numerator, denominator, and calculation are explicitly defined from existing data.

## Recent Activity Panel
- Located on the top-right side.
- Clean white/light-gray background.
- Header: "Recent Activity" with a working "View All" text link.
- **Rules**:
  - Must use real entries only.
  - Row actions and links must work and point to actual records.

## Queue Snapshot Panel
- Located below the Recent Activity Panel.
- Header: "Filing Work Queue (Snapshot)\" with a working "View All" text link.
- **Rules**:
  - Must use actual client names, actual statuses, and working record links.
  - Do not prescribe decorative icons as separate actions.

## Typography
- Modern, clean sans-serif font.
- Headers and key metrics are bold and prominently weighted.
- Subtitles, labels, and secondary text are muted and smaller.

## Colors
- **Primary Blue**: Deep royal blue used for the sidebar, overview area, and bottom cards.
- **Accent Blue**: Vibrant blue for primary buttons, active interactive areas, and icons.
- **Accent Coral/Pink**: Used for the "Outstanding Amount" card.
- **Background White**: Main content wrapper background.
- **Status Amber**: Soft orange for "Yet To File" badges.
- **Text**: Dark slate for primary text on light backgrounds; white for text on dark backgrounds.

## Radii
- **Outer Frame**: Extremely large radius (e.g., \32px\ - \40px\).
- **Main Cards/Panels**: Large radius (e.g., \24px\).
- **Buttons and Badges**: Fully rounded/pill shape.
- **Overlapping Icons (Bottom Cards)**: Rounded square or circle.

## Shadows
- **Outer Frame**: Large, diffuse drop shadow.
- **White Panels (Recent Activity, Queue)**: Soft, subtle drop shadows to lift them off the background.
- **Colored Cards**: Inner glows or soft, colored drop shadows to enhance depth.

## Spacing
- Generous internal padding within cards and panels (typically \24px\ or \32px\).
- Consistent gap spacing between grid items.
- Significant top margin below the header to separate it from the dashboard grid.

## Responsive Rules
- **Desktop (1672x941)**: Follow the exact multi-column grid layout proportions shown in the reference.
- **Tablet**: Stack the Stacked Stat Cards below the Overview or collapse the sidebar.
- **Mobile**: Single column layout. Sidebar collapses to a hamburger menu. All panels and cards stack vertically.

## Visual Acceptance Rules
- The UI must visually match the reference image in terms of typography, spacing, radii, shadows, and proportions.
- The active sidebar cut-out must be seamless with no visible borders or pixel gaps.
- Gradients must transition smoothly.
- Shadows must be soft and diffuse, avoiding harsh lines.

## Implementation Rules
- Build purely using CSS and markup utility classes.
- Use CSS Grid and Flexbox for all layout structures.
- Implement the sidebar cut-out using CSS masking, pseudo-elements (\::before\/\::after\), or specific border-radius tricks.
- Use CSS variables for the color palette to ensure consistency.

