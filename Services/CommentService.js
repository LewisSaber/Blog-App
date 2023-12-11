const commentModel = require("../Models/Comment");
const mongoose = require("mongoose");

class CommentService {
    constructor() {
        this.commentModel = commentModel;
    }

    validateCommentId(commentId) {
        return new Promise((resolve) => {
            resolve(mongoose.isValidObjectId(commentId));
        });
    }

    getComments(post) {
        return this.commentModel.find({post: post._id}).populate("author")
    }

    editComment(comment, body) {
        if (body.text !== undefined && body.text.trim() !== "") {
            comment.text = body.text.trim();
        }


        return comment.save();
    }

    addComment(postId, userId, text) {
        const newComment = new this.commentModel({post: postId, author: userId, text})
        return newComment.save()
    }

    deleteComment(commentId, userId) {
        return this.validateCommentId(commentId).then((result) => {
            if (!result) {
                return {success: false, message: "Invalid commentId format"};
            }

            return this.commentModel.findById(commentId).then((comment) => {
                if (!comment) {
                    return {success: false, message: "No comment found"};
                }

                if (!comment.userId.equals(userId)) {
                    return {success: false, message: "User mismatch"};
                }

                return this.commentModel
                    .findByIdAndDelete(comment._id)
                    .then(() => {
                        return {success: true, message: "Comment deleted successfully"};
                    });
            });
        });
    }

    
}

module.exports = {CommentService};