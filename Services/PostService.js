const postModel = require("../Models/Post")
const mongoose = require("mongoose")

class PostService {

    constructor() {
        this.postModel = postModel

    }

    validatePostId(postId) {
        return new Promise((resolve) => {
            resolve(mongoose.isValidObjectId(postId));
        });
    }

    editPost(post, body) {
        if (body.title)
            post.title = body.title
        if (body.description)
            post.description = body.description
        if (body.content)
            post.content = body.content
        if (body.published)
            post.published = body.published

        return post.save()

    }

    getPostById(postId, identityUser, checkAuthor = true) {
        return this.validatePostId(postId).then(result => {

            if (!result) return {success: false, message: "No post found"}
            return this.postModel.findById(postId).then(post => {
                if (!post) {
                    return {success: false, message: "No post found"};
                }

                return {success: true, post};
            }).then(result => {
                if (!result.success) return result
                let authorMatch = identityUser.isSameUser(result.post.author)
                if (checkAuthor && !authorMatch) return {
                    success: false,
                    message: "author mismatch"
                }
                if (!result.post.published && !authorMatch) return {
                    success: false,
                    message: "author mismatch, unpublished post"
                }
                return result.post.populate("author").then((post) => {
                    return {success: true, message: "success", post, authority: authorMatch}
                })

            })

        })
    }

    deletePostById(postId, identityUser) {
        return this.validatePostId(postId)
            .then(result => {
                if (!result) {
                    return {success: false, message: "Invalid postId format"};
                }

                return this.postModel.findById(postId)
                    .then(post => {
                        if (!post) {
                            return {success: false, message: "No post found"};
                        }

                        if (!identityUser.isSameUser(post.author._id)) {
                            return {success: false, message: "Author mismatch"};
                        }


                        return this.postModel.findByIdAndDelete(post._id)
                            .then(() => {
                                return {success: true, message: "Post deleted successfully"};
                            });
                    });
            })
            .catch(error => {
                console.error('Error during post deletion:', error);

            });
    }


    createPost(author) {
        return new this.postModel({author}).save()
    }

    getPosts(userModel) {
        return this.postModel.find({author: userModel._id});
    }

    getAllPosts() {
        return this.postModel.find().populate("author")
    }

    getAllPublishedPosts(popul = false) {
        return this.postModel.find({published: true}).then(result => {
            if (popul) return result.populate("author")
            return result
        })
    }


}


module.exports = {PostService}