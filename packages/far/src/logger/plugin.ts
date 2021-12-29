import { FarPlugin } from '../plugins';
import { ctxFormat, miniCtx } from './utils';

/** logger plugin */

declare module 'koa' {
  interface Context {
    /** append by logger */
    duration: number;
  }
}

const cache = new WeakMap();

export const httpLoggerPlugin: FarPlugin = (conf, { logger }) => {
  if (!cache.get(conf)) {
    cache.set(
      conf,
      logger.create((appTransports, withAppFormats) => {
        return {
          transports: appTransports,
          format: withAppFormats('http', ctxFormat()),
        };
      }),
    );
  }

  const httpLogger = cache.get(conf);

  return {
    use: async (ctx, next) => {
      const start_time = +new Date();
      await next();
      const end_time = +new Date();
      ctx.duration = end_time - start_time;
      httpLogger.info(miniCtx(ctx));
    },
  };
};

httpLoggerPlugin.name = 'httpLogger';
httpLoggerPlugin.priority = -99;
