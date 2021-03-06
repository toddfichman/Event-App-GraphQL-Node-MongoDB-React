const { dateToString } = require('../../helpers/date');
const { transformEvent } = require('./merge');
const Event = require('../../models/event');
const User = require('../../models/user');


module.exports = { //points to object that have resolver functions
    events: async () => { //resolvers need same name as query/mutation to them
        try {
            const events = await Event.find() //find is a method from mongoose and if left blank, will return everything in Event collection
            return events.map(event => {
                return transformEvent(event);;
            })
        } catch (err) {
            throw err
        }
           
    },
    createEvent: async (args, req) => { //args is an object based on arguments passed in schema creation
        if(!req.isAuth) {
            throw new Error('Unauthenticated')
        }
        //event is the model from mongoose
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: dateToString(args.eventInput.date),
            creator: req.userId
        });

        let createdEvent;

        try {
            const result = await event.save()
            createdEvent = transformEvent(result);
            const creator = await User.findById(req.userId)
            
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
    
}