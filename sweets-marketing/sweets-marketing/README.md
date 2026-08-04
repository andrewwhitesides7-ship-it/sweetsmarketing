# Sweets Marketing

Animated landing page. Static site, no build step, no npm install. Vercel serves it as-is.

```
index.html      the page
styles.css      design tokens + all styling (tokens are at the top)
app.js          the motion layer
favicon.svg
images/         empty for now, see "Images" below
vercel.json     clean URLs + asset caching
```

## Deploy

```bash
cd sweets-marketing
git init
git add .
git commit -m "sweets marketing landing page"
git branch -M main
git remote add origin https://github.com/YOUR_USER/sweets-marketing.git
git push -u origin main
```

On Vercel: New Project, import the repo, framework preset **Other**, root directory `./`, no build command, output directory `./`. Deploy. No API keys needed, nothing here calls a server yet.

## What is animated

| Where | What happens |
| --- | --- |
| Page load | Cookie spins while a progress bar fills, then the plum panels split open and the hero types itself in |
| Everywhere | Lenis smooth scroll, pink and yellow progress bar, custom cursor with a soft glow that scales on hover, film grain overlay |
| Hero | Six floating cookie and cake cutouts with idle drift, mouse parallax and scroll parallax. Falling sprinkle particles on canvas. Three blurred gradient blobs drifting behind everything. Headline reveals line by line from behind a mask |
| Ticker | Infinite marquee that speeds up when you scroll faster and settles when you stop |
| Stats | Numbers count up from zero when they enter view |
| How it works | A cookie rides a dotted curve across the section, scrubbed to your scroll position, spinning twice on the way |
| Cards | 3D tilt on hover with a spotlight that follows the cursor |
| Buttons | Magnetic pull toward the cursor plus a fill sweep on hover |
| Images | Clip-path wipe reveal with a scale-down, then slow parallax drift inside the frame |
| CTA | Cake rotates and rises as you scroll through |
| Footer | Giant wordmark parallaxes up and fades into the background |

### Motion libraries

Loaded from jsDelivr, no install needed:

- Lenis 1.1.14 (smooth scroll)
- GSAP 3.12.5 + ScrollTrigger + MotionPathPlugin

If those CDN scripts ever fail to load, `app.js` never adds the `js-ready` class and the page renders as a normal static site with everything visible. Same thing happens if the visitor has "reduce motion" turned on in their OS. Nothing breaks, it just stops moving.

### Turning the intensity down

Two knobs, both in `app.js`:

- Slow the whole thing down: change the `duration` values in the `intro` timeline.
- Kill one effect: each block is commented and self contained. Delete the sprinkles block, or the cursor block, or the tilt block, and nothing else cares.

## Images

Eleven images are loading from the Higgsfield CDN so the site works the second you deploy it. That is fine for a week, but you do not want to depend on someone else's CDN long term.

To self-host:

1. Download the images from the Higgsfield chat. There are five scene photos and six transparent cutouts.
2. Save them into `images/`. The cutouts must stay PNG so the transparency survives.
3. In `index.html`, find and replace each `https://d8j0ntlcm91z4.cloudfront.net/...` URL with the matching `images/NAME.png`.
4. Worth doing: convert the five scene photos to WebP (`cwebp -q 82 in.png -o out.webp`). The cutouts stay PNG.

The cutouts are the ones doing the heavy lifting visually. Do not compress them into JPEG, they will lose the alpha channel and show up as white boxes.

## Making the forms work

Both forms show a success message and do nothing else right now. Two minute fix with Formspree:

1. Sign up at formspree.io, create a form, copy the endpoint ID.
2. In `app.js`, find the commented `fetch` block inside `wireForm` and paste your ID in.

When you outgrow that, swap in a Vercel serverless function at `/api/lead.js` and point the fetch there.

## Changing the look

Every color, radius and font is a CSS variable at the top of `styles.css`. Change `--icing` and the whole page shifts.

## Still undone on purpose

- No analytics. Vercel Analytics is one toggle in the dashboard.
- Pricing buttons point at `#start`. Once you have a Cal.com link, send them there instead. Booking beats a form.
- No terms or privacy page. You want one before you take payments.
- The 38% claim is load bearing. Make sure you can show the denominator if someone asks.
