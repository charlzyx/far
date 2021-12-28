import { Conf } from '@rlx/conf';
import type { LoggerConfig } from './logger';
import type { ApisMap } from './plugins/routes';
import type { FarPlugin } from './plugins';

export const APPNAME = 'far';

export const FarConfigDefaults = {
  appname: 'far',
  plugins: [] as FarPlugin[],
  server: {
    host: '127.0.0.1',
    port: '8888',
    basePath: '',
  },
};

export type ShapeOfFarConfigDefaults = typeof FarConfigDefaults;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FarConfig extends ShapeOfFarConfigDefaults {
  logger?: LoggerConfig;
  apis: ApisMap;
  public?: string;
}

export const defineConfig = (x: Partial<FarConfig>) => x;

export const loadConf = async () => {
  const conf = Conf.make(APPNAME, FarConfigDefaults as FarConfig);

  await conf.load();

  return conf;
};
