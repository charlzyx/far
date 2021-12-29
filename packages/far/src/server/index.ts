import Koa from 'koa';
import { FarConfig } from '../config';
import { FarPlugin } from '../plugins';
import { loggerInit, loggerPlugin } from '../logger';
import KoaRouter from 'koa-router';

const resortPlugins = (plugins: FarPlugin[]): FarPlugin[] => {
  const clone = [...plugins];
  clone.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  return clone;
};

export const server = async (conf: FarConfig) => {
  const app = new Koa();
  const router = new KoaRouter();
  const logger = loggerInit(conf);

  const routerPlugin: FarPlugin = (_, { app: appInstace }) => {
    appInstace.use(router.routes());
    appInstace.use(router.allowedMethods());
  };
  routerPlugin.name = 'router';

  const sortedPlugins = resortPlugins([
    loggerPlugin,
    routerPlugin,
    ...conf.plugins,
  ]);

  const plugins = await Promise.all(
    sortedPlugins.map((plugin) => {
      return plugin(conf, { app, router, logger });
    }),
  );

  logger.info(`插件加载顺序::${sortedPlugins.map((x) => x.name).join(',')}`);

  plugins.forEach(async (plug, idx) => {
    if (plug) {
      const name = sortedPlugins[idx].name;
      if (!name) {
        logger.error(`插件缺少名称::${sortedPlugins[idx]}`);
      }
      try {
        if (Array.isArray(plug)) {
          plug.forEach((p) => app.use(p));
        } else {
          app.use(plug);
        }
        logger.info(`注册插件::${name}`);
      } catch (error) {
        logger.error(`注册插件失败::${name}`, error);
      }
    }
  });

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
