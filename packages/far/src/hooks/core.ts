/**
 * 联动 plugins/tracer, 我也想不明白为什么起了这个神奇的名字
 * https://github.com/puzpuzpuz/cls-rtracer/blob/master/src/rtracer.js#L254
 */
import { id as getIdByAlsStore } from 'cls-rtracer';
import { Context } from 'koa';

export type Store<T = any> = {
  get(sid: string | number): T | Promise<T>;
  set(sid: string | number, data: T, ttl?: number): T | Promise<T>;
  destory(sid: string | number): void | boolean | Promise<void | boolean>;
};

export interface StoreSpace {
  readonly ctx: Context;
}

export interface CacheSpace {
  readonly user: { nothing: 'here' };
}

const memorize = new Map();
const CACHEDBKEY = '__cachedb__';

const memoryStore: Store = {
  get(sid) {
    return memorize.get(sid);
  },
  set(sid, data) {
    return memorize.set(sid, data);
  },
  destory(sid) {
    return memorize.delete(sid);
  },
};

type Clear = () => void;

/** 每个请求结束之后就会销毁 */
export const useMemory = <K extends keyof StoreSpace, T = StoreSpace[K]>(
  namespace: K,
  getter?: T | (() => T),
): [T, Clear] => {
  const uuid = getIdByAlsStore() as string;
  const sid = `${namespace}:${uuid}`;
  const clear = () => memoryStore.destory(uuid);
  let init: T = undefined as unknown as T;
  if (getter) {
    if (typeof getter === 'function') {
      init = (getter as () => T)();
    } else {
      init = getter;
    }
  }
  if (init) {
    memoryStore.set(sid, init);
  }
  return [memoryStore.get(sid), clear];
};

export const setCacheDB = (cachedb: Store) => {
  memorize.set(CACHEDBKEY, cachedb);
};

/** 根据 ttl 时长缓存 */
export const useCache = <K extends keyof CacheSpace, R = CacheSpace[K]>(
  cacheKey: K,
  getter?: R | (() => R) | (() => Promise<R>),
  ttl?: number,
): R => {
  // const uuid = getIdByAlsStore() as string;
  const sid = `${CACHEDBKEY}:${cacheKey}`;

  const store = memorize.get(CACHEDBKEY) as Store;
  if (getter) {
    store.set(sid, JSON.stringify(getter), ttl);
  }
  return JSON.parse(store.get(sid)) as R;
};
