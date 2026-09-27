// Builds the static site from content.json into dist/.
// Usage: node build.mjs

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, "dist");
const content = JSON.parse(readFileSync(join(ROOT, "content.json"), "utf8"));
const SITE_URL = content.siteUrl.replace(/\/$/, "");
const PLACEHOLDER_RATIOS = ["3 / 2", "2 / 3", "3 / 2", "4 / 5", "3 / 2", "1 / 1", "2 / 3", "3 / 2", "16 / 9"];

const warnings = [];
const pages = [];

const galleries = content.sections.flatMap(section => section.galleries.map(gallery => ({ ...gallery, section })));

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, "static"), DIST, { recursive: true });
if (existsSync(join(ROOT, "images"))) cpSync(join(ROOT, "images"), join(DIST, "images"), { recursive: true });

checkContent();

writePage({ path: "/", title: `${content.name}, Photographer`, description: homeDescription(), navKey: null, isHome: true, body: renderHome() });
for (const section of content.sections) {
  writePage({ path: `/${section.slug}/`, title: `${section.title} | ${content.name}`, description: section.description, navKey: section.slug, body: renderSection(section) });
}
galleries.forEach((gallery, index) => {
  writePage({
    path: `/${gallery.section.slug}/${gallery.slug}/`,
    title: `${gallery.title} | ${content.name}`,
    description: gallery.description,
    navKey: gallery.section.slug,
    ogImage: gallery.photos[0] ? `/${gallery.photos[0].src}` : undefined,
    body: renderGallery(gallery, galleries[index - 1], galleries[index + 1])
  });
});
writePage({ path: "/about/", title: `About | ${content.name}`, description: `About ${content.name}, photographer.`, navKey: "about", body: renderAbout() });
writePage({ path: "/contact/", title: `Contact | ${content.name}`, description: `Contact ${content.name} about commissions, licensing and publication.`, navKey: "contact", body: renderContact() });
writePage({ path: "/404.html", title: `Page not found | ${content.name}`, description: "This page doesn't exist.", navKey: null, isNotFound: true, body: renderNotFound() });

writeFileSync(join(DIST, "sitemap.xml"), renderSitemap());
writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

process.stdout.write(`Built ${pages.length} pages into dist/\n`);
if (warnings.length) process.stdout.write(`\nBefore launch:\n${warnings.map(w => `  - ${w}`).join("\n")}\n`);

function checkContent() {
  if (!content.email) warnings.push("Add James's email to content.json (shown on the contact page and in form errors).");
  if (!content.formEndpoint) warnings.push("Set formEndpoint in content.json, or the contact form can't send.");
  if (!content.bio.length) warnings.push("Add James's bio to content.json.");
  const empty = galleries.filter(g => !g.photos.length).map(g => g.title);
  if (empty.length) warnings.push(`Add photos to: ${empty.join(", ")}.`);
  for (const g of galleries) {
    for (const photo of g.photos) {
      if (!photo.alt) warnings.push(`Missing alt text: ${photo.src}`);
      if (!photo.width || !photo.height) warnings.push(`Missing width/height: ${photo.src}`);
    }
  }
}

