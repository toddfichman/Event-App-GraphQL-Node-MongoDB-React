const bcrypt = require('bcryptjs');
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
    }
}