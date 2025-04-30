var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/nodeauth');

var db = mongoose.connection;

var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    profileimage: {
        type: String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = async function(newUser) {
    try {
        const savedUser = await newUser.save(); // Returns a promise
        console.log('User saved successfully:', savedUser);
        return savedUser; // Return the saved user if needed
    } catch (err) {
        console.error('Error saving user:', err);
        throw err; // Throw the error for higher-level handling
    }
}