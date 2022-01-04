import { TaiApiShape } from '@rlx/tai';
import { FarPlugin, PLUGIN_PRIORITY } from '@rlx/far';
import path from 'path';
import * as tsup from 'tsup';

export const isPROD = process.env.NODE_ENV === 'production';

export const byPwd = (first: string, ...rest: string[]) => {
  const isAbs = path.isAbsolute(first);
  const prefix = isAbs ? first : process.cwd();
  return path.resolve(prefix, isAbs ? '' : first, ...rest);
};

declare module '@rlx/far' {
  interface FarConfig {
    tai: {
      entry: string;
      apis?: TApis;
    };
  }
}

type TApis = {
  [namespace: string]: {
    [apiName: string]: TaiApiShape;
  };
};

const output = byPwd('./node_modules', '.farcache');

export const taiRoutesPlugin: FarPlugin = async (conf, { router, logger }) => {
  const entry = byPwd(conf.tai.entry);
  try {
    if (!conf.tai.apis) {
      /** TODO: how to build */
      await tsup.build({ entry: [entry], outDir: output });
    }
  } catch (error) {
    console.log('error', error);
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apis = conf.tai.apis ?? (require(output) as TApis);

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
            `${apiConf.method.toUpperCase()} ${apiConf.path} ${error.message}`,
          );
          next();
        }
      });
    });
  });
};

taiRoutesPlugin.priority = PLUGIN_PRIORITY.ROUTE - 1;
