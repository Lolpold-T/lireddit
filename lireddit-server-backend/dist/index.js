"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const constants_1 = require("./constants");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./entities/resolvers/hello");
const post_1 = require("./entities/resolvers/post");
const user_1 = require("./entities/resolvers/user");
const express_session_1 = __importDefault(require("express-session"));
const pg_1 = __importDefault(require("pg"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const cors_1 = __importDefault(require("cors"));
const typeorm_1 = require("typeorm");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const path_1 = __importDefault(require("path"));
const Upvote_1 = require("./entities/Upvote");
const createUserLoader_1 = require("./utils/createUserLoader");
const createUpvoteLoader_1 = require("./utils/createUpvoteLoader");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield typeorm_1.createConnection({
        type: 'postgres',
        database: 'lireddit2',
        username: 'postgres',
        password: 'postgres',
        logging: true,
        synchronize: true,
        migrations: [path_1.default.join(__dirname, './migrations/*')],
        entities: [Post_1.Post, User_1.User, Upvote_1.Upvote]
    });
    conn.runMigrations();
    const app = express_1.default();
    const pgSession = connect_pg_simple_1.default(express_session_1.default);
    const pgPool = new pg_1.default.Pool({
        password: 'postgres',
        database: 'lireddit',
        user: 'postgres'
    });
    app.set("trust proxy", 1);
    app.use(cors_1.default({
        origin: "http://localhost:3000",
        credentials: true,
    }));
    app.use(express_session_1.default({
        name: constants_1.COOKIE_NAME,
        store: new pgSession({ pool: pgPool }),
        secret: 'popololo',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: "lax",
        }
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({
            req,
            res,
            userLoader: createUserLoader_1.createUserLoader(),
            upvoteLoader: createUpvoteLoader_1.createUpvoteLoader(),
        }),
    });
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    app.listen(4000, () => {
        console.log("server started on port 4000");
    });
});
main();
//# sourceMappingURL=index.js.map