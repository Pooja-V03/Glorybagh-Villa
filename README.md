# GloryBagh Villa — Website

A luxury responsive website for GloryBagh Villa, Udaipur.
Built with: HTML5 · CSS3 · Vanilla JS · PHP (backend)

---

## Project Structure

```
glorybagh/
├── index.html                ← Main page (single-page site)
├── css/
│   └── style.css             ← All styles (Rinova palette, animations)
├── js/
│   └── main.js               ← All interactions & logic
├── backend/
│   └── inquiry.php           ← Form handler (needs PHP hosting)
├── assets/
│   └── images/               ← ADD YOUR VILLA PHOTOS HERE
│       ├── villa-1.jpg       ← Exterior / Facade
│       ├── villa-2.jpg       ← Living Room
│       ├── villa-3.jpg       ← Pool (large card)
│       ├── villa-4.jpg       ← Terrace (large card)
│       ├── villa-5.jpg       ← Master Suite
│       ├── villa-6.jpg       ← Garden
│       ├── villa-7.jpg       ← Dining
│       └── villa-8.jpg       ← Spa
└── README.md
```

---

## How to Add Your Photos

1. Copy your villa photos into `assets/images/`
2. Rename them: `villa-1.jpg`, `villa-2.jpg`, etc.
3. OR open `index.html`, find each `<img src="assets/images/villa-X.jpg">` and update the filename.
4. Update the `data-title=""` and `<h4>` text to describe your photo.
5. To add MORE gallery cards: copy any `.holo-card` block in the HTML.
   Use `class="holo-card large"` to make it span 2 columns.

### Hero Background
To add a full-screen villa photo behind the hero text, open `css/style.css`,
find `.hero-section` and add:
```css
background-image: url('../assets/images/hero-bg.jpg');
background-size: cover;
background-position: center;
```

---

## How to Add Your Logo

In `index.html`, find the comment `<!-- LOGO PLACEHOLDER -->` and replace:
```html
<div class="logo-placeholder">
  <span class="logo-text">GloryBagh</span>
  <span class="logo-sub">VILLA · UDAIPUR</span>
</div>
```
With:
```html
<img src="assets/logo.png" alt="GloryBagh Villa" class="logo-img" style="height:50px;"/>
```

---

## Update Real Details

Search the HTML and PHP for these placeholders and replace:

| Placeholder             | Replace with                  |
|-------------------------|-------------------------------|
| `+91 XXXXX XXXXX`       | Your actual phone number      |
| `reservations@glorybagh.com` | Your actual email        |
| `GloryBagh Villa, Udaipur, Rajasthan — 313001` | Actual address |
| Google Maps iframe `src` | Embed link from Google Maps for exact location |
| Social `href="#"`       | Your Instagram / Facebook / WhatsApp links |

---

## Deployment

### Option 1 — GitHub Pages (Free, Static)
GitHub Pages does NOT support PHP. Use this approach for the form:

1. Sign up at https://formspree.io (free plan available)
2. Create a form, get your form endpoint URL (e.g. `https://formspree.io/f/xyzabcde`)
3. Open `js/main.js`, find:
   ```js
   const res = await fetch('backend/inquiry.php', {
   ```
4. Replace with:
   ```js
   const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
   ```
5. Remove the `new FormData()` and replace with JSON:
   ```js
   body: JSON.stringify(Object.fromEntries(new FormData(inquiryForm))),
   headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
   ```
6. Push all files to GitHub, enable GitHub Pages on the repo.

### Option 2 — cPanel / Shared Hosting (PHP works)
1. Upload all files via FTP to `public_html/` or a subdomain folder.
2. Open `backend/inquiry.php`, update `$to_email` to your real email.
3. Done — the PHP mailer will work out of the box.

### Option 3 — Google Sites
Google Sites does NOT allow custom HTML/CSS/JS on pages directly.
For real deployment, use GitHub Pages or a shared host, then embed via iframe,
or use Google Sites' "Embed" feature with a hosted URL.

Recommended: Host on GitHub Pages (free) → share the URL → use as your main site.

---

## Color Palette (Rinova-inspired)

| Variable       | Hex       | Usage                     |
|----------------|-----------|---------------------------|
| `--deep`       | `#1c1a0f` | Main background           |
| `--olive`      | `#2b2710` | Section backgrounds       |
| `--gold`       | `#c9a84c` | Accents, CTAs, borders    |
| `--gold-light` | `#e2c97e` | Hover states              |
| `--cream`      | `#f5f0e8` | Body text                 |
| `--ivory`      | `#faf7f2` | Bright text               |

---

## Features Included

- Skeleton loader with shimmer animation
- Sticky navbar (transparent → frosted glass on scroll)
- Desktop nav links + mobile burger drawer
- Floating gold particle hero background
- Scroll-triggered reveal animations
- Holographic gallery with 3D tilt on hover + prismatic shimmer
- Lightbox image viewer
- Animated marquee strip
- Amenities section with hover effects
- Full inquiry form with validation
- PHP backend form handler + guest confirmation email
- Google Maps embed in footer
- Social media links
- Custom gold cursor
- Fully responsive (mobile, tablet, desktop)
