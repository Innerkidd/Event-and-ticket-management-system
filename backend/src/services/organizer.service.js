const prisma = require('../config/prisma');
const razorpayService = require('./razorpay.service');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ALLOWED_EVENT_STATUSES = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];
const ALLOWED_STAFF_ROLES = ['REGISTRATION', 'CHECK_IN', 'EVENT_COORDINATOR', 'SUPPORT'];
const ALLOWED_STAFF_STATUSES = ['ACTIVE', 'INACTIVE'];

class OrganizerError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function parsePagination(page, limit) {
  const parsedPage = Math.max(parseInt(page, 10) || DEFAULT_PAGE, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || DEFAULT_LIMIT, 1), 100);
  return { page: parsedPage, limit: parsedLimit };
}

function buildPagination(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 0),
  };
}

function getPlatformFeePercent() {
  const percent = Number(process.env.PLATFORM_FEE_PERCENT);
  return Number.isFinite(percent) && percent > 0 ? percent : 5;
}

function computeOrganizerFee(event) {
  const ticketPrice = Number(event.ticket_price) || 0;
  const totalTickets = Number(event.total_tickets) || 0;
  const maximumTicketValue = ticketPrice * totalTickets;
  const platformFeePercent = getPlatformFeePercent();
  const organizerFee = Math.round((maximumTicketValue * platformFeePercent) / 100);
  return { maximumTicketValue, platformFeePercent, organizerFee };
}

function toEventDto(event, sold = 0) {
  const totalTickets = Number(event.total_tickets) || 0;
  const soldTickets = Math.min(sold, totalTickets);
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    image: event.image,
    startDate: event.start_date,
    endDate: event.end_date,
    venue: event.venue,
    ticketPrice: Number(event.ticket_price),
    totalTickets,
    soldTickets,
    availableTickets: Math.max(totalTickets - soldTickets, 0),
    status: event.status,
    createdAt: event.created_at,
  };
}

function toBookingDto(booking) {
  return {
    bookingId: booking.id,
    attendee: booking.users?.name,
    attendeeEmail: booking.users?.email,
    event: booking.events?.name,
    quantity: booking.quantity,
    amount: Number(booking.total_amount),
    bookingDate: booking.created_at,
    status: booking.status,
  };
}

async function getSoldTicketsMap(eventIds) {
  if (!eventIds.length) return {};
  const rows = await prisma.$queryRaw`
    SELECT event_id, COALESCE(SUM(quantity), 0)::int AS sold
    FROM bookings
    WHERE status = 'CONFIRMED' AND event_id = ANY(${eventIds}::int[])
    GROUP BY event_id`;
  const map = {};
  for (const row of rows) map[row.event_id] = Number(row.sold);
  return map;
}

async function getEventForOrganizer(organizerId, eventId) {
  const event = await prisma.events.findFirst({
    where: { id: Number(eventId), organizer_id: organizerId },
  });
  if (!event) throw new OrganizerError(404, 'Event not found');
  return event;
}

function validateDate(value, label) {
  if (value === undefined || value === null || value === '') return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new OrganizerError(400, `Invalid ${label}`);
  }
  return date;
}

// ---------------------------------------------------------------- Dashboard

