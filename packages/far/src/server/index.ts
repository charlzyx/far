import Koa, { Context } from 'koa';
import serve from 'koa-static';
import KoaRouter from 'koa-router';
import { FarConfig } from '../config';
import { byPwd } from '../utils';

type ApisShape = {
  [namespace: string]: {
    [apiName: string]: {
      path: string;
      method: 'get' | 'post' | 'patch' | 'delete';
      handler: <ReqInput extends Record<string, any>>(
        input: ReqInput,
        params: Record<string, string>,
      ) => Promise<any>;
    };
  };
};

export const server = async (conf: FarConfig) => {
  const app = new Koa();
  const router = new KoaRouter();

  const { publicDir, entry, middlewares } = conf;
  const www = byPwd(publicDir);
  const apis: ApisShape = await import(entry);

  Object.keys(apis).forEach((namespace) => {
    const api = apis[namespace];
    Object.keys(api).forEach((apiName) => {
      const apiConf = api[apiName];
      if (!apiConf.method) return;
      // console.log(`register router ::${apiConf.method}${apiConf.path} `);
      router[apiConf.method](apiConf.path, async (ctx: Context, next) => {
        const input: any = ctx.body || ctx.query;
        const params = ctx.params;
        // const banner = `${apiConf.path}${
        //   (apiConf == null ? void 0 : apiConf.path) || ''
        // }`;
        // console.log('enter ', banner);
        try {
          const data = await apiConf.handler(input, params);
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
        }
        await next();
      });
    });
  });

  middlewares.forEach((mw) => {
    app.use(mw);
  });

  router.prefix(conf.server.basePath);
  app.use(router.routes()).use(router.allowedMethods());

  app.use(serve(www, {}));
  return app.listen({
    host: conf.server.host,
    port: conf.server.port,
  });
};
