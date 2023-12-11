const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const defaultUser = mongoose.model('LUsers', userSchema);
module.exports = defaultUser