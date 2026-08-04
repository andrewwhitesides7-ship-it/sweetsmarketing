# Sweets Marketing

Animated landing page with on-page Stripe checkout. Static site plus one serverless
function. No npm install, no build step. Vercel handles it with zero config.

```
index.html        the page
thanks.html       post-payment page
styles.css        design tokens + all styling
app.js            the motion layer
checkout.js       the payment modal
config.js         >>> the only file you edit to turn payments on <<<
api/checkout.js   serverless function that talks to Stripe
favicon.svg
vercel.json
```

## Turning on payments (about 10 minutes)

**1. Get your keys.** Stripe dashboard, Developers, API keys. You want both.
Start in **test mode** so you cannot charge yourself real money by accident.

**2. Publishable key goes in `config.js`.**

```js
stripePublishableKey: 'pk_test_51abc...'
```

This one is public by design. It is safe sitting in your repo.

**3. Secret key goes in Vercel, never in the code.**

Vercel, your project, Settings, Environment Variables:

- Name: `STRIPE_SECRET_KEY`
- Value: your `sk_test_...` key
- Apply to all environments, then **redeploy**. Env vars do not apply to an
  existing deploy.

**4. Test it.** Open the site, click any buy button, use card `4242 4242 4242 4242`
with any future expiry and any CVC. You should land on `thanks.html` and see the
payment in your Stripe dashboard.

**5. Go live.** Flip Stripe out of test mode, swap `pk_test_` for `pk_live_` in
`config.js` and `sk_test_` for `sk_live_` in Vercel. Redeploy.

### Changing prices

Two places, and they have to match:

- `config.js` for what the customer sees
- `api/checkout.js` for what actually gets charged

The duplication is deliberate. If prices only lived in `config.js`, anyone could
open dev tools and pay $1. The server side is the one that counts.

## Deploy

```bash
cd sweets-marketing
git init
git add .
git commit -m "sweets marketing"
git branch -M main
git remote add origin https://github.com/YOUR_USER/sweets-marketing.git
git push -u origin main
```

Vercel: New Project, import the repo, framework preset **Other**, no build command.

**`index.html` must sit at the root of the repo**, not inside a folder. If GitHub
shows you a folder you have to click into, Vercel returns 404.

## The offer baked into the copy

Everything on the page is built around one promise: **two meetings in 30 days or
the next five boxes are free**, with the price split $150 now and $150 only once
the second meeting books.

That structure is doing the heavy lifting. It removes the need to claim a
conversion rate you cannot prove yet, and it makes the buying decision nearly
free. If you change the guarantee, change it in all five places: hero, order slip,
guarantee section, pricing cards, FAQ, and the modal banner.

Worst case cost of honoring it: $155 in cookies. Cheap insurance on a $300 sale.

## What is animated

Preloader with a spinning cookie and split panels. Lenis smooth scroll, custom
cursor, film grain, scroll progress bar. Six floating cutouts in the hero with
idle drift, mouse parallax and scroll parallax. Canvas sprinkle particles. A
marquee that speeds up with scroll velocity. Counters. A cookie that rides a
dotted path through the how-it-works section. 3D tilt cards, magnetic buttons,
clip-path image wipes, a scroll-scrubbed cake in the CTA, parallax footer wordmark.

Motion libraries load from jsDelivr (Lenis 1.1.14, GSAP 3.12.5 with ScrollTrigger
and MotionPathPlugin). If they fail to load, or the visitor has reduce-motion on,
`app.js` never adds the `js-ready` class and the page renders as a normal static
site with everything visible. **Checkout still works either way**, since
`checkout.js` does not depend on GSAP.

## Analytics

Vercel Web Analytics is configured and will automatically track visitor behavior
once enabled in the Vercel dashboard (Analytics → Enable Web Analytics). The
tracking script is privacy-friendly and works without cookies.

## Images

Eleven images load from the Higgsfield CDN so the site works immediately. Download
and self-host them before you run real traffic. The six cutouts must stay PNG or
the transparency dies and you get white boxes.

## Still undone

- No Stripe webhook, so orders arrive as Stripe emails. Fine at low volume.
- Checkout collects company and booking link as custom fields, but you still email
  the customer for the five addresses. Automate later.
- No terms or privacy page. Get one before volume.
- `aj@sweetsmarketing.com` is hardcoded in three places. Change it if that is not
  your address.
