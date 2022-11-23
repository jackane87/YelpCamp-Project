//This file contains the Campground Controller methods that are used by the Campground Routes.

const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

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
    //This line is creating an array of image(s) received that includes the path and filename and adds that onto campground.images.
    campground.images =  req.files.map(f => ({url: f.path, filename: f.filename}))
    //This line sets the campground author to the currently logged in user.
    campground.author = req.user._id;
    await campground.save();
    console.log
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
    //This finds the campground and updates the body
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    //this is creating an array of the images being added to the campground.
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    //this adds the new images onto the images array for the campground the spread operator (...) is used to break out each image in the imgs array created above and push that image on to the campground.images array.
    campground.images.push(...imgs);
    await campground.save();
    //We are checking if we have the deleteImages array which would be added on if image(s) are selected to be deleted on edit page.
    if (req.body.deleteImages){
        //This is looping over each filename in the deleteImages array and is calling this build in destroy method which will delete the images from cloudinary
        for(let filename of req.body.deleteImages){
           await cloudinary.uploader.destroy(filename);
        }
        //This is removing each image reference from the database that is included in the deleteImages array.
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    console.log(campground);
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async function (req, res) {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Campground deleted successfully!');
    res.redirect('/campgrounds/');
}