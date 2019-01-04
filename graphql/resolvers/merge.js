const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');

//functions that help merge data 

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: {$in: eventIds} }) 
        return events.map(event => {
            return transformEvent(event);
        })
    } catch (err) {
        throw err
    } 
}

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return transformEvent(event);
    } catch (err) {
        throw err
    }
}

const user = async userId => {
    try {
        const user = await User.findById(userId)
        return { ...user._doc, 
            _id: user.id, //overwriting user ID
            createdEvents: events.bind(this, user._doc.createdEvents) //binding created event to events function
         } 
    } catch (err) {
        throw err
    }
}

const transformEvent = event => {
    return { 
        ...event._doc, //._doc is a mongoose property which leaves out all meta data
        _id: event.id, //overwrting _id value with value returned by this function
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator) //value of creator will call function below
    }
};

const transformBooking = booking => {
    return { 
        ...booking._doc, 
        _id: booking.id, 
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
     }
}

//don't nned to export events, singleEvent, or user b/c they are only used in transformEvent and transformBooking

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;