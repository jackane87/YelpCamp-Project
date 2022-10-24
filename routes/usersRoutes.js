const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const usersController = require('../controllers/usersController');
const { checkReturnTo } = require('../middleware');
const passport = require('passport');

//This route GETS the registration form
//router.get('/register', usersController.renderRegisterForm);

//This route POSTS the user registration to create the new user
//router.post('/register', wrapAsync(usersController.register));

//express allows for chainable route handlers as shown below. These work exactly the same as the routes above that are commented out.
router.route('/register')
    .get(usersController.renderRegisterForm)
    .post(wrapAsync(usersController.register))

//This route GETS the login form
//router.get('/login', usersController.renderLogin);

//This is the POST route that logs the user in. If there is an error in the login and error will be flashed and the user redirected to the login screen.
//router.post('/login', checkReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), usersController.login);

//express allows for chainable route handlers as shown below. These work exactly the same as the routes above that are commented out.
router.route('/login')
    .get(usersController.renderLogin)
    .post(checkReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), usersController.login)

router.get('/logout', usersController.logout);

module.exports = router;