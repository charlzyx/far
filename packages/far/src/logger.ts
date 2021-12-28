import log4js, { Configuration } from 'koa-log4';
import path from 'path';
import { FarConfig } from './config';
import type { FarPlugin } from './plugins';
import { byPwd } from './utils';

export type Log4jsConfig = Configuration;

export const Log4jsConfigDefaults = {
  // 日志的输出
  appenders: {
    access: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log', //生成文件的规则
      alwaysIncludePattern: true, // 文件名始终以日期区分
      encoding: 'utf-8',
      filename: path.join(byPwd('logs'), 'access.log'), //生成文件名
    },
    error: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log', //生成文件的规则
      alwaysIncludePattern: true, // 文件名始终以日期区分
      encoding: 'utf-8',
      filename: path.join(byPwd('logs'), 'error.log'), //生成文件名
    },
    application: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      encoding: 'utf-8',
      filename: path.join(byPwd('logs'), 'application.log'),
    },
    out: {
      type: 'console',
    },
  },
  categories: {
    default: { appenders: ['out'], level: 'info' },
    access: { appenders: ['access'], level: 'info' },
    error: { appenders: ['error'], level: 'error' },
    application: { appenders: ['application'], level: 'all' },
  },
};

export const defineLogger = (conf: FarConfig) => {
  log4js.configure({
    ...Log4jsConfigDefaults,
    ...conf.log4js,
  });
};

// type LogLevel = keyof typeof Log4jsConfigDefaults['categories'];

const logger = log4js.getLogger();

export default logger;

export const pluginLogger: FarPlugin = (conf) => {
  defineLogger(conf);
  return (ctx, next) => {
    log4js.koaLogger(log4js.getLogger('access'))(ctx, next);
  };
};

pluginLogger.name = 'logger';