async function getDashboard(organizerId) {
  const [myEvents, soldRow, totalTicketsRow, totalBookings, upcomingEvent, recentBookings, registered, checkedIn] =
    await Promise.all([
      prisma.events.count({ where: { organizer_id: organizerId } }),
      prisma.$queryRaw`
        SELECT COALESCE(SUM(b.quantity), 0)::int AS sold
        FROM bookings b
        JOIN events e ON e.id = b.event_id
        WHERE e.organizer_id = ${organizerId} AND b.status = 'CONFIRMED'`,
      prisma.$queryRaw`
        SELECT COALESCE(SUM(e.total_tickets), 0)::int AS total
        FROM events e
        WHERE e.organizer_id = ${organizerId}`,
      prisma.bookings.count({ where: { events: { organizer_id: organizerId } } }),
      prisma.events.findFirst({
        where: {
          organizer_id: organizerId,
          status: 'PUBLISHED',
          start_date: { gt: new Date() },
        },
        orderBy: { start_date: 'asc' },
      }),
      prisma.bookings.findMany({
        where: { events: { organizer_id: organizerId } },
        orderBy: { created_at: 'desc' },
        take: 5,
        include: { users: true, events: true },
      }),
      prisma.bookings.count({ where: { events: { organizer_id: organizerId } } }),
      prisma.attendance.count({
        where: { status: 'CHECKED_IN', events: { organizer_id: organizerId } },
      }),
    ]);

  const totalTicketsSold = Number(soldRow[0].sold);
  const ticketsAvailable = Math.max(Number(totalTicketsRow[0].total) - totalTicketsSold, 0);
  const remaining = Math.max(registered - checkedIn, 0);
  const attendancePercentage = registered > 0 ? Math.round((checkedIn / registered) * 100) : 0;

  return {
    stats: {
      myEvents,
      totalTicketsSold,
      ticketsAvailable,
      totalBookings,
    },
    upcomingEvent: upcomingEvent ? toEventDto(upcomingEvent) : null,
    recentBookings: recentBookings.map(toBookingDto),
    attendance: {
      registered,
      checkedIn,
      remaining,
      percentage: attendancePercentage,
    },
  };
}

// ---------------------------------------------------------------- Events

async function listEvents(organizerId, { search, status, page, limit }) {
  const pagination = parsePagination(page, limit);
  const where = { organizer_id: organizerId };
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }
  if (status) {
    where.status = status;
  }

  const [events, total] = await Promise.all([
    prisma.events.findMany({
      where,
      orderBy: { start_date: 'desc' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    }),
    prisma.events.count({ where }),
  ]);

  const soldMap = await getSoldTicketsMap(events.map((e) => e.id));

  return {
    events: events.map((e) => toEventDto(e, soldMap[e.id] || 0)),
    pagination: buildPagination(pagination.page, pagination.limit, total),
  };
}

async function getEvent(organizerId, eventId) {
  const event = await getEventForOrganizer(organizerId, eventId);
  const soldMap = await getSoldTicketsMap([event.id]);
  const bookingsCount = await prisma.bookings.count({ where: { event_id: event.id } });
  return {
    event: {
      ...toEventDto(event, soldMap[event.id] || 0),
      bookingsCount,
    },
  };
}

async function createEvent(organizerId, body = {}) {
  const { name, description, image, startDate, endDate, venue, ticketPrice, totalTickets } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new OrganizerError(400, 'Event name is required');
  }
  const start = validateDate(startDate, 'startDate');
  if (!start) throw new OrganizerError(400, 'startDate is required');
  const end = validateDate(endDate, 'endDate') || start;
  if (end <= start) throw new OrganizerError(400, 'endDate must be after startDate');
  if (!venue || typeof venue !== 'string' || !venue.trim()) {
    throw new OrganizerError(400, 'venue is required');
  }
  const price = Number(ticketPrice);
  if (!Number.isFinite(price) || price <= 0) {
    throw new OrganizerError(400, 'ticketPrice must be a number greater than 0');
  }
  const tickets = Number(totalTickets);
  if (!Number.isInteger(tickets) || tickets < 1) {
    throw new OrganizerError(400, 'totalTickets must be an integer of at least 1');
  }

  const event = await prisma.events.create({
    data: {
      name: name.trim(),
      description: description || null,
      image: image || null,
      start_date: start,
      end_date: end,
      venue: venue.trim(),
      ticket_price: price,
      total_tickets: tickets,
      status: 'DRAFT',
      organizer_id: organizerId,
    },
  });

  return { event: toEventDto(event, 0) };
}

