//This file contains the Campground Controller methods that are used by the Campground Routes.

const Campground = require('../models/campground');

module.exports.index = async function (req, res) {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = function (req, res) {
    //display the add new campground page.
    res.render('campgrounds/new');
}

module.exports.createCampground = async function (req, res, next) {
    const campground = new Campground(req.body.campground);
    //This line sets the campground author to the currently logged in user.
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async function (req, res) {
    //here we are finding the campground we've selected to view
    const campground = await Campground.findById(req.params.id).populate(
        //Here we are populating each review for the campground
        {path: 'reviews',
        //Here we are populating the author of each review
        populate: {
            path: 'author'
        //This last populate is populating the author of the campground    
        }}).populate('author');
    //checking to see if the id specified exists. If it does not, then display flash error and redirect to campgrounds list page.
    if (!campground) {
        req.flash('error', 'Campground cannot be found.');
        return res.redirect('/campgrounds');
    }
    //if the id specified exists, display the requested campground 
    else {
        res.render('campgrounds/show', { campground });
    }
}

module.exports.renderEditForm = async function (req, res) {
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
}

module.exports.editCampground = async function (req, res) {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async function (req, res) {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground deleted successfully!');
    res.redirect('/campgrounds/');
}