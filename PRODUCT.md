# Product

Personal portfolio and online CV of Phan Nguyen Dang Truong, a Java backend developer in Hanoi.

## Platform

web

## Stack

Astro (static output), TypeScript, plain CSS with design tokens in `src/styles/global.css`. Self-hosted fonts through `@fontsource`. Deployed to GitHub Pages by GitHub Actions. No client framework, no trackers.

## Users

- Recruiters and hiring managers who arrive from a LinkedIn profile or a shared CV link, often on a phone, and skim for role, seniority, stack and contact.
- Tech leads and engineers who read further on desktop to judge the depth of the backend work.
- Vietnamese- and English-speaking readers: every page exists in English (`/`) and Vietnamese (`/vi/`).

## Product Purpose

Show, in seconds, that the owner is a backend engineer who builds systems where data correctness matters (report ingestion, submission and approval workflows, scheduled jobs, messaging, security), and make it easy to reach him on LinkedIn or print the CV.

## Positioning

A developer portfolio that proves rather than claims: the career is drawn as a transit network whose lines, stations and interchanges are computed from the real experience data.

## Operating Context

Read on phones in the LinkedIn in-app browser and on desktop browsers. The CV page must print cleanly to two A4 pages in black and white.

## Capabilities and Constraints

- No project, subsystem, client or agency names and no industry details that reveal who the work was for; describe systems by type and technical work only. Employer names, roles, dates and technologies are shown.
- No email address or phone number anywhere on the site; contact goes through LinkedIn.
- Content and labels live in `src/data/profile.ts` and `src/i18n/ui.ts`, in both languages.
- Features to keep: skill filter on the experience route, command palette (Ctrl/⌘ K), profile as JSON (`#api`, `/api/me.json`), language switch that keeps the anchor, theme switch, printable CV.

## Brand Commitments

- Dark theme is the default (owner's choice); a light theme is available and remembered per visitor.
- No job-seeking status line on the page (owner's choice).

## Evidence on Hand

Real experience data only (three companies, five projects, technology lists). No portrait photo, no case studies and no result numbers yet.

## Product Principles

- Clarity for a recruiter first; the visual world carries the story but never hides role, stack or contact.
- Every relationship drawn on the map must be true to the data.

## Accessibility & Inclusion

WCAG 2.1 AA: text contrast at least 4.5:1 in both themes, touch targets at least 44px, keyboard access and visible focus, skip link, reduced-motion support (the only animation can be paused and stops under `prefers-reduced-motion`).
