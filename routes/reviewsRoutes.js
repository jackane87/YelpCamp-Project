const express = require('express');
const router = express.Router({mergeParams: true});

const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');

//These are our models
const Campground = require('../models/campground.js');
const Review = require('../models/review.js');

//Requiring validateReview middleware from the middleware file
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

//This route add a new review to specified campground. First runs isLoggedIn middleware to check if user is logged in, otherwise redirects to Login
//Then validates the review (i.e. makes sure there is a comment and rating.
router.post('/', isLoggedIn, validateReview, wrapAsync(async function(req, res){
    //Finding the campground for which attempting to add review to.
    const campground = await Campground.findById(req.params.id);
    //This is the review (comment and rating).
    const review = new Review(req.body.review);
    //Here we are setting the review author to the currently logged in user.
    review.author = req.user._id;
    //Adding the review to the campground
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Review created successfully!');
    res.redirect(`/campgrounds/${campground._id}`);

}))

//This route deletes a specific review from the selected campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async function(req, res){
    //This line has destructured the id and reviewId from req.params
    const { id, reviewId } = req.params;
    //This line we are waiting for the review matching the reviewId to be removed from the specific campground
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId }});
    //This line we are waiting for the specific review to be deleted from the database.
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;