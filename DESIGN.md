---
name: Transit Network Portfolio
description: A backend career drawn as a schematic night transit map, with lines, stations and interchanges computed from the experience data.
colors:
  bg: "#0a1120"
  surface: "#101a2c"
  surface-2: "#152238"
  text: "#eef2f8"
  muted: "#a7b3c6"
  faint: "#8592a8"
  border: "#25344d"
  border-strong: "#3a4d6d"
  line-1: "#22c08f"
  line-2: "#4d86ff"
  line-3: "#f5b13d"
  on-line: "#0a1120"
  interchange-fill: "#eef2f8"
  interchange-stroke: "#0a1120"
  danger: "#ff8574"
  scrim: "#02050bb3"
  bg-light: "#f6f8fb"
  surface-light: "#ffffff"
  surface-2-light: "#eef2f7"
  text-light: "#0e1626"
  muted-light: "#46546a"
  faint-light: "#5b6779"
  border-light: "#d5dce7"
  border-strong-light: "#9aa7ba"
  line-1-light: "#0b7a57"
  line-2-light: "#2453c8"
  line-3-light: "#946000"
  on-line-light: "#ffffff"
  danger-light: "#b42318"
  scrim-light: "#0e162666"
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
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1
  label:
    fontFamily: "Barlow, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.08em"
  map-sign:
    fontFamily: "Barlow Condensed, Arial Narrow, Barlow, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  mono:
    fontFamily: "JetBrains Mono Variable, JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
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
    backgroundColor: "{colors.line-3}"
    textColor: "{colors.on-line}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "#f4bb59"
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
    textColor: "{colors.on-line}"
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
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
---

# Design System: Transit Network Portfolio

## Overview

**Creative North Star: "The Night Network Map"**

The site is drawn as a schematic transit map at night. A career is a network: each employer is a coloured line, numbered by start date; each project is a station on its line; every technology used at two employers or more is an interchange where their lines meet, and all lines converge on a shared terminus labelled "Now". These relationships are computed from the experience data, and the build stops when a hand-placed map no longer matches that data, so the drawing is a record, not an illustration. Map language (lines, stations, end bars, legend, "not to scale") reaches every block, from the route of the experience section to the CV sheet and the 404 page.

The material is flat navy with 1px rules. Colour is scarce and semantic: three line colours, each owned by one job, with the current line doubling as the interface accent. Type is split into signs and text: condensed capitals for the name, section signs and station labels; a plain sans for anything a person reads; mono only for code. Density is moderate and reading-first: a recruiter must find role, stack and contact without decoding the map, and every map has a plain equivalent (accessible SVG title and description, the route list, the interchange table).

Motion is one quiet loop: small data packets running along the hero map's lines, paused off screen, paused by a button, and absent under reduced motion. The world rejects the generic dark developer portfolio: no gradient name, frosted stat tiles, comment-style labels, numbered sections, glows or blobs.

**Key Characteristics:**
- Three line colours are the only hues; the current line (line 3) is the accent.
- Tracks run only horizontally, vertically or at 45°, with rounded bends and square end bars.
- Stations are rings on the page background; interchanges are light capsules with an ink edge.
- Barlow Condensed for signs, Barlow for text, JetBrains Mono for code only.
- Flat surfaces with 1px edges; soft black shadow only on layers that float over content.
- Dark is the default theme; light is an explicit visitor choice; print is pure black on white.

## Colors

A flat night palette of blue-grey neutrals carrying three saturated line colours, each tuned to keep ink or white text legible on it.