function writePage({ path, title, description, navKey, body, ogImage, isHome = false, isNotFound = false }) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${isNotFound ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${SITE_URL}${path}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(content.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE_URL}${isNotFound ? "/" : path}">
<meta property="og:image" content="${SITE_URL}${ogImage || "/og-default.png"}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,400;0,500;1,400&display=swap">
<link rel="stylesheet" href="/site.css">
<script>document.documentElement.classList.add("js")</script>
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
${renderHeader(navKey, isHome)}
<main id="content">
${body}
</main>
<footer class="site-footer">
  <span>© ${new Date().getFullYear()} ${esc(content.name)}</span>
  <span>All photographs are copyright ${esc(content.name)} and may not be reused without permission.</span>
</footer>
<script src="/site.js" defer></script>
</body>
</html>
`;
  const file = path.endsWith(".html") ? join(DIST, path) : join(DIST, path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  pages.push({ path, isNotFound });
}

function renderHeader(navKey, isHome) {
  const items = [...content.sections.map(s => [s.slug, s.title]), ["about", "About"], ["contact", "Contact"]];
  const desktop = items.map(([slug, title]) => `<a href="/${slug}/"${slug === navKey ? ' aria-current="page"' : ""}>${esc(title)}</a>`).join("");
  const mobile = content.sections.map(s => `
      <div class="menu-group">
        <a class="menu-section" href="/${s.slug}/"${s.slug === navKey ? ' aria-current="page"' : ""}>${esc(s.title)}</a>
        <div class="menu-subs">${s.galleries.map(g => `<a href="/${s.slug}/${g.slug}/">${esc(g.title)}</a>`).join("")}</div>
      </div>`).join("") + ["about", "contact"].map(slug => `
      <div class="menu-group"><a class="menu-section" href="/${slug}/"${slug === navKey ? ' aria-current="page"' : ""}>${slug === "about" ? "About" : "Contact"}</a></div>`).join("");
  const name = isHome ? `<h1 class="name">${esc(content.name)}</h1>` : `<a class="name" href="/">${esc(content.name)}</a>`;
  return `<header class="site-header">
  <div class="header-row">
    ${name}
    <nav class="nav" aria-label="Main">${desktop}</nav>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
  </div>
  <nav class="menu" id="menu" aria-label="Main" hidden>${mobile}
  </nav>
</header>`;
}

function renderHome() {
  const lead = galleries.find(g => g.photos.length)?.photos[0];
  const leadHtml = lead
    ? `<img src="/${esc(lead.src)}" alt="${esc(lead.alt)}" width="${lead.width}" height="${lead.height}" fetchpriority="high">`
    : placeholder("3 / 2");
  const cards = content.sections.map(section => {
    const cover = section.galleries.find(g => g.photos.length)?.photos[0];
    return `<a class="card" href="/${section.slug}/">
      ${cover ? image(cover, "4 / 5") : placeholder("4 / 5")}
      <h2>${esc(section.title)}</h2>
      <p>${esc(section.galleries.map(g => g.title).join(", "))}</p>
    </a>`;
  }).join("\n");
  return `<div class="wrap">
  <figure class="lead">${leadHtml}</figure>
  <div class="cards cards-sections">${cards}</div>
</div>`;
}

function renderSection(section) {
  const cards = section.galleries.map(g => `<a class="card" href="/${section.slug}/${g.slug}/">
      ${g.photos[0] ? image(g.photos[0], "3 / 2") : placeholder("3 / 2")}
      <h2>${esc(g.title)}</h2>
      <p>${g.photos.length ? `${g.photos.length} photographs` : "Photographs coming soon"}</p>
    </a>`).join("\n");
  return `<div class="wrap">
  <h1 class="page-title">${esc(section.title)}</h1>
  <p class="intro">${esc(section.description)}</p>
  <div class="cards">${cards}</div>
</div>`;
}

function renderGallery(gallery, prev, next) {
  const photos = gallery.photos.length
    ? gallery.photos.map(p => `<figure class="photo">
      <a href="/${esc(p.src)}" data-caption="${esc(p.caption || "")}">${image(p)}</a>
      ${p.caption ? `<figcaption>${esc(p.caption)}</figcaption>` : ""}
    </figure>`).join("\n")
    : PLACEHOLDER_RATIOS.map(r => `<figure class="photo">${placeholder(r)}</figure>`).join("\n");
  const link = g => `/${g.section.slug}/${g.slug}/`;
  return `<div class="wrap">
  <p class="crumb"><a href="/${gallery.section.slug}/">${esc(gallery.section.title)}</a></p>
  <h1 class="page-title">${esc(gallery.title)}</h1>
  <p class="intro">${esc(gallery.description)}</p>
  <div class="photos">${photos}</div>
  <nav class="pager" aria-label="Other galleries">
    ${prev ? `<a href="${link(prev)}">← ${esc(prev.title)}</a>` : "<span></span>"}
    ${next ? `<a href="${link(next)}">${esc(next.title)} →</a>` : "<span></span>"}
  </nav>
</div>`;
}

function renderAbout() {
  const bio = content.bio.length
    ? content.bio.map(p => `<p>${esc(p)}</p>`).join("\n")
    : `<p class="muted">Biography coming soon.</p>`;
  return `<div class="wrap about">
  ${placeholder("4 / 5")}
  <div class="prose">
    <h1 class="page-title">About</h1>
    ${bio}
  </div>
</div>`;
}

function renderContact() {
  const details = [
    ["Email", content.email && `<span id="email">${esc(content.email)}</span> <button class="text-btn" type="button" data-copy="email">Copy</button>`],
    ["Phone", content.phone && esc(content.phone)],
    ["Instagram", content.instagram && `<a href="https://www.instagram.com/${esc(content.instagram.replace(/^@/, ""))}/" rel="me">${esc(content.instagram)}</a>`]
  ].filter(([, value]) => value).map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
  return `<div class="wrap">
  <h1 class="page-title">Contact</h1>
  <p class="intro">For commissions, licensing or publication, send a message below${content.email ? " or email directly" : ""}.</p>
  <div class="contact">
    <dl class="details">${details}</dl>
    <div>
      <form class="contact-form" action="${esc(content.formEndpoint)}" method="post" data-email="${esc(content.email)}" novalidate>
        <div class="pair">
          <div class="field"><label for="cf-name">Name</label><input id="cf-name" name="name" autocomplete="name" required><p class="err" id="err-name"></p></div>
          <div class="field"><label for="cf-email">Email</label><input id="cf-email" name="email" type="email" autocomplete="email" required><p class="err" id="err-email"></p></div>
        </div>
        <div class="field">
          <label for="cf-topic">About</label>
          <select id="cf-topic" name="topic">
            <option>A commission</option>
            <option>Licensing a photograph</option>
            <option>Press or publication</option>
            <option>Something else</option>
          </select>
        </div>
        <div class="field"><label for="cf-message">Message</label><textarea id="cf-message" name="message" required></textarea><p class="err" id="err-message"></p></div>
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" class="trap" aria-hidden="true">
        <button class="send" type="submit">Send message</button>
        <p class="form-status" role="status" aria-live="polite"></p>
      </form>
    </div>
  </div>
</div>`;
}

function renderNotFound() {
  const links = content.sections.map(s => `<li><a href="/${s.slug}/">${esc(s.title)}</a></li>`).join("");
  return `<div class="wrap narrow">
  <h1 class="page-title">Page not found</h1>
  <p>There's no page at this address. If you followed an old link, the site has been rebuilt and the page may have moved.</p>
  <p>Try one of these instead:</p>
  <ul class="plain-list">${links}<li><a href="/contact/">Contact</a></li></ul>
</div>`;
}

function renderSitemap() {
  const urls = pages.filter(p => !p.isNotFound).map(p => `  <url><loc>${SITE_URL}${p.path}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function homeDescription() {
  const titles = content.sections.map(s => s.title.toLowerCase());
  return `Photographs by ${content.name}: ${titles.slice(0, -1).join(", ")} and ${titles.at(-1)} work.`;
}

function image(photo, cropRatio) {
  const style = cropRatio ? ` style="aspect-ratio:${cropRatio};object-fit:cover"` : "";
  return `<img src="/${esc(photo.src)}" alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async"${style}>`;
}

function placeholder(ratio) {
  return `<div class="ph" style="aspect-ratio:${ratio}" role="img" aria-label="Photograph coming soon"></div>`;
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
