const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const User = require('../models/user');
const passport = require('passport');

router.get('/register', function(req, res){
    res.render('users/register')
})

router.post('/register', wrapAsync(async function(req, res){
    //We will try to register the user
    try{
    const {email, username, password} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);
    //this is logging in the user that was just successfully registered so they don't have to login after registering. If there is an error in the login process, the error will be passed to our error handler.
    req.login(registeredUser, function(err){
        if(err) return next(err);
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
    })
    //if there is an error in the registration process, the error will be caught and flashed and the user is redirected back to the register page.
    }  catch(e){
        req.flash('error', e.message)
        res.redirect('register')
    }
}))

router.get('/login', function(req,res){
    res.render('users/login')
})

//This is the POST route that logs the user in. If there is an error in the login and error will be flashed and the user redirected to the login screen.
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), function(req, res){
    //if the login is successful, flash the welcome message and redirect to campgrounds
    req.flash('success', 'Welcome Back ' + req.user.username + '!');
    //Variable stores the returnTo Url if one is present. This would be if user attempted to access a page that requires login, that path is saved and user is redirected to login.
    //With this we can redirec them to the URL they were trying to access before being redirected to the login screen. If a returnTo url was NOT present, then redirectURL is set to campgrounds route.
    const redirectUrl = req.session.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
})

//req.logout() requires a callback function as an argument. Within the callback we handle any errors and execute the flash message and redirect to campgrounds
router.get('/logout', function(req, res, next){
    //here is the callback. If there are errors return the error; otherwise, present the flash and redirect.
    req.logout(function(err){
        if (err) { return next(err);}
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });

})

module.exports = router;