async function updateEvent(organizerId, eventId, body = {}) {
  const event = await getEventForOrganizer(organizerId, eventId);

  const data = {};
  const { name, description, image, startDate, endDate, venue, ticketPrice, totalTickets, status } = body;

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) throw new OrganizerError(400, 'Event name is required');
    data.name = name.trim();
  }
  if (description !== undefined) data.description = description || null;
  if (image !== undefined) data.image = image || null;
  if (venue !== undefined) {
    if (typeof venue !== 'string' || !venue.trim()) throw new OrganizerError(400, 'venue is required');
    data.venue = venue.trim();
  }

  const start = validateDate(startDate, 'startDate');
  const end = endDate !== undefined ? validateDate(endDate, 'endDate') : undefined;
  if (start) data.start_date = start;
  if (end !== undefined && end !== null) data.end_date = end;
  if (data.start_date && data.end_date && data.end_date <= data.start_date) {
    throw new OrganizerError(400, 'endDate must be after startDate');
  }

  if (ticketPrice !== undefined) {
    const price = Number(ticketPrice);
    if (!Number.isFinite(price) || price <= 0) {
      throw new OrganizerError(400, 'ticketPrice must be a number greater than 0');
    }
    data.ticket_price = price;
  }
  if (totalTickets !== undefined) {
    const tickets = Number(totalTickets);
    if (!Number.isInteger(tickets) || tickets < 1) {
      throw new OrganizerError(400, 'totalTickets must be an integer of at least 1');
    }
    data.total_tickets = tickets;
  }
  if (status !== undefined) {
    if (status === 'PUBLISHED' || status === 'COMPLETED') {
      throw new OrganizerError(
        400,
        'Events cannot be manually set to PUBLISHED; publish requires the platform-fee payment flow'
      );
    }
    if (!ALLOWED_EVENT_STATUSES.includes(status)) {
      throw new OrganizerError(400, `Invalid event status. Allowed: ${ALLOWED_EVENT_STATUSES.join(', ')}`);
    }
    data.status = status;
  }

  const confirmedCount = await prisma.bookings.count({
    where: { event_id: event.id, status: 'CONFIRMED' },
  });
  if (confirmedCount > 0) {
    if (data.ticket_price !== undefined && Number(data.ticket_price) !== Number(event.ticket_price)) {
      throw new OrganizerError(409, 'Ticket price cannot be changed once confirmed bookings exist');
    }
    if (data.total_tickets !== undefined) {
      const soldRow = await prisma.bookings.aggregate({
        where: { event_id: event.id, status: 'CONFIRMED' },
        _sum: { quantity: true },
      });
      const sold = Number(soldRow._sum.quantity) || 0;
      if (Number(data.total_tickets) < sold) {
        throw new OrganizerError(409, 'totalTickets cannot be reduced below confirmed sold tickets');
      }
    }
  }

  const updated = await prisma.events.update({
    where: { id: event.id },
    data,
  });
  const soldMap = await getSoldTicketsMap([updated.id]);

  return { event: toEventDto(updated, soldMap[updated.id] || 0) };
}

// ------------------------------------------------------- Publishing / fees

async function getPublishSummary(organizerId, eventId) {
  const event = await getEventForOrganizer(organizerId, eventId);
  if (event.status !== 'DRAFT') {
    throw new OrganizerError(409, 'Only DRAFT events are eligible for publishing payment');
  }
  const { maximumTicketValue, platformFeePercent, organizerFee } = computeOrganizerFee(event);
  return {
    eventId: event.id,
    ticketPrice: Number(event.ticket_price),
    totalTickets: Number(event.total_tickets),
    maximumTicketValue,
    platformFeePercent,
    organizerFee,
  };
}

