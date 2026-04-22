# Design Brief

## Direction
WeFlow by nHive — Professional project management with Kanban workflow, featuring sprints, task cards, and team health metrics.

## Tone
Clean, professional, minimal. Spacious layouts with warm orange accents, emphasizing clarity and efficiency in productivity context.

## Differentiation
Orange/amber primary defines every interactive element — progress bars, badges, buttons — creating a consistent warm energy that distinguishes nHive's design language.

## Color Palette

| Token        | OKLCH        | Role                                      |
| ------------ | ------------ | ----------------------------------------- |
| background   | 0.99 0.002 40 | Bright white, clean canvas               |
| foreground   | 0.15 0.01 40 | Deep grey text, 0.84 contrast ratio      |
| card         | 1.0 0 0      | Pure white elevation                      |
| primary      | 0.62 0.22 40 | Orange/amber — actions, progress, badges |
| secondary    | 0.95 0.008 40| Soft grey — secondary UI                 |
| muted        | 0.95 0.008 40| Muted backgrounds                         |
| destructive  | 0.58 0.22 25 | Red blockers, warnings                    |
| border       | 0.92 0.004 40| Subtle dividers, 0.07 contrast ratio     |

## Typography
- Display: Space Grotesk — headings, logos, sprint labels
- Body: DM Sans — content, task titles, UI labels
- Mono: JetBrains Mono — code snippets, timestamps
- Scale: Hero `text-5xl font-bold`, section `text-2xl font-bold`, body `text-base`, labels `text-sm font-semibold`

## Elevation & Depth
Cards elevated with subtle shadows (0-4px y-offset, 0.05-0.08 opacity). Borders define structure instead of heavy shadows.

## Structural Zones

| Zone            | Background    | Border       | Notes                                |
| --------------- | ------------- | ------------ | ------------------------------------ |
| Header/Nav      | card bg-white | border-b     | Contains nHive logo, primary nav     |
| Sidebar (left)  | sidebar bg    | sidebar-border| Sprint list, task bucket section     |
| Main content    | background    | —            | Kanban board columns, task cards     |
| Sidebar (right) | sidebar bg    | sidebar-border| Team health metrics, sprint info    |
| Cards (tasks)   | card bg-white | subtle border| 0.5rem radius, shadow-card          |

## Spacing & Rhythm
Spacious layout — 2rem gaps between major sections, 1rem card padding, 0.5rem micro-spacing in labels. Clean rhythm emphasizes content over decoration.

## Component Patterns
- Buttons: `bg-primary text-primary-foreground rounded-md`, orange background, full width in Kanban cards
- Cards: `bg-card shadow-card rounded-md border border-border`, used for tasks and containers
- Badges: `bg-primary/20 text-primary`, rounded-full for sprint status ("Live"), department tags with colored dots (blue, green, purple, pink)
- Progress bars: `bg-primary` with gradient, used in "Doing" cards and team metrics

## Motion
Entrance: smooth fade-in (0.3s) on load. Hover: `transition-smooth` (0.3s) on buttons and cards. Drag: card lift on hover (+shadow-elevated). No decorative animations.

## Constraints
- Light mode only (white background as per user requirement)
- Orange primary throughout — no purple/blue defaults
- High contrast text (0.84+) for accessibility
- Minimal borders, spacious layout (anti-dense)
- Card-based UI with clear hierarchy

## Signature Detail
Every interactive element — buttons, progress bars, badges, status indicators — uses the warm orange primary, creating a cohesive and recognizable nHive visual identity.
