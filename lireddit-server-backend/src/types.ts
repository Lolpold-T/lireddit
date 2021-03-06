// import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import {Request, Response} from 'express';
import { Session, SessionData } from "express-session";
import { createUpvoteLoader } from './utils/createUpvoteLoader';
import { createUserLoader } from './utils/createUserLoader';

export type MyContext = {
  // em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
  req: Request & {
    session: Session & Partial<SessionData> & {userId?:number};
  };
  res: Response; 
  userLoader: ReturnType<typeof createUserLoader>
  upvoteLoader: ReturnType<typeof createUpvoteLoader>
}