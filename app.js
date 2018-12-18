const express = require('express');
const bodyParser = require('body-parser');

// this package exports a middleware function that takes in 
// incoming requests and funnels them through a graphql
// query parser and forward them to the right resolvers
const graphQlHttp = require('express-graphql');

// buildSchema allows you to write schema as a string
// then graphql converts it to an object
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());

//this is where you config graphql api
//ex. where to find end points, where to find resolvers
app.use('/graphql', graphQlHttp({
    //type, schema, query and mutation are set key words in graphql
        //querys get data, and mutations alter data
    // [Strings!] is saying the data connected to events key must be a list of strings
    schema: buildSchema(` 
        type RootQuery {
            events: [String!]!
        }

        type RootMutation {
            createEvent(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: { //points to object that have resolver functions
        events: () => { //resolvers need same name as query/mutation to them
            return ['Eating', 'Running', 'Party at Bills']
        },
        createEvent: (args) => { //args is an object based on arguments passed in schema creation
            const eventName = args.name;
            return eventName;
        }
    },
    graphiql: true
}));

app.listen(8080);