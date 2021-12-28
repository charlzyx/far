import Koa from 'koa';
import { FarConfig } from '../config';
import { FarPlugin, buildins } from '../plugins';
import logger, { confLogger } from '../logger';

/** TODO: 排序 */
const queuePlugins = (plugins: FarPlugin[]): FarPlugin[] => {
  return [...plugins];
};

export const server = async (conf: FarConfig) => {
  const app = new Koa();
  confLogger(conf);
  const sortedPlugins = queuePlugins([...buildins, ...conf.plugins]);

  const plugins = await Promise.all(
    sortedPlugins.map((plugin) => {
      return plugin(conf, app);
    }),
  );

  plugins.forEach(async (plug, idx) => {
    if (plug) {
      const name = sortedPlugins[idx].name;
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
      console.log(
        `starting at:: http://${conf.server.host}:${conf.server.port}${conf.server.basePath}`,
      );
    },
  );
};
