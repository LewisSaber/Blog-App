const GlobalSettingProvider = require("./GlobalSettingsProvider")
const {validateEmailAndPassword} = require("./Utility");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
const jwt = require("jsonwebtoken")

class UserManager {
    inject = [{property: "appSettings", target: GlobalSettingProvider}]


    constructor() {

    }

    Constructor() {
        this.appSettings.addSetting("secretKey", "LewisSaber", "Authorization")
        this.appSettings.addSetting("tokenCookieName", "LSJWKAuth", "Authorization")
    }

    addTokenToCookie(token, res) {
        let cookieKey = this.appSettings.getSetting("tokenCookieName", "Authorization")
        res.cookie(cookieKey, token, {httpOnly: true});
    }

    removeTokenFromCookie(res) {
        res.clearCookie(this.appSettings.getSetting("tokenCookieName", "Authorization"));
    }

    async checkPassword(password, passwordHash) {
        return bcrypt.compare(password, passwordHash)
    }

    changePassword(user, old_password, new_password) {
        return this.checkPassword(old_password, user.password).then(match => {
            if (!match) return {success: false, message: "Password mismatch"}
            return this.encryptPassword(new_password).then(hash => {
                user.password = hash
                return user.save()
            })

        })

    }

    signIn(email, password) {
        console.log("Signing in with ", email, password)
        const UserModel = this.appSettings.getSetting("user", "Authorization");


        return UserModel.findOne({email})
            .then(user => {
                if (!user) {
                    return {success: false, message: 'User not found'};
                }

                return this.checkPassword(password, user.password)
                    .then(match => {
                        if (match) {
                            const token = jwt.sign({
                                password,
                                email: user.email
                            }, this.appSettings.getSetting("secretKey", "Authorization"), {expiresIn: '24h'});


                            return {success: true, message: 'Sign-in successful', token, model: user};
                        } else {
                            return {success: false, message: 'Invalid password'};
                        }
                    });
            })
            .catch(error => {
                console.error('Error during sign in:', error);
                throw error;
            });
    }

    encryptPassword(password) {
        return bcrypt.genSalt(10).then(salt => bcrypt.hash(password, salt))
    }

    signUp(email, password) {
        let validationResult = validateEmailAndPassword(email, password)
        if (validationResult.success) {
            const UserModel = this.appSettings.getSetting("user", "Authorization")
            return UserModel.findOne({email})
                .then(existingUser => {
                    if (existingUser) {
                        return {success: false, message: 'User with this email already exists'};
                    }

                    return this.encryptPassword(password)
                        .then(hash => {
                            // Create and save the new user
                            const newUser = new UserModel({email, password: hash});
                            return newUser.save();
                        })
                        .then(savedUser => {
                            return {success: true, message: 'User registration successful'};
                        });
                })
                .catch(error => {
                    // Handle errors (e.g., user already exists)
                    console.error('Error during sign up:', error);
                    throw error; // Propagate the error to the calling code
                });
        } else {
            return Promise.resolve({success: false, message: 'Validation failed'});
        }


    }


}

module.exports = UserManager