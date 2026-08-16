const express = require('express');
const cors = require('cors');

const eventRoutes = require('./routes/event.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', eventRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;