const express = require('express');
const cors = require('cors');

const eventRoutes = require('./routes/event.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const organizerRoutes = require('./routes/organizer.routes');
const bookingRoutes = require('./routes/booking.routes');
const applicationRoutes = require('./routes/application.routes');
const { authenticate, requireRole } = require('./middleware/auth.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticate, requireRole('ADMIN'), adminRoutes);
app.use('/api/organizer', authenticate, requireRole('ORGANIZER'), organizerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/applications', applicationRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;