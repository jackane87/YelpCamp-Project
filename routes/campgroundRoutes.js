const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
//This is our Campground model
const Campground = require('../models/campground.js');
//Requiring the Joi campground schema
const {campgroundSchema} = require('../validationSchemas.js');

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

router.get('/', async function(req, res){
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
})

//This is the GET route for the new campground.
router.get('/new', function(req, res){
    res.render('campgrounds/new');
})

//This is our POST route for a new campground.
//validateCampground performs server side validation before completing the creation of a new campground and stops if validation fails.
router.post('/', validateCampground, wrapAsync(async function(req, res, next){
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
    }))

router.get('/:id', wrapAsync(async function(req, res){
        const campground = await Campground.findById(req.params.id).populate('reviews');
        res.render('campgrounds/show', {campground});
}))

router.get('/:id/edit', wrapAsync(async function(req, res){
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
}))

//This is our route for updating an existing campground. 
//validateCampground performs server side validation before moving forward and stops if validation fails.
router.put('/:id', validateCampground, wrapAsync(async function(req, res){
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`);
}))

//This route is deleting a specific campground from the database.
router.delete('/:id', wrapAsync(async function(req, res){
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds/');
}))

module.exports = router;