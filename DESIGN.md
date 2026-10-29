---
name: Transit Network Portfolio
description: A backend career drawn as a schematic transit map on a graphite signal board, with lines, stations and interchanges computed from the experience data.
colors:
  bg: "#0e1013"
  surface: "#16191e"
  surface-2: "#1c2026"
  text: "#f3f4f6"
  muted: "#aeb4bd"
  faint: "#959ca6"
  border: "#2a2f37"
  border-strong: "#3b424d"
  line-1: "#00a7db"
  line-2: "#f39700"
  line-3: "#e85298"
  on-line-1: "#0e1013"
  on-line-2: "#0e1013"
  on-line-3: "#0e1013"
  line-neutral: "#7a828f"
  interchange-fill: "#f3f4f6"
  interchange-stroke: "#0e1013"
  accent: "#f3f4f6"
  ok: "#5fd39a"
  danger: "#ff7b8a"
  grid-dot: "#f3f4f61a"
  packet: "#ffffff"
  packet-halo: "#ffffff40"
  scrim: "#050608b3"
  term-bg: "#0a0b0e"
  term-text: "#dfe2e7"
  bg-light: "#f5f6f8"
  surface-light: "#ffffff"
  surface-2-light: "#eceef1"
  text-light: "#111318"
  muted-light: "#4a5059"
  faint-light: "#545b65"
  border-light: "#d9dce1"
  border-strong-light: "#a9afb8"
  line-1-light: "#00729f"
  line-2-light: "#a86400"
  line-3-light: "#c2306f"
  on-line-1-light: "#ffffff"
  on-line-2-light: "#ffffff"
  on-line-3-light: "#ffffff"
  line-neutral-light: "#6b7380"
  accent-light: "#111318"
  ok-light: "#156b43"
  danger-light: "#c0263c"
  grid-dot-light: "#11131814"
  scrim-light: "#11131866"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, Barlow, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, min(7vw, 17cqi), 6rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, Barlow, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.01em"
  headline-sm:
    fontFamily: "Barlow Condensed, Arial Narrow, Barlow, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.25rem + 1vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.01em"
  title:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.5vw, 1.4rem)"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  button:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1
  chip:
    fontFamily: "JetBrains Mono Variable, JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1
  data:
    fontFamily: "JetBrains Mono Variable, JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.08em"
  map-sign:
    fontFamily: "JetBrains Mono Variable, JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "12px"
    fontWeight: 500
  mono:
    fontFamily: "JetBrains Mono Variable, JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "999px"
  full: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  gutter: "20px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "56px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.bg}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "#d1d2d4"
  button-primary-large:
    padding: "0 22px"
    height: "48px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    size: "36px"
  icon-button-large:
    size: "44px"
  route-bullet:
    backgroundColor: "{colors.line-3}"
    textColor: "{colors.on-line-3}"
    rounded: "{rounded.full}"
    size: "28px"
  route-bullet-sm:
    size: "20px"
  chip-tech:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.chip}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "32px"
  chip-tech-pressed:
    backgroundColor: "{colors.text}"
    textColor: "{colors.bg}"
  interchange-row:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    padding: "6px 8px"
    height: "44px"
  interchange-row-hover:
    backgroundColor: "{colors.surface-2}"
  interchange-row-pressed:
    backgroundColor: "{colors.text}"
    textColor: "{colors.bg}"
  nav-link:
    textColor: "{colors.muted}"
    padding: "0 12px"
    height: "44px"
  nav-link-current:
    textColor: "{colors.text}"
  filter-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "4px 4px 4px 16px"
  command-palette:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    width: "560px"
  cv-sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "40px 48px 44px"
    width: "800px"
  code-frame:
    backgroundColor: "{colors.term-bg}"
    textColor: "{colors.term-text}"
    rounded: "{rounded.lg}"
  platform-panel:
    backgroundColor: "color-mix(in srgb, {colors.bg} 86%, transparent)"
    textColor: "{colors.text}"
    rounded: "{rounded.xl}"
    padding: "36px 32px"
    width: "min(720px, 52%)"
---

# Design System: Transit Network Portfolio

## Overview

**Creative North Star: "The Night Network Map"**

The site is drawn as a schematic transit map at night. A career is a network: each employer is a coloured line, numbered by start date; each project is a station on its line; every technology used at two employers or more is an interchange where their lines meet, and all lines converge on a shared terminus labelled "Now". These relationships are computed from the experience data, and the build stops when a hand-placed map no longer matches that data, so the drawing is a record, not an illustration. Map language (lines, stations, end bars, legend, "not to scale") reaches every block, from the route of the experience section to the CV sheet and the 404 page.

