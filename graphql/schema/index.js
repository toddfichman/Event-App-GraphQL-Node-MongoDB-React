// buildSchema allows you to write schema as a string
// then graphql converts it to an object
const { buildSchema } = require('graphql');


//type, input, schema, query and mutation, are set key words in graphql
        //querys get data, and mutations alter data
    //input is used to pass a list or arguments (to query or mutation) as a single argument
    // [Strings!] is saying the data connected to events key must be a list of strings
        // ! means the item associated cannot be null
module.exports = buildSchema(` 
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
    `)