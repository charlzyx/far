import { Conf } from '@rlx/conf';
import type { LoggerConfig } from './logger';
import type { StaticsPluginConfig } from './plugins/static';
import type { BodyParserPluginConfig } from './plugins/bodyParser';
import type { TracerPluginConfig } from './plugins/tracer';
import type { FarPlugin } from './plugins';
import { byPwd } from './utils';
import type { Options } from 'tsup';

export const FarTSUPConfig: Options = {
  splitting: false,
  /**
   * https://tsup.egoist.sh/#excluding-all-packages
   * https://github.com/egoist/tsup/blob/dev/src/cli-node.ts
   */
  skipNodeModulesBundle: true,
  format: ['cjs'],
  target: 'node16',
  platform: 'node',
};

export const APPNAME = 'far';

export const FarConfigDefaults = {
  appname: 'far',
  plugins: [] as FarPlugin[],
  server: {
    host: '127.0.0.1',
    port: '8888',
    basePath: '',
  },
  outDir: 'dist',
};

export type ShapeOfFarConfigDefaults = typeof FarConfigDefaults;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FarConfig
  extends ShapeOfFarConfigDefaults,
    TracerPluginConfig,
    BodyParserPluginConfig,
    StaticsPluginConfig {
  logger?: LoggerConfig;
}

export const defineConfig = (x: Partial<FarConfig>) => x as FarConfig;

export const loadConf = async (online?: boolean) => {
  const conf = await Conf.make(APPNAME, FarConfigDefaults as FarConfig);
  conf.put((old) => {
    old.outDir = byPwd(old.outDir);
  });
  const configResolvers = conf.plugins
    .filter((plugin) => Boolean(plugin.confResolver))
    .map((plugin) => plugin.confResolver);

  for await (const resolver of configResolvers) {
    if (!resolver) continue;
    await resolver(conf as any, online);
  }

  return conf;
};

export type FarConfigResolver = (
  /** 只有给插件用的时候,追加一个 put, 别的时候都是 readonly */
  conf: FarConfig & { put: (producer: (old: FarConfig) => void) => void },
  /** 是否是 start  */
  online?: boolean,
) => void | Promise<void>;
