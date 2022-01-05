import Koa, { Context, Middleware } from 'koa';
import KoaRouter from '@koa/router';
import { FarConfig, FarConfigResolver } from '../config';
import { FarLogger, plugin as httpLoggerPlugin } from '../logger';
import { staticsPlugin } from './static';
import { memoHooksPlugin } from './memoHooks';
import { bodyParserPlugin } from './bodyParser';
import { tracerPlugin } from './tracer';

export const resortPlugins = (plugins: FarPlugin[]): FarPlugin[] => {
  const clone = [...plugins];
  clone.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  return clone;
};

type MiddlewareLike =
  | Middleware<Koa.DefaultState, Context>
  | Middleware<Koa.DefaultState, Context>[];

type AwaitedVoid = void | Promise<void>;

export interface FarPlugin {
  (
    conf: FarConfig,
    other: {
      app: Koa;
      router: KoaRouter;
      /** 插件级 logger */
      logger: FarLogger;
    },
  ): MiddlewareLike | AwaitedVoid;
  /**
   * import { PLUGIN_PRIORITY  } from '@rlx/far'
   * 权重, 值越小中间件越靠前 默认值 0
   * @example
   * PLUGIN_PRIORITY.CORE
   * PLUGIN_PRIORITY.CORE - 1
   * PLUGIN_PRIORITY.CORE + 1
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  priority?: PLUGIN_PRIORITY | (number & {});
  confResolver?: FarConfigResolver;
}

export const buildins = [
  memoHooksPlugin,
  tracerPlugin,
  httpLoggerPlugin,
  bodyParserPlugin,
  staticsPlugin,
];

/**
 * 基本顺序
 */
// eslint-disable-next-line no-shadow
export const enum PLUGIN_PRIORITY {
  CORE = 0,
  DB = 100,
  ROUTE = 200,
}
