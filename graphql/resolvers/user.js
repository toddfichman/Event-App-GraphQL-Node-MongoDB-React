const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');
const User = require('../../models/user');


module.exports = { //points to object that have resolver functions
    createUser: async (args) => {
        try {
            const exisitingUser = await User.findOne({email: args.userInput.email}) //Checking user DB to see if email exists already
            if (exisitingUser) { //if the user exists 
                throw new Error('User already exists')
            } // else create user
            //THIS HASHES USER PASSWORD
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12) //1st arg = what to hash, 2nd arg = length of salt used to hash
        
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword //stores hashed password in DB
            });
            const result = await user.save(); //saves user to DB
            return { ... result._doc, password: null, _id: result.id }  //set password to null so it isnt returned     
        } catch (err) {
            throw err;
        }
    },
    login: async ({email, password}) => {
        const user = await User.findOne({ email: email }); //looking to see if email exists
        if (!user) {
            throw new Error('User does not exist');
        }
        const isEqual = await bcrypt.compare(password, user.password); //compares stored password and incoming password
        if (!isEqual) { //if the user exists but the password is incorrect
            throw new Error('Incorrect password');
        }
        //sign method creates a token
        //1st arg is extra data to attach to token, 2nd arg is a key used to hash the token, 3rd arg is to config token
        const token = jwt.sign({ userId: user.id, email: user.email }, 'secretkey', { expiresIn: '1h' });  
        return { userId: user.id, token: token, tokenExpiration: 1 }; 
    }
}