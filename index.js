/* We are loading modules here */
//Defining express which is a node.js web application framework. Helps us build our routes.
const express = require('express');
const app = express();
//Defining path module which provides functionality for us to be able to interact with file system.
const path = require('path');
//Defining mongoose which provides tools to allow us to model our application data in MongoDB.
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
//loading the campgroundSchema and reviewSchema validation schemas.
const {campgroundSchema, reviewSchema } = require('./validationSchemas.js');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
//This is our Campground model
const Campground = require('./models/campground.js');
//This is our Review model
const Review = require('./models/review.js');
const { findByIdAndDelete } = require('./models/review.js');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
.then(function(){
    console.log("Connection Open");
})
.catch(function(err){
    console.log("oh no error");
    console.log(err);
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));

//campground validation middleware
const validateCampground = function(req, res, next){
        //This line is using the schema to validate the body and save the error if present.
        const { error } = campgroundSchema.validate(req.body);
        //This is checking if there is an error to throw and express error with the error details and a status code
        if(error){
            //Details is an array of objects, so we are mapping over this and joining into a single string comma separated.
            const msg = error.details.map(el => el.message).join(',')
            throw new ExpressError(msg , 400)
        } else{
            next();
        }

}

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


app.get('/', function(req, res){
    res.render('home')
})

app.get('/campgrounds', async function(req, res){
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
})

//This is the GET route for the new campground.
app.get('/campgrounds/new', function(req, res){
    res.render('campgrounds/new');
})

//This is our POST route for a new campground.
//validateCampground performs server side validation before completing the creation of a new campground and stops if validation fails.
app.post('/campgrounds', validateCampground, wrapAsync(async function(req, res, next){
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
    }))

app.get('/campgrounds/:id', wrapAsync(async function(req, res){
        const campground = await Campground.findById(req.params.id).populate('reviews');
        res.render('campgrounds/show', {campground});
}))

app.get('/campgrounds/:id/edit', wrapAsync(async function(req, res){
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}))

//This is our route for updating an existing campground. 
//validateCampground performs server side validation before moving forward and stops if validation fails.
app.put('/campgrounds/:id', validateCampground, wrapAsync(async function(req, res){
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`);
}))

//This route is deleting a specific campground from the database.
app.delete('/campgrounds/:id', wrapAsync(async function(req, res){
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds/');
}))

//This route add a new review to specified campground
app.post('/campgrounds/:id/reviews', validateReview, wrapAsync(async function(req, res){
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}))

//This route deletes a specific review from the selected campground
app.delete('/campgrounds/:id/reviews/:reviewId', wrapAsync(async function(req, res){
    //This line has destructured the id and reviewId from req.params
    const { id, reviewId } = req.params;
    //This line we are waiting for the review matching the reviewId to be removed from the specific campground
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId }});
    //This line we are waiting for the specific review to be deleted from the database.
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

app.all('*', function(req, res, next){
    next(new ExpressError('Page Not Found', 404))
})

app.use(function(err, req, res, next){
    //This line destructures the error to isolate the statusCode to be used. It also sets the default value to 500 in case one is not recieved.
    const { statusCode = 500} = err;
    //This line will update the error object with a default message in the event that the error doesn't have a message.
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    //This will render our error template. We're passing through the entire error so we'll have access to it on the template.
    res.status(statusCode).render('error', { err });
})

app.listen(3000, function(){
    console.log('serving on port 3000')
})