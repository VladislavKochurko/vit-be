import mongoose, { CallbackError } from 'mongoose';
import { logger } from './logger.js';

export const connectToDB = (connectionString: string, cb: () => void): void => {
  mongoose.connect(connectionString, (err: CallbackError) => {
    if (err) {
      logger.error('MongoDB connection error');
      connectToDB(connectionString, cb);
    }

    logger.info('MongoDB connected');
    cb();
  });
};
