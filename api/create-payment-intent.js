// api/create-payment-intent.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, email, planId } = req.body;

    // Create a PaymentIntent with the specified amount ($300, $600, or $1,200)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount || 30000,
      currency: 'usd',
      receipt_email: email,
      metadata: { planId: planId || 'starter' }
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
