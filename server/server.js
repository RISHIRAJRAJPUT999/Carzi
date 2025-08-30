const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

require("dotenv").config();

const app = express();

app.use(cors());

// --- THIS IS THE FIX ---
// Increase the limit to allow for larger payloads like image files.
// It's also good practice to include both middleware handlers.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


const DB_URI = process.env.DB_URI;

mongoose.connect(DB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas!');
  })
  .catch((err) => {
    console.error('❌ Could not connect to MongoDB Atlas...', err);
  });

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});