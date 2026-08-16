const prisma = require('../config/prisma');
const razorpayService = require('./razorpay.service');

class PaymentError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function getOwnedBooking(userId, bookingId) {
  const id = Number(bookingId);
  if (!Number.isInteger(id) || id < 1) {
    throw new PaymentError(400, 'Invalid booking id');
  }

  const booking = await prisma.bookings.findUnique({
    where: { id },
    include: { events: true },
  });
  if (!booking) {
    throw new PaymentError(404, 'Booking not found');
  }
  if (booking.user_id !== userId) {
    throw new PaymentError(403, 'You can only pay for your own bookings');
  }

  return booking;
}

async function createTicketPaymentOrder(userId, bookingId) {
  const booking = await getOwnedBooking(userId, bookingId);

  if (booking.status !== 'PENDING') {
    throw new PaymentError(409, `Booking is already ${booking.status}`);
  }

  const event = booking.events;
  if (!event) {
    throw new PaymentError(404, 'Event not found');
  }
  if (event.status !== 'PUBLISHED') {
    throw new PaymentError(409, 'Event is no longer available for booking');
  }

  const existing = await prisma.payments.findFirst({
    where: {
      booking_id: booking.id,
      type: 'TICKET_PAYMENT',
      status: 'PENDING',
    },
    orderBy: { created_at: 'desc' },
  });
  if (existing) {
    return {
      bookingId: booking.id,
      orderId: existing.razorpay_order_id,
      amount: Math.round(Number(existing.amount) * 100),
      currency: 'INR',
      keyId: razorpayService.getKeyId(),
    };
  }

  const amountRupees = Number(event.ticket_price) * booking.quantity;
  const amountPaise = Math.round(amountRupees * 100);

  const order = await razorpayService.createOrder({
    amountPaise,
    receipt: `tkt_${booking.id}_${Date.now()}`,
  });

  await prisma.payments.create({
    data: {
      booking_id: booking.id,
      event_id: event.id,
      type: 'TICKET_PAYMENT',
      razorpay_order_id: order.id,
      amount: amountRupees,
      status: 'PENDING',
      method: 'OTHER',
    },
  });

  return {
    bookingId: booking.id,
    orderId: order.id,
    amount: order.amount,
    currency: 'INR',
    keyId: razorpayService.getKeyId(),
  };
}

async function verifyTicketPayment(userId, bookingId, body = {}) {
  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new PaymentError(400, 'razorpay_order_id, razorpay_payment_id and razorpay_signature are required');
  }

  const booking = await getOwnedBooking(userId, bookingId);
  if (booking.status !== 'PENDING') {
    throw new PaymentError(409, `Booking is already ${booking.status}`);
  }

  const payment = await prisma.payments.findFirst({
    where: {
      booking_id: booking.id,
      type: 'TICKET_PAYMENT',
      razorpay_order_id: razorpayOrderId,
    },
  });
  if (!payment) {
    throw new PaymentError(400, 'No matching payment attempt found for this order');
  }
  if (payment.status === 'SUCCESS') {
    throw new PaymentError(409, 'Payment already verified');
  }

  const signatureValid = razorpayService.verifySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!signatureValid) {
    await prisma.payments.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });
    throw new PaymentError(400, 'Payment signature verification failed');
  }

  const [updatedPayment, updatedBooking] = await prisma.$transaction([
    prisma.payments.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        paid_at: new Date(),
      },
    }),
    prisma.bookings.update({
      where: { id: booking.id },
      data: { status: 'CONFIRMED' },
    }),
  ]);

  return {
    message: 'Payment verified; booking confirmed',
    data: {
      payment: {
        id: updatedPayment.id,
        amount: Number(updatedPayment.amount),
        status: updatedPayment.status,
      },
      booking: {
        bookingId: updatedBooking.id,
        status: updatedBooking.status,
        quantity: updatedBooking.quantity,
        amount: Number(updatedBooking.total_amount),
      },
    },
  };
}

module.exports = {
  PaymentError,
  createTicketPaymentOrder,
  verifyTicketPayment,
};