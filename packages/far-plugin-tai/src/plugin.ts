import { TaiApiShape, generator } from '@rlx/tai';
import { FarConfigResolver, FarPlugin, PLUGIN_PRIORITY } from '@rlx/far';
import { OpenAPIV3 } from 'openapi-types';
import path from 'path';
import fs from 'fs';
import justrequire from 'justrequire';

export const isPROD = process.env.NODE_ENV === 'production';

export const byPwd = (first: string, ...rest: string[]) => {
  const isAbs = path.isAbsolute(first);
  const prefix = isAbs ? first : process.cwd();
  const ret = path.resolve(prefix, isAbs ? '' : first, ...rest);
  // console.log({ isAbs, prefix, ret, first, rest });
  return ret;
};

declare module '@rlx/far' {
  interface FarConfig {
    openapi?: OpenAPIV3.Document;
    apis?: TApis;
    tai: {
      apiDir: string;
    };
  }
}

type TApis = {
  [namespace: string]: {
    [apiName: string]: TaiApiShape;
  };
};

const specOutput = (conf: Parameters<FarConfigResolver>[0]) =>
  isPROD
    ? byPwd(conf.outDir, 'spec.json')
    : byPwd('./node_modules', 'spec.json');

const outputTo = (conf: Parameters<FarConfigResolver>[0]) =>
  isPROD
    ? byPwd(conf.outDir, './far-tai-routes')
    : byPwd('./node_modules', 'far-tai-routes');

const genSpec = async (conf: Parameters<FarConfigResolver>[0]) => {
  const spec = await generator({
    apiInfo: {
      version: 'OpenAPIV3',
      openapi: {
        info: {
          description: '# RELX FE TECH\n> 又一把疾风之剑?!',
          version: '1.0.0',
          title: 'far × tai',
          termsOfService: 'https://fe.relxtech.com/',
          contact: {
            email: 'xiaochao.yang@relxtech.com',
            name: '杨小超',
          },
          license: {
            name: 'Apache 2.0',
            url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
          },
        },
        servers: [
          {
            url: 'http://{host}:{port}/{basePath}',
            description: '接口地址',
            variables: {
              host: {
                default: conf.server.host,
                description: '主机地址',
              },
              port: {
                default: conf.server.port,
                description: '端口号',
              },
              basePath: {
                default: conf.server.basePath,
                description: 'basePath',
              },
            },
          },
        ],
      },
    },
    entry: `${conf.tai.apiDir}/**/*.ts`,
    tsconfig: byPwd('./tsconfig.json'),
  });
  return spec;
};

export const configResolver: FarConfigResolver = async (conf, online) => {
  // const out = outputTo(conf);
  const specOut = specOutput(conf);
  const entry = byPwd(conf.tai.apiDir);
  let spec: any;
  if (!online) {
    // await tsup.build({
    //   entry: [entry],
    //   outDir: out,
    //   clean: false,
    //   target: 'node16',
    //   format: ['cjs'],
    // });
    spec = await genSpec(conf);
    fs.writeFileSync(specOut, JSON.stringify(spec, null, 2), 'utf-8');
  } else {
    try {
      spec = require(specOut);
    } catch (error) {
      console.log('require spec error');
      console.error(error);
      spec = {};
    }
  }

  conf.put((old) => {
    /** dev 环境依赖 debug.ts, eggpain, 回头再看有没有好办法吧 */
    if (isPROD || !old.apis) {
      old.apis = justrequire(entry);
    }
    old.openapi = spec;
  });
};

export const taiRoutesPlugin: FarPlugin = async (conf, { router, logger }) => {
  if (!conf.apis) return;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apis = conf.apis;

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
taiRoutesPlugin.confResolver = configResolver;
