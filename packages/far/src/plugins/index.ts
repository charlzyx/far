import Koa, { Context, Middleware, Next } from 'koa';
import { FarConfig, ShapeOfFarConfigDefaults } from '../config';
import { pluginRoutes } from './routes';
import { pluginStatics } from './static';
import { pluginLogger } from '../logger';

type MiddlewareLike = (
  ctx: Context,
  next: Next,
  /** 其实吧 跟 Koa.Middleware 长得差不多, 主要是 有个 app 有时候更加方便 */
  app: Koa,
) => any | Promise<void>;

type BuildInPluginNames = keyof Omit<FarConfig, keyof ShapeOfFarConfigDefaults>;

export interface FarPlugin {
  /** TODO: promise & next */
  (conf: FarConfig): Middleware<any, any, any>;
  name: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  before?: BuildInPluginNames | (string & {});
  // eslint-disable-next-line @typescript-eslint/ban-types
  after?: BuildInPluginNames | (string & {});
}

export const buildins = [pluginLogger, pluginRoutes, pluginStatics];
