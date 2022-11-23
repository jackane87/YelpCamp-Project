//Defining joi which is a schema description language and data validator.
const { number, string } = require('joi');
const Joi = require('joi');

//Joi schema for Campground data validation.
module.exports.campgroundSchema = Joi.object({
    //Campground is the object on the new.ejs page and we check that it is present (required)
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        //image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
    deleteImages: Joi.array()
});

//Joi schema for Review data validation
module.exports.reviewSchema = Joi.object({
    //Review is the object on the show.ejs page and we check that it is present (required)
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});