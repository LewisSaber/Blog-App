const ControllerBase = require("../Core/ControllerBase.js")
const bcrypt = require("bcrypt");
const {validateEmailAndPassword} = require("../Core/Utility.js")
const User = require("../Models/User.js")
const View = require("../Core/View.js")
const UserManager = require("../Core/UserManager")

class AccountController extends ControllerBase {
    constructor(params) {
        super(params)
        this.inject = [UserManager]

    }

    getRegister(req, res) {
        return new View()
    }

    postLogout({req, res}) {
        this.UserManager.removeTokenFromCookie(res)
        return this.redirectToAction("Index", "Home", req, res)
    }

    async postRegister({body, req, res}) {

        if (body.Password != body.RepeatPassword) return false
        const signUpResult = await this.UserManager.signUp(body.Email, body.Password)
        if (signUpResult.success) {
            let result = await this.UserManager.signIn(body.Email, body.Password)
            if (result.token) {
                this.UserManager.addTokenToCookie(result.token, res)

            }
            return this.redirectToAction("Index", "Home", req, res)
        }

        return new View()


    }

    async getLogin() {
        return new View()
    }

    async postLogin({body, req, res}) {
        
        return this.UserManager.signIn(body.Email, body.Password).then(result => {
                if (result.success == true) {
                    this.UserManager.addTokenToCookie(result.token, res)
                    return this.redirectToAction("Index", "Home", req, res)
                }
                return new View()
            }
        )

    }
}

module.exports = AccountController