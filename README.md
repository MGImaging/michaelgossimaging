# Michael Goss Imaging — Web design and AI automation

Marketing website for **Michael Goss Imaging (MGI)**. The studio offers web design and AI automation. Built with **Vite** and **Tailwind CSS v4**.

## Business positioning

Michael Goss designs the work, directs AI-assisted development, and tests the result. The site does not offer landscape or pool rendering. Logo options live in `design/logo-options/` and are not part of the deployed site.

## Features

- Responsive single-page marketing site
- Animated Nodes logo in the header and hero, with a static fallback when motion or JavaScript is off
- Project screenshots of Spaces Media, BotScoreboard, and the portfolio
- Website price of $1,000 one-time, and a custom quote for AI automation
- Hero, work, process, pricing, about, and contact sections
- Mobile navigation and sticky header
- Quote request form (opens the visitor’s email client via `mailto:`)
- Ink and paper palette with one blue accent
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
