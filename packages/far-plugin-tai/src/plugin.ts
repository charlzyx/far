import { TaiApiShape, generator } from '@rlx/tai';
import { FarPlugin } from '@rlx/far';
import fs from 'fs';
import SPECHTML from './spec';

declare module '@rlx/far' {
  interface FarConfig {
    tai: {
      entry: string;
      apis: {
        [namespace: string]: {
          [apiName: string]: TaiApiShape;
        };
      };
    };
  }
}

export const taiRoutesPlugin: FarPlugin = async (conf, { router, logger }) => {
  const apis = conf.tai.apis;
  const spec = await generator({
    apiInfo: {
      version: 'OpenAPIV3',
      openapi: {
        info: {
          description: '# 很多人就是不爱写文档 \n> 又一把疾风之剑?!',
          version: '1.0.0',
          title: 'far-plugin-tai',
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
    entry: `${conf.tai.entry}/**/*.ts`,
    tsconfig: './tsconfig.json',
  });
  fs.writeFileSync(
    `${conf?.public?.dir}/spec.json`,
    JSON.stringify(spec, null, 2),
    'utf-8',
  );
  fs.writeFileSync(`${conf?.public?.dir}/spec.html`, SPECHTML, 'utf-8');

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

taiRoutesPlugin.priority = 0;
