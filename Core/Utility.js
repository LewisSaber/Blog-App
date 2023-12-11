const fs = require('fs');
const path = require('path');


function $args(func) {
    return (func + '')
        .replace(/[/][/].*$/mg, '') // strip single-line comments
        .replace(/\s+/g, '') // strip white space
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
        .split('){', 1)[0].replace(/^[^(]*[(]/, '') // extract the parameters
        .replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',').filter(Boolean); // split & filter [""]
}


function validateEmailAndPassword(email, password) {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if the email is in a valid format
    if (!emailRegex.test(email)) {
        return {success: false, message: 'Invalid email format'};
    }

    // Check if the password meets certain criteria (e.g., minimum length)
    const minPasswordLength = 8;
    if (password.length < minPasswordLength) {
        return {success: false, message: 'Password must be at least 8 characters long'};
    }

    // If both email and password are valid, return success
    return {success: true, message: 'Email and password are valid'};
}

module.exports = {
    $args,
   
    validateEmailAndPassword
}