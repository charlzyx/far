import { TaiApiShape, generator } from '@rlx/tai';
import { FarPlugin, PLUGIN_PRIORITY } from '@rlx/far';
import fs from 'fs';
import SPECHTML from './spec';
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
    await tsup.build({ entry: [entry], outDir: output });
  } catch (error) {
    console.log('error', error);
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apis = require(output) as TApis;

  // const spec = await generator({
  //   apiInfo: {
  //     version: 'OpenAPIV3',
  //     openapi: {
  //       info: {
  //         description: '# 很多人就是不爱写文档 \n> 又一把疾风之剑?!',
  //         version: '1.0.0',
  //         title: 'far-plugin-tai',
  //         termsOfService: 'https://fe.relxtech.com/',
  //         contact: {
  //           email: 'xiaochao.yang@relxtech.com',
  //           name: '杨小超',
  //         },
  //         license: {
  //           name: 'Apache 2.0',
  //           url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
  //         },
  //       },
  //       servers: [
  //         {
  //           url: 'http://{host}:{port}/{basePath}',
  //           description: '接口地址',
  //           variables: {
  //             host: {
  //               default: conf.server.host,
  //               description: '主机地址',
  //             },
  //             port: {
  //               default: conf.server.port,
  //               description: '端口号',
  //             },
  //             basePath: {
  //               default: conf.server.basePath,
  //               description: 'basePath',
  //             },
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   entry: `${conf.tai.entry}/**/*.ts`,
  //   tsconfig: './tsconfig.json',
  // });

  // fs.writeFileSync(
  //   byPwd(`${conf?.public?.dir}/spec.json`),
  //   JSON.stringify(spec, null, 2),
  //   'utf-8',
  // );
  // fs.writeFileSync(byPwd(`${conf?.public?.dir}/spec.html`), SPECHTML, 'utf-8');

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
