const crypto = require('crypto');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createOrder({ amountPaise, receipt }) {
  return razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
  });
}

function verifySignature({ orderId, paymentId, signature }) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const provided = Buffer.from(String(signature), 'utf8');
  const computed = Buffer.from(String(expected), 'utf8');

  return provided.length === computed.length && crypto.timingSafeEqual(provided, computed);
}

module.exports = {
  createOrder,
  verifySignature,
  getKeyId: () => process.env.RAZORPAY_KEY_ID,
};