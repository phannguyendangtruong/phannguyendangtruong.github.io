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
  phone-card:
    backgroundColor: "color-mix(in srgb, {colors.bg} 82%, transparent)"
    textColor: "{colors.text}"
    rounded: "{rounded.xl}"
    padding: "22px 20px"
---

# Design System: Transit Network Portfolio

## Overview

**Creative North Star: "The Night Network Map"**

The site is drawn as a schematic transit map at night. A career is a network: each employer is a coloured line, numbered by start date; each project is a station on its line; every technology used at two employers or more is an interchange where their lines meet, and all lines converge on a shared terminus labelled "Now". These relationships are computed from the experience data, and the build stops when a hand-placed map no longer matches that data, so the drawing is a record, not an illustration. Map language (lines, stations, end bars, legend, "not to scale") reaches every block, from the route of the experience section to the CV sheet and the 404 page.

The material is a graphite signal board: flat graphite panels with 1px rules over a fine dot grid fixed behind the page, and, in the dark theme only, tracks lit like the lamps of a dispatch board. Colour is scarce and semantic: three line colours, each owned by one job and used for nothing else; actions are drawn in ink, the text colour of the theme. Type is split into signs, text and data: condensed capitals for the name and section signs; a plain sans for anything a person reads; JetBrains Mono for data (map labels, dates, counts, technology chips, shortcut keys) and code. Density is moderate and reading-first: a recruiter must find role, stack and contact without decoding the map, and every map has a plain equivalent (accessible SVG title and description, the route list, the interchange table).

Motion is one quiet loop: small white data packets running along the hero map's lines, paused off screen, paused by a button, and absent under reduced motion. Where the device allows it, the same network also stands as a miniature city at night in 3D (see Night City 3D), on phones as on desktops: lit towers, a river, metro viaducts, trains running into "Now", and a drone camera that follows the page. Without WebGL 2, under reduced motion or with Save-Data, the page is exactly the flat map. The world rejects the generic dark developer portfolio: no gradient name, frosted stat tiles, comment-style labels, numbered sections, blobs or glowing text. On the flat page light belongs to the tracks alone; in the 3D city it belongs to the city and to the lines.

**Key Characteristics:**
- Three line colours (cyan, orange, magenta) belong to the lines only; actions are ink, never a line colour.
- Tracks run only horizontally, vertically or at 45°, with rounded bends and square end bars; in the dark theme they glow.
- Stations are rings on the page background; interchanges are light capsules with an ink edge.
- Barlow Condensed for signs, Barlow for text, JetBrains Mono for data and code.
- Flat graphite surfaces with 1px edges over a fixed dot grid; soft black shadow only on layers that float over content.
- Dark is the default theme; light is an explicit visitor choice; print is pure black on white.
- The 3D night city is progressive: its metro is built from the same data. At the full level it stands behind the whole home page, beside platform panels on wide windows and between glass cards on phones; on weak devices it falls back to the hero map box (lite level). The flat page is its off level.

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
**The Three Lines Rule.** The line colours belong to the lines and to nothing else. Each belongs to one job in start order (line 1 = first job) and appears only where that line is meant: track, station, bullet, band stretch, its chip dots, and the 404 line. Status, actions and diagrams that belong to no job have colours of their own. In the 3D city a line colour appears only on parts of its line: the LED strips of its viaduct, the stripe of its trains, its portal, hologram and light stream, its ring at "Now" and the tags of its stations; the city's own lights are white, warm, or the red beacons of the towers.

**The Action Ink Rule.** Every action is drawn in ink (`--accent` / `--accent-text`): the primary button, links, the "Show n more" fold, the current nav underline, the palette ring and underline, the brand mark. Signal White with graphite text in dark, near-black with light text in light; never a line colour.

**The Ink-on-Line Rule.** Text on a line colour takes the `--on-line-N` of that line: ink #0e1013 on all three in dark; white on all three in light. Body text never takes a line colour unless it passes 4.5:1 on its surface (JSON tokens sit on the dark code panel for that reason).

