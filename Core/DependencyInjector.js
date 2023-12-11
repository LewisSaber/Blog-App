class DependencyInjector {
    constructor() {
        this.container = {}
        DependencyInjector.instance = this
    }

    static getInstance() {
        if (DependencyInjector.instance == undefined) {
            new DependencyInjector()
        }
        return DependencyInjector.instance
    }

    static getDependency(dependency) {
        let dep = DependencyInjector.getInstance().container[
            dependency
            ]
        if (dep == undefined) {

            console.error("Cant find dependency", dependency)
        }
        return dep.getInstance()
    }

    static registerSingleton(dependencyInterface, dependency, constructorParams) {
        if (dependency == undefined) {
            dependency = dependencyInterface
        }
        let dependencyInstance = new SingletonDependency(dependency, constructorParams)
        dependencyInstance.instance = dependencyInstance.getInstance()
        DependencyInjector.getInstance().container[dependencyInterface] =
            dependencyInstance
        return this.getDependency(dependency)
    }

    static registerTransient(dependencyInterface, dependency, constructorParams) {
        if (dependency == undefined) {
            dependency = dependencyInterface
        }
        DependencyInjector.getInstance().container[dependencyInterface] =
            new TransientDependency(dependency, constructorParams)
    }
}

class Dependency {
    constructor(service, constructorParams) {
        this.constructorParams = constructorParams
        this.service = service
    }

    getInstance() {

        let serviceInstance = new this.service(this.constructorParams)
        let injectionlist = serviceInstance.inject
        if (injectionlist != undefined && Array.isArray(injectionlist)) {
            for (const dependency of injectionlist) {
                let propertyName
                let injectTarget
                if (dependency.property != undefined && dependency.target != undefined) {

                    propertyName = dependency.property
                    injectTarget = dependency.target
                } else {
                    propertyName = dependency.name
                    injectTarget = dependency
                }

                serviceInstance[propertyName] =
                    DependencyInjector.getDependency(injectTarget)
            }
        }
        if (serviceInstance.Constructor != undefined) serviceInstance.Constructor()
        return serviceInstance
    }
}

class SingletonDependency extends Dependency {
    getInstance() {
        if (this.instance) return this.instance
        return super.getInstance()
    }
}

class TransientDependency extends Dependency {
}

module.exports = DependencyInjector