async function createPublishOrder(organizerId, eventId) {
  const event = await getEventForOrganizer(organizerId, eventId);
  if (event.status !== 'DRAFT') {
    throw new OrganizerError(409, 'Only DRAFT events are eligible for publishing payment');
  }

  const existing = await prisma.payments.findFirst({
    where: {
      event_id: event.id,
      type: 'PLATFORM_FEE',
      status: 'PENDING',
    },
    orderBy: { created_at: 'desc' },
  });
  if (existing) {
    return {
      eventId: event.id,
      orderId: existing.razorpay_order_id,
      amount: Math.round(Number(existing.amount) * 100),
      currency: 'INR',
      keyId: razorpayService.getKeyId(),
    };
  }

  const { organizerFee } = computeOrganizerFee(event);
  const amountPaise = Math.round(organizerFee * 100);
  const order = await razorpayService.createOrder({
    amountPaise,
    receipt: `pf_${event.id}_${Date.now()}`,
  });

  await prisma.payments.create({
    data: {
      event_id: event.id,
      type: 'PLATFORM_FEE',
      razorpay_order_id: order.id,
      amount: organizerFee,
      status: 'PENDING',
      method: 'OTHER',
    },
  });

  return {
    eventId: event.id,
    orderId: order.id,
    amount: order.amount,
    currency: 'INR',
    keyId: razorpayService.getKeyId(),
  };
}

async function verifyPublishPayment(organizerId, eventId, body = {}) {
  const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new OrganizerError(400, 'razorpay_order_id, razorpay_payment_id and razorpay_signature are required');
  }

  const event = await getEventForOrganizer(organizerId, eventId);

  const payment = await prisma.payments.findFirst({
    where: {
      event_id: event.id,
      type: 'PLATFORM_FEE',
      razorpay_order_id: razorpayOrderId,
    },
  });
  if (!payment) {
    throw new OrganizerError(400, 'No matching payment attempt found for this order');
  }
  if (payment.status === 'SUCCESS') {
    throw new OrganizerError(409, 'Event payment already verified');
  }
  if (event.status !== 'DRAFT') {
    throw new OrganizerError(409, 'Event is no longer eligible for publishing');
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
    throw new OrganizerError(400, 'Payment signature verification failed');
  }

  const [, updatedEvent] = await prisma.$transaction([
    prisma.payments.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        paid_at: new Date(),
      },
    }),
    prisma.events.update({
      where: { id: event.id },
      data: { status: 'PUBLISHED' },
    }),
  ]);

  return {
    message: 'Payment verified; event published successfully',
    data: {
      event: toEventDto(updatedEvent),
      payment: {
        id: payment.id,
        amount: Number(payment.amount),
        status: 'SUCCESS',
      },
    },
  };
}

// ---------------------------------------------------------------- Tickets

async function listTickets(organizerId, { status, page, limit }) {
  const pagination = parsePagination(page, limit);
  const where = { organizer_id: organizerId };
  if (status) where.status = status;

  const [events, total] = await Promise.all([
    prisma.events.findMany({
      where,
      orderBy: { start_date: 'desc' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    }),
    prisma.events.count({ where }),
  ]);

  const soldMap = await getSoldTicketsMap(events.map((e) => e.id));

  return {
    tickets: events.map((e) => {
      const totalTickets = Number(e.total_tickets) || 0;
      const soldTickets = soldMap[e.id] || 0;
      const availableTickets = Math.max(totalTickets - soldTickets, 0);
      return {
        eventId: e.id,
        eventName: e.name,
        ticketPrice: Number(e.ticket_price),
        totalTickets,
        soldTickets,
        availableTickets,
        salesPercentage: totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0,
        status: e.status,
      };
    }),
    pagination: buildPagination(pagination.page, pagination.limit, total),
  };
}

async function getEventTickets(organizerId, eventId) {
  const event = await getEventForOrganizer(organizerId, eventId);
  const soldMap = await getSoldTicketsMap([event.id]);
  const totalTickets = Number(event.total_tickets) || 0;
  const soldTickets = soldMap[event.id] || 0;

  return {
    tickets: {
      totalTickets,
      soldTickets,
      availableTickets: Math.max(totalTickets - soldTickets, 0),
      salesPercentage: totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0,
    },
  };
}

// --------------------------------------------------------------- Bookings

async function listBookings(organizerId, { search, eventId, status, from, to, page, limit }) {
  const pagination = parsePagination(page, limit);
  const where = { events: { organizer_id: organizerId } };

  if (eventId) {
    where.event_id = Number(eventId);
  }
  if (status) {
    where.status = status;
  }
  const searchConditions = [];
  if (search) {
    searchConditions.push(
      { users: { name: { contains: search, mode: 'insensitive' } } },
      { users: { email: { contains: search, mode: 'insensitive' } } },
      { events: { name: { contains: search, mode: 'insensitive' } } }
    );
  }
  if (searchConditions.length) {
    where.OR = searchConditions;
  }
  const fromDate = validateDate(from, 'from date');
  const toDate = validateDate(to, 'to date');
  if (fromDate || toDate) {
    where.created_at = {};
    if (fromDate) where.created_at.gte = fromDate;
    if (toDate) where.created_at.lte = toDate;
  }

  const [bookings, total] = await Promise.all([
    prisma.bookings.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      include: { users: true, events: true },
    }),
    prisma.bookings.count({ where }),
  ]);

  return {
    bookings: bookings.map(toBookingDto),
    pagination: buildPagination(pagination.page, pagination.limit, total),
  };
}