**The Lit Tracks Rule.** Light belongs to the tracks. In the dark theme only, the tracks and end bars of a job's line glow like the lamps of a dispatch board on the hero map, the terminus sign and the 404 map: two blurred copies of the track under it, about 4px and 10px, the outer one at 45% (class `.led`, filter `#led` in `src/components/metro/LedGlow.astro`). In the 3D city the light comes from the scene itself (windows, street lamps, trains, the LED strips of the viaducts and the light layer of portals, holograms, streams and the beam) under a moderate bloom, dark theme only. Data packets are white with a small halo. Text, buttons, cards and the neutral diagrams never glow, nor does anything in the light theme or in print. No gradients, frosted glass, backdrop blur or coloured shadows, apart from the surfaces of the full 3D level: platform panels, phone cards, the soft backdrop behind the hero name block and the glass tags of the scene (see Elevation & Depth); the older tokens (`--grad`, `--glass`, `--glow*`, `--grid-line`, `--hero-glow*`, `--grad-rail`, `--accent-2/3`) resolve to a flat colour, transparent or none and must never be re-inflated.

**The Dot Grid Rule.** One background texture only: a 1px dot every 22px in `--grid-dot`, fixed behind the page while it scrolls. No square grid, no noise; every block with a background of its own covers it. The 3D city brings its own ground (roads, pavements, parks, the river); the dot grid stays the texture of the page wherever the scene is not drawn.

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
- **Map labels** (sizes in viewBox units, so they scale with the map): station and interchange labels JetBrains Mono 500 12px, hubs 700 13px, start years 500 12px, "NOW" 700 18px, "You are here" 600 12px; the compact map sets hubs at 15px, "NOW" at 20px, years at 13px and "You are here" at 14px. Company names at line starts stay Condensed 700 15px and route numerals Condensed 700 13px. Diagram labels ("What I do") are Condensed 600 16px on phones and 13px from 640px. The tags of the 3D city keep the mono face: 500 12px, "NOW" 700 18px; its holograms set the company in Barlow Condensed 700 uppercase over a mono line.
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
- **Full 3D level, wide (from 1024px).** The home blocks after the hero become platform panels over one half of the window, so the scene stays open in the other half: min(720px, 52%) wide with 36px 32px padding, the outer edge on the edge of the page container (24px from the window edge until the window is wider than the container). About (with What I do), Skills and Contact stand on the left, Experience on the right (`data-panel="right"`). Two panels are 34vh of open scene apart: the section margin plus both 56px section paddings. Inside a panel the bands stack their diagram over the title and text, the interchange table takes two columns from 1280px and one below, and the route keeps its layout. The hero stays open, its name block over a soft backdrop of the page background.
- **Full 3D level, narrow (under 1024px).** The scene stays behind the whole page; each block after the hero is a glass card across the page container, 16px from the window edges, with 46vh of open scene above it. In Experience the head of the section is a card, each company of the route is a card with 40vh of open scene above it, and the education station is the last card; the track of each company stays inside its card. The hero name block sits over a backdrop of the page background at 90% that fades out under it; the map box under it is left open to the scene, its pause button over the scene. Either layout is set before the blocks are drawn, never when the scene arrives, so nothing shifts.

**The 45-Degree Rule.** Every track, on any map or diagram, bends only at 45° or 90°. Parallel lines keep a constant 12px gap and converge in route order.

## Elevation & Depth

