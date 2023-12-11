const ControllerBase = require("../Core/ControllerBase.js")
const View = require("../Core/View.js")
const {PostService} = require("../Services/PostService");

class HomeController extends ControllerBase {

    constructor(props) {
        super(props)
        this.inject = [PostService]
    }

    getIndex({id, req, res}) {
        return this.PostService.getAllPublishedPosts().then((posts) => {
            return new View({posts})
        })

    }

    postIndex(req, res) {
        return new View()
    }
}

module.exports = HomeController