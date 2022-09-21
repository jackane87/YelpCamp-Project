const express = require('express');
const router = express.Router({mergeParams: true});

const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');

//These are our models
const Campground = require('../models/campground.js');
const Review = require('../models/review.js');

//Requiring the Joi review schema
const { reviewSchema } = require('../validationSchemas.js');

//review validation middleware
const validateReview = function(req, res, next){
    //This line is using the schema to validate the body and save the error if present.
    const { error } = reviewSchema.validate(req.body);
    //This is checking if there is an error to throw and express error with the error details and a status code
    if(error){
        //Details is an array of objects, so we are mapping over this and joining into a single string comma separated.
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg , 400)
    } else{
        next();
    }

}

//This route add a new review to specified campground
router.post('/', validateReview, wrapAsync(async function(req, res){
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}))

//This route deletes a specific review from the selected campground
router.delete('/:reviewId', wrapAsync(async function(req, res){
    //This line has destructured the id and reviewId from req.params
    const { id, reviewId } = req.params;
    //This line we are waiting for the review matching the reviewId to be removed from the specific campground
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId }});
    //This line we are waiting for the specific review to be deleted from the database.
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;