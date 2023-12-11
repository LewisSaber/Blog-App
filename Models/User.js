const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
});

const User = mongoose.model('User', userSchema);

// Creating an instance of the User model
module.exports = User