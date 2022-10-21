const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');

//This is our Campground model
const Campground = require('../models/campground.js');
//Requiring the middleware that checks if a user is logged in.
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

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
    //This line sets the campground author to the currently logged in user.
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

//This is the get rout for getting a specific camground
router.get('/:id', wrapAsync(async function (req, res) {
    //here we are finding the campground we've selected to view
    const campground = await Campground.findById(req.params.id).populate(
        //Here we are populating each review for the campground
        {path: 'reviews',
        //Here we are populating the author of each review
        populate: {
            path: 'author'
        //This last populate is populating the author of the campground    
        }}).populate('author');
    console.log(campground);
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

//GET route for editing a campground
router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(async function (req, res) {
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
router.put('/:id', isLoggedIn,isAuthor, validateCampground, wrapAsync(async function (req, res) {
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

//This route is deleting a specific campground from the database.
router.delete('/:id', isLoggedIn, isAuthor, wrapAsync(async function (req, res) {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground deleted successfully!');
    res.redirect('/campgrounds/');
}))

module.exports = router;