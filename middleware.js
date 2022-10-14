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