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
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const { findByIdAndDelete } = require('./models/review.js');

//Requring the campgroundRoutes.js file here for all campground routes
const campgroundRoutes = require('./routes/campgroundRoutes');
//Requring the reviewsRoutes.js file here for all review routes
const reviewsRoutes = require('./routes/reviewsRoutes');

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
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

//We are using all required route files here.
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', function(req, res){
    res.render('home')
})

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