const ControllerBase = require("../Core/ControllerBase.js")
const View = require("../Core/View.js")
const UserManager = require("../Core/UserManager")
const {PostService} = require("../Services/PostService");

class UserProfileController extends ControllerBase {

    constructor(props) {
        super(props)
        this.inject = [UserManager, PostService]
    }

    Constructor() {
        this.addAuthentification()
        super.Constructor();
    }

    getIndex({req}) {

        return new View()
    }

    getEdit() {
        return new View()
    }

    getChangePassword() {
        return new View()
    }

    postChangePassword({body, req, res}) {
        if (body.newPassword != body.confirmNewPassword) return new View()
        return this.UserManager.changePassword(req.user.model, body.currentPassword, body.newPassword).then(
            () => {
                this.UserManager.signIn(req.user.model.email, body.newPassword).then((result) => {
                    this.UserManager.addTokenToCookie(result.token, res)
                    return this.redirectToAction("Index", "UserProfile", req, res)
                })
            }
        )
    }

    postEdit({req, res, body}) {
        req.user.model.email = body.email
        req.user.model.name = body.name
        req.user.model.save()
        return this.redirectToAction("Index", "UserProfile", req, res)
    }

    getPosts({req, res, body}) {
        return this.PostService.getPosts(req.user.model).then(posts => {
            return new View({posts})
        })

    }
}

module.exports = UserProfileController