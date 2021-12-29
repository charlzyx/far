import Koa, { Context, Middleware } from 'koa';
import KoaRouter from 'koa-router';
import { FarConfig } from '../config';
import { logger } from '../logger';

type MaybeMiddleware =
  | Middleware<any, Context>
  | Middleware<any, Context>[]
  | void;

export interface FarPlugin {
  (
    conf: FarConfig,
    other: {
      app: Koa;
      router: KoaRouter;
      logger: typeof logger;
    },
  ): MaybeMiddleware | Promise<MaybeMiddleware>;
  name: string;
  /** 默认值 0 */
  priority?: number;
}
