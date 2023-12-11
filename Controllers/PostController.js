const ControllerBase = require("../Core/ControllerBase.js")
const View = require("../Core/View.js")
const {PostService} = require("../Services/PostService");
const {fileUploadHandler} = require("../Core/Utility");
const {CommentService} = require("../Services/CommentService");

class PostController extends ControllerBase {

    constructor(props) {
        super(props);
        this.inject = [CommentService, PostService]
    }

    getView({req, res, id}) {
        return this.PostService.getPostById(id, req.user, false).then(result => {
            if (!result.success) return res.redirect("/")
            return this.CommentService.getComments(result.post).then(comments => new View({
                post: result.post,
                authority: result.authority,
                comments
            }))

        })
    }


    getCreatePost({req, res}) {
        if (!req.user.isAuthentificated) return res.redirect("/")
        return this.PostService.createPost(req.user.model).then(newPost => {
            return this.redirectToAction("Edit", "Post", req, res, {id: newPost._id})
        })
    }

    getEdit({id, req, res}) {

        if (!req.user.isAuthentificated || id == undefined) return res.redirect("/")
        return this.PostService.getPostById(id, req.user).then(result => {
            if (!result.success) return res.redirect("/")
            return new View({post: result.post})
        })

    }

    postEdit({id, req, res, body}) {
        console.log({body}, req.body)
        if (!req.user.isAuthentificated || id == undefined) return res.redirect("/")
        return this.PostService.getPostById(id, req.user).then(result => {
            if (!result.success) return res.redirect("/")

            return this.PostService.editPost(result.post, body)
        }).then(() => {
            if (body.action == "saveAndView") {
                return this.redirectToAction("View", "Post", req, res, {id})
            }
            return this.redirectToAction("Posts", "UserProfile", req, res)
        })
    }


    getDelete({id, req, res}) {
        if (!req.user.isAuthentificated || id == undefined) return res.redirect("/")
        return this.PostService.deletePostById(id, req.user).then(result => {
            if (!result.success) return res.redirect("/")
            return this.redirectToAction("Posts", "UserProfile", req, res)
        })
    }


    postIndex(req, res) {
        return new View()
    }
}

module.exports = PostController