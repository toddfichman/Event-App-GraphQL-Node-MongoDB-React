const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// this package exports a middleware function that takes in 
// incoming requests and funnels them through a graphql
// query parser and forward them to the right resolvers
const graphQlHttp = require('express-graphql');

const graphQlSchema = require('./graphql/schema/index');

const graphQlResolvers = require('./graphql/resolvers/index');

const isAuth = require('./middleware/is-auth');



const app = express();

app.use(bodyParser.json());

app.use(isAuth);

//this is where you config graphql api
//ex. where to find end points, where to find resolvers
app.use('/graphql', graphQlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-22ex0.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`, { useNewUrlParser: true })
    .then(() => {
        app.listen(8080);
    })
    .catch(err => {
        console.log(err)
    })