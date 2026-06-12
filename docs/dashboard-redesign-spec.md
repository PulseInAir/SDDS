# Dashboard Redesign Specification

This document serves as the single visual source-of-truth for the SDDS dashboard redesign, based strictly on the provided design reference.

## Reference Image
- **File**: `public/design-reference/sdds-dashboard-target.webp`
- **Reference Size**: 1672x941

## Canvas Rules
- The application sits within a stylized outer canvas background frame.
- The background behind the app frame features a soft, colorful gradient (purple/blue blur).

## Outer App Frame
- The main application container has a thick outer padding area (light purple/blue tint).
- The inner content wrapper is solid white/off-white.
- The app container has extremely rounded corners (approx. `32px` to `40px` border radius).
- Features a distinct soft drop shadow elevating the frame from the canvas background.

## Sidebar
- Solid deep royal blue background.
- Features the logo area at the top ("SD SDDS Portal").
- Navigation links stack vertically with left-aligned icons.
- Bottom section contains the user profile (Avatar, Name, Email) and a prominent "Sign Out" button with an exit icon.
- Text color is white/light gray for all inactive items.

## Active Sidebar Cut-Out
- The active navigation item (e.g., "Dashboard") has a white background that merges seamlessly with the main content area on the right.
- The active item's background has rounded corners on the left side (top-left and bottom-left) but is completely flat on the right edge.
- Above and below the right edge of the active item, the sidebar background has inverse rounded corners to create a fluid, organic cut-out shape.
- The text and icon for the active item are deep blue.

## Header
- **Left**: Page Title ("Dashboard") and subtitle ("Overview of clients, filings, and collections.").
- **Center**: Search bar with a magnifying glass icon and user avatar.
- **Top Badges**: 
  - "SDDS Operating Environment Active" with a green status dot.
  - "Privacy Mode: OFF" with an eye icon.
  - "SSL Secure Connection" with a shield icon.
- **Controls**: Assessment Year dropdown ("2026-27") and a solid blue pill-shaped "+ Add Client" button.

## Overview Card
- Large, prominent card spanning the top-left content area.
- Deep blue gradient background.
- Contains a smooth, curved area chart (wave line) with a gradient fill below the line.
- X-axis labels for months (Jan - Oct).
- Tooltip/Active state shows a vertical highlight and a floating dark badge (e.g., "129 Yet To File").
- Bottom section of the card displays three key metrics separated by subtle vertical dividers: "Filed This AY", "Yet To File", and "Pending Filings".

## Stacked Stat Cards
- Positioned to the right of the Overview Card.
- **Top Card**: "Refunds Pending" - vibrant solid blue background. Includes a circular icon wrapper with a ₹ symbol.
- **Bottom Card**: "Outstanding Bal." - vibrant pink/coral gradient background. Includes a circular icon wrapper with a ₹ symbol and a "Billed" subtext. Features a right-arrow action button in the bottom corner.

## Bottom Summary Cards
- Three equal-width cards below the Overview area.
- Deep blue gradient backgrounds.
- Distinctive overlapping icons at the top center of each card, housed in fully rounded shapes that break the top border of the card.
- **Cards**:
  1. "Filed This AY" (List icon) - Subtext: "Click to view files list".
  2. "Intimations Pending" (Bell icon) - Subtext: "Filed orders under CPC process".
  3. "Revenue / Collections" (₹ icon) - Subtext: "Outstanding Bal.".
- Each card features a horizontal progress bar at the bottom with a percentage indicator (0%).

## Recent Activity Panel
- Located on the top-right side.
- Clean white/light-gray background.
- Header: "Recent Activity" with a "View All" text link.
- List format showing activity items. Each item has:
  - A circular icon wrapper on the left.
  - Main text (Client name and action).
  - Subtext (Date and time).
  - Action icon on the right (mail/envelope).

## Queue Snapshot Panel
- Located below the Recent Activity Panel.
- Header: "Filing Work Queue (Snapshot)" with a "View All" text link.
- List of clients in the queue. Each item has:
  - Client Name and ID (e.g., "Aditya Hazarika", "ARTPH9243G").
  - Status badge (e.g., "Yet To File" with a soft amber/orange background and text).
  - Menu/action list icon on the far right.

## Typography
- Modern, clean sans-serif font.
- Headers and key metrics are bold and prominently weighted.
- Subtitles, labels, and secondary text are muted and smaller.

## Colors
- **Primary Blue**: Deep royal blue used for the sidebar, overview card, and bottom cards.
- **Accent Blue**: Vibrant blue for primary buttons, active chart areas, and icons.
- **Accent Coral/Pink**: Used for the "Outstanding Bal." card.
- **Background White**: Main content wrapper background.
- **Status Amber**: Soft orange for "Yet To File" badges.
- **Status Green**: Vibrant green for the operating environment indicator.
- **Text**: Dark slate for primary text on light backgrounds; white for text on dark backgrounds.

## Radii
- **Outer Frame**: Extremely large radius (e.g., `32px` - `40px`).
- **Main Cards/Panels**: Large radius (e.g., `24px`).
- **Buttons and Badges**: Fully rounded/pill shape.
- **Overlapping Icons (Bottom Cards)**: Rounded square or circle.

## Shadows
- **Outer Frame**: Large, diffuse drop shadow.
- **White Panels (Recent Activity, Queue)**: Soft, subtle drop shadows to lift them off the background.
- **Colored Cards**: Inner glows or soft, colored drop shadows to enhance depth.

## Spacing
- Generous internal padding within cards and panels (typically `24px` or `32px`).
- Consistent gap spacing between grid items.
- Significant top margin below the header to separate it from the dashboard grid.

## Responsive Rules
- **Desktop (1672x941)**: Follow the exact multi-column grid layout shown in the reference.
- **Tablet**: Stack the Stacked Stat Cards below the Overview or collapse the sidebar.
- **Mobile**: Single column layout. Sidebar collapses to a hamburger menu. All panels and cards stack vertically.

## Visual Acceptance Rules
- The UI must visually match the reference image exactly.
- The active sidebar cut-out must be seamless with no visible borders or pixel gaps.
- Gradients must transition smoothly.
- Icons must match the style, weight, and sizing of the reference.
- Shadows must be soft and diffuse, avoiding harsh lines.

## Implementation Rules
- Build purely using CSS and markup utility classes.
- Use CSS Grid and Flexbox for all layout structures.
- Implement the sidebar cut-out using CSS masking, pseudo-elements (`::before`/`::after`), or specific border-radius tricks.
- Use CSS variables for the color palette to ensure consistency.
- No business logic or application code should be present in the layout or visual spec files.
