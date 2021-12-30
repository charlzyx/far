import { FarPlugin } from '../plugins';
import { ctxFormat, miniCtx } from './utils';
import winston from 'winston';

/** logger plugin */

declare module 'koa' {
  interface Context {
    /** append by logger */
    duration: number;
  }
}

export const httpLoggerPlugin: FarPlugin = (conf, { logger }) => {
  const httpLogger = logger.create({
    format: winston.format.combine(winston.format.timestamp(), ctxFormat()),
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
