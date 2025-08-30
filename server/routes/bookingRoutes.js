const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const { protect } = require('../middleware/authMiddleware');
const pdf = require('pdf-creator-node');
const fs = require('fs');
const path = require('path');

// @route   POST /api/bookings
// @desc    Create a new booking for the logged-in user
// @access  Private
router.post('/', protect, async (req, res) => {
    const customerId = req.user._id;
    const { carId, startDate, endDate, totalAmount, paymentMethod, customerDetails } = req.body;

    try {
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (!car.available) {
            return res.status(400).json({ message: 'This car is not available for booking.' });
        }

        const newBooking = new Booking({
            carId,
            customerId,
            ownerId: car.ownerId,
            startDate,
            endDate,
            totalAmount,
            paymentMethod,
            customerDetails
        });

        const savedBooking = await newBooking.save();

        // After saving the booking, update the car's status to unavailable
        await Car.findByIdAndUpdate(carId, { available: false });

        res.status(201).json(savedBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get all bookings for the logged-in customer
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ customerId: req.user._id })
            .populate('carId', 'title images brand model location pricePerDay')
            .sort({ startDate: -1 });
            
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/bookings/owner-bookings
// @desc    Get all bookings for the logged-in car owner
// @access  Private
router.get('/owner-bookings', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ ownerId: req.user._id })
            .populate('carId', 'title images')
            .populate('customerId', 'name email')
            .sort({ startDate: -1 });

        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// @route   GET /api/bookings/invoice/:bookingId
// @desc    Generate and download a PDF invoice for a booking
// @access  Private
router.get('/invoice/:bookingId', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
            .populate('carId')
            .populate('customerId', 'name email phone')
            .populate('ownerId', 'name email phone');

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.customerId._id.toString() !== req.user.id && booking.ownerId._id.toString() !== req.user.id) {
            return res.status(401).json({ message: "User not authorized" });
        }

        const html = fs.readFileSync(path.join(__dirname, '../invoice-template.html'), 'utf-8');
        const filename = `invoice_${booking._id}.pdf`;
        const invoicesDir = path.join(__dirname, '../invoices');

        if (!fs.existsSync(invoicesDir)){
            fs.mkdirSync(invoicesDir);
        }

        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        const diffTime = Math.abs(endDate - startDate);
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const subtotal = booking.carId.pricePerDay * days;
        
        const document = {
            html: html,
            data: {
                booking: {
                    ...booking.toObject(),
                    startDate: startDate.toLocaleDateString('en-IN'),
                    endDate: endDate.toLocaleDateString('en-IN')
                },
                days: days,
                subtotal: subtotal
            },
            path: path.join(invoicesDir, filename)
        };

        await pdf.create(document, { format: "A4", orientation: "portrait", border: "10mm" });
        
        res.download(document.path);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error generating invoice." });
    }
});


// @route   PUT /api/bookings/:bookingId/pay
// @desc    Update a booking's payment status to 'completed'
// @access  Private (only for the car owner)
router.put('/:bookingId/pay', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.ownerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        booking.paymentStatus = 'completed';
        await booking.save();

        res.status(200).json({ message: 'Payment status updated to completed' });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;