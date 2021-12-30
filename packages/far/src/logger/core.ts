/** https://juejin.cn/post/6865926810061045774 */
import winston from 'winston';
import * as Transport from 'winston-transport';
import { byPwd, isPROD } from '../utils';
import { FarConfig } from '../config';
import DailyRotateFile from 'winston-daily-rotate-file';
import {
  appendCtxLogField,
  inlineFormat,
  loggerLabel,
  runTimeLabelFormat,
} from './utils';

// type LiteLogger = Pick<
//   ReturnType<typeof winston.createLogger>,
//   'error' | 'warn' | 'info' | 'debug'
// >;
type LiteLogger = ReturnType<typeof winston.createLogger>;

export type FarLogger = LiteLogger & {
  appendCtxLogField: typeof appendCtxLogField;
};

export const loggerConfigDefaults: LoggerConfig = {
  dir: byPwd('logs'),
};

export type LoggerConfig = {
  dir: string;
};

export const transports = {
  console: new winston.transports.Console(),
  daily: new DailyRotateFile({
    filename: `logs/far-%DATE%.log`,
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    level: 'info',
    maxSize: '200m',
    maxFiles: '14d',
  }),
  dailyError: new DailyRotateFile({
    filename: `logs/far-%DATE%-error.log`,
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    level: 'error',
    maxSize: '200m',
    maxFiles: '14d',
  }),
  filter: <T>(x: T[]) => x.filter(Boolean) as Exclude<T, undefined | null>[],
};

export const modifyLogInfoByConf = (conf: FarConfig) => {
  loggerLabel.set(conf.appname || 'far');
  transports.daily.filename = conf.logger?.dir + conf.appname || 'far';
  transports.dailyError.filename = conf.logger?.dir + conf.appname || 'far';
};

export const formats = {
  inline: inlineFormat(),
};

export const createLoggerWithLabel = (label: string, runtime?: boolean) => {
  const labelLogger = winston.createLogger({
    level: isPROD ? 'info' : 'debug',
    transports: [transports.daily, transports.dailyError],
    format: winston.format.combine(
      winston.format.timestamp(),
      runtime ? runTimeLabelFormat() : winston.format.label({ label: label }),
    ),
  }) as FarLogger;
  labelLogger.appendCtxLogField = appendCtxLogField;
  if (!isPROD) {
    labelLogger.add(
      new winston.transports.Console({
        format: winston.format.combine(formats.inline),
      }),
    );
  }
  return labelLogger as FarLogger;
};

export const logger = createLoggerWithLabel('far', true);

/** TODO: ES 和 链路追踪 的 transport, 参考 winston.transports.Console 实现 */
interface RemoteTransport extends Transport {
  host: string;
  port: number;
}