Flat and tonal. Depth comes from three steps of graphite (background, surface, raised surface) separated by 1px rules; the only light is the glow of the tracks in the dark theme. Within a map, depth is drawing order: tracks, then packets, then end bars, stations, interchange capsules, and labels on top. Two soft black shadows exist, both for layers that float over content.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4)`; 0.12 in light): the sticky filter status bar, the mobile menu panel, the skip link.
- **Dialog** (`box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5)`; 0.18 in light): the command palette.

### Platform Panels and Cards (full 3D level only)
The only translucent surfaces of the site, all over the 3D scene, each keeping its text at 4.5:1 or more whatever the scene shows behind it:
- **Platform panel** (wide layout): the home blocks after the hero, `--bg` at 86% with a 6px backdrop blur, a 1px Rule edge, 16px corners, no shadow, about half the window wide on the left or the right (see Layout).
- **Card** (narrow layout): the same surface across the page container, `--bg` at 82% with a 6px blur, 22px 20px padding.
- **Hero backdrop**: a soft block of the page background behind the hero name block (86% blurred 32px on the wide layout, 90% fading out under the block on the narrow one); it has no edge and no shape of its own.
- **Scene tags**: the glass chips of the 3D labels (see Night City 3D).
The footer turns solid `--bg` over the scene.

### Named Rules
**The Flat-at-Rest Rule.** Panels, sheets, rows and buttons are flat with a 1px edge. A shadow appears only on something that floats over content, is soft and black, and is removed in print.

## Shapes

The form language is the map's own: circles are stops, capsules are joins, square bars are ends.

- **Circles** (50%): route bullets (28px, 20px small, r10 on maps), station rings (3px stroke in the line colour, filled with the page background; 16px on the route, r7 on maps), the education origin ring (18px, text colour), status dots (8px), the "You are here" ring and dot.
- **Capsules** (999px, or rx equal to half the height): interchanges (light fill, 2px ink edge, spanning the parallel tracks they join), technology chips, status and HTTP chips.
- **Square bars** (butt caps): terminal bars across line ends (6px thick, 18px long, 12px at the shared terminus), the 6px band stretches under section signs (40px each; 24×4px on the CV), the 3px current-nav underline.
- **Boxes:** 8px corners for buttons, icon buttons, the CV sheet, palette and filter bar; 12px for the JSON code frame; 16px for the platform panels and phone cards of the full 3D level and the lite scene frame; 4px for inline code, kbd and map-label hit boxes; 6px for palette rows.
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

### Night City 3D (signature, progressive)
The network of the hero map stands again as a miniature city at night in WebGL, seen from a drone through a tilt-shift lens (three.js, `src/scripts/station3d/`, mounted by `Station3D.astro`, its phone layout in `Station3DNarrow.astro`). The metro is built from the same data as the map: `src/data/network.ts` and the desktop map `wideMap`, 10 map units to one scene unit, map y along the scene z. Lines, stations, interchanges, the end, company names and start years all come from the scene model, and the build stops when the map no longer matches the network. The city round it is generated from fixed seeds, the same on every visit, and keeps clear of the lines.
- **City.** A road grid every 6 units, with a boulevard under each viaduct. About 1,700 lots: towers (podium, shaft, sometimes a set-back crown) round a downtown beside the trunk, housing and shophouses lower towards the edge. Facades are drawn in the shader: a grid of windows by kind of building, each lit or dark by chance, warm or cool, a few switching over time, and lit shop fronts at street level. Behind every lit window a room is seen with parallax as the camera moves: back and side walls, a bright ceiling, a darker floor, now and then a piece of furniture, each room its own tint. Roofs carry bitumen, plant and a parapet; towers have a blinking red light, some a crown of white LED (warm, cool or neutral white, never a line colour). The ground shader draws asphalt, pavements, parks, lane markings, pools of street light, the line colour washed under each viaduct, and streams of head and tail lights along the lanes, each led by a small car worked out on the GPU from the same numbers as its trail (body and dark cabin, paint by chance, head and tail lamps), which turns off at the river bank and the edge of its area. Wet asphalt mirrors the nearest lamps as streaks running towards the camera, stronger in the puddles. A river crosses the city just before the end, under line 3 and the trunk, reflecting the towers, with lamps along its banks. Trees line the pavements and fill the parks.
- **Metro.** Concrete viaducts on piers with parapets, an LED strip of the line colour along each edge, and two tracks of steel rails on sleepers. Line 1 rides higher where it crosses line 3, then comes down. A project station is two side platforms with a yellow safety edge under a floating canopy with strips of light. An interchange is a gate of light across the parallel tracks; a hub that every line passes is a wide canopy over all three; the crossing is a round tower with a ring of light. "Now" is a glass vault with lit ribs over the ends of the three lines, on a concourse with a warm glass front.
- **Trains.** Two trains of four cars a line, one on each track, shuttling between the portal at the start of the line and "Now" and stopping at every station and hub. Silver cars, a band of warm lit windows, a stripe of the line colour, white lamps at the leading end, red at the trailing end, a soft beam on the deck ahead. Close up: a raked windscreen with a faint cab light and a destination sign in the line colour at each end, door seams down both sides and two air-conditioning units on each roof. Cars behind the portal are hidden, so a train slides out of it car by car.
- **The light layer.** A ring of swirling light at the start of each line. Above it, on a cone of light and facing the camera, a hologram of the company name (Barlow Condensed 700, uppercase) and "Line n · since year" (mono). Streams of light in the line colour run along each line towards "Now". At "Now", a beam into the sky, three rings of the line colours turning round it, and sparks rising. Over the city, a night sky with stars, a moon with its halo, and moonlit clouds seen only from high up.
- **The city wakes.** During the opening shot a wave spreads from "Now" and the lights come on as it passes: windows, street lamps, trails and cars by distance, then the LED strips, stations and trains, each portal and hologram when the wave reaches it, and last the beam shooting up from the vault with its rings and sparks. Without the opening shot (scrolled, paused, reduced motion) or in the light theme the city is simply lit.
- **Air.** Two thin sheets of mist drift just over the ground, a soft column of light rounds the beam of "Now", and a cone of light hangs under every station canopy (dark theme).
- **Pointing at the scene** (full level, open scene only, never through a panel, card, link or button). Over a project station or a company hologram its line lights up and the others dim, and a glass card names it with "Click to go to this line"; a click scrolls to that line's block, a tap shows the card first and goes on the second. The pointer leans the drone a few degrees. The canvas and the card stay hidden from screen readers; the same content is in the page.
- **Lens.** Multisampling, bloom (strength 0.5, radius 0.38, threshold 0.92), a tilt-shift blur that keeps a band round the look point sharp, a slight colour fringe, vignette and grain, ACES tone mapping. A night HDRI gives glass and water their reflections.
- **Light theme.** The same model at golden hour, switched in place when the theme changes, without rebuilding:
  - Lighting: a low warm sun (#ffd7ad) from the viewer's side, long shadows in a box that follows the look point, a studio environment, Neutral tone mapping, a warm haze and a sky from that haze to clear blue with a glow round the sun, a slight warm grade, no bloom.
  - Surfaces: light walls and blue-grey glass with a few windows faintly lit, grey concrete ground, green parks; cars keep their paint.
  - Gone by day: street lamps, LED crowns, light trails, pools of light, the beam and the night sky.
  - Line colours: the LED strips and train stripes become paint in the line colour; holograms and light streams are drawn over the scene in the line colours of the light theme.
- **Labels.** HTML tags over the scene in the language of the page: small glass chips (page background at 70%, 1px edge, 4px blur, a faint halo that takes the line colour on a station tag, no halo in the light theme) in JetBrains Mono 500 12px; "NOW" is 700 18px; "You are here" has no chip.
  - Which tags show: on the wide layout, project stations, interchanges, "NOW" and "You are here" (the company is the hologram, so line starts have no tag). On the narrow layout, project stations, hubs, "NOW" and "You are here", placed by rank so that none overlaps another or leaves the window. At the lite level, "NOW" and the hubs.
  - Fading: station and interchange tags fade out between 26 and 46 units from the camera, and every tag waits during the opening shot. On the wide layout a tag fades out over the last 24px before a platform panel and is gone, out of reach of the pointer and of Tab, once it touches it.
  - Access: interchange tags are buttons that filter the route exactly as the map links do (hover box, focus ring, inverted while pressed, 44px target). The rest are hidden from screen readers, which read the title and description of the SVG map, still in the page.
- **Camera.** An opening shot of 7.5s comes down from high over the city to the hero shot. After it, each block holds a shot (`data-cam`): hero → the whole network beside the name block; About → the portal and hologram of the current line; each company → the stations of its line; Skills → down the trunk and over its bridge; Contact → over the vault of "Now". The camera eases from shot to shot with damping, climbs a little between two shots, banks slightly into its turns, and drifts like a hovering drone.
  - Wide layout: fov 30. Each shot is framed in the open room beside its panel by a sideways view offset (`frameBeside` in `panels.ts`), stepping back when that room is narrow.
  - Narrow layout held upright (width/height under 0.8): a set of shots of its own looking north along the lines from high in the south, fov 46. The look point is drawn in the middle of the window, except the hero shot at 70% of the height, under the name block. A block with more than 120px of open scene above it holds its shot while that gap is in the middle of the window.
  - Lite level: one shot of the trunk, the bridge and "Now" from high in the south-east, circling slowly.
- **Run levels and layouts.**
  - *Full*: WebGL 2, no reduced motion, no Save-Data, not a weak device (deviceMemory under 4 or fewer than 4 cores), and not marked slow in this session. From 1024px wide it takes the *wide* layout: the canvas fixed behind the whole home page, the blocks after the hero as platform panels (see Layout). Under 1024px it takes the *narrow* layout: the same canvas behind the page, the blocks as glass cards with open scene between them.
  - *Lite*: weak devices, or a session in which the full level stayed too slow. The canvas sits only in the hero map box (square under 1024px), in a frame with 16px corners and a 1px rule.
  - *Off* (no script, no WebGL 2, reduced motion, Save-Data): the page exactly as without the scene; three.js and the textures are never fetched.
  - The level is set before the blocks are drawn, so nothing shifts when the scene arrives; a window resized across 1024px restarts the scene in the other layout.
- **Loading and cost.**
  - Loading: three.js is a chunk of its own, fetched after the load event once the browser is idle, followed by the textures and the HDRI (about 1MB, CC0 from Poly Haven, in `public/scene/city/`). A failed fetch falls back to off. The canvas fades in once its first frame is drawn.
  - Resolution: the pixel ratio starts at the lower of the device ratio and 1.25 (1.5 at the lite level) and steps down by 0.15 while frames take longer than 24ms, to 0.7 on the wide layout and 0.6 on the narrow one. If frames still take longer than 45ms on average over 4s at that floor, the page drops to lite and remembers it for the session.
  - Quality by layout: multisampling ×4 wide, ×2 narrow and lite. The river mirror renders at half the canvas size wide and 0.3 of the device size narrow; the lite level uses plain glossy water. Sun shadows are 2048 wide and 1024 otherwise.
  - When it draws: only while the scene can be seen (tab visible, page view rather than the JSON view, and at the lite level the hero map on screen). The pause button stops the trains and every motion of the scene, which then redraws only on scroll, resize or theme change. Leaving the page frees the GPU, and printing leaves the scene out, with the maps.

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
- **Do** keep the 3D city a progressive layer: its metro built from the same data and line tokens as the SVG map, fetched only after load, drawn only while it is seen, falling back to lite on weak or slow devices, and leaving the page exactly as it is at the off level.

### Don't:
- **Don't** use gradients, frosted glass, backdrop blur, coloured shadows, blobs, noise or a square background grid; the dot grid is the only texture. The surfaces of the full 3D level (platform panels, phone cards, the hero backdrop and the scene tags) are the only translucent, blurred ones.
- **Don't** put a glow on text, buttons, cards or the neutral diagrams, or anywhere in the light theme or in print; inside the 3D scene only its own lights and the faint halo of its tags glow.
- **Don't** put a kicker or eyebrow label above a heading, number sections (01–04), or use comment-style labels such as `// about`.
- **Don't** set names, titles, running text or company names in mono; mono is for data and code.
- **Don't** add another hue or use a line colour for something that is not its line: actions are ink, status is green or red, unowned diagrams are neutral grey.
- **Don't** add scroll reveals, count-ups, typing effects or looping decoration; content is visible on load. The packet loop and the 3D city (trains, traffic, streams, the beam, the drone's drift), all stopped by the pause button and absent under reduced motion, stay the only ambient motion.
- **Don't** nest cards inside cards or box content that reads as a list; use rules and bands.
- **Don't** draw a track segment at any angle other than 0°, 45° or 90°, or label a map relationship the data does not contain.
