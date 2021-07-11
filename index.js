require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const {
    generateModelTypes,
    generateApolloServer,
} = require('graphql-sequelize-generator');
const { models, Sequelize } = require('./db');
const graphqlSchemaDeclaration = require('./models_handlers');
const customMutations = require('./custom_mutations');
const authHelper = require('./helpers/auth');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const cleanPassLinkCronJob = require('./cron_jobs/clean_pass_link');
const changeReservationStatusCronJob = require('./cron_jobs/change_reservation_status');
const types = generateModelTypes(models);
const corsOptions = {
    origin: ['http://localhost:3000', 'http://tabo.io'],
    credentials: true
}
console.log(`cron job cleanPassLinkCronJob: ${cleanPassLinkCronJob.cleanPassLink()}`);
console.log(`cron job changeReservationStatusCronJob: ${changeReservationStatusCronJob.changeReservationStatus()}`);
const server = generateApolloServer({
    graphqlSchemaDeclaration,
    types,
    models,
    customMutations,
    apolloServerOptions: {
        playground: true,
        context: ({ req, connection }) => {
            const context = {
                req,
            };
            const token = req.headers.authorization || '';
            context.client = authHelper.verify(token);
            context.user = authHelper.verify(req.headers['x-token']);

            return context;
        },
        // Example of socket security hook.
        // subscriptions: {
        //     onConnect: (connectionParams, webSocket) => {
        //         return true
        //     }
        // }
    }
});

const app = express();


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    const allowedOrigins = ['http://localhost:3000', 'https://tabo.io', 'https://api.tabo.io',];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('X-Frame-Options', 'ALLOW-FROM ' + origin);
    }
    if ('OPTIONS' === req.method) {
        res.send(200)
    } else {
        next()
    }
})
// Don't use JSON parser for Stripe webhook routes
app.use((req, res, next) => {
    if (req.originalUrl.indexOf('/tabo/api/webhook/stripe') > -1) {
        // console.log(req.body);
        console.log('stripe webhook middleware json');
        return bodyParser.raw({ type: 'application/json' })(req, res, next);
    } else {
        return bodyParser.json({ limit: '2mb' })(req, res, next);
    }
});

// Don't use JSON parser for Stripe webhook routes
app.use((req, res, next) => {
    if (req.originalUrl.indexOf('/tabo/api/webhook/stripe') > -1) {
        return bodyParser.raw({ type: 'application/json' })(req, res, next);
    } else {
        return bodyParser.urlencoded({ extended: false })(req, res, next);
    }
});

app.use((req, res, next) => {
    if (req.headers['x-token']) {
        req.user = authHelper.verify(req.headers['x-token']);
    }
    next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: 'application/*+json' }));
app.use('/tabo/api', authRoutes);
app.use('/tabo/api', apiRoutes);
// app.get('/', async (req, res) => 
//     return res.status(200).json(req.body);
// })

server.applyMiddleware({
    app,
    cors: corsOptions,
    path: '/tabo/graphql'
});
// const hostname = "192.168.109.179";
// const port = "4000";
// app.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
// });
//Start the GraphQL server
app.listen({ port: 4000 }, () => {
    console.log(`🚀  Server ready`);
});
