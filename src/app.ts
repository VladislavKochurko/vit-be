import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';

import countriesRouter from './resources/countries/countries.router.js';
import covidRouter from './resources/covid/covid.router.js';
import { ServerError } from './utils/error-handler.js';
import { IServerError } from './common/interfaces/common.interfaces';
import { corsConfig } from './utils/cors-config.js';
import { reqLogger, logger } from './utils/logger.js';
import { connectToDB } from './utils/connect-to-db.js';

const { config } = dotenv;
config();

const app = express();
app.use(express.json());
app.use(cors(corsConfig));
app.use(helmet());

app.use(reqLogger);

app.use('/countries', countriesRouter);
app.use('/covid', covidRouter);

app.all('*', (req: express.Request, res: express.Response) => {
  res.status(404).json('Route not recognized');
});

app.use((err: IServerError | unknown, req: express.Request, res: express.Response) => {
  logger.error(err);
  if (err instanceof ServerError) {
    res.status(err.status).json(err.message);
  } else {
    res.status(500).json('Internal server error');
  }
});

connectToDB(process.env.MONGO_CONNECTION_STRING, () => {
  app.listen(process.env.PORT || 3000, () => {
    logger.info(`Server is listening on ${process.env.PORT || 3000}`);
  });
});
