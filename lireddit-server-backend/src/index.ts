import 'reflect-metadata';
// import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
// import { Post } from "./entities/Post";
// import microConfig from "./mikro-orm.config";
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { HelloResolver } from "./entities/resolvers/hello";
import { PostResolver } from "./entities/resolvers/post";
import { UserResolver } from './entities/resolvers/user';
import session from 'express-session';
import pg from 'pg';
import connectPg from 'connect-pg-simple';
import cors from 'cors';
// import { User } from './entities/User';
import{createConnection} from 'typeorm'
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import { Upvote } from './entities/Upvote';
import { createUserLoader } from './utils/createUserLoader';
import { createUpvoteLoader } from './utils/createUpvoteLoader';

// psql -U postgres lireddit < node_modules/connect-pg-simple/table.sql
const main = async() => {
  const conn = await createConnection({
    type: 'postgres',
    database: 'lireddit2',
    username: 'postgres',
    password: 'postgres',
    logging : true,
    synchronize:true,
    migrations:[path.join(__dirname, './migrations/*')],
    entities:[Post, User,Upvote]
    
  });
  conn.runMigrations();
  // await Post.delete({}); // delete all posts
  // const orm = await MikroORM.init(microConfig);
  // await orm.em.nativeDelete(User, {}); // clear users
  // await orm.getMigrator().up(); // runs migrations 
  // const post = orm.em.create(Post, { title:' my first post'}); //constuctor
  // await orm.em.persistAndFlush(post); // run sql

  // graphql endpoints
  const app = express();

  const pgSession = connectPg(session);
  const pgPool = new pg.Pool({
      password: 'postgres',
      database: 'lireddit',
      user: 'postgres'
    })
      app.set("trust proxy", 1);
       app.use(cors({
      origin: "http://localhost:3000",
      credentials: true,
    }))
   
    app.use(
      session({
        name: COOKIE_NAME,
        store: new pgSession({pool :pgPool}),
        secret:'popololo', 
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 1000*60*60*24*365*10, // 10 years
          httpOnly: true,
          sameSite: "lax", //csrf
          // secure: __prod__ ,// cookie only works in https
      }
      }),
      
    );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    // context: ({req, res}) => ({em : orm.em, req, res}
    context: ({req, res}) => ({ 
      req,
       res,
        userLoader: createUserLoader(),
        upvoteLoader: createUpvoteLoader(),
      }),// make it accessible to your resolvers
   });
  

    apolloServer.applyMiddleware({
      app,
      cors: false,
    });

  
  app.listen(4000, () => {
    console.log("server started on port 4000")
  })
}

main();

