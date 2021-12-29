/** https://juejin.cn/post/6865926810061045774 */
import winston from 'winston';
import * as Transport from 'winston-transport';
import { FarConfig } from '../config';
import { FarPlugin } from '../plugins';
import { byPwd, isPROD } from '../utils';
import DailyRotateFile from 'winston-daily-rotate-file';
import { append, stringify } from './utils';

/** TODO: ES 和 链路追踪 的 transport, 参考 winston.transports.Console 实现 */
interface RemoteTransport extends Transport {
  host: string;
  port: number;
}
export type LoggerConfig = {
  logDir: string;
};

export const logConfigDefaults: LoggerConfig = {
  logDir: byPwd('logs'),
};

const consoleTransport = new winston.transports.Console();

const memo = {
  logger: winston.createLogger({
    transports: [consoleTransport],
  }),
};

export const logger = new Proxy(memo.logger, {
  get(_, key) {
    if (key === 'append') {
      return append;
    }
    return Reflect.get(memo.logger, key);
  },
}) as typeof memo.logger & {
  append: typeof append;
};

export const loggerInit = (conf: FarConfig) => {
  const dir = byPwd(conf.logger?.logDir || '');
  const dailyTransport: DailyRotateFile = new DailyRotateFile({
    filename: `${dir}/${conf.appname}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  });

  const transports = isPROD
    ? [dailyTransport]
    : [consoleTransport, dailyTransport];

  memo.logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.label({ label: conf.appname }),
      winston.format.timestamp(),
      winston.format.prettyPrint(),
      winston.format.align(),
    ),
    transports,
  });
  return memo.logger;
};

/** logger plugin */

declare module 'koa' {
  interface Context {
    /** append by logger */
    start_time: number;
    /** append by logger */
    end_time: number;
    /** append by logger */
    duration: number;
  }
}

export const loggerPlugin: FarPlugin = (conf, { logger: appLogger }) => {
  return async (ctx, next) => {
    ctx.start_time = +new Date();
    try {
      await next();
    } finally {
      ctx.end_time = +new Date();
      ctx.duration = ctx.end_time - ctx.start_time;
      appLogger.info(stringify(ctx));
    }
  };
};

loggerPlugin.name = 'logger';
loggerPlugin.priority = -99;
