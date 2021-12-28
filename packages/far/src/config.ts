import { Middleware } from 'koa';
import { Conf } from '@rlx/conf';

const APPNAME = 'far';

import { byPwd } from './utils';

export const FarConfig = {
  entry: './src/apis',
  publicDir: './public',
  middlewares: [] as Middleware[],
  server: {
    host: '0.0.0.0',
    port: '8888',
    basePath: '',
  },
};

export type FarConfig = typeof FarConfig;

export const defineConfig = (x: Partial<FarConfig>) => x;

export const loadConf = async () => {
  const conf = Conf.make(APPNAME, FarConfig);
  await conf.load();
  conf.put((old) => {
    old.entry = byPwd(old.entry);
    old.publicDir = byPwd(old.publicDir);
  });
  return conf;
};
