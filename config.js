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

  // Change prices here and nowhere else. Amounts are in cents.
  plans: {
    starter: {
      amount: 15000,
      name: 'Sweets Marketing: 5 boxes (first half)',
      description: '5 cookie boxes with cards and delivery. Second $150 due only when your second meeting books.',
      modalTitle: 'Send my first 5 boxes',
      modalSub: '$150 today, $150 when your second meeting books.'
    },
    full: {
      amount: 30000,
      name: 'Sweets Marketing: 5 boxes (paid in full)',
      description: '5 cookie boxes with cards and delivery, paid in one payment.',
      modalTitle: 'Five boxes, paid in full',
      modalSub: '$300 today. Same two meeting guarantee.'
    },
    pipeline: {
      amount: 120000,
      name: 'Sweets Marketing: 20 boxes',
      description: '20 cookie boxes staggered across the month, with a research line written per prospect.',
      modalTitle: 'Twenty boxes',
      modalSub: '$1,200 today. Eight meeting guarantee.'
    }
  }
};
