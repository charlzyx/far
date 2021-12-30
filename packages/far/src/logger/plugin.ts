import { FarPlugin } from '../plugins';
import { ctxFormat, miniCtx } from './utils';
import { transports } from './core';
import { isPROD } from '../utils';
import winston from 'winston';

/** logger plugin */

declare module 'koa' {
  interface Context {
    /** append by logger */
    duration: number;
  }
}

export const httpLoggerPlugin: FarPlugin = () => {
  const httpLogger = winston.createLogger({
    level: isPROD ? 'info' : 'debug',
    format: winston.format.combine(winston.format.timestamp(), ctxFormat()),
    transports: transports.filter([
      isPROD ? null : transports.console,
      transports.daily,
    ]),
  });

  return async (ctx, next) => {
    const start_time = +new Date();
    await next();
    const end_time = +new Date();
    ctx.duration = end_time - start_time;
    httpLogger.info(miniCtx(ctx));
  };
};

httpLoggerPlugin.priority = -99;
