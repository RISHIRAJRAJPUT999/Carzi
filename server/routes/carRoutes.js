const express = require('express');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// POST /api/cars - Create a new car
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one image is required.' });
        }
        const imageUrls = [];
        for (const file of req.files) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: 'carzi_cars' }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                uploadStream.end(file.buffer);
            });
            imageUrls.push(result.secure_url);
        }
        const newCar = new Car({ ...req.body, images: imageUrls });
        const savedCar = await newCar.save();
        res.status(201).json(savedCar);
    } catch (err) {
        console.error("Error creating car:", err);
        res.status(400).json({ message: err.message });
    }
});

// GET /api/cars - Get all cars
router.get('/', async (req, res) => {
    try {
        const unavailableCars = await Car.find({ available: false });
        for (const car of unavailableCars) {
            const activeBooking = await Booking.findOne({
                carId: car._id,
                endDate: { $gte: new Date() }
            });
            if (!activeBooking) {
                await Car.findByIdAndUpdate(car._id, { available: true });
            }
        }
        const cars = await Car.find({}).populate('ownerId', 'name phone email');
        res.status(200).json(cars);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/cars/:id - Get a single car
router.get('/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id).populate('ownerId', 'name phone email');
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.status(200).json(car);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- THIS IS THE NEWLY ADDED CODE ---
// @route   PUT /api/cars/:id
// @desc    Update a car's details
// @access  Private (best practice)
router.put('/:id', async (req, res) => {
    try {
        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // Options to return the new version and run schema validators
        );

        if (!updatedCar) {
            return res.status(404).json({ message: 'Car not found' });
        }

        res.status(200).json(updatedCar);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/cars/:id - Delete a car
router.delete('/:id', async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.status(200).json({ message: 'Car deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;