const DependencyInjector = require("./DependencyInjector.js")

class ControllerRegistry {
    constructor() {
        this.controllers = {}
    }

    addController(controller) {
        let controllerName = controller.constructor.name.replace("Controller", "")
        this.controllers[controllerName] = controller
    }

    getController(controller) {

        return DependencyInjector.getDependency(this.controllers[controller].constructor)
    }

}

module.exports = ControllerRegistry