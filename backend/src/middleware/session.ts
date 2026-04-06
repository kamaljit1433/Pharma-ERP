import session from 'express-session';
import { RedisStore } from 'connect-redis';
import redisClient from '../config/redis';
import config from '../config';

const sessionMiddleware = session({
  store: new RedisStore({
    client: redisClient.getClient(),
    prefix: 'ems:sess:',
  }),
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.env === 'production',
    httpOnly: true,
    maxAge: config.session.maxAge,
    sameSite: 'lax',
  },
  name: 'ems.sid',
});

export default sessionMiddleware;