async function getBooking(organizerId, bookingId) {
  const booking = await prisma.bookings.findFirst({
    where: { id: Number(bookingId), events: { organizer_id: organizerId } },
    include: { users: true, events: true },
  });
  if (!booking) throw new OrganizerError(404, 'Booking not found');
  return { booking: toBookingDto(booking) };
}

// ------------------------------------------------------------------ Staff

async function listStaff(organizerId, { eventId, status, search, page, limit }) {
  const pagination = parsePagination(page, limit);
  const where = { events: { organizer_id: organizerId } };

  if (eventId) {
    where.event_id = Number(eventId);
  }
  if (status) {
    if (!ALLOWED_STAFF_STATUSES.includes(status)) {
      throw new OrganizerError(400, `Invalid staff status. Allowed: ${ALLOWED_STAFF_STATUSES.join(', ')}`);
    }
    where.status = status;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [staff, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      include: { events: true },
    }),
    prisma.staff.count({ where }),
  ]);

  return {
    staff: staff.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: s.role,
      status: s.status,
      eventId: s.event_id,
      eventName: s.events?.name,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    })),
    pagination: buildPagination(pagination.page, pagination.limit, total),
  };
}

async function createStaff(organizerId, body = {}) {
  const { name, email, phone, role, eventId } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new OrganizerError(400, 'Staff name is required');
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new OrganizerError(400, 'Staff email is required');
  }
  if (role && !ALLOWED_STAFF_ROLES.includes(role)) {
    throw new OrganizerError(400, `Invalid staff role. Allowed: ${ALLOWED_STAFF_ROLES.join(', ')}`);
  }
  const event = await prisma.events.findFirst({
    where: { id: Number(eventId), organizer_id: organizerId },
  });
  if (!event) {
    if (await prisma.events.findUnique({ where: { id: Number(eventId) } })) {
      throw new OrganizerError(403, 'You can only assign staff to your own events');
    }
    throw new OrganizerError(404, 'Event not found');
  }

  const staff = await prisma.staff.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      phone: phone || null,
      role: role || 'SUPPORT',
      status: 'ACTIVE',
      event_id: event.id,
    },
    include: { events: true },
  });

  return {
    staff: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      status: staff.status,
      eventId: staff.event_id,
      eventName: staff.events?.name,
      createdAt: staff.created_at,
      updatedAt: staff.updated_at,
    },
  };
}

