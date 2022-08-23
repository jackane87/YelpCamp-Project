const mongoose = require('mongoose');
const Campground = require('../models/campground.js');
const cities = require('./cities.js');
const {places, descriptors} = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
.then(function(){
    console.log("Connection Open");
})
.catch(function(err){
    console.log("oh no error");
    console.log(err);
})

const sample = function(array){
   return array[Math.floor(Math.random() * array.length)];
}

const seedDB = async function(){
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000)
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        });
        await camp.save();
    }
}

seedDB()
.then(function(){
    mongoose.connection.close();
})