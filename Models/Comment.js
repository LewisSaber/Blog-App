const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
    post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    text: {type: String, required: true},
    date: {type: Date, default: Date.now},
    liked: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}]
});

const Comment = mongoose.model('Comment', commentSchema);

// Creating an instance of the User model
module.exports = Comment