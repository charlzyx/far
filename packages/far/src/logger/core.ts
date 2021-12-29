/** https://juejin.cn/post/6865926810061045774 */
import winston, { format } from 'winston';
import * as Transport from 'winston-transport';
import { FarConfig } from '../config';
import { byPwd, isPROD } from '../utils';
import DailyRotateFile from 'winston-daily-rotate-file';
import { appendCtxLogField, inlineFormat } from './utils';

export type FarLogger = ReturnType<typeof getLogger>;

type LogFormat = ReturnType<ReturnType<typeof format>>;

export type LoggerConfig = {
  logDir: string;
};

export const logConfigDefaults: LoggerConfig = {
  logDir: byPwd('logs'),
};

/** TODO: ES 和 链路追踪 的 transport, 参考 winston.transports.Console 实现 */
interface RemoteTransport extends Transport {
  host: string;
  port: number;
}
const consoleTransport = new winston.transports.Console();

const memo = {
  logger: winston.createLogger({}),
};

export const setAppLoggerInMemo = (
  logger: ReturnType<typeof winston.createLogger>,
) => {
  memo.logger = logger;
};

/** app logger */
export const logger = new Proxy(memo.logger, {
  get(_, key) {
    return Reflect.get(memo.logger, key);
  },
}) as FarLogger;

export const getLogger = (
  conf: FarConfig,
  label = '',
  formats: LogFormat[] = [],
) => {
  const dailyTransport: DailyRotateFile = new DailyRotateFile({
    filename: `${conf.logger?.logDir}/${conf.appname}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  });
  const transports = isPROD
    ? [dailyTransport]
    : [consoleTransport, dailyTransport];

  const withDefaultFormats = (
    labelName: string,
    ...appendFormats: LogFormat[]
  ) => {
    return winston.format.combine(
      winston.format.label({ label: labelName }),
      inlineFormat(),
      winston.format.timestamp(),
      ...appendFormats,
    );
  };

  const appLabel = label || conf.appname || 'far';
  const innerLogger = winston.createLogger({
    format: withDefaultFormats(appLabel, ...formats),
    transports,
  });

  (innerLogger as any).appendCtxLogField = appendCtxLogField;

  const create = (
    getOpts: (
      appTransports: Transport[],
      withAppFormats: typeof withDefaultFormats,
    ) => Parameters<typeof winston.createLogger>[0],
  ) => {
    const opts = getOpts(transports, withDefaultFormats);
    return winston.createLogger(opts);
  };

  (innerLogger as any).create = create;

  return innerLogger as typeof innerLogger & {
    appendCtxLogField: typeof appendCtxLogField;
    create: typeof create;
  };
};
