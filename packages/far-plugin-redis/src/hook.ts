import { useCtx } from '@rlx/far';
import { RedisClient, RedisCluster } from './plugin';

declare module 'koa' {
  interface Context {
    redis?: RedisClient | RedisCluster;
  }
}

export interface SessionNameSpace {
  _test: string;
}

export const useRedis = (redis?: RedisClient | RedisCluster) => {
  const ctx = useCtx();
  if (redis) {
    ctx.redis = redis;
    redis.set('d', '', {});
  }
  return ctx.redis;
};
