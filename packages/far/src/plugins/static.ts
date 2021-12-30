import serve from 'koa-static';
import { FarConfig } from '../config';
import { byPwd } from '../utils';
import { FarPlugin } from './index';
import { noop } from '../utils';

export type StaticsPluginConfig = {
  public?: {
    dir?: string;
  };
};

export const staticsPlugin: FarPlugin = (conf: FarConfig, { app, logger }) => {
  if (!conf?.public?.dir) return noop;
  const www = byPwd(conf?.public?.dir ?? '');
  logger.info(`public dir::${www}`);
  app.use(serve(www, {}));
};

staticsPlugin.priority = 1;
