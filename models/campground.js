const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

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
});

//This is mongoose middleware that will delete all reviews associated with the campground being deleted.
CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)