import Koa from 'koa';
import { FarConfig } from '../config';
import { FarPlugin, buildins, resortPlugins } from '../plugins';
import { FarLogger, getTransportAndFormatByConf, logger } from '../logger';
import { setMemoLogger } from '../logger/core';
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
  const coreLogger = logger.create(getTransportAndFormatByConf(conf));

  setMemoLogger(logger);

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

  routerPlugin.priority = 0;

  const sortedPlugins = resortPlugins([
    ...buildins,
    routerPlugin,
    ...conf.plugins,
  ]);

  coreLogger.info(
    `插件加载顺序::[${sortedPlugins.map((x) => x.name).join(',')}]`,
  );

  let idx = 0;
  for await (const plugin of sortedPlugins) {
    const name = sortedPlugins[idx].name;
    /** 注入 plugin 级别 logger */
    const pluginLogger = logger.create(
      getTransportAndFormatByConf(
        conf,
        // 简化一下名字
        `far-plugin-${name.replace(/plugins?/i, '')}`,
      ),
    );
    /** 没有返回值就是一个 lazy 注册 */
    const plug = await plugin(conf, { app, router, logger: pluginLogger });
    idx++;
    try {
      if (plug) {
        if (Array.isArray(plug)) {
          plug.map((p) => app.use(p));
        } else {
          app.use(plug);
        }
      }
      coreLogger.info(`注册插件成功::${name}`);
    } catch (error) {
      coreLogger.error(`注册插件失败::${name}, ${(error as any).message}`);
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
