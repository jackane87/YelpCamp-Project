const express = require('express');
const router = express.Router();
//Requiring the Campground Controller where we've defined all our controller methods.
const campgroundController = require('../controllers/campgroundController');
//Requiring the wrapAsync utility that lets us handle potential errors from async functions.
const wrapAsync = require('../utils/wrapAsync');
//Requiring the middleware that checks if a user is logged in.
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');



//router.get('/', wrapAsync(campgroundController.index));

//This is the GET route for the new campground. First check if user is logged in, then if so display form.
router.get('/new', isLoggedIn, campgroundController.renderNewForm);

//This is our POST route for a new campground.
//validateCampground performs server side validation before completing the creation of a new campground and stops if validation fails.
//router.post('/', isLoggedIn, validateCampground, wrapAsync(campgroundController.createCampground));

//This is the get route for getting a specific camground
//router.get('/:id', wrapAsync(campgroundController.showCampground));

//GET route for editing a campground
router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(campgroundController.renderEditForm));

//This is our route for updating an existing campground. 
//first check user is logged in, then check to make sure user is author (creator) of campground, then validateCampground performs server side validation before moving forward and stops if validation fails.
//router.put('/:id', isLoggedIn, isAuthor, validateCampground, wrapAsync(campgroundController.editCampground));

//This route is deleting a specific campground from the database.
//router.delete('/:id', isLoggedIn, isAuthor, wrapAsync(campgroundController.deleteCampground));

//express allows for chainable route handlers as shown below. These work exactly the same as the routes above that are commented out.
router.route('/')
    .get(wrapAsync(campgroundController.index))
    .post(isLoggedIn, validateCampground, wrapAsync(campgroundController.createCampground))

router.route('/:id')
    .get(wrapAsync(campgroundController.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, wrapAsync(campgroundController.editCampground))
    .delete(isLoggedIn, isAuthor, wrapAsync(campgroundController.deleteCampground))

module.exports = router;