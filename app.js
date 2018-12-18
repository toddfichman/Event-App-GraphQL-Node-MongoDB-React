const express = require('express');
const bodyParser = require('body-parser');

// this package exports a middleware function that takes in 
// incoming requests and funnels them through a graphql
// query parser and forward them to the right resolvers
const graphQlHttp = require('express-graphql');

// buildSchema allows you to write schema as a string
// then graphql converts it to an object
const { buildSchema } = require('graphql');

const mongoose = require('mongoose');

const Event = require('./models/event');

const app = express();

app.use(bodyParser.json());

//this is where you config graphql api
//ex. where to find end points, where to find resolvers
app.use('/graphql', graphQlHttp({
    //type, input, schema, query and mutation, are set key words in graphql
        //querys get data, and mutations alter data
    //input is used to pass a list or arguments (to query or mutation) as a single argument
    // [Strings!] is saying the data connected to events key must be a list of strings
        // ! means the item associated cannot be null
    schema: buildSchema(` 
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: { //points to object that have resolver functions
        events: () => { //resolvers need same name as query/mutation to them
            return Event.find() //find is a method from mongoose and if left blank, will return everything in Event collection
                .then(events => {
                    return events.map(event => {
                        return { ...event._doc, _id: event.id };
                    })
                })
                .catch(err => {
                    throw err
                })
        },
        createEvent: (args) => { //args is an object based on arguments passed in schema creation
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
                date: new Date(args.eventInput.date)
            });

            return event.save()
                .then(result => {
                    console.log(result, 'successful post to DB');
                    return { ...result._doc, _id: result._doc._id.toString() }; //._doc is a mongoose property which leaves out all meta data
                })
                .catch(err => {
                    console.log(err, 'failed post to DB');
                    throw err;
                })
        }
    },
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-22ex0.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`, { useNewUrlParser: true })
    .then(() => {
        app.listen(8080);
    })
    .catch(err => {
        console.log(err)
    })