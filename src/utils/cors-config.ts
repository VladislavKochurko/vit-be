import { CorsOptions } from 'cors';
import { allowedDomains } from './constants.js';
import { ServerError } from './error-handler.js';

const isDevMode = () => process.env.NODE_ENV === 'dev';

export const corsConfig: CorsOptions = {
  origin: (requestOrigin: string, callback) => {
    if (allowedDomains.includes(requestOrigin) || isDevMode) {
      callback(null, true);
    } else {
      callback(new ServerError({ status: 401, message: 'Blocked by CORS policy' }));
    }
  },
};
