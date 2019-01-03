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
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

const events = eventIds => {
    return Event.find({ _id: {$in: eventIds} }) 
        .then(events => {
            return events.map(event => {
                return { 
                    ...event._doc, 
                    _id: event.id, //overwrting _id value with value returned by this function
                    creator: user.bind(this, event.creator) //value of creator will call function below
                 }
            })
        })
        .catch(err => {
            throw err;
    })
}

const user = userId => {
    return User.findById(userId)
            .then(user => {
                return { ...user._doc, 
                    _id: user.id, //overwriting user ID
                    createdEvents: events.bind(this, user._doc.createdEvents)
                 } 
            })
            .catch(err => {
                throw err;
    })
}

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
            creator: User!
        }

        type User {
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User 
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
                        return { 
                            ...event._doc, 
                            _id: event.id,
                            creator: user.bind(this, event._doc.creator) //uses function at top to het creator id
                        };
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
                date: new Date(args.eventInput.date),
                creator: '5c1a696159d929dc24818701'
            });

            let createdEvent;

            return event.save()
                .then(result => {
                    createdEvent = { ...result._doc, _id: result._doc._id.toString(), creator: user.bind(this, result._doc.creator) }; //._doc is a mongoose property which leaves out all meta data
                    return User.findById('5c1a696159d929dc24818701')
                    
                })
                .then(user => {
                    if (!user) { //if the user doesnt exists 
                        throw new Error('User not found')
                    }
                    user.createdEvents.push(event); //adding the event to the list of createdEvents for the user that created it
                    return user.save(); //updates user DB
                })
                .then(result => {
                    console.log(result, 'successful post to DB');
                    return createdEvent
                })
                .catch(err => {
                    console.log(err, 'failed post to DB');
                    throw err;
                })
        },
        createUser: (args) => {
            return User.findOne({email: args.userInput.email}) //Checking user DB to see if email exists already
                .then(user => {
                    if (user) { //if the user exists 
                        throw new Error('User already exists')
                    } // else create user
                    //THIS HASHES USER PASSWORD
                    return bcrypt.hash(args.userInput.password, 12) //1st arg = what to hash, 2nd arg = length of salt used to hash
                }) 
                .then(hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword //stores hashed password in DB
                    });
                    return user.save(); //saves user to DB
                })
                .then(result => {
                     return { ... result._doc, password: null, _id: result.id }  //set password to null so it isnt returned     
                })
                .catch(err => {
                    throw err
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