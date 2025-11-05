const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// Prevent user from submitting more than one review per car
ReviewSchema.index({ car: 1, user: 1 }, { unique: true });


// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (carId) {
    const obj = await this.aggregate([
        {
            $match: { car: carId },
        },
        {
            $group: {
                _id: '$car',
                averageRating: { $avg: '$rating' },
                numOfReviews: { $sum: 1 },
            },
        },
    ]);

    try {
        await this.model('Car').findByIdAndUpdate(carId, {
            rating: obj[0] ? obj[0].averageRating : 0,
            reviews: obj[0] ? obj[0].numOfReviews : 0,
        });
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
ReviewSchema.post('save', async function () {
    await this.constructor.getAverageRating(this.car);
});

// Call getAverageRating after remove
ReviewSchema.post('deleteOne', { document: true, query: false }, async function () {
    await this.constructor.getAverageRating(this.car);
});

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
