const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
//This is our Campground model
const Campground = require('../models/campground.js');
//Requiring the Joi campground schema
const { campgroundSchema } = require('../validationSchemas.js');
//Requiring the middleware that checks if a user is logged in.
const { isLoggedIn } = require('../middleware');

//campground validation middleware
const validateCampground = function (req, res, next) {
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

router.get('/', async function (req, res) {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})

//This is the GET route for the new campground.
router.get('/new', isLoggedIn, function (req, res) {
    //If user is logged in display the add new campground page.
    res.render('campgrounds/new');
})

//This is our POST route for a new campground.
//validateCampground performs server side validation before completing the creation of a new campground and stops if validation fails.
router.post('/', isLoggedIn, validateCampground, wrapAsync(async function (req, res, next) {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.get('/:id', wrapAsync(async function (req, res) {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    //checking to see if the id specified exists. If it does not, then display flash error and redirect to campgrounds list page.
    if (!campground) {
        req.flash('error', 'Campground cannot be found.');
        return res.redirect('/campgrounds');
    }
    //if the id specified exists, display the requested campground 
    else {
        res.render('campgrounds/show', { campground });
    }
}))

router.get('/:id/edit', isLoggedIn, wrapAsync(async function (req, res) {
    const campground = await Campground.findById(req.params.id);
    //checking to see if the id specified exists. If it does not, then display flash error and redirect to campgrounds list page.
    if (!campground) {
        req.flash('error', 'Campground cannot be found.');
        return res.redirect('/campgrounds');
    }
    //display the edit page for the requested campground
    else {
        res.render('campgrounds/edit', { campground });
    }
}))

//This is our route for updating an existing campground. 
//validateCampground performs server side validation before moving forward and stops if validation fails.
router.put('/:id', isLoggedIn, validateCampground, wrapAsync(async function (req, res) {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

//This route is deleting a specific campground from the database.
router.delete('/:id', isLoggedIn, wrapAsync(async function (req, res) {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground deleted successfully!');
    res.redirect('/campgrounds/');
}))

module.exports = router;