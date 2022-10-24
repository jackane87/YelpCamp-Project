const Review = require('../models/review');
const Campground = require('../models/campground.js');

module.exports.addReview = async function(req, res){
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

}

module.exports.deleteReview = async function(req, res){
    //This line has destructured the id and reviewId from req.params
    const { id, reviewId } = req.params;
    //This line we are waiting for the review matching the reviewId to be removed from the specific campground
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId }});
    //This line we are waiting for the specific review to be deleted from the database.
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/campgrounds/${id}`);
}