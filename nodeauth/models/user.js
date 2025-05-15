var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/nodeauth');

//var db = mongoose.connection;

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


module.exports.getUserById = async function(id) {
    try {
        const user = await User.findById(id);
        return user; // Return the user object
    } catch (err) {
        console.error('Error fetching user by ID:', err);
        throw err; // Allow higher-level error handling
    }
}

module.exports.getUserByUsername = async function(username) {
    try {
        const user = await User.findOne({ username });
        return user; // Return the user object
    } catch (err) {
        console.error('Error fetching user by username:', err);
        throw err; // Allow higher-level error handling
    }
}

module.exports.comparePassword = async function(candidatePassword, hash) {
    try {
        return await bcrypt.compare(candidatePassword, hash);
    } catch (err) {
        console.error('Error comparing passwords:', err);
        throw err; // Allow higher-level error handling
    }
}

module.exports.createUser = async function(newUser) {
    try {
        const salt = await bcrypt.genSalt(10); // Wait for the salt to be generated
        newUser.password = await bcrypt.hash(newUser.password, salt); // Wait for hashing
    
        const savedUser = await newUser.save(); // Save the user after hashing
        console.log('User saved successfully:', savedUser);
        return savedUser; // Return the saved user if needed
    } catch (err) {
        console.error('Error saving user:', err);
        throw err; // Throw the error for higher-level handling
    }
}