### Primary
- **Turmeric Line 3** (#f5b13d dark / #946000 light): the line of the current job and the interface accent (`--accent`, `--btn-bg`, `--progress`). Fills the primary button, the header brand mark and route bullet 3; colours links, the current nav underline (3px), the station ring of the selected palette row, the palette input underline, `::selection`, `caret-color` and `accent-color`. Focus-scene diagrams are drawn in it because they describe current work.

### Secondary
- **Cobalt Line 2** (#4d86ff dark / #2453c8 light): the second job's track, stations, route bullet and band stretch. It carries no interface role.
- **Jade Line 1** (#22c08f dark / #0b7a57 light): the first job's track, stations, route bullet and band stretch; also the "ok" status (`--ok`) and JSON string values.

### Tertiary
- **Signal Coral** (#ff8574 dark / #b42318 light): `--danger`, the only hue outside the lines, reserved for error states (failed status chip, error dot, danger button). Never decorative.

### Neutral
- **Night Navy** (#0a1120 / light #f6f8fb): page background (`--bg`), header background, station ring fill, and `--on-line` ink in the dark theme.
- **Map Panel** (#101a2c / light #ffffff): `--surface`, solid panels: CV sheet, command palette, filter bar, JSON body, mobile menu panel.
- **Raised Panel** (#152238 / light #eef2f7): `--surface-2`, hover fill for rows and map labels, selected palette row, code and kbd backgrounds, frame header bar.
- **Signal White** (#eef2f8 / light #0e1626): `--text`; also `--focus` and, in dark, the interchange capsule fill (`--interchange-fill`; white in light).
- **Platform Grey** (#a7b3c6 / light #46546a): `--muted`, secondary text, periods, roles, inactive nav links, the "planned" status.
- **Tunnel Grey** (#8592a8 / light #5b6779): `--faint`, tertiary text (legend scale note, footer note, placeholders, dash bullets); still at least 5:1 on every surface.
- **Rule Blue** (#25344d / light #d5dce7): `--border`, 1px rules between bands, rows and sheet sections.
- **Edge Blue** (#3a4d6d / light #9aa7ba): `--border-strong`, edges of controls (secondary button, chips, icon buttons), the scrollbar thumb.
- **Scrim** (#02050bb3 / light #0e162666): behind the command palette and the mobile menu.

**Themes.** Dark is the default whatever the OS preference; light applies only when the visitor picks it (`html[data-theme='light']`, remembered in local storage). The light theme swaps every token above for its light value; text on a line colour flips from ink to white so all three bullets keep at least 4.5:1. Print overrides every token to black or white, removes all shadows, and drops colour fills.

### Named Rules
**The Three Lines Rule.** The line colours are the only hues on the page, and each belongs to one job in start order (line 1 = first job). A line colour may appear only where that line is meant (track, station, bullet, band stretch, its chip dots) or, for line 3, as the accent. Status colours reuse lines (ok = line 1, in progress = line 3); only danger adds a hue.

**The Ink-on-Line Rule.** Text on a line colour is always `--on-line`: ink #0a1120 in dark, white in light. Body text never takes a line colour unless it passes 4.5:1 on its surface (JSON tokens are set on the solid surface for that reason).

**The Flat Night Rule.** No gradients, frosted glass, backdrop blur, glows or coloured shadows. The older tokens (`--grad`, `--glass`, `--glow*`, `--hero-glow*`, `--grad-rail`, `--accent-2/3`) resolve to a flat colour, transparent or none; they must never be re-inflated.

## Typography

**Display Font:** Barlow Condensed 600/700 (with Arial Narrow, Barlow, system-ui)
**Body Font:** Barlow 400/500/600 (with system-ui, -apple-system, Segoe UI, Roboto, Arial)
**Label/Mono Font:** JetBrains Mono Variable (with ui-monospace, SFMono-Regular, Menlo, Consolas), code only

**Character:** Condensed capitals read as station signage: tall, compact, confident at large sizes. Barlow, from the same family, keeps running text calm and legible, so signs and text feel related without competing. All three faces are self-hosted with Latin, Latin Extended and Vietnamese subsets.

### Hierarchy
- **Display** (Condensed 700, clamp(2.75rem, min(7vw, 17cqi), 6rem), line-height 0.98, -0.01em): the hero name only, solid text colour, sized against its own column so it holds two lines beside the map.
- **Page title** (Condensed 700, h1 default clamp(2.5rem, 6vw, 4rem), line-height 1): secondary page titles; the CV name is clamp(2.25rem, 1.75rem + 2.5vw, 3.25rem) and the 404 title clamp(2.25rem, 5.5vw, 3.5rem).
- **Headline / section sign** (Condensed 700, clamp(2rem, 5vw, 2.75rem), line-height 1.05, 0.01em, uppercase): every h2 section head, the terminus sign.
- **Headline small** (Condensed 700, clamp(1.5rem, 1.25rem + 1vw, 1.875rem), line-height 1.15, uppercase): sub-signs inside a block, and CV section signs at line-height 1.05; the mobile menu links use the same face at 600 1.375rem.
- **Title** (Barlow 600, clamp(1.25rem, 1.1rem + 0.5vw, 1.4rem), line-height 1.3): h3 and band titles. Company station names are Barlow 600 1.375rem / 1.2; project station names 1.125rem / 1.4.
- **Body** (Barlow 400, 1.0625rem, line-height 1.6): running text; measure 70ch for intros and summaries, 65ch for the about text, 60ch for the tagline and band text, 46ch for the contact sentence.
- **Body small** (Barlow 400 to 600, 0.9375rem): periods, points, legend entries, nav links (500), palette rows.
- **Label** (Barlow 600, 0.75rem, 0.08em, uppercase): palette group labels. Table group titles use Condensed 600 0.9375rem, 0.08em, uppercase, muted.
- **Map signs** (Condensed, sizes in viewBox units so they scale with the map): station labels 600 14px, hub interchanges 700 16px, line starts 700 15px with the start year in Barlow 500 13px, "NOW" 700 22px at 0.04em, route numerals 700 13px; diagram labels 600 16px on phones and 13px from 640px.
- **Mono** (JetBrains Mono, 12.5px / 1.7, 13px from 640px): JSON body, request bar, palette target paths, HTTP status chip (600 12.5px).

### Named Rules
**The Sign Face Rule.** Barlow Condensed is for signs only: the name, section signs (uppercase), station and line names on maps, route numerals, the "Now" sign. Body headings from h3 down, UI controls and running text stay in Barlow.

**The Code-Only Mono Rule.** Mono marks code and nothing else: no mono dates, company names, labels or footers.

**The Tabular Figures Rule.** Dates, periods, years, counts and kbd keys use `font-variant-numeric: tabular-nums`. Headings use `text-wrap: balance`, paragraphs `text-wrap: pretty`.

## Layout

One centred container (max 1120px) with 20px gutters on phones and 24px from 640px. Blocks sit on a fixed rhythm: section padding 32px top and bottom on phones (64px between blocks), 56px from 640px (112px between); the last block adds room before the footer (64px, 96px from 640px). A section head leaves 32px before its content. The sticky header is 64px high and anchors scroll with 16px of extra padding under it.

Breakpoints: 640px (tablet layout, wider gutters and padding), 960px (full header nav replaces the menu), 1024px (full map, three-column table, alternating bands). The 404 page alone splits its two languages side by side from 720px.

- **Hero.** Phone: name, role line, tagline, buttons, then the compact map (at most 440px) directly under the buttons. 640–1023px: text column plus a compact-map column of clamp(280px, 42%, 400px), tops aligned. From 1024px the wide map spans the whole container and the 400px text block sits over its top-left corner, which the map leaves empty by design.
- **Route (experience).** A single vertical rail: the track centre is 14px from the left edge and text starts at 44px (56px from 640px). Each employer is a 6px stretch of its line colour; the current stretch starts at a 28×6px "Now" end bar.
- **Bands (focus areas).** Full-width rows between 1px rules, not cards: title, diagram, text on phones; from 1024px the diagram takes one half (up to 480px) and title and text the other, swapping sides each band.
- **Interchange table.** Ruled rows in CSS columns: one column on phones, two from 640px, three from 1024px; a group never splits.
- **CV.** An 800px sheet; a printed A4 page at 15mm margins.
- **Map geometry.** Wide map viewBox 960×560, compact map 320×270. Parallel tracks are 12px apart; every segment is horizontal, vertical or 45° (the build throws otherwise).

**The 45-Degree Rule.** Every track, on any map or diagram, bends only at 45° or 90°. Parallel lines keep a constant 12px gap and converge in route order.

## Elevation & Depth

Flat and tonal. Depth comes from three steps of navy (background, surface, raised surface) separated by 1px rules, never from light. Within a map, depth is drawing order: tracks, then packets, then end bars, stations, interchange capsules, and labels on top. Two soft black shadows exist, both for layers that float over content.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4)`; 0.12 in light): the sticky filter status bar, the mobile menu panel, the skip link.
- **Dialog** (`box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5)`; 0.18 in light): the command palette.

### Named Rules
**The Flat-at-Rest Rule.** Panels, sheets, rows and buttons are flat with a 1px edge. A shadow appears only on something that floats over content, is soft and black, and is removed in print.

## Shapes

The form language is the map's own: circles are stops, capsules are joins, square bars are ends.

- **Circles** (50%): route bullets (28px, 20px small, r10 on maps), station rings (3px stroke in the line colour, filled with the page background; 16px on the route, r7 on maps), the education origin ring (18px, text colour), status dots (8px), the "You are here" ring and dot.
- **Capsules** (999px, or rx equal to half the height): interchanges (light fill, 2px ink edge, spanning the parallel tracks they join), technology chips, status and HTTP chips.
- **Square bars** (butt caps): terminal bars across line ends (6px thick, 18px long, 12px at the shared terminus), the 6px band stretches under section signs (40px each; 24×4px on the CV), the 3px current-nav underline.
- **Boxes:** 8px corners for buttons, icon buttons, the CV sheet, palette and filter bar; 12px for the JSON code frame; 4px for inline code, kbd and map-label hit boxes; 6px for palette rows.
- **Tracks:** 7px strokes on SVG maps (6px on HTML rails), round joins at bends, butt ends; an unbuilt section is dashed 10/8.

## Components

### Buttons
Solid, compact and plain; a button is a sign, not a gem.
- **Shape:** gently squared (8px), at least 44px high (48px for hero, contact and 404 calls to action), 20px side padding (22–24px when large), 8px icon gap with 16px icons.
- **Primary:** Turmeric Line 3 fill with ink text in dark, white text in light; Barlow 600 1rem.
- **Hover / Focus:** hover mixes 15% of the text colour into the fill (`color-mix(in srgb, var(--btn-bg) 85%, var(--text))`); 150ms ease-out colour transitions; focus is the global 2px text-colour outline at 3px offset.
- **Secondary:** transparent with a 1px Edge Blue border and text colour; hover turns the border to text colour.
- **Danger:** coral text and border on a 12% coral tint; hover fills coral with background-coloured text.
- **Disabled:** raised panel fill, faint text, plain border, not-allowed cursor.
- **Text link:** muted Barlow 0.9375rem, 44px high, turns to text colour on hover; LinkedIn and GitHub sit beside the hero buttons as text links.
- **Icon button:** 36px (44px large) square with 8px corners and an Edge Blue border, muted icon; hover lifts icon to text colour and border to muted.

### Chips
- **Technology chip (route):** a 32px Barlow 500 0.875rem capsule with an Edge Blue border, extended to a 44px touch target by an invisible `::after`. When the technology is an interchange, small 8px dots in the colours of the lines through it precede the name, in route order. A button that filters the route.
- **State:** hover shows a text-colour border; pressed inverts (text-colour fill, background-colour text). Chips past the sixth wait behind a dashed "+n" chip.
- **Status chip (JSON view):** 32px mono capsule; ok, warn and fail tint border, text and a 12% fill with jade, turmeric or coral.

### Cards / Containers
- **Corner Style:** 8px; the JSON frame 12px.
- **Background:** Map Panel (`--surface`) on Night Navy; raised panel for a frame's header bar.
- **Shadow Strategy:** none at rest (see Elevation & Depth).
- **Border:** 1px Rule Blue; Edge Blue for the code frame and floating bars.
- **Internal Padding:** CV sheet 24px 18px 28px on phones, 40px 48px 44px from 640px.
- Prefer ruled rows and bands to boxes: the focus areas, the interchange table, and route stops have no card around them.

### Inputs / Fields
- **Style:** the command palette field is borderless and transparent in a 56px row under a 1px rule, 16px text, faint placeholder.
- **Focus:** the row gains a 2px inset Turmeric underline (`inset 0 -2px 0 var(--accent)`), which replaces the field's outline.

### Navigation
- **Header:** sticky, solid page background, 1px bottom rule, 64px. Left: the brand mark (a 28px Turmeric route bullet with initials in the sign face) and the name in Barlow 600. Centre from 960px: links in Barlow 500 0.9375rem, muted, 44px high; hover and current turn to text colour, and the current section carries a 3px Turmeric underline inset 12px. Right: palette key chip (⌘K on Mac, Ctrl K elsewhere), language chip, theme icon button.
- **Mobile menu:** a 44px menu button opens a panel on the surface colour with a float shadow and scrim; links are Condensed 600 1.375rem uppercase rows of 52px between rules, hover in Turmeric; no item numbers.
- **Footer:** a map legend: small route bullets with each employer, the "Diagram not to scale" note in faint text, then the JSON profile link, icon buttons, a no-tracking note and copyright; right-aligned from 640px.

### Network Map (signature)
The hero drawing, built only from four parts: **Track** (7px line-colour stroke, round joins), **Station** (ring on the background), **Interchange** (light capsule with 2px ink edge spanning 1–3 parallel tracks, or a round stop where two lines cross at right angles), **Terminal** (square end bar). Line starts show a route bullet, the employer name and start year; hubs every line passes through get larger labels; all lines end at a shared "NOW" terminus with a "You are here" mark. Interchange labels are a second overlaid SVG of real links that filter the route; a 4px-cornered box fills on hover, outlines on focus and inverts while pressed. On phones and tablets a compact map shows only line starts, hubs and the terminus.

Motion: one data packet per line, a 4px round dot in the interchange-fill colour drawn as a dash on a 100-unit path, running linearly at about 80 units a second (kept to 8–14s a run), each line offset by a share of its run so they never move together. Packets show only with the script, run only while the map is on screen and the tab visible, stop with the 44px pause button in the map's corner, and are removed with the button under reduced motion.

### Route (signature)
The experience section as one line diagram: each employer is a 6px stretch of its colour with a 28px route bullet sitting on the track, the employer name (Barlow 600), role and period. Projects are 16px station rings on the stretch with name, summary, two points and a "Show n more" fold, and technology chips. The route ends at the education origin ring. While a filter is on, matching stations fill their ring with the line colour, others fade to 45% opacity, and a sticky status bar ("Passing through: …" with a project count and a Clear button) floats under the header.

### Interchange Table (signature)
Skills as a ruled table grouped under condensed caps titles. Each row is at least 44px on three columns: name, one 20px slot per line (route bullet or empty, so a line keeps its column), and the project count in muted tabular figures. Rows with projects are buttons: raised-panel hover, pressed inverts like the chips.

### Section Sign
An uppercase condensed headline with, 12px below, a band of 6px stretches (40px each) in the colours of the lines the section concerns, in route order. No label above, no number, no outline numerals. The contact block replaces the band with the lines arriving from the left and stopping at end bars against the word "Terminus".

### JSON View
The profile as an API response, opened in place of the home blocks: a request bar in mono (Turmeric method chip, path, jade "200 OK" status chip, type and size) over a 12px-cornered frame with a numbered, syntax-coloured body (keys Turmeric, strings Jade, numbers Turmeric, punctuation muted). On opening, lines arrive one after another (fade and 4px rise, 140ms each on the standard ease `cubic-bezier(0.22, 0.61, 0.36, 1)`), staggered by at most 30ms so the last line starts within 450ms whatever the length; only without a reduced-motion preference.

### CV Sheet and Print
On screen: one flat surface sheet with a 1px edge, solid-colour name, condensed section signs over a thin band of line colours that runs on as a hairline, route bullets beside employer names, and projects as rings on a 3px track in the line colour. The print button is outlined on phones and solid Turmeric from 640px. In print: A4 portrait, 15mm margins, 10pt / 1.4 body, 20pt name, section signs become 10.5pt Barlow caps over a 0.75pt black rule, route bullets become black rings with no fill, tracks and rings are dropped, bullets print as text dashes, skills print as plain text, jobs, projects and the skills list avoid page breaks, and everything marked no-print (header, footer, maps, diagrams, filter bar, toolbar, colour bands) disappears. The sheet must fit two pages in black and white.

### 404
"This station is not on the map": a short stretch of the current line with two stations runs into a dashed unbuilt section ending at a large ring with a question mark; the code sits in muted condensed figures above an English title with the Vietnamese one under it in muted text; each language gets its own primary "home" and secondary "CV" buttons.

## Do's and Don'ts

### Do:
- **Do** draw every new diagram with the map parts (Track, Station, Interchange, Terminal) and the 45-Degree Rule: 7px tracks, 3px station rings on the page background, capsules with a 2px ink edge, square end bars.
- **Do** take a line's colour from its route number (`--line-1`, `--line-2`, `--line-3`), and derive any new interchange or relationship from the experience data, never by hand.
- **Do** put `--on-line` text on any line-colour fill, and check every new text pair for 4.5:1 in both themes (3:1 for large text).
- **Do** open each home block with the section sign: condensed uppercase headline and the 6px band of related line colours.
- **Do** keep touch targets at least 44px, extending a smaller visual (32px chip) with an invisible `::after` rather than enlarging it.
- **Do** keep interaction feedback to colour and border changes at 150ms ease-out, with the 2px text-colour focus outline at 3px offset; a pressed filter control inverts to text-colour fill.
- **Do** keep dark as the default theme regardless of OS preference, and give every block a black-on-white print state.
- **Do** use Barlow at 400, 500 and 600 only; 700 belongs to the condensed face.

### Don't:
- **Don't** use gradients, frosted glass, backdrop blur, glows, coloured shadows, blobs, noise or background grids.
- **Don't** put a kicker or eyebrow label above a heading, number sections (01–04), or use comment-style labels such as `// about`.
- **Don't** set dates, names, labels or footers in mono; mono is for code.
- **Don't** add a fourth accent hue or use a line colour for something that is not its line (line 3 as accent excepted).
- **Don't** add scroll reveals, count-ups, typing effects or looping decoration; content is visible on load, and the packet loop stays the only ambient motion.
- **Don't** nest cards inside cards or box content that reads as a list; use rules and bands.
- **Don't** draw a track segment at any angle other than 0°, 45° or 90°, or label a map relationship the data does not contain.
