class GlobalSettingsProvider {

    constructor() {
        this.settings = {}
    }


    addSetting(setting, value, category) {
        if (category == undefined) {
            this.settings[setting] = value
            return
        }
        if (this.settings[category] == undefined) this.settings[category] = {}
        this.settings[category][setting] = value

    }

    getSetting(setting, category) {
        return this.settings[category][setting]
    }

    getCategory(category) {
        return this.settings[category] || {}
    }
}

module.exports = GlobalSettingsProvider