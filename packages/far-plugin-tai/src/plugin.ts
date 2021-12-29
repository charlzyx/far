import { TaiApiShape } from '@rlx/tai';
import { FarPlugin } from '@rlx/far';

declare module '@rlx/far' {
  interface FarConfig {
    /** tai plugins 配置 */
    apis: {
      [namespace: string]: {
        [apiName: string]: TaiApiShape;
      };
    };
  }
}

export const taiRoutesPlugin: FarPlugin = (conf, { router, logger }) => {
  const apis = conf.apis;

  return () => {
    Object.keys(apis).forEach((namespace) => {
      const api = apis[namespace];
      Object.keys(api).forEach((apiName) => {
        const apiConf = api[apiName];
        if (!apiConf.method) return;
        logger.info(`router register:: ${apiConf.method}${apiConf.path} `);
        router[apiConf.method](apiConf.path, async (ctx, next) => {
          // logger.info(`>>> ::${apiConf.method}${apiConf.path} `);
          const input: any = ctx.body || ctx.query;
          const params = ctx.params;
          try {
            const data = await apiConf.handler(input, params);
            ctx.body = {
              code: 200,
              data,
              message: 'success',
            };
            next();
            // logger.info(`<<< ::${apiConf.method}${apiConf.path} `);
          } catch (error: any) {
            ctx.body = {
              code: 500,
              data: null,
              message: `${error.message} at ${apiConf.path}`,
            };
            logger.error(
              `${apiConf.method.toUpperCase()} ${apiConf.path} ${
                error.message
              }`,
            );
            next();
          }
        });
      });
    });
  };
};

taiRoutesPlugin.name = 'tai';
taiRoutesPlugin.priority = 0;
