import Koa, { Context, Middleware } from 'koa';
import KoaRouter from '@koa/router';
import { FarConfig } from '../config';
import { FarLogger } from '../logger';

export const resortPlugins = (plugins: FarPlugin[]): FarPlugin[] => {
  const clone = [...plugins];
  clone.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  return clone;
};

type MiddlewareLike =
  | Middleware<Koa.DefaultState, Context>
  | Middleware<Koa.DefaultState, Context>[];

/** 懒惰的注册函数 */
type LazyRegister = () => void | Promise<void>;
type MiddlewareUseBox = {
  /** 或者, use: 中间件 | 中间件[] */
  use?: MiddlewareLike;
};

export interface FarPlugin {
  (
    conf: FarConfig,
    other: {
      app: Koa;
      router: KoaRouter;
      /** 插件级 logger */
      logger: FarLogger;
    },
  ): LazyRegister | MiddlewareUseBox;
  /** 默认是插件的函数名称, 如果有的话... */
  name?: string;
  /** 权重, 值越小中间件越靠前 默认值 0 */
  priority?: number;
}
