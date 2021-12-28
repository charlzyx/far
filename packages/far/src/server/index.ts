import Koa from 'koa';
import { FarConfig } from '../config';
import { FarPlugin, buildins } from '../plugins';
import logger, { defineLogger } from '../logger';

/** TODO: 排序 */
const sortPlugins = (plugins: FarPlugin[]): FarPlugin[] => {
  return [...plugins];
};

export const server = async (conf: FarConfig) => {
  const app = new Koa();
  /** 先配置一下, 在下面log用, 在 plugins 中会再次配置一次 */
  defineLogger(conf);

  const plugins = sortPlugins([...buildins, ...conf.plugins]).map((plugin) => {
    const plug = plugin(conf);
    return {
      plug,
      name: plugin.name,
    };
  });

  plugins.forEach((plug) => {
    logger.info(`注册插件::${plug.name}`);
    app.use(plug.plug);
    // app.use(async (ctx, next) => {
    //   await plug.plug(ctx, next, app);
    // });
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
