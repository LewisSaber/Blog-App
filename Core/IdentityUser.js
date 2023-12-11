class IdentityUser {

    constructor() {
        this.isAuthentificated = false

    }

    isSameUser(model_id) {
        if (!this.isAuthentificated) return false
        return model_id.equals(this.model._id)
    }

    getModelId() {
        return this.model?._id
    }

    authentificate(model) {
        this.model = model
        this.isAuthentificated = true
    }
}

module.exports = {IdentityUser}