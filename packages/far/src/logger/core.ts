/** https://juejin.cn/post/6865926810061045774 */
import winston from 'winston';
import * as Transport from 'winston-transport';
import { FarConfig } from '../config';
import { byPwd, isPROD } from '../utils';
import DailyRotateFile from 'winston-daily-rotate-file';
import { appendCtxLogField, inlineFormat } from './utils';

export type FarLogger = typeof logger;

type LiteLogger = Pick<
  ReturnType<typeof winston.createLogger>,
  'error' | 'warn' | 'info' | 'debug'
>;

type LoggerOptions = Exclude<
  Parameters<typeof winston.createLogger>[0],
  undefined
>;

export type LoggerConfig = {
  dir: string;
  opts?: Omit<LoggerOptions, 'transports'>;
};

export const loggerConfigDefaults: LoggerConfig = {
  dir: byPwd('logs'),
  opts: {
    level: isPROD ? 'info' : 'debug',
  },
};

/** TODO: ES 和 链路追踪 的 transport, 参考 winston.transports.Console 实现 */
interface RemoteTransport extends Transport {
  host: string;
  port: number;
}

const memo = {
  transportsMap: isPROD
    ? ({} as {
        [key: string]: Transport;
      })
    : {
        console: new winston.transports.Console(),
      },
  format: winston.format.simple(),
  logger: winston.createLogger({}) as LiteLogger,
};

const create = (opts: LoggerOptions) => {
  const innerLogger = winston.createLogger({
    ...loggerConfigDefaults.opts,
    ...opts,
    format: opts.format ? opts.format : memo.format,
    transports: opts.transports
      ? opts.transports
      : Object.values(memo.transportsMap),
  });
  (innerLogger as any).create = create;
  (innerLogger as any).appendCtxLogField = appendCtxLogField;
  return innerLogger as unknown as FarLogger;
};

export const getTransportAndFormatByConf = (
  conf: FarConfig,
  label?: string,
) => {
  const dailyTransport: DailyRotateFile = new DailyRotateFile({
    filename: `${conf.logger?.dir}/${conf.appname}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  });

  memo.transportsMap['daily'] = dailyTransport;
  memo.format =
    conf.logger?.opts?.format ||
    winston.format.combine(
      winston.format.timestamp(),
      winston.format.label({
        label: label || conf.appname || 'far',
      }),
      inlineFormat(),
    );
  return {
    transports: Object.values(memo.transportsMap),
    format: memo.format,
  };
};

export const setMemoLogger = (logger: typeof memo.logger) => {
  memo.logger = logger;
};

/** app logger */
export const logger = new Proxy(memo.logger, {
  get(target, key) {
    if (key === 'create') {
      return create;
    } else if (key === 'appendCtxLogField') {
      return appendCtxLogField;
    } else {
      return Reflect.get(target, key);
    }
  },
}) as typeof memo.logger & {
  /** 创建一个新的 logger  */
  create: typeof create;
  /** 添加字段到内置的 http logger 上 */
  appendCtxLogField: typeof appendCtxLogField;
};
