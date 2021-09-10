const express = require('express');
const router = express.Router({ mergeParams: true});
const wrapAsync = require('../utilities/wrapAsync');
const ExpressError = require('../utilities/ExpressError');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { validateReview } = require('../middleware');

router.post('/', validateReview, wrapAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', 'New review created!');
    res.redirect(`/campgrounds/${camp._id}`);
}));

router.delete('/:reviewId', wrapAsync(async (req, res) => {
    console.log('deleting...');
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;