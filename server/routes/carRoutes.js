const express = require('express');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// POST /api/cars - Create a new car
router.post('/', protect, upload.array('images', 5), async (req, res) => {
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
        const newCar = new Car({ ...req.body, ownerId: req.user._id, images: imageUrls });
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
        const cars = await Car.find({}).populate('ownerId', 'name phone email');
        res.status(200).json(cars);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/cars/update-availability - Update car availability based on booking end dates
router.put('/update-availability', async (req, res) => {
    try {
        const unavailableCars = await Car.find({ available: false });
        let updatedCount = 0;

        for (const car of unavailableCars) {
            const activeBooking = await Booking.findOne({
                carId: car._id,
                endDate: { $gte: new Date() }, // Booking is still active or in the future
                bookingStatus: { $in: ['pending', 'confirmed'] } // Only consider pending or confirmed bookings
            });

            if (!activeBooking) {
                // If no active booking found, make the car available
                await Car.findByIdAndUpdate(car._id, { available: true });
                updatedCount++;
            }
        }
        res.status(200).json({ message: `Updated availability for ${updatedCount} cars.` });
    } catch (err) {
        console.error("Error updating car availability:", err);
        res.status(500).json({ message: err.message });
    }
});

// --- THIS IS THE NEW ROUTE ---
// @route   GET /api/cars/:carId/location
// @desc    Get the simulated (fake) GPS location of a car
// @access  Private
router.get('/:carId/location', protect, async (req, res) => {
    try {
        const { carId } = req.params;
        const car = await Car.findById(carId);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }



        return res.status(200).json(car.locationCoords);

    } catch (err) {
        console.error("Error in getCarLocation:", err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// --- END OF NEW ROUTE ---

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
router.put('/:id', protect, async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        // Security check: Only owner can update
        if (car.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this car' });
        }

        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // Options to return the new version and run schema validators
        );

        res.status(200).json(updatedCar);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   POST /api/cars/:carId/reviews
// @desc    Submit a review for a car
// @access  Private
router.post('/:carId/reviews', protect, async (req, res) => {
    const { carId } = req.params;
    const userId = req.user ? req.user._id : null;

    if (!carId || !userId) {
        return res.status(400).json({ message: 'Invalid carId or userId' });
    }

    const { rating, comment } = req.body;

    try {
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }



        const existingReview = await Review.findOne({ car: carId, user: userId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already submitted a review for this car' });
        }

        const review = new Review({
            car: carId,
            user: req.user._id,
            rating: Number(rating),
            comment,
        });

        await review.save();

        res.status(201).json({ message: 'Review added' });
    } catch (err) {
        console.error("Error submitting review:", err);
        res.status(400).json({ message: err.message });
    }
});

// @route   GET /api/cars/:carId/reviews
// @desc    Get all reviews for a car
// @access  Public
router.get('/:carId/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ car: req.params.carId }).populate('user', 'name');
        res.status(200).json(reviews);
    } catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/cars/:id - Delete a car
router.delete('/:id', protect, async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        // Security check: Only owner can delete
        if (car.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this car' });
        }

        await Car.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Car deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;