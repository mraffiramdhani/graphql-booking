const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

const Event = require("./models/event");

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
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
      createEvent(input: EventInput): Event
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
    rootValue: {
      events: () => {
        return Event.find()
          .then((events) => events.map((event) => ({ ...event._doc })))
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
      createEvent: ({ input }) => {
        const event = new Event({
          title: input.title,
          description: input.description,
          price: input.price,
          date: new Date(input.date),
        });
        return event
          .save()
          .then((result) => ({ ...result._doc }))
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
    },
    graphiql: true,
  })
);

console.log(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@clusterexperimental.ztste.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@clusterexperimental.ztste.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
