import Koa from 'koa';
import { FarConfig } from '../config';
import { FarPlugin, resortPlugins } from '../plugins';
import { FarLogger, getLogger, plugin as httpLoggerPlugin } from '../logger';
import { setAppLoggerInMemo } from '../logger/core';
import KoaRouter from '@koa/router';

declare module 'koa' {
  interface DefaultContext {
    /** 应用级 logger */
    logger: FarLogger;
  }
}

export const server = async (conf: FarConfig) => {
  const app = new Koa();
  const router = new KoaRouter();
  const logger = getLogger(conf);

  setAppLoggerInMemo(logger);

  app.use(async (ctx, next) => {
    /** 注入 appLogger */
    ctx.logger = logger;
    await next();
  });

  router.prefix(conf.server.basePath);

  const routerPlugin: FarPlugin = (_, { app: appInstace }) => {
    return () => {
      appInstace.use(router.routes());
      appInstace.use(router.allowedMethods());
      logger.info(router.stack);
      logger.info('router done.');
    };
  };

  routerPlugin.name = 'router';

  const sortedPlugins = resortPlugins([
    httpLoggerPlugin,
    routerPlugin,
    ...conf.plugins,
  ]);

  logger.info(`插件加载顺序::${sortedPlugins.map((x) => x.name).join(',')}`);

  let idx = 0;
  for await (const plugin of sortedPlugins) {
    const name = sortedPlugins[idx].name;
    /** 注入 plugin 级别 logger */
    const pluginLogger = getLogger(conf, `far-plugin-${name}`);
    const plug = plugin(conf, { app, router, logger: pluginLogger });
    idx++;
    try {
      if (typeof plug === 'function') {
        await plug();
      } else {
        const using = plug.use!;
        if (Array.isArray(using)) {
          using.map((p) => app.use(p));
        } else {
          app.use(using);
        }
      }
    } catch (error) {
      logger.error(`注册插件失败::${name}`, error);
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
