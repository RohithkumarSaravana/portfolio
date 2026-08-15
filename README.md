# Rohithkumar Saravanan — Portfolio

Personal portfolio website for Rohithkumar Saravanan, AI &amp; Machine Learning Engineer.

Live site: https://rohithkumarsaravana.github.io/portfolio/

## Preview

Open `index.html` directly in a browser, or serve it locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project structure

```
index.html               Main page
robots.txt, sitemap.xml  SEO
Rohithkumar_Resume.pdf   Resume (viewable + downloadable from the site)
assets/
  css/style.css          All custom styles
  js/main.js             All interactivity (nav, scroll reveal, tilt, GSAP)
  certificates/          Certificate PDFs, linked from Experience/Certifications/Achievements
  *.png, *.jpg           Profile, project, and skill images
```

## Stack

Static HTML/CSS/JS — no framework, no build step. Styled with Tailwind CSS (CDN) plus a
custom design-system layer in `assets/css/style.css`. Scroll/entrance animation via GSAP +
ScrollTrigger, with a plain `IntersectionObserver`-based reveal system (with a scroll-position
safety net so content never gets stuck hidden on a fast scroll).

## Updating content

- **Certifications**: add a card in the relevant group inside the `#certifications` section of
  `index.html`, and drop the certificate PDF into `assets/certificates/`.
- **Projects**: add a card inside the `#projects` grid; project images live in `assets/`.
- Keep image files reasonably compressed before adding them — large certificate/project images
  were resized and compressed during the 2026 redesign to keep the site fast.
