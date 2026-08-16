const prisma = require('../config/prisma');

class ApplicationError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function createOrganizerApplication(userId, body = {}) {
  const {
    full_name: fullName,
    phone,
    organization,
    orgType,
    experience,
    eventCount,
    reason,
    linkedin_url: linkedinUrl,
    social_media_url: socialMediaUrl,
    portfolio_url: portfolioUrl,
    document_name: documentName,
  } = body;

  const user = await prisma.users.findUnique({ where: { id: Number(userId) } });
  if (!user) throw new ApplicationError(404, 'User not found');
  if (user.role === 'ORGANIZER') {
    throw new ApplicationError(409, 'You are already an organizer');
  }

  const existing = await prisma.organizer_applications.findFirst({
    where: { user_id: user.id, status: 'PENDING' },
  });
  if (existing) {
    throw new ApplicationError(409, 'You already have a pending application');
  }

  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    throw new ApplicationError(400, 'Full name is required');
  }
  if (!reason || typeof reason !== 'string' || !reason.trim()) {
    throw new ApplicationError(400, 'Reason is required');
  }

  const parsedEventCount = Number(eventCount);
  const application = await prisma.organizer_applications.create({
    data: {
      user_id: user.id,
      full_name: fullName.trim(),
      email: user.email,
      phone: phone || null,
      organization: organization || null,
      org_type: orgType || null,
      experience: experience || null,
      event_count: Number.isInteger(parsedEventCount) ? parsedEventCount : null,
      reason: reason.trim(),
      linkedin_url: linkedinUrl || null,
      social_media_url: socialMediaUrl || null,
      portfolio_url: portfolioUrl || null,
      document_name: documentName || null,
      status: 'PENDING',
    },
  });

  return {
    application: {
      id: application.id,
      fullName: application.full_name,
      email: application.email,
      phone: application.phone,
      organization: application.organization,
      orgType: application.org_type,
      experience: application.experience,
      eventCount: application.event_count,
      reason: application.reason,
      linkedinUrl: application.linkedin_url,
      socialMediaUrl: application.social_media_url,
      portfolioUrl: application.portfolio_url,
      documentName: application.document_name,
      status: application.status,
      createdAt: application.created_at,
    },
  };
}

module.exports = {
  ApplicationError,
  createOrganizerApplication,
};