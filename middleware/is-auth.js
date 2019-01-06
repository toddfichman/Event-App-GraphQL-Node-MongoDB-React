const jwt = require('jsonwebtoken');


//Middleware to check to token is valid
module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) { //if the user is not authenticated
        req.isAuth = false; //add a value (isAuth) to the req object = false
        return next(); //next will be a function to continue to next process after authentication
    }
    const token = authHeader.split(' ')[1]; //Authorization vale will look like 'Bearer ervcrvw(token key)' 
    if (!token || token === '') {
        req.isAuth = false;
        return next();
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'secretkey') //checking to see if token has key I set in user resolver
    } catch (err) {
        req.isAuth = false;
        return next();
    }
    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }
    req.isAuth = true;
    req.userId = decodedToken.userId;
    next();
}