async function updateStaff(organizerId, staffId, body = {}) {
  const staff = await prisma.staff.findFirst({
    where: { id: Number(staffId), events: { organizer_id: organizerId } },
  });
  if (!staff) throw new OrganizerError(404, 'Staff member not found');

  const data = {};
  const { name, email, phone, role, status, eventId } = body;

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) throw new OrganizerError(400, 'Staff name is required');
    data.name = name.trim();
  }
  if (email !== undefined) {
    if (typeof email !== 'string' || !email.trim()) throw new OrganizerError(400, 'Staff email is required');
    data.email = email.trim();
  }
  if (phone !== undefined) data.phone = phone || null;
  if (role !== undefined) {
    if (!ALLOWED_STAFF_ROLES.includes(role)) {
      throw new OrganizerError(400, `Invalid staff role. Allowed: ${ALLOWED_STAFF_ROLES.join(', ')}`);
    }
    data.role = role;
  }
  if (status !== undefined) {
    if (!ALLOWED_STAFF_STATUSES.includes(status)) {
      throw new OrganizerError(400, `Invalid staff status. Allowed: ${ALLOWED_STAFF_STATUSES.join(', ')}`);
    }
    data.status = status;
  }
  if (eventId !== undefined) {
    const targetEvent = await prisma.events.findFirst({
      where: { id: Number(eventId), organizer_id: organizerId },
    });
    if (!targetEvent) {
      if (await prisma.events.findUnique({ where: { id: Number(eventId) } })) {
        throw new OrganizerError(403, 'You can only assign staff to your own events');
      }
      throw new OrganizerError(404, 'Event not found');
    }
    data.event_id = targetEvent.id;
  }

  const updated = await prisma.staff.update({
    where: { id: staff.id },
    data,
    include: { events: true },
  });

  return {
    staff: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      status: updated.status,
      eventId: updated.event_id,
      eventName: updated.events?.name,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    },
  };
}

async function removeStaff(organizerId, staffId) {
  const staff = await prisma.staff.findFirst({
    where: { id: Number(staffId), events: { organizer_id: organizerId } },
  });
  if (!staff) throw new OrganizerError(404, 'Staff member not found');

  const updated = await prisma.staff.update({
    where: { id: staff.id },
    data: { status: 'INACTIVE' },
  });

  return {
    message: 'Staff member removed',
    data: { staff: { id: updated.id, status: updated.status } },
  };
}

// ------------------------------------------------------------- Attendance

async function getAttendanceOverview(organizerId, eventId) {
  const event = await prisma.events.findFirst({
    where: { id: Number(eventId) },
  });
  if (!event) throw new OrganizerError(404, 'Event not found');
  if (event.organizer_id !== organizerId) {
    throw new OrganizerError(403, 'You can only view attendance for your own events');
  }

  const [registered, checkedIn] = await Promise.all([
    prisma.bookings.count({ where: { event_id: event.id } }),
    prisma.attendance.count({ where: { event_id: event.id, status: 'CHECKED_IN' } }),
  ]);
  const remaining = Math.max(registered - checkedIn, 0);

  return {
    registered,
    checkedIn,
    remaining,
    attendancePercentage: registered > 0 ? Math.round((checkedIn / registered) * 100) : 0,
  };
}

