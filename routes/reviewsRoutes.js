const express = require('express');
const router = express.Router({mergeParams: true});
//Requiring the Campground Controller where we've defined all our controller methods.
const reviewsController = require('../controllers/reviewsController');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');

//Requiring validateReview middleware from the middleware file
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

//This route add a new review to specified campground. First runs isLoggedIn middleware to check if user is logged in, otherwise redirects to Login
//Then validates the review (i.e. makes sure there is a comment and rating.
router.post('/', isLoggedIn, validateReview, wrapAsync(reviewsController.addReview));

//This route deletes a specific review from the selected campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewsController.deleteReview))

module.exports = router;