The material is a graphite signal board: flat graphite panels with 1px rules over a fine dot grid fixed behind the page, and, in the dark theme only, tracks lit like the lamps of a dispatch board. Colour is scarce and semantic: three line colours, each owned by one job and used for nothing else; actions are drawn in ink, the text colour of the theme. Type is split into signs, text and data: condensed capitals for the name and section signs; a plain sans for anything a person reads; JetBrains Mono for data (map labels, dates, counts, technology chips, shortcut keys) and code. Density is moderate and reading-first: a recruiter must find role, stack and contact without decoding the map, and every map has a plain equivalent (accessible SVG title and description, the route list, the interchange table).

Motion is one quiet loop: small white data packets running along the hero map's lines, paused off screen, paused by a button, and absent under reduced motion. Where the device allows it, the same network also stands as a 3D night station (see Station 3D): trains run along the lines into the "Now" platform and the camera follows the page; without WebGL 2, under reduced motion or with Save-Data, the page is exactly the flat map. The world rejects the generic dark developer portfolio: no gradient name, frosted stat tiles, comment-style labels, numbered sections, blobs or glowing text; light belongs to the tracks alone.

**Key Characteristics:**
- Three line colours (cyan, orange, magenta) belong to the lines only; actions are ink, never a line colour.
- Tracks run only horizontally, vertically or at 45°, with rounded bends and square end bars; in the dark theme they glow.
- Stations are rings on the page background; interchanges are light capsules with an ink edge.
- Barlow Condensed for signs, Barlow for text, JetBrains Mono for data and code.
- Flat graphite surfaces with 1px edges over a fixed dot grid; soft black shadow only on layers that float over content.
- Dark is the default theme; light is an explicit visitor choice; print is pure black on white.
- The 3D station is progressive: built from the same data, behind the page (full level) or in the hero map box (lite level); the flat page is its off level.

## Colors

A graphite palette of cool neutrals carrying three saturated signal colours for the lines, each tuned to keep its bullet numeral legible: ink on all three in dark, white on all three in light.

