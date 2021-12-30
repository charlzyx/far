import Koa, { Context, Middleware } from 'koa';
import KoaRouter from '@koa/router';
import { FarConfig } from '../config';
import { FarLogger, plugin as httpLogger } from '../logger';
import { staticsPlugin } from './static';
import { bodyParserPlugin } from './bodyParser';

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
  /** 权重, 值越小中间件越靠前 默认值 0 */
  priority?: number;
}

export const buildins = [httpLogger, bodyParserPlugin, staticsPlugin];
