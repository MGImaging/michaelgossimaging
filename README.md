# Michael Goss Imaging — Exterior 3D Landscape Rendering

Marketing website for **Michael Goss Imaging (MGI)**, an exterior-only 3D landscape rendering and outdoor living visualization studio. Built with **Vite** and **Tailwind CSS v4**.

## Business positioning

MGI creates exterior 3D stills and walkthroughs for pools, patios, hardscape, and outdoor living—for homeowners, pool builders, hardscape contractors, and builders. This is visualization work, not landscape architecture or design-build.

## Features

- Responsive single-page marketing site
- Brand logo and hero banner from `public/images/`
- Hero, services, pricing, process, projects, about, and contact sections
- Mobile navigation and sticky header
- Quote request form (opens the visitor’s email client via `mailto:`)
- Custom forest / sand / moss brand palette
- SEO package: meta/Open Graph/Twitter tags, JSON-LD schema, `robots.txt`, `sitemap.xml`
- GitHub Pages deploy workflow + custom domain support

## Getting started

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`).

## Scripts

| Command           | Description                |
| ----------------- | -------------------------- |
| `npm run dev`     | Start Vite dev server      |
| `npm run build`   | Production build to `dist` |
| `npm run preview` | Preview the production build |

## Deploy (GitHub Pages + GoDaddy domain)

This project is set up for **GitHub Pages** with the custom domain **michaelgossimaging.com**.

### 1. Create a GitHub repo and push

```bash
git init
git add .
git commit -m "Initial Michael Goss Imaging site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Repo → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually)
4. Wait for the workflow to finish (**Actions** tab)

### 3. Point GoDaddy DNS to GitHub Pages

In GoDaddy → your domain → **DNS**:

**A records** for `@` (root domain):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `185.199.108.153` | 600 |
| A | @ | `185.199.109.153` | 600 |
| A | @ | `185.199.110.153` | 600 |
| A | @ | `185.199.111.153` | 600 |

**CNAME** for `www` (recommended):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | `YOUR_USERNAME.github.io` | 600 |

Replace `YOUR_USERNAME` with your GitHub username.

Also in GitHub → **Settings** → **Pages** → **Custom domain**:

1. Enter `michaelgossimaging.com`
2. Save
3. Enable **Enforce HTTPS** once DNS checks pass (can take minutes to hours)

`public/CNAME` already contains `michaelgossimaging.com` so deploys keep the custom domain.

### 4. After go-live

- Visit `https://michaelgossimaging.com`
- Submit `https://michaelgossimaging.com/sitemap.xml` in Google Search Console

## Customize

- Update business copy, phone, email, and location in `index.html`
- Replace project images under `public/images/projects/` as needed
- Adjust brand colors and fonts in `src/style.css` (`@theme` block)
- Contact form subject/body language lives in `src/main.js`

## SEO notes

Canonical, Open Graph, Twitter, schema, robots, and sitemap use:

`https://michaelgossimaging.com/`

## Stack

- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- Vanilla HTML & JavaScript
