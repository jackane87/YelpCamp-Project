const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

//We don't need to define username and password as that is added on by passport via the plugin below.
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

//this sets up using the passport local mongoose which will add on a username, password to schema, do some validations on fields and provides additional methods
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema);