import { FarPlugin, PLUGIN_PRIORITY, Store, setCacheDB } from '@rlx/far';
import { createClient, createCluster } from 'redis';
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

const TTL_SECONDS = 3; // seconds
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
  if (!opts) return;
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
  const redisStore: Store = {
    async get(sid) {
      if (anyway === client) {
        return await client.get(sid);
      } else {
        return await cluster!.get(sid);
      }
    },
    async set(sid, neo, ttl) {
      if (anyway === client) {
        return await client.set(sid, neo, {
          EX: ttl ?? TTL_SECONDS,
        });
      } else {
        return await cluster!.set(sid, neo, {
          EX: ttl ?? TTL_SECONDS,
        });
      }
    },
    async del(sid) {
      if (anyway === client) {
        return await client.del(sid);
      } else {
        return await cluster!.del(sid);
      }
    },
  };
  setCacheDB(redisStore);
  process.on('exit', () => {
    /** cluster 不知道怎么退出, 先写个 client 吧 */
    client?.quit();
  });
};

redisPlugin.priority = PLUGIN_PRIORITY.DB;
