const DependencyInjector = require("./DependencyInjector.js")
const MyFileReader = require("./MyFileReader.js")
const Express = require("express");
const path = require("path")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose")
const ControllerRegistry = require("./ControllerRegistry.js")
const GlobalSettingProvider = require("./GlobalSettingsProvider")
const UserManager = require("./UserManager")
const {IdentityUser} = require("./IdentityUser");
const jwt = require("jsonwebtoken")

class App {
    constructor() {
        DependencyInjector.registerSingleton(MyFileReader)
        DependencyInjector.registerSingleton(Express)
        DependencyInjector.registerSingleton(GlobalSettingProvider)
        this.userManager = DependencyInjector.registerSingleton(UserManager)
        this.appSettings = DependencyInjector.getDependency(GlobalSettingProvider)
        this.app = DependencyInjector.getDependency(Express)
        this.app.set('view engine', 'ejs')
        this.app.set('views', path.join(__dirname, "..", 'Views'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: true}));


    }

    configureStaticFilesPath(path) {
        this.app.use(Express.static(path));
    }

    setLoginPath(path) {
        this.appSettings.addSetting("loginPath", path, "Authorization")
    }

    setDefaultPath(path) {
        // Set the default path
        this.app.get("/", (req, res) => {
            res.redirect(path);
        });
    }

    addControllers() {
        DependencyInjector.registerSingleton(ControllerRegistry)

        let fr = DependencyInjector.getDependency(MyFileReader)
        let controllers = fr.getAllFilePaths("./Controllers")

        for (const controller of controllers) {
            const controllerClass = require("../" + controller)
            DependencyInjector.registerSingleton(controllerClass, undefined, {path: controller})
            DependencyInjector.getDependency(ControllerRegistry).addController(DependencyInjector.getDependency(controllerClass))
        }
    }

    addUserModel(model) {
        this.appSettings.addSetting("user", model, "Authorization")
    }

    addViewOptions(options) {
        for (const option in options) {
            this.appSettings.addSetting(option, options[option], "View")
        }
    }

    addAuthorization() {
        let userModel = this.appSettings.getSetting("user", "Authorization")
        DependencyInjector.registerTransient(IdentityUser)

        if (userModel == undefined) {
            userModel = require("./DefaultUser")
            this.appSettings.addSetting("user", userModel, "Authorization")
        }

        this.app.use((req, res, next) => {
            const token = req.cookies[this.appSettings.getSetting("tokenCookieName", "Authorization")]
            const identityUser = DependencyInjector.getDependency(IdentityUser)
            
            req.user = identityUser
            //no token found
            if (token == undefined) {
                next()
            } else {
                const secretKey = this.appSettings.getSetting("secretKey", "Authorization")
                jwt.verify(token, secretKey, (err, decoded) => {
                    if (err) {
                        this.userManager.removeTokenFromCookie(res)
                        next()
                    } else {
                        const {email, password} = decoded
                        this.userManager.signIn(email, password).then(result => {
                            //no user found
                            if (!result.success) {
                                this.userManager.removeTokenFromCookie(res)
                                next()
                            } else {
                                identityUser.authentificate(result.model)
                                next()
                            }
                        }).catch(error => {

                            console.error('Error finding user:', error);
                        })

                    }
                });
            }

        })

    }

    addMongoDB(connectionString) {
        mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }

    addCookiesParser() {
        this.app.use(cookieParser())
    }

    start(PORT = 3000) {
        this.app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }


}

module.exports = App