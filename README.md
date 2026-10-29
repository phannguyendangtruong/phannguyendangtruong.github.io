# Personal portfolio site

Static, bilingual (English at `/`, Vietnamese at `/vi/`) portfolio built with [Astro](https://astro.build). No backend, no trackers, no external fonts.

## Pages

| Path | Content |
|---|---|
| `/` and `/vi/` | Intro, about, focus areas, projects (when any is shown), experience, skills, education, contact |
| `/cv/` and `/vi/cv/` | Printable CV (no phone number or email; "Print or save as PDF") |
| `/resume/` and `/vi/resume/` | Old address: redirects to `/cv/` and `/vi/cv/` (not in the sitemap) |

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

## Share images

`public/og/default-en.png` and `public/og/default-vi.png` (1200×630, shown when a link to the site is shared) and `public/apple-touch-icon.png` (180×180, from `public/favicon.svg`) are made by `scripts/make-images.mjs`, which draws them in headless Chrome with the name, role, location and main technologies from `src/data/profile.ts` and the hero diagram from `src/data/hero.ts`. Run it again whenever you change those, then commit the images in `public/`:

```bash
SITE_URL=https://<your-domain> npm run images
```

In PowerShell: `$env:SITE_URL="https://<your-domain>"; npm run images`.

- `SITE_URL` gives the domain printed at the bottom of the share images; without it the line is left out.
- The script needs Chrome, Chromium or Edge. If it is not found, set `CHROME_PATH` to the browser executable.
- The image paths are `shareImages` in `src/data/profile.ts`; set them to `null` to drop the `og:image` tags.

## Deploying

The site is plain static files in `dist/`.

- **GitHub Pages:** push this folder as a repository, enable Pages with source "GitHub Actions", and set repository variables `SITE_URL` (e.g. `https://<user>.github.io` or your domain) and `BASE_PATH` (`/` for a user site or custom domain, `/<repo>` for a project site). `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
- **Cloudflare Pages:** build command `npm run build`, output directory `dist`, environment variables `NODE_VERSION=24` and `SITE_URL=https://<your-domain>`.

## Before publishing

- Check the LinkedIn and GitHub links in `src/data/profile.ts`.
- Keep phone numbers and email addresses out of the public site; the résumé page says contact details are available on request.
- Re-read every sentence about your work: it must be something you can explain in an interview.
