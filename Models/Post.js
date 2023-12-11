const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {type: String, default: "Unnamed post"},
    description: {type: String, default: ""},
    content: {type: String, default: ""},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: {type: Date, default: Date.now},
    published: {type: Boolean, default: false}
});

const Post = mongoose.model('Post', postSchema);

// Creating an instance of the User model
module.exports = Post