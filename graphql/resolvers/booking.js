const { transformBooking, transformEvent } = require('./merge');

const Booking = require('../../models/booking');
const Event = require('../../models/event');



module.exports = { //points to object that have resolver functions
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return transformBooking(booking);
            })
        } catch (err) {
            throw err;
        }
    },
    bookEvent: async (args) => { //same name at in rootMuation (graphql schema)
        const fetchedEvent = await Event.findOne({ _id: args.eventId }) //args.eventId is from graphql schema
        const booking = new Booking({
            user: '5c2e786774dc6ef774b67710',
            event: fetchedEvent
        });
        const result = await booking.save();
        return transformBooking(result);
    },
    cancelBooking: async (args) => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformEvent(booking.event)
            await Booking.deleteOne({_id: args.bookingId})
            return event;
        } catch(err) {
            throw err
        }
    }
}