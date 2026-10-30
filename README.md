# Personal portfolio site

Static, bilingual (English at `/`, Vietnamese at `/vi/`) portfolio built with [Astro](https://astro.build). No backend, no trackers, no external fonts.

## Pages

| Path | Content |
|---|---|
| `/` and `/vi/` | Intro with the network map, about and focus areas, projects (when any is shown), experience as a route ending at education, skills as an interchange table, contact |
| `/cv/` and `/vi/cv/` | Printable CV (no phone number or email; "Print or save as PDF") |
| `/resume/` and `/vi/resume/` | Old address: redirects to `/cv/` and `/vi/cv/` (not in the sitemap) |

## Editing content

All text lives in these files:

- `src/data/profile.ts` – name, job title and city of the hero line, tagline, about, links, figures and main technologies, focus areas, skills, experience (start and end months as `MM/YYYY`, an optional short `mapLabel` per project for the map), education, projects. Set a project's `repoUrl` / `demoUrl` once they are public, change `status` to `done` when it is finished, or set `showPlannedProjects = true` to show planned projects. With no project shown, the home page leaves out its Projects block, the Projects nav item and the command palette entry.
- `src/data/hero.ts` – station names of the small route diagrams of the focus areas.
- `src/data/network-layout.ts` – coordinates of the home page network map, desktop and phone. Each company is a line, each project a station, a technology used at two companies or more an interchange (computed from `experience`). The build stops when a station or interchange has no coordinates, when coordinates name one that is no longer in the data, or when a track bends at another angle than 45° or 90°: place it there after changing the experience.
- `src/i18n/ui.ts` – interface labels in both languages.

A project with a `slug`, not `planned`, and a `src/data/case-studies/<slug>.ts` file gets a case study page at `/projects/<slug>/` and `/vi/projects/<slug>/`, rendered by `src/components/CaseStudy.astro`; the build stops when that component is missing. There is none at the moment.

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

`public/og/default-en.png` and `public/og/default-vi.png` (1200×630, shown when a link to the site is shared) and `public/apple-touch-icon.png` (180×180, from `public/favicon.svg`) are made by `scripts/make-images.mjs`, which draws them in headless Chrome with the name, role, location and jobs from `src/data/profile.ts`. Run it again whenever you change those, then commit the images in `public/`:

```bash
SITE_URL=https://<your-domain> npm run images
```

In PowerShell: `$env:SITE_URL="https://<your-domain>"; npm run images`.

- `SITE_URL` gives the domain printed at the bottom of the share images; without it the line is left out.
- The script needs Chrome, Chromium or Edge. If it is not found, set `CHROME_PATH` to the browser executable.
- The image paths are `shareImages` in `src/data/profile.ts`; set them to `null` to drop the `og:image` tags.

## 3D scene assets

The night city behind the home page (`src/scripts/station3d/`) uses textures and an HDRI from [Poly Haven](https://polyhaven.com), all CC0 (public domain), resized to 512px JPEG and kept in `public/scene/city/`: the textures `bitumen`, `concrete_tile_facade`, `asphalt_02`, `concrete_pavement`, `aerial_grass_rock` and `concrete_wall_008`, and the HDRI `modern_buildings_night` (512×256, its brightest points clamped, as `night.hdr`). They are fetched only when the scene runs; with reduced motion, Save-Data or no WebGL 2 the page keeps its SVG map and fetches none of them.

## Deploying

The site is plain static files in `dist/`.

- **GitHub Pages:** push this folder as a repository, enable Pages with source "GitHub Actions", and set repository variables `SITE_URL` (e.g. `https://<user>.github.io` or your domain) and `BASE_PATH` (`/` for a user site or custom domain, `/<repo>` for a project site). `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
- **Cloudflare Pages:** build command `npm run build`, output directory `dist`, environment variables `NODE_VERSION=24` and `SITE_URL=https://<your-domain>`.

## Before publishing

- Check the LinkedIn and GitHub links in `src/data/profile.ts`.
- Keep phone numbers and email addresses out of the public site; the résumé page says contact details are available on request.
- Re-read every sentence about your work: it must be something you can explain in an interview.