async function getAttendanceTable(organizerId, eventId, { page, limit }) {
  await getAttendanceOverview(organizerId, eventId);
  const pagination = parsePagination(page, limit);

  const [bookings, total] = await Promise.all([
    prisma.bookings.findMany({
      where: { event_id: Number(eventId) },
      orderBy: { created_at: 'asc' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      include: { users: true, attendance: true },
    }),
    prisma.bookings.count({ where: { event_id: Number(eventId) } }),
  ]);

  return {
    attendees: bookings.map((b) => ({
      attendee: b.users?.name,
      attendeeEmail: b.users?.email,
      bookingId: b.id,
      quantity: b.quantity,
      checkInStatus: b.attendance?.status || 'NOT_CHECKED_IN',
      checkedInAt: b.attendance?.checked_in_at || null,
    })),
    pagination: buildPagination(pagination.page, pagination.limit, total),
  };
}

async function checkIn(organizerId, bookingId) {
  const booking = await prisma.bookings.findFirst({
    where: { id: Number(bookingId) },
    include: { events: true },
  });
  if (!booking) throw new OrganizerError(404, 'Booking not found');
  if (booking.events?.organizer_id !== organizerId) {
    throw new OrganizerError(403, 'You can only check in bookings for your own events');
  }

  const existing = await prisma.attendance.findUnique({
    where: { booking_id: booking.id },
  });
  if (existing && existing.status === 'CHECKED_IN') {
    throw new OrganizerError(409, 'Booking is already checked in');
  }

  try {
    const attendance = await prisma.attendance.create({
      data: {
        booking_id: booking.id,
        event_id: booking.event_id,
        checked_in_by: organizerId,
        status: 'CHECKED_IN',
        checked_in_at: new Date(),
      },
    });
    return {
      message: 'Check-in successful',
      data: {
        attendance: {
          id: attendance.id,
          bookingId: attendance.booking_id,
          eventId: attendance.event_id,
          status: attendance.status,
          checkedInAt: attendance.checked_in_at,
        },
      },
    };
  } catch (error) {
    if (error.code === 'P2002') {
      throw new OrganizerError(409, 'Booking is already checked in');
    }
    throw error;
  }
}

// -------------------------------------------------------------- Analytics

async function getAnalytics(organizerId, eventId) {
  const event = await prisma.events.findFirst({ where: { id: Number(eventId) } });
  if (!event) throw new OrganizerError(404, 'Event not found');
  if (event.organizer_id !== organizerId) {
    throw new OrganizerError(403, 'You can only view analytics for your own events');
  }

  const [soldRow, bookingsCount, attendanceRows, grossRow, feeRow, trendRows] = await Promise.all([
    prisma.bookings.aggregate({
      where: { event_id: event.id, status: 'CONFIRMED' },
      _sum: { quantity: true },
    }),
    prisma.bookings.count({ where: { event_id: event.id } }),
    prisma.$queryRaw`
      SELECT
        (SELECT COUNT(*)::int FROM bookings WHERE event_id = ${event.id}) AS registered,
        (SELECT COUNT(*)::int FROM attendance WHERE event_id = ${event.id} AND status = 'CHECKED_IN') AS checked_in`,
    prisma.bookings.aggregate({
      where: { event_id: event.id, status: 'CONFIRMED' },
      _sum: { total_amount: true },
    }),
    prisma.payments.aggregate({
      where: { event_id: event.id, type: 'PLATFORM_FEE', status: 'SUCCESS' },
      _sum: { amount: true },
    }),
    prisma.$queryRaw`
      SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::int AS count
      FROM bookings
      WHERE event_id = ${event.id}
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 7`,
  ]);

  const totalTickets = Number(event.total_tickets) || 0;
  const sold = Number(soldRow._sum.quantity) || 0;
  const registered = Number(attendanceRows[0].registered);
  const checkedIn = Number(attendanceRows[0].checked_in);
  const gross = Number(grossRow._sum.total_amount) || 0;
  const platformFee = Number(feeRow._sum.amount) || 0;

  const trendMap = {};
  for (const row of trendRows) {
    trendMap[new Date(row.day).toISOString().slice(0, 10)] = Number(row.count);
  }
  const trend = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    trend.push({ date: key, count: trendMap[key] || 0 });
  }

  return {
    tickets: {
      totalTickets,
      sold,
      available: Math.max(totalTickets - sold, 0),
      salesPercentage: totalTickets > 0 ? Math.round((sold / totalTickets) * 100) : 0,
    },
    bookings: {
      totalBookings: bookingsCount,
      trend,
    },
    attendance: {
      registered,
      checkedIn,
      remaining: Math.max(registered - checkedIn, 0),
      attendancePercentage: registered > 0 ? Math.round((checkedIn / registered) * 100) : 0,
    },
    revenue: {
      grossTicketSales: gross,
      platformFee,
      netOrganizerAmount: Math.max(gross - platformFee, 0),
    },
  };
}

module.exports = {
  OrganizerError,
  getDashboard,
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  getPublishSummary,
  createPublishOrder,
  verifyPublishPayment,
  listTickets,
  getEventTickets,
  listBookings,
  getBooking,
  listStaff,
  createStaff,
  updateStaff,
  removeStaff,
  getAttendanceOverview,
  getAttendanceTable,
  checkIn,
  getAnalytics,
};