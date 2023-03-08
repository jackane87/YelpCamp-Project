const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const { cloudinary } = require('../cloudinary');

const ImageSchema = new Schema({
            url: String,
            filename: String
});

//This virtual gets us a thumbnail to present on the edit page instead of full image.
ImageSchema.virtual('thumbnail').get(function(){
   return this.url.replace('/upload', '/upload/w_200,ar_4:3');
});

//this virtual is used so that the image carousel on that show page does not resize as it is shuffling through the images.
ImageSchema.virtual('cardImage').get(function(){
    return this.url.replace('/upload', '/upload/ar_4:3,c_crop');
});

//by default Mongoose does not include virtuals when converting a document to JSON, so this line sets it so it does and we pass this into the campground schema below. This will allow us to include the virtual properties below so they can populate in the map popups.
const opts = {toJSON: {virtuals: true}};

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    //setting up geojson for mapbox.
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {type: Schema.Types.ObjectId,
        ref: 'Review'
        }
    ]
}, opts);

//this virtual is used to create a properties object on campgrounds objects so that we can include details of the campground on the map displayed.
CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `
    <a href="/campgrounds/${this._id}">${this.title}</a>
    <p>${this.description.substring(0,20)}...</p>`;
});

CampgroundSchema.post('findOneAndDelete', async function (campground) {
    console.log('deleted')
    if(campground.reviews){
        await Review.deleteMany({_id: {$in: campground.reviews}})
    }
    //This is going to delete the images tied to a campground being deleted and delete them from cloudinary IF they are NOT one of the images in the seeds array below.
    if(campground.images){
        const seeds =   [
                      'YelpCamp/gantas-vaiciulenas-QchymJS9iJ0-unsplash_vkn0hw.jpg.jpg',
                      'YelpCamp/rlne7rsftz7se76dlpry.jpg',
                      'YelpCamp/NoImageAvailable_djf9g2.jpg',
        ]
 
        for (const img of campground.images) {
            if (!(img.filename in seeds)){
            await cloudinary.uploader.destroy(img.filename);
            }
    }}
})

module.exports = mongoose.model('Campground', CampgroundSchema)