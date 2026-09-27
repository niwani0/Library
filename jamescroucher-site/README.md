# jamescroucher.com

Static portfolio site. All content lives in `content.json`; `node build.mjs` writes the finished site to `dist/`. No dependencies beyond Node 18+.

## Adding photos

1. Put images in `images/<gallery-slug>/`, e.g. `images/prime-ministers/01.jpg`. Export at about 2400px on the long edge, JPEG quality ~80.
2. List each one in that gallery's `photos` in `content.json`. The first photo becomes the gallery cover and its social preview image:

```json
{ "src": "images/prime-ministers/01.jpg", "alt": "What the photo shows, for screen readers and search", "caption": "Optional caption", "width": 2400, "height": 1600 }
```

3. Run `node build.mjs`. It lists anything still missing (alt text, sizes, empty galleries, contact details).

## Before launch

- Fill in `email`, `bio`, and optionally `phone` and `instagram` in `content.json`.
- Create a form endpoint (Formspree, or the host's own forms) and put its URL in `formEndpoint`.
- Replace `static/og-default.png` with a 1200×630 crop of James's best photograph.
- Deploy `dist/` to a host that reads `_redirects` and `404.html` (Netlify or Cloudflare Pages), then attach `jamescroucher.com` to it before sharing any link. Canonical tags already point at jamescroucher.com, so preview addresses won't compete in search.
- Check whether the old host also handles his email before moving the domain's DNS.
- After launch, submit `https://jamescroucher.com/sitemap.xml` in Google Search Console.
