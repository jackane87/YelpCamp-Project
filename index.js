if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

/* We are loading modules here */
//Defining express which is a node.js web application framework. Helps us build our routes.
const express = require('express');
const app = express();
//Defining path module which provides functionality for us to be able to interact with file system.
const path = require('path');
//Defining mongoose which provides tools to allow us to model our application data in MongoDB.
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
//importing passport and passport-local for authentication purposes
const passport = require('passport');
const LocalStrategy = require('passport-local');
//user model is imported for authentication
const User = require('./models/user.js')
const { findByIdAndDelete } = require('./models/review.js');


//Requring the campgroundRoutes.js file here for all campground routes
const campgroundRoutes = require('./routes/campgroundRoutes');
//Requring the reviewsRoutes.js file here for all review routes
const reviewsRoutes = require('./routes/reviewsRoutes');
//Requiring the usersRoutes.js file here for all user routes
const usersRoutes = require('./routes/usersRoutes');

//opening a connection to our mongo db. If unsuccessful, the error will be logged to the console.
mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
.then(function(){
    console.log("Connection Open");
})
.catch(function(err){
    console.log("oh no error");
    console.log(err);
})

app.engine('ejs', ejsMate);
//Setting the view engine to ejs here
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
//This is setting up a public directory to serve
app.use(express.static(path.join(__dirname,'public')));

//This is used to setup a session with the parameters specified below
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 *60 * 24* 7,
        maxAge: 1000 * 60 *60 * 24* 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

//Setting up passport to use local authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//This these are middleware for ever single request
app.use(function(req, res, next){
    console.log(req.session)
    //This gives us access to req.user on every page under currentUser. We can use this to conditionally display items if user is logged in.
    res.locals.currentUser = req.user;
    //takes whatever is in the flash under success or error and have access to it in locals under keys 'success' or error. Can then be accessed on any of our ejs templates.
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//We are using all required route files here.
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', usersRoutes);

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