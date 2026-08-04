/* ============================================================
   THE ONLY FILE YOU NEED TO EDIT TO TURN PAYMENTS ON.

   1. Paste your Stripe PUBLISHABLE key below (starts with pk_).
      This one is safe to have in public code. It is meant to be.
   2. Put your SECRET key (sk_...) in Vercel as an environment
      variable named STRIPE_SECRET_KEY. Never in this file.

   Test it first with your pk_test_ key and card 4242 4242 4242 4242.
   ============================================================ */

window.SWEETS_CONFIG = {

  stripePublishableKey: 'pk_live_51U0nDp2depv7NYWcXGKJMArFs3D2lMbTAHdyRKg84k0dfuwsE3UcPFvhVLvyAzzEwciiC9OfWbiAbN9CIFR0auzy00xDa1QsHp',

// config.js
const CONFIG = {
  stripePublicKey: "pk_live_51U0nDp2depv7NYWcXGKJMArFs3D2lMbTAHdyRKg84k0dfuwsE3UcPFvhVLvyAzzEwciiC9OfWbiAbN9CIFR0auzy00xDa1QsHp", // Replace with your pk_live_ or pk_test_ key
  pricing: {
    starter: {
      priceId: "price_STARTER_PRICE_ID", // From Stripe Dashboard
      amount: 30000,
      title: "5 Box Campaign",
      boxes: 5
    },
    full: {
      priceId: "price_FULL_PRICE_ID",
      amount: 60000,
      title: "10 Box Campaign",
      boxes: 10
    },
    pipeline: {
      priceId: "price_PIPELINE_PRICE_ID",
      amount: 120000,
      title: "20 Box Campaign",
      boxes: 20
    }
  }
};
