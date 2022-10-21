//Requiring the Joi campground and review schemas
const { campgroundSchema, reviewSchema } = require('./validationSchemas.js');

const ExpressError = require('./utils/ExpressError');
//This is our Campground model
const Campground = require('./models/campground.js');
//This is our Review model
const Review = require('./models/review.js');

//Checking if user is signed in. If not, flash the error and redirect to the login page.
module.exports.isLoggedIn = function(req, res, next){
    if(!req.isAuthenticated()){
        //Adding to session the url attempting to navigate to when user is not logged in. We can then use once the user is logged in to take them where they were attempting to go.
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

//campground validation middleware
module.exports.validateCampground = function (req, res, next) {
    //This line is using the schema to validate the body and save the error if present.
    const { error } = campgroundSchema.validate(req.body);
    //This is checking if there is an error to throw and express error with the error details and a status code
    if (error) {
        //Details is an array of objects, so we are mapping over this and joining into a single string comma separated.
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//This is authorization middleware that checks to make sure the user that is trying to edit/delete a particular campground is the owner of the campground. If not, display a message indicating they don't have permission and redirect
//to the campground show page.
module.exports.isAuthor = async function(req, res, next){ 
const { id } = req.params;   
const campground = await Campground.findById(id);
if(!campground.author.equals(req.user._id)){
    req.flash('error', 'You do not have permission');
    //We need the return here to stop subsequent execution. Before this was added, the campground would be delted anyway.
    return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//This is authorization middleware that checks to make sure the user that is trying to delete a particular review is the author of the review. If not, display a message indicating they don't have permission and redirect
//to the campground show page.
module.exports.isReviewAuthor = async function(req, res, next){ 
    const { id, reviewId } = req.params;   
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission');
        //We need the return here to stop subsequent execution. Before this was added, when the delete route was hit, it would show the message you don't have permission, but delete the review anyway.
        return res.redirect(`/campgrounds/${id}`);
        }
        next();
    }

//review validation middleware
module.exports.validateReview = function(req, res, next){
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

//This middleware takes the returnto address from req.session and saves to res.locals. When we are using the ReturnTo address is is when we are redirected to the login page because a user is NOT logged in
//Once they do login the sessionid changes (Passport made this change in recent update for security purposes). Ian(devsprout) has a tutorial on youtube that showed how to create this middleware to solve the issue.
module.exports.checkReturnTo = function(req, res, next){
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo
    }
    next();
}