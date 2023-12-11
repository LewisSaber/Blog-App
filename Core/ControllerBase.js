const Express = require("express")
const View = require("../Core/View.js")
const ControllerRegistry = require("../Core/ControllerRegistry.js")
const GlobalSettingProvider = require("./GlobalSettingsProvider");

class ControllerBase {

    get inject() {
        return this._inject;
    }

    set inject(value) {
        if (Array.isArray(value)) {
            this._inject = this._inject.concat(value);
        } else {
            console.error('Invalid value assigned to "inject". Expected an array.');
        }
    }

    constructor({path}) {
        this._inject = []
        this.options = {}
        this.path = path
        this.inject = [{
            property: "Express",
            target: Express
        }, {
            property: "registry",
            target: ControllerRegistry
        }, {property: "appSettings", target: GlobalSettingProvider}]
    }


    Constructor() {

        this.createAndSetupRouter()

        const methods = Object.getOwnPropertyNames((Object.getPrototypeOf(this)))
        for (const method of methods) {
            this.WrapMethod(method)

        }

    }

    addAuthentification(roles = []) {
        this.options.authentification = roles
    }

    WrapMethod(methodName) {
        if (!ControllerBase.isRoutingMethod(methodName)) return
        let action = ControllerBase.getMethodAction(methodName)
        let methodRoute = "/" + ControllerBase.extractActionFromMethodName(methodName)
        let wrapper = ControllerBase.createWrapper(methodName, methodRoute, this)
        this[methodName + "Wrapper"] = wrapper
        switch (action) {
            case "get":
                this.router.get(methodRoute, wrapper)
                break
            case "post":
                this.router.post(methodRoute, wrapper)
                break
        }

    }

    static createWrapper(methodName, methodRoute, Controller) {
        return async function (req, res, next) {

            const actionResult = await Controller[methodName]({
                body: req.body, ...req.query,
                req,
                res,
                next
            })
            if (actionResult instanceof View) {
                let additionalViewParams = {
                    user: req?.user || {},
                    ...Controller.appSettings.getCategory("View")
                }
                const viewPath = Controller.routingPath.substring(1) + methodRoute + '.ejs';
                actionResult.addMainViewPath('_Layout.ejs').addViewPath(viewPath).addParams(additionalViewParams).render(res)
            }
        }
    }

    redirectToAction(action, controller, req, res, params) {
        if (res == undefined) console.error("No response provided for redirection")

        let controllerInstance = this.registry.getController(controller)
        let query = []
        for (const param in params) {
            query.push(param + "=" + params[param])
        }
        let querystring = ""
        if (query.length != 0) {
            querystring += "?" + query.join("&")
        }

        res.redirect(controllerInstance.routingPath + "/" + action + querystring)


    }

    setupAuthentification() {
        if (this.options.authentification) {
            this.router.use((req, res, next) => {
                if (req.user && req.user.isAuthentificated) {
                    next()
                } else {
                    let loginPath = this.appSettings.getSetting("loginPath", "Authorization")
                    if (loginPath == undefined) loginPath = "/"
                    res.redirect(loginPath)
                }

            })

        }
    }

    createAndSetupRouter() {
        this.router = Express.Router()
        this.routingPath = "/" + this.path.replace("Controllers\\", "").replace("Controller.js", "")
        this.setupAuthentification()
        this.Express.use(this.routingPath, this.router)
    }

    static routerStarts = ["get", "post"]

    static isRoutingMethod(methodName) {
        for (const start of ControllerBase.routerStarts) {
            if (methodName.startsWith(start)) {
                return true
            }
        }
        return false
    }


    static getMethodAction(methodName) {
        for (const start of ControllerBase.routerStarts) {
            if (methodName.startsWith(start)) {
                return start
            }
        }
    }

    static extractActionFromMethodName(methodName) {
        let start = ControllerBase.getMethodAction(methodName)
        return methodName.replace(start, "")
    }

}


module.exports = ControllerBase