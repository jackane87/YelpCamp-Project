//Defining joi which is a schema description language and data validator.
const { number, string } = require('joi');
const baseJoi = require('joi');
//importing the sanitize-html package to be used to create our own sanitize extension for joi
const sanitizeHTML = require('sanitize-html');

//this is a joi extension that will escape any HTML that is passed in
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML:{
            validate(value, helpers){
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if(clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean;
            }
        }
    }
})

//Definining Joi as the baseJoi with our extension created above added to it.
const Joi = baseJoi.extend(extension);

//Joi schema for Campground data validation.
module.exports.campgroundSchema = Joi.object({
    //Campground is the object on the new.ejs page and we check that it is present (required)
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        //image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
});

//Joi schema for Review data validation
module.exports.reviewSchema = Joi.object({
    //Review is the object on the show.ejs page and we check that it is present (required)
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});