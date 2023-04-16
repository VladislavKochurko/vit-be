import morgan from 'morgan';
import express from 'express';
import winston from 'winston';
import { resolve } from 'path';
import { __dirname, maxLogFiles, maxLogFilesSize } from './constants.js';

interface CustomLevels extends winston.Logger {
  requests: winston.LeveledLogMethod
}

const loggerFiles = {
  errorFile: {
    level: 'error',
    filename: resolve(__dirname, 'logs', 'errors.log'),
    maxFiles: maxLogFiles,
    maxsize: maxLogFilesSize,
  },
  reqFile: {
    level: 'requests',
    filename: resolve(__dirname, 'logs', 'requests.log'),
    json: true,
    maxFiles: maxLogFiles,
    maxsize: maxLogFilesSize,
  },
  infoFile: {
    level: 'info',
    filename: resolve(__dirname, 'logs', 'info.log'),
    maxFiles: maxLogFiles,
    maxsize: maxLogFilesSize,
  },
  console: {
    colorize: true,
    json: true,
    handleExceptions: true,
    handleRejections: true,
  },
};

const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf((info: any) => `${info.timestamp} — ${info.message}`),
);

const winstonReqLogger = <CustomLevels>winston.createLogger({
  levels: {
    requests: 8,
  },
  format: customFormat,
  transports: [new winston.transports.File(loggerFiles.reqFile)],
});

const logger = winston.createLogger({
  format: customFormat,
  transports: [
    new winston.transports.File(loggerFiles.infoFile),
    new winston.transports.File(loggerFiles.errorFile),
    new winston.transports.Console(loggerFiles.console),
  ],
  exceptionHandlers: [new winston.transports.File(loggerFiles.errorFile)],
  rejectionHandlers: [new winston.transports.File(loggerFiles.errorFile)],
  exitOnError: true,
});

morgan.token('body', (req: express.Request) => {
  let body = req.body;
  if (body.password) {
    body = { ...body, password: '*'.repeat(body.password.length) };
  }
  return JSON.stringify(body);
});
morgan.token('query', (req: express.Request) => JSON.stringify(req.query));
const reqLogger = morgan(
  ':status :method :url - QUERY::query - BODY::body :response-time ms',
  { stream: {
    write(str: string) {
      logger.info(str);
      winstonReqLogger.requests(str);
    },
  } },
);

export {
  reqLogger,
  logger,
};
