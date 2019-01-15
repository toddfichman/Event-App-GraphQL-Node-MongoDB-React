const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// this package exports a middleware function that takes in 
// incoming requests and funnels them through a graphql
// query parser and forward them to the right resolvers
const graphqlHttp = require('express-graphql');

const graphQlSchema = require('./graphql/schema/index');

const graphQlResolvers = require('./graphql/resolvers/index');

const isAuth = require('./middleware/is-auth');



const app = express();

app.use(bodyParser.json());


//middleware to defines what request are allowed and by whom
app.use((req, res, next) => {
    //allows everyone to send requests to server
    res.setHeader('Access-Control-Allow-Origin', '*');

    //defines what kind of requests can be sent
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');

    //contols what kind of headers can be sent to server (like 2 headers above)
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if(req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(isAuth);

//this is where you config graphql api
//ex. where to find end points, where to find resolvers
app.use('/graphql', graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-22ex0.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`, { useNewUrlParser: true })
    .then(() => {
        app.listen(8000);
    })
    .catch(err => {
        console.log(err)
    })