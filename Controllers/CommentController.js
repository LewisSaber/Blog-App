const ControllerBase = require("../Core/ControllerBase.js")
const View = require("../Core/View.js")
const {PostService} = require("../Services/PostService");
const {CommentService} = require("../Services/CommentService");

class CommentController extends ControllerBase {

    Constructor() {
        this.addAuthentification()
        super.Constructor();
    }

    constructor(props) {
        super(props)
        this.inject = [PostService, CommentService]
    }

    async postAdd({id, req, res, body}) {
        if (id == undefined) return res.redirect("/")
        if (body.text == undefined || body.text.trim() == "") return res.redirect("/")
        await this.CommentService.addComment(id, req.user.getModelId(), body.text)

        return this.redirectToAction("View", "Post", req, res, {id})


    }


}

module.exports = CommentController