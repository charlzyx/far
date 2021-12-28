import { Context } from 'koa';
import compose from 'koa-compose';
import KoaRouter from 'koa-router';
import { FarConfig } from '../config';
import type { FarPlugin } from './index';
import log from '../logger';

export type ApisMap = {
  [namespace: string]: {
    [apiName: string]: {
      method: 'get' | 'post' | 'put' | 'patch' | 'delete';
      path: string;
      handler: (...args: any) => any;
    };
  };
};

export const pluginRoutes: FarPlugin = (conf: FarConfig) => {
  const apis = conf.apis;
  const router = new KoaRouter();

  Object.keys(apis).forEach((namespace) => {
    const api = apis[namespace];
    Object.keys(api).forEach((apiName) => {
      const apiConf = api[apiName];
      if (!apiConf.method) return;
      log.info(`register router ::${apiConf.method}${apiConf.path} `);
      router[apiConf.method](apiConf.path, async (ctx: Context, next) => {
        const input: any = ctx.body || ctx.query;
        const params = ctx.params;
        try {
          const data = await apiConf.handler(input, params);
          console.log({ data });
          ctx.body = {
            code: 200,
            data,
            message: 'success',
          };
        } catch (error: any) {
          ctx.body = {
            code: 500,
            data: null,
            message: `${error.message} at ${apiConf.path}`,
          };
          log.error(
            `${apiConf.method.toUpperCase()} ${apiConf.path} ${error.message}`,
          );
        }
        await next();
      });
    });
  });

  return (ctx, next) => {
    router.prefix(conf.server.basePath);
    compose([router.routes(), router.allowedMethods()])(ctx, next);
  };
};

pluginRoutes.name = 'routes';
