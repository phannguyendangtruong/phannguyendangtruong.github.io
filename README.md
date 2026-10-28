# Personal portfolio site

Static, bilingual (English at `/`, Vietnamese at `/vi/`) portfolio built with [Astro](https://astro.build). No backend, no trackers, no external fonts.

## Pages

| Path | Content |
|---|---|
| `/` and `/vi/` | Intro, about, focus areas, projects (when any is shown), experience, skills, education, contact |
| `/resume/` and `/vi/resume/` | Printable résumé (no phone number or email; "Print or save as PDF") |

## Editing content

All text lives in these files:

- `src/data/profile.ts` – name, tagline, about, links, hero figures and main technologies, focus areas, skills, experience (start and end months as `MM/YYYY`), education, projects. Set a project's `repoUrl` / `demoUrl` once they are public, change `status` to `done` when it is finished, or set `showPlannedProjects = true` to show planned projects. With no project shown, the home page leaves out its Projects block, the Projects nav item and the command palette entry; the hero button then points to the experience block.
- `src/data/hero.ts` – nodes, edges, log lines and frame label of the illustration in the home page hero, labels of the small diagrams on the focus area cards, and the command line of the contact panel.
- `src/i18n/ui.ts` – interface labels in both languages.

A project with a `slug` gets a case study page at `/projects/<slug>/` only when `src/data/case-studies/<slug>.ts` and `src/components/CaseStudy.astro` exist. There is none at the moment.

## Commands

Requires Node 22.23+.

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run preview
```

`npm run build` runs `astro check` (types) before building into `dist/`. Set `ASTRO_TELEMETRY_DISABLED=1` to turn off Astro's anonymous usage data.

## Deploying

The site is plain static files in `dist/`.

- **GitHub Pages:** push this folder as a repository, enable Pages with source "GitHub Actions", and set repository variables `SITE_URL` (e.g. `https://<user>.github.io` or your domain) and `BASE_PATH` (`/` for a user site or custom domain, `/<repo>` for a project site). `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
- **Cloudflare Pages:** build command `npm run build`, output directory `dist`, environment variables `NODE_VERSION=24` and `SITE_URL=https://<your-domain>`.

## Before publishing

- Check the LinkedIn and GitHub links in `src/data/profile.ts`.
- Keep phone numbers and email addresses out of the public site; the résumé page says contact details are available on request.
- Re-read every sentence about your work: it must be something you can explain in an interview.
