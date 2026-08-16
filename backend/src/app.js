const express = require('express');
const cors = require('cors');

const eventRoutes = require('./routes/event.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const { authenticate, requireRole } = require('./middleware/auth.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticate, requireRole('ADMIN'), adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;