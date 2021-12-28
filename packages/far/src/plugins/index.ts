import Koa, { Context, Middleware, Next } from 'koa';
import { FarConfig, ShapeOfFarConfigDefaults } from '../config';
import { pluginRoutes } from './routes';
import { pluginStatics } from './static';
import logger from '../logger';

type BuildInPluginNames = keyof Omit<
  FarConfig,
  keyof ShapeOfFarConfigDefaults | 'logger'
>;

type MaybeMiddleware = Middleware<any, any> | Middleware<any, any>[] | void;

export interface FarPlugin {
  /** TODO: promise & next */
  (conf: FarConfig, app: Koa): MaybeMiddleware | Promise<MaybeMiddleware>;
  name: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  before?: BuildInPluginNames | (string & {});
  // eslint-disable-next-line @typescript-eslint/ban-types
  after?: BuildInPluginNames | (string & {});
}

export const buildins = [pluginRoutes, pluginStatics];
