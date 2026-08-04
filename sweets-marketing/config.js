// config.js — Sweets Marketing Configuration

const CONFIG = {
  // Replace with your actual Stripe Publishable Key (pk_live_... or pk_test_...)
  stripePublicKey: "pk_live_51U0nDp2depv7NYWcXGKJMArFs3D2lMbTAHdyRKg84k0dfuwsE3UcPFvhVLvyAzzEwciiC9OfWbiAbN9CIFR0auzy00xDa1QsHp",

  // Pricing structure: $300 minimum order ($60/box)
  pricing: {
    starter: {
      id: "starter",
      title: "5 Box Campaign",
      boxes: 5,
      amount: 30000, // $300.00 in cents
      displayPrice: "$300",
      pricePerBox: "$60 / box",
      description: "5 fresh cookie boxes delivered with customized cards & your booking link."
    },
    full: {
      id: "full",
      title: "10 Box Campaign",
      boxes: 10,
      amount: 60000, // $600.00 in cents
      displayPrice: "$600",
      pricePerBox: "$60 / box",
      description: "10 fresh cookie boxes delivered with customized cards & your booking link."
    },
    pipeline: {
      id: "pipeline",
      title: "20 Box Campaign",
      boxes: 20,
      amount: 120000, // $1,200.00 in cents
      displayPrice: "$1,200",
      pricePerBox: "$60 / box",
      description: "20 fresh cookie boxes delivered with customized cards & your booking link."
    }
  },

  // Backend endpoint for Stripe PaymentIntent
  apiEndpoint: "/api/create-payment-intent"
};
