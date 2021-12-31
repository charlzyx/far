import { FarPlugin } from '@rlx/far';
import { createClient, createCluster } from 'redis';
import { useRedis } from './hook';
import path from 'path';

export const isPROD = process.env.NODE_ENV === 'production';

export const byPwd = (first: string, ...rest: string[]) => {
  const isAbs = path.isAbsolute(first);
  const prefix = isAbs ? first : process.cwd();
  return path.resolve(prefix, isAbs ? '' : first, ...rest);
};

type RedisOption = Parameters<typeof createClient>[0];
type RedisClusterOption = Parameters<typeof createCluster>[0];
export type RedisClient = ReturnType<typeof createClient>;
export type RedisCluster = ReturnType<typeof createCluster>;

declare module '@rlx/far' {
  interface FarConfig {
    redis?: RedisOption | RedisClusterOption;
  }
}

const isClientOption = (
  opt: RedisOption | RedisClusterOption,
): opt is RedisOption => {
  return !Array.isArray((opt as RedisClusterOption).rootNodes);
};
const isClusterOption = (
  opt: RedisOption | RedisClusterOption,
): opt is RedisClusterOption => {
  return !isClientOption(opt);
};

export const redisPlugin: FarPlugin = async (conf, { logger }) => {
  const opts = conf.redis;
  if (opts) return;
  const client = isClientOption(opts) ? createClient(opts) : undefined;
  const cluster = isClusterOption(opts) ? createCluster(opts) : undefined;
  const anyway = client || cluster;
  if (!anyway) {
    logger.warn('redis create error');
    return;
  }
  anyway?.on('error', logger.error);
  await anyway?.connect();
  logger.info('redis connect success!');
  useRedis(anyway as any);
  process.on('exit', () => {
    /** cluster 不知道怎么退出, 先写个 client 吧 */
    client?.quit();
  });
};

redisPlugin.priority = 0;
