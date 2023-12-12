const App = require("./Core/App.js")
const path = require("path");
const DependencyInjector = require("./Core/DependencyInjector")
const HomeController = require("./Controllers/HomeController")
const {PostService} = require("./Services/PostService");
const {CommentService} = require("./Services/CommentService");

function main() {
    let app = new App()
    app.configureStaticFilesPath(path.join(__dirname, "public"))
    app.addCookiesParser()
    app.addMongoDB("mongodb+srv://LewisSaber:Ub9s8jyulMlQ1vhy@lewiscluster.vevmcub.mongodb.net/blogApp")
    app.addUserModel(require("./Models/User"))
    app.addAuthorization()
    app.setLoginPath("/Account/Login/")

    DependencyInjector.registerSingleton(PostService)
    DependencyInjector.registerSingleton(CommentService)


    app.addControllers()
    app.setDefaultPath("/Home/Index")
    app.addViewOptions({
        title: "Blog App"
    })
    app.start(3001)

}

main()