### Primary
- **Action Ink** (#f3f4f6 fill with #0e1013 text in dark / #111318 fill with #f5f6f8 text in light): `--accent`, `--btn-bg`, `--accent-text`; also `--progress`. Fills the primary button and the header brand mark; colours links, the "Show n more" fold, the current nav underline (3px), the station ring of the selected palette row, the palette input underline, the method chip of the JSON view, `::selection`, `caret-color` and `accent-color`. The ink is also the text colour of its theme, so hover states mix in the page background or add an underline instead of changing colour.

### Secondary
- **Cyan Line 1** (#00a7db dark / #00729f light): the first job's track, stations, route bullet, band stretch and chip dots.
- **Orange Line 2** (#f39700 dark / #a86400 light): the second job's track, stations, route bullet, band stretch and chip dots.
- **Magenta Line 3** (#e85298 dark / #c2306f light): the current job's track, stations, route bullet, band stretch and chip dots; also the line of the 404 page.
- The line colours carry no interface role.

### Tertiary
- **Signal Green** (#5fd39a dark / #156b43 light): `--ok`, the "200 OK" chip and done dots.
- **Signal Red** (#ff7b8a dark / #c0263c light): `--danger`, reserved for error states (failed status chip, error dot, danger button), kept apart from Magenta Line 3. Never decorative.

### Neutral
- **Graphite** (#0e1013 / light #f5f6f8): page background (`--bg`), header background, station ring fill; in dark also the text on every line colour (`--on-line-1/2/3`) and on the action ink.
- **Panel** (#16191e / light #ffffff): `--surface`, solid panels: CV sheet, command palette, filter bar, request bar chips, mobile menu panel.
- **Raised Panel** (#1c2026 / light #eceef1): `--surface-2`, hover fill for rows and map labels, selected palette row, code and kbd backgrounds, frame header bar.
- **Signal White** (#f3f4f6 / light #111318): `--text`; also `--focus`, the action ink and, in dark, the interchange capsule fill (`--interchange-fill`; white in light).
- **Steel Grey** (#aeb4bd / light #4a5059): `--muted`, secondary text, periods, roles, inactive nav links, the "planned" status.
- **Slate Grey** (#959ca6 / light #545b65): `--faint`, tertiary text (legend scale note, footer note, placeholders, dash bullets); still at least 5.9:1 on every surface.
- **Rule** (#2a2f37 / light #d9dce1): `--border`, 1px rules between bands, rows and sheet sections.
- **Edge** (#3b424d / light #a9afb8): `--border-strong`, edges of controls (secondary button, chips, icon buttons), the scrollbar thumb.
- **Neutral Line** (#7a828f / light #6b7380): `--line-neutral`, track, stations and end bars of the "What I do" diagrams, which belong to no job; their stations are filled white (`--line-neutral-fill`).
- **Code Black** (#0a0b0e, text #dfe2e7, secondary #959ca6): `--term-*`, the JSON body, dark in both themes.
- **Dot Grid** (#f3f4f6 at 10% / light #111318 at 8%): `--grid-dot`, the 1px dots every 22px behind the page.
- **Packet** (#ffffff, halo #ffffff at 25%): `--packet`, `--packet-halo`; the halo is transparent in light.
- **Scrim** (#050608b3 / light #11131866): behind the command palette and the mobile menu.

**Themes.** Dark is the default whatever the OS preference; light applies only when the visitor picks it (`html[data-theme='light']`, remembered in local storage). The light theme swaps every token above for its light value except the code panel; text on a line colour is ink #0e1013 on all three in dark and white on all three in light (`--on-line-1/2/3`), so every bullet keeps at least 5.5:1 in dark and 4.6:1 in light. The light theme has no glow and no packet halo. Print overrides every token to black or white, removes all shadows and the glow, and drops colour fills and the dot grid.

### Named Rules
**The Three Lines Rule.** The line colours belong to the lines and to nothing else. Each belongs to one job in start order (line 1 = first job) and appears only where that line is meant: track, station, bullet, band stretch, its chip dots, and the 404 line. Status, actions and diagrams that belong to no job have colours of their own.

**The Action Ink Rule.** Every action is drawn in ink (`--accent` / `--accent-text`): the primary button, links, the "Show n more" fold, the current nav underline, the palette ring and underline, the brand mark. Signal White with graphite text in dark, near-black with light text in light; never a line colour.

**The Ink-on-Line Rule.** Text on a line colour takes the `--on-line-N` of that line: ink #0e1013 on all three in dark; white on all three in light. Body text never takes a line colour unless it passes 4.5:1 on its surface (JSON tokens sit on the dark code panel for that reason).

**The Lit Tracks Rule.** Light belongs to the tracks. In the dark theme only, the tracks and end bars of a job's line glow like the lamps of a dispatch board on the hero map, the terminus sign and the 404 map: two blurred copies of the track under it, about 4px and 10px, the outer one at 45% (class `.led`, filter `#led` in `src/components/metro/LedGlow.astro`). In the 3D station the same light comes from the scene itself: self-lit tracks, rings and lamps under a moderate bloom, dark theme only. Data packets are white with a small halo. Text, buttons, cards and the neutral diagrams never glow, nor does anything in the light theme or in print. No gradients, frosted glass, backdrop blur or coloured shadows, apart from the platform panels of the full 3D level (see Elevation & Depth); the older tokens (`--grad`, `--glass`, `--glow*`, `--grid-line`, `--hero-glow*`, `--grad-rail`, `--accent-2/3`) resolve to a flat colour, transparent or none and must never be re-inflated.

**The Dot Grid Rule.** One background texture only: a 1px dot every 22px in `--grid-dot`, fixed behind the page while it scrolls. No square grid, no noise; every block with a background of its own covers it. The ground of the 3D station carries the same dots, on thin square lines that give the floor its depth.

## Typography

**Display Font:** Barlow Condensed 600/700 (with Arial Narrow, Barlow, system-ui)
**Body Font:** Barlow 400/500/600 (with system-ui, -apple-system, Segoe UI, Roboto, Arial)
**Data/Mono Font:** JetBrains Mono Variable (with ui-monospace, SFMono-Regular, Menlo, Consolas), for data and code

**Character:** Condensed capitals read as station signage: tall, compact, confident at large sizes. Barlow, from the same family, keeps running text calm and legible, so signs and text feel related without competing. JetBrains Mono gives the data the even rhythm of a signal board readout. All three faces are self-hosted with Latin, Latin Extended and Vietnamese subsets.

### Hierarchy
- **Display** (Condensed 700, clamp(2.75rem, min(7vw, 17cqi), 6rem), line-height 0.98, -0.01em): the hero name only, solid text colour, sized against its own column so it holds two lines beside the map.
- **Page title** (Condensed 700, h1 default clamp(2.5rem, 6vw, 4rem), line-height 1): secondary page titles; the CV name is clamp(2.25rem, 1.75rem + 2.5vw, 3.25rem) and the 404 title clamp(2.25rem, 5.5vw, 3.5rem).
- **Headline / section sign** (Condensed 700, clamp(2rem, 5vw, 2.75rem), line-height 1.05, 0.01em, uppercase): every h2 section head, the terminus sign.
- **Headline small** (Condensed 700, clamp(1.5rem, 1.25rem + 1vw, 1.875rem), line-height 1.15, uppercase): sub-signs inside a block, and CV section signs at line-height 1.05; the mobile menu links use the same face at 600 1.375rem.
- **Title** (Barlow 600, clamp(1.25rem, 1.1rem + 0.5vw, 1.4rem), line-height 1.3): h3 and band titles. Company station names are Barlow 600 1.375rem / 1.2; project station names 1.125rem / 1.4.
- **Body** (Barlow 400, 1.0625rem, line-height 1.6): running text; measure 70ch for intros and summaries, 65ch for the about text, 60ch for the tagline and band text, 46ch for the contact sentence.
- **Body small** (Barlow 400 to 600, 0.9375rem): points, legend entries, nav links (500), palette rows.
- **Data** (JetBrains Mono 500, 0.875rem): periods on the route and on the screen CV; project counts in the interchange table and technology chips at 0.8125rem; kbd keys 600 12px and the ⌘K chip 600 0.8125rem. The printed CV keeps its dates in Barlow.
- **Label** (Barlow 600, 0.75rem, 0.08em, uppercase): palette group labels. Table group titles use Condensed 600 0.9375rem, 0.08em, uppercase, muted.
- **Map labels** (sizes in viewBox units, so they scale with the map): station and interchange labels JetBrains Mono 500 12px, hubs 700 13px, start years 500 12px, "NOW" 700 18px, "You are here" 600 12px; the compact map sets hubs at 15px, "NOW" at 20px, years at 13px and "You are here" at 14px. Company names at line starts stay Condensed 700 15px and route numerals Condensed 700 13px. Diagram labels ("What I do") are Condensed 600 16px on phones and 13px from 640px. The labels of the 3D station use the same faces and sizes in CSS pixels, with 20px route bullets.
- **Mono code** (JetBrains Mono, 12.5px / 1.7, 13px from 640px): JSON body, request bar, palette target paths, HTTP status chip (600 12.5px).

### Named Rules
**The Sign Face Rule.** Barlow Condensed is for signs only: the name, section signs (uppercase), company names at line starts, route numerals, the "Now" sign of the route, diagram labels. Body headings from h3 down, UI controls and running text stay in Barlow.

**The Data Mono Rule.** JetBrains Mono marks data and code: map labels and years, "You are here", dates and periods, project counts, technology chips, shortcut keys, the JSON view. Names, titles, running text and company names never take it, and the printed CV keeps Barlow. Map labels are placed for 0.6 em a mono character; an interchange name too long for the map takes a shorter label there ("JPA / Hibernate"), its link keeps the full name.

**The Tabular Figures Rule.** Dates, periods, years, counts and kbd keys use `font-variant-numeric: tabular-nums` (mono figures are tabular already). Headings use `text-wrap: balance`, paragraphs `text-wrap: pretty`.

## Layout

One centred container (max 1120px) with 20px gutters on phones and 24px from 640px. Blocks sit on a fixed rhythm: section padding 32px top and bottom on phones (64px between blocks), 56px from 640px (112px between); the last block adds room before the footer (64px, 96px from 640px). A section head leaves 32px before its content. The sticky header is 64px high and anchors scroll with 16px of extra padding under it.

Breakpoints: 640px (tablet layout, wider gutters and padding), 960px (full header nav replaces the menu), 1024px (full map, three-column table, alternating bands). The 404 page alone splits its two languages side by side from 720px.

- **Hero.** Phone: name, role line, tagline, buttons, then the compact map (at most 440px) directly under the buttons. 640–1023px: text column plus a compact-map column of clamp(280px, 42%, 400px), tops aligned. From 1024px the wide map spans the whole container and the 400px text block sits over its top-left corner, which the map leaves empty by design.
- **Route (experience).** A single vertical rail: the track centre is 14px from the left edge and text starts at 44px (56px from 640px). Each employer is a 6px stretch of its line colour; the current stretch starts at a 28×6px "Now" end bar.
- **Bands (focus areas).** Full-width rows between 1px rules, not cards: title, diagram, text on phones; from 1024px the diagram takes one half (up to 480px) and title and text the other, swapping sides each band.
- **Interchange table.** Ruled rows in CSS columns: one column on phones, two from 640px, three from 1024px; a group never splits.
- **CV.** An 800px sheet; a printed A4 page at 15mm margins.
- **Map geometry.** Wide map viewBox 960×560, compact map 320×270. Parallel tracks are 12px apart; every segment is horizontal, vertical or 45° (the build throws otherwise). On the wide map line 1 runs at x = 626, so the longest mono station label on its left (about 152 units) clears line 3 at x = 440; every label stays inside the frame and off the tracks.
- **Full 3D level.** The home blocks after the hero become platform panels over one half of the window, so the scene stays open in the other half: min(720px, 52%) wide with 36px 32px padding, the inner edge on the middle of the window once the window is wide enough (about 1490px) and the panel 24px from the window edge before that. About (with What I do), Skills and Contact stand on the left, Experience on the right (`data-panel="right"`). Two panels are 34vh of open scene apart: the section margin plus both 56px section paddings. Inside a panel the bands stack their diagram over the title and text, the interchange table takes two columns from 1280px and one below, and the route keeps its layout. This layout is set before the blocks are drawn, never when the scene arrives, so nothing shifts.

**The 45-Degree Rule.** Every track, on any map or diagram, bends only at 45° or 90°. Parallel lines keep a constant 12px gap and converge in route order.

## Elevation & Depth

Flat and tonal. Depth comes from three steps of graphite (background, surface, raised surface) separated by 1px rules; the only light is the glow of the tracks in the dark theme. Within a map, depth is drawing order: tracks, then packets, then end bars, stations, interchange capsules, and labels on top. Two soft black shadows exist, both for layers that float over content.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4)`; 0.12 in light): the sticky filter status bar, the mobile menu panel, the skip link.
- **Dialog** (`box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5)`; 0.18 in light): the command palette.

### Platform Panel (full 3D level only)
The home blocks after the hero over the 3D scene: `--bg` at 86% with a 6px backdrop blur, a 1px Rule edge, 16px corners, no shadow, about half the window wide on the left or the right (see Layout). The only translucent surface of the site; its text keeps at least 4.5:1 whatever the scene shows behind it. The footer turns solid `--bg` over the scene; the hero stays open, its name block over the left of the overview.

### Named Rules
**The Flat-at-Rest Rule.** Panels, sheets, rows and buttons are flat with a 1px edge. A shadow appears only on something that floats over content, is soft and black, and is removed in print.

## Shapes

The form language is the map's own: circles are stops, capsules are joins, square bars are ends.

- **Circles** (50%): route bullets (28px, 20px small, r10 on maps), station rings (3px stroke in the line colour, filled with the page background; 16px on the route, r7 on maps), the education origin ring (18px, text colour), status dots (8px), the "You are here" ring and dot.
- **Capsules** (999px, or rx equal to half the height): interchanges (light fill, 2px ink edge, spanning the parallel tracks they join), technology chips, status and HTTP chips.
- **Square bars** (butt caps): terminal bars across line ends (6px thick, 18px long, 12px at the shared terminus), the 6px band stretches under section signs (40px each; 24×4px on the CV), the 3px current-nav underline.
- **Boxes:** 8px corners for buttons, icon buttons, the CV sheet, palette and filter bar; 12px for the JSON code frame; 16px for the platform panels of the full 3D level; 4px for inline code, kbd and map-label hit boxes; 6px for palette rows.
- **Tracks:** 7px strokes on SVG maps (6px on HTML rails), round joins at bends, butt ends; an unbuilt section is dashed 10/8. SVG tracks of a job's line glow in the dark theme; the HTML rails of the route do not.

## Components

### Buttons
Solid, compact and plain; a button is a sign, not a gem.
- **Shape:** gently squared (8px), at least 44px high (48px for hero, contact and 404 calls to action), 20px side padding (22–24px when large), 8px icon gap with 16px icons.
- **Primary:** Action Ink fill: Signal White with graphite text in dark, near-black with light text in light; Barlow 600 1rem.
- **Hover / Focus:** the fill is also the text colour, so hover mixes 15% of the page background into it (`color-mix(in srgb, var(--btn-bg) 85%, var(--bg))`); 150ms ease-out colour transitions; focus is the global 2px text-colour outline at 3px offset.
- **Secondary:** transparent with a 1px Edge border and text colour; hover turns the border to text colour.
- **Danger:** red text and border on a 12% red tint; hover fills red with background-coloured text.
- **Disabled:** raised panel fill, faint text, plain border, not-allowed cursor.
- **Text link:** muted Barlow 0.9375rem, 44px high, turns to text colour on hover; LinkedIn and GitHub sit beside the hero buttons as text links.
- **Icon button:** 36px (44px large) square with 8px corners and an Edge border, muted icon; hover lifts icon to text colour and border to muted.

### Chips
- **Technology chip (route):** a 32px JetBrains Mono 500 0.8125rem capsule with an Edge border, extended to a 44px touch target by an invisible `::after`. When the technology is an interchange, small 8px dots in the colours of the lines through it precede the name, in route order. A button that filters the route. Chips of the case study (`.tags`) use the same face.
- **State:** hover shows a text-colour border; pressed inverts (text-colour fill, background-coloured text). Chips past the sixth wait behind a dashed "+n" chip.
- **Status chip (JSON view):** 32px mono capsule; ok, warn and fail tint border, text and a 12% fill with green, ink or red.

### Cards / Containers
- **Corner Style:** 8px; the JSON frame 12px.
- **Background:** Panel (`--surface`) on Graphite.
- **Shadow Strategy:** none at rest (see Elevation & Depth).
- **Border:** 1px Rule; Edge for the code frame and floating bars.
- **Internal Padding:** CV sheet 24px 18px 28px on phones, 40px 48px 44px from 640px.
- Prefer ruled rows and bands to boxes: the focus areas, the interchange table, and route stops have no card around them.

### Inputs / Fields
- **Style:** the command palette field is borderless and transparent in a 56px row under a 1px rule, 16px text, faint placeholder.
- **Focus:** the row gains a 2px inset ink underline (`inset 0 -2px 0 var(--accent)`), which replaces the field's outline.

### Navigation
- **Header:** sticky, solid page background, 1px bottom rule, 64px. Left: the brand mark (a 28px Action Ink route bullet with initials in the sign face) and the name in Barlow 600. Centre from 960px: links in Barlow 500 0.9375rem, muted, 44px high; hover and current turn to text colour, and the current section carries a 3px ink underline inset 12px. Right: palette key chip in mono (⌘K on Mac, Ctrl K elsewhere), language chip, theme icon button.
- **Mobile menu:** a 44px menu button opens a panel on the surface colour with a float shadow and scrim; links are Condensed 600 1.375rem uppercase rows of 52px between rules, hover adds a 3px ink underline; no item numbers.
- **Footer:** a map legend: small route bullets with each employer, the "Diagram not to scale" note in faint text, then the JSON profile link, icon buttons, a no-tracking note and copyright; right-aligned from 640px.

### Network Map (signature)
The hero drawing, built only from four parts: **Track** (7px line-colour stroke, round joins, glowing in the dark theme), **Station** (ring on the background), **Interchange** (light capsule with 2px ink edge spanning 1–3 parallel tracks, or a round stop where two lines cross at right angles), **Terminal** (square end bar, glowing with its track). Line starts show a route bullet, the employer name in the sign face and the start year in mono; hubs every line passes through get bolder labels; all lines end at a shared "NOW" terminus with a "You are here" mark, both in mono. Interchange labels are a second overlaid SVG of real links that filter the route; a 4px-cornered box fills on hover, outlines on focus and inverts while pressed. On phones and tablets a compact map shows only line starts, hubs and the terminus.

Motion: one data packet per line, a 4px round white dot (`--packet`) over an 11px faint halo (`--packet-halo`, dark theme only), drawn as dashes on a 100-unit path, running linearly at about 80 units a second (kept to 8–14s a run), each line offset by a share of its run so they never move together. Packets show only with the script, run only while the map is on screen and the tab visible, stop with the 44px pause button in the map's corner, and are removed with the button under reduced motion; the glow of the tracks is static and stays.

### Station 3D (signature, progressive)
The network of the hero map stands again as a night station in WebGL (three.js, `src/scripts/station3d/`, mounted by `Station3D.astro`), built from the same data: `src/data/network.ts` and the desktop map `wideMap`, 40 map units to one scene unit, map y along the scene z. Nothing is placed by hand that the map does not place, and the build stops when the map no longer matches the network.
- **Scene.** Each track is a glowing tube in its line colour with rounded bends, over a dark bed, its colour spilled faintly on the ground; project stations are lit rings on a disc of the page background; interchanges are light capsules with an ink edge, or a round stop where two lines cross; light bars close each line start and the shared end. A light fog of the page background hides the edge of the ground. At the end stands the station: a low platform with a lit safety line, a thin floating roof with strips of light, two slim masts and a pool of warm light.
- **Trains.** One train of three cars a line (rounded light metal shell, a band of warm lit windows, a stripe in the line colour, two headlamps with a small glow and a faint beam on the ground) runs from the start of its line to "Now", brakes into it, waits about 2.6s, fades out and starts again. The lines run out of step; the train that ends nearest the middle of the end bars arrives during the opening shot.
- **Colour and light.** Every page colour comes from the tokens (`--bg`, `--surface-2`, `--border-strong`, `--text`, `--muted`, `--packet`, `--interchange-fill/stroke`, `--line-N`), read when the scene starts and again when the theme changes; only the light sources (lamps, windows, sky and moon light) have fixed warm or cool white colours. Dark theme: Neutral tone mapping and a moderate bloom (strength 0.55, radius 0.35, threshold 0.8). Light theme: light ground, daylight, faint self-light and halos, no bloom.
- **Labels.** HTML labels over the scene in the language of the page, with the faces of the SVG map over a halo of the page background: company and start year with the route bullet at each line start, the short station names, the interchange names (short where the map shortens them), "NOW" and "You are here". Station and minor interchange labels show only when the camera is near; all labels wait during the opening shot, then fade in. Interchange labels are buttons that filter the route exactly as the map links do (hover box, focus ring, pressed inverts, 44px target); the other labels are hidden from screen readers, which read the title and description of the SVG map, still in the page. At the full level no label shows over a platform panel: a label fades out over the last 24px as it comes up to the box of a panel on screen, and is gone, out of reach of the pointer and of Tab, once it touches it; labels in the open half show as before.
- **Camera.** An opening shot of about 6s stands level with the platform and looks back up the trunk while the first train comes in, then rises over the network. After it, each block holds a shot (`data-cam`): hero → the whole network; About → the first stretch of the current line; each company of the route → the stations of its line; Skills → the hubs; Contact → down on the platform. The camera eases from shot to shot as the middle of the window passes the middles of the blocks, and is damped. At the full level each shot is framed in the open half beside its panel: the view is shifted sideways (a view offset over a window of the same size) so the look point is drawn in the middle of the room the panel leaves, kept between 25% and 75% of the width: about 75% beside a left panel, 25% beside the Experience panel, and the middle for the hero, whose map stays to the right of the name. The shift follows the shots with the same easing and damping and is set again on every resize. The Contact shot stands back from the platform and turns towards the trunk, so the platform, its lit roof, the train at it, "NOW" and "You are here" fill the right half.
- **Run levels.** *Full* (1024px and wider with a mouse, WebGL 2, no reduced motion, no Save-Data): the canvas fixed behind the whole home page, bloom, pixel ratio at most 1.5, the camera following the page; the home blocks after the hero become platform panels; the SVG map of the hero fades out once the first frame is drawn, its pause button stays. *Lite* (narrower or touch, otherwise the same): the canvas only in the hero map box with feathered edges, pixel ratio 1, no bloom, the opening shot then the whole network with its trains; the rest of the page unchanged. *Off* (no script, no WebGL 2, reduced motion, Save-Data): the page exactly as without the scene; three.js is never fetched.
- **Loading and cost.** three.js is a chunk of its own, fetched after the load event once the browser is idle; the canvas fades in over 600ms. The scene draws only while it can be seen (tab visible, page view rather than the JSON view, and at the lite level the hero map on screen); the pause button of the hero map stops the trains and the opening shot; leaving the page frees the GPU. Printing leaves it out, with the maps.

### Route (signature)
The experience section as one line diagram: each employer is a 6px stretch of its colour with a 28px route bullet sitting on the track, the employer name (Barlow 600), role and period (mono). Projects are 16px station rings on the stretch with name, summary, two points and a "Show n more" fold in ink that underlines on hover, and technology chips. The route ends at the education origin ring. While a filter is on, matching stations fill their ring with the line colour, others fade to 45% opacity, and a sticky status bar ("Passing through: …" with a project count and a Clear button) floats under the header.

### Interchange Table (signature)
Skills as a ruled table grouped under condensed caps titles. Each row is at least 44px on three columns: name, one 20px slot per line (route bullet or empty, so a line keeps its column), and the project count in muted mono figures, on one line in its 5rem column. Rows with projects are buttons: raised-panel hover, pressed inverts like the chips.

### Section Sign
An uppercase condensed headline with, 12px below, a band of 6px stretches (40px each) in the colours of the lines the section concerns, in route order. No label above, no number, no outline numerals. The contact block replaces the band with the lines arriving from the left, glowing in the dark theme, and stopping at end bars against the word "Terminus".

### Focus Diagrams
The "What I do" bands draw small static diagrams with the map parts, but they belong to no job: track, stations and end bars take the Neutral Line (`--line-neutral`), stations are filled white, and the interchange round stop keeps its ink edge. No line colour appears in them, and they never glow.

### JSON View
The profile as an API response, opened in place of the home blocks: a request bar in mono (ink method chip, path, green "200 OK" status chip, type and size) over a 12px-cornered frame with a numbered, syntax-coloured body on the Code Black panel #0a0b0e, dark in both themes (keys Cyan #00a7db, strings Green #5fd39a, numbers and literals Orange #f39700, punctuation and line numbers #959ca6, text #dfe2e7). On opening, lines arrive one after another (fade and 4px rise, 140ms each on the standard ease `cubic-bezier(0.22, 0.61, 0.36, 1)`), staggered by at most 30ms so the last line starts within 450ms whatever the length; only without a reduced-motion preference.

### CV Sheet and Print
On screen: one flat surface sheet with a 1px edge, solid-colour name, condensed section signs over a thin band of line colours that runs on as a hairline, route bullets beside employer names, periods in mono, and projects as rings on a 3px track in the line colour. The print button is outlined on phones and solid Action Ink from 640px. In print: A4 portrait, 15mm margins, 10pt / 1.4 body, 20pt name, section signs become 10.5pt Barlow caps over a 0.75pt black rule, periods return to Barlow, route bullets become black rings with no fill, tracks and rings are dropped, bullets print as text dashes, skills print as plain text, jobs, projects and the skills list avoid page breaks, and everything marked no-print (header, footer, maps, diagrams, filter bar, toolbar, colour bands) disappears. The sheet must fit two pages in black and white.

### 404
"This station is not on the map": a short stretch of the current line (Magenta Line 3, glowing in the dark theme) with two stations runs into a dashed unbuilt section ending at a large ring with a question mark; the code sits in muted condensed figures above an English title with the Vietnamese one under it in muted text; each language gets its own primary "home" and secondary "CV" buttons.

## Do's and Don'ts

### Do:
- **Do** draw every new diagram with the map parts (Track, Station, Interchange, Terminal) and the 45-Degree Rule: 7px tracks, 3px station rings on the page background, capsules with a 2px ink edge, square end bars; a diagram that belongs to no job leaves out the route number and draws in `--line-neutral`, so it does not glow.
- **Do** take a line's colour from its route number (`--line-1`, `--line-2`, `--line-3`), and derive any new interchange or relationship from the experience data, never by hand.
- **Do** put the `--on-line-N` text of the line on any line-colour fill, draw every action in ink (`--accent` / `--accent-text`), and check every new text pair for 4.5:1 in both themes (3:1 for large text, tracks and stations).
- **Do** set data in JetBrains Mono (map labels, dates, counts, chips, keys) and place map labels for 0.6 em a character, clear of the tracks, of each other and of the map frame.
- **Do** open each home block with the section sign: condensed uppercase headline and the 6px band of related line colours.
- **Do** keep touch targets at least 44px, extending a smaller visual (32px chip) with an invisible `::after` rather than enlarging it.
- **Do** keep interaction feedback to colour and border changes at 150ms ease-out, with the 2px text-colour focus outline at 3px offset; a pressed filter control inverts to text-colour fill; where the ink equals the text colour, hover underlines instead.
- **Do** keep dark as the default theme regardless of OS preference, and give every block a black-on-white print state.
- **Do** use Barlow at 400, 500 and 600 only; 700 belongs to the condensed face.
- **Do** keep the 3D station a progressive layer: built from the same data and tokens as the SVG map, fetched only after load, drawn only while it is seen, and leaving the page exactly as it is at the off level.

### Don't:
- **Don't** use gradients, frosted glass, backdrop blur, coloured shadows, blobs, noise or a square background grid; the dot grid is the only texture. The platform panels of the full 3D level are the one translucent, blurred surface.
- **Don't** put a glow on text, buttons, cards or the neutral diagrams, or anywhere in the light theme or in print.
- **Don't** put a kicker or eyebrow label above a heading, number sections (01–04), or use comment-style labels such as `// about`.
- **Don't** set names, titles, running text or company names in mono; mono is for data and code.
- **Don't** add another hue or use a line colour for something that is not its line: actions are ink, status is green or red, unowned diagrams are neutral grey.
- **Don't** add scroll reveals, count-ups, typing effects or looping decoration; content is visible on load, and the packet loop and the trains of the 3D station, both stopped by the pause button, stay the only ambient motion.
- **Don't** nest cards inside cards or box content that reads as a list; use rules and bands.
- **Don't** draw a track segment at any angle other than 0°, 45° or 90°, or label a map relationship the data does not contain.
