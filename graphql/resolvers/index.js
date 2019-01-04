const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

//function the returns the events
const events = async eventIds => {
    try {
        const events = await Event.find({ _id: {$in: eventIds} }) 
        events.map(event => {
            return { 
                ...event._doc, 
                _id: event.id, //overwrting _id value with value returned by this function
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator) //value of creator will call function below
                }
        })
        return events;
    } catch (err) {
        throw err
    } 
}

const user = async userId => {
    try {
        const user = await User.findById(userId)
        return { ...user._doc, 
            _id: user.id, //overwriting user ID
            createdEvents: events.bind(this, user._doc.createdEvents)
         } 
    } catch (err) {
        throw err
    }
}


module.exports = { //points to object that have resolver functions
    events: async () => { //resolvers need same name as query/mutation to them
        try {
            const events = await Event.find() //find is a method from mongoose and if left blank, will return everything in Event collection
            return events.map(event => {
                return { 
                    ...event._doc, 
                    _id: event.id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator) //uses function at top to het creator id
                };
            })
        } catch (err) {
            throw err
        }
           
    },
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return { 
                    ...booking._doc, 
                    _id: booking.id, 
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updatedAt: new Date(booking._doc.updatedAt).toISOString()
                 }
            })
        } catch (err) {
            throw err;
        }
    },
    createEvent: async (args) => { //args is an object based on arguments passed in schema creation
        // const event = {
        //     _id: Math.random().toString(),
        //     title: args.eventInput.title,
        //     description: args.eventInput.description,
        //     price: +args.eventInput.price,
        //     date: args.eventInput.date
        // }
        // events.push(event);
        // return event;
        //event is the model from mongoose
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5c2e786774dc6ef774b67710'
        });

        let createdEvent;

        try {
            const result = await event.save()
            createdEvent = { 
                ...result._doc, 
                _id: result._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(), 
                creator: user.bind(this, result._doc.creator) }; //._doc is a mongoose property which leaves out all meta data
            const creator = await User.findById('5c2e786774dc6ef774b67710')
            
            if (!creator) { //if the user doesnt exists 
                throw new Error('User not found')
            }
            creator.createdEvents.push(event); //adding the event to the list of createdEvents for the user that created it
            await creator.save(); //updates user DB
    
            console.log(result, 'successful post to DB');
            return createdEvent
        } catch (err) {
            throw err
        }
          
    },
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
    bookEvent: async (args) => {
        const fetchedEvent = await Event.findOne({ _id: args.eventId }) //args.eventId is from graphql schema
        const booking = new Booking({
            user: '5c2e786774dc6ef774b67710',
            event: fetchedEvent
        });
        const result = await booking.save();
        return {
            ...result._doc,
            _id: result.id,
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString()
        }
    }
}