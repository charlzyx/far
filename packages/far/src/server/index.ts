import Koa from 'koa';
import { FarConfig } from '../config';
import {
  FarPlugin,
  PLUGIN_PRIORITY,
  buildins,
  resortPlugins,
} from '../plugins';
import { FarLogger, logger, modifyLogInfoByConf } from '../logger';
import KoaRouter from '@koa/router';

declare module 'koa' {
  interface DefaultContext {
    /** 应用级 logger */
    logger: FarLogger;
  }
}

export const server = async (conf: FarConfig) => {
  const app = new Koa();
  const router = new KoaRouter({});

  modifyLogInfoByConf(conf);

  app.use(async (ctx, next) => {
    /** 注入 appLogger */
    ctx.logger = logger;
    await next();
  });

  router.prefix(conf.server.basePath);

  const routerPlugin: FarPlugin = (_, { app: appInstace }) => {
    appInstace.use(router.routes());
    appInstace.use(router.allowedMethods());
  };

  routerPlugin.priority = PLUGIN_PRIORITY.ROUTE;

  const sortedPlugins = resortPlugins([
    ...buildins,
    routerPlugin,
    ...conf.plugins,
  ]);

  logger.info(`插件加载顺序::[${sortedPlugins.map((x) => x.name).join(',')}]`);

  let idx = 0;
  for await (const plugin of sortedPlugins) {
    const name = sortedPlugins[idx].name;
    /** 注入 plugin 级别 logger */

    // const pluginLogger = createLoggerWithLabel(`far-plugin${name}`);
    const pluginLogger = logger;

    const start_time = +new Date();
    try {
      /** 没有返回值就是一个 lazy 注册 */
      const plug = await plugin(conf, { app, router, logger: pluginLogger });
      idx++;
      if (plug) {
        if (Array.isArray(plug)) {
          plug.map((p) => app.use(p));
        } else {
          app.use(plug);
        }
      }
      logger.info(`注册插件成功::${name}`);
    } catch (error) {
      console.error(error);
      logger.error(
        `注册插件失败::${name}, ${
          (error as any).message || (error as any).stack
        }`,
      );
    } finally {
      logger.info(`插件::${name} 加载时长 ${+new Date() - start_time}ms`);
    }
  }

  return app.listen(
    {
      host: conf.server.host,
      port: conf.server.port,
    },
    () => {
      logger.info(
        `starting at:: http://${conf.server.host}:${conf.server.port}${conf.server.basePath}`,
      );
    },
  );
};
