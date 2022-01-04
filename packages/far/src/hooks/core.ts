/**
 * 联动 plugins/tracer, 我也想不明白为什么起了这个神奇的名字
 * https://github.com/puzpuzpuz/cls-rtracer/blob/master/src/rtracer.js#L254
 */
import { id as getIdByAlsStore } from 'cls-rtracer';
import { Context } from 'koa';

const memorize = new Map();

export type Store<T = any> = {
  get(sid: string): T | Promise<T>;
  set(sid: string, data: T, ttl?: number): T | Promise<T>;
  del(sid: string): any | Promise<any>;
  destory?(sid: string | number): any | Promise<any>;
};

export interface StoreSpace {
  readonly ctx: Context;
}

export interface CacheSpace {
  readonly user: { nothing: 'here' };
}

const CACHEDBKEY = '__cachedb__';

const memoryStore: Store = {
  get(sid) {
    return memorize.get(sid);
  },
  set(sid, data) {
    memorize.set(sid, data);
    return memorize.get(sid);
  },
  del(sid) {
    return memorize.delete(sid);
  },
  destory(sid) {
    return memorize.delete(sid);
  },
};

type Clear = () => void;

/**
 * 直接在缓存中的存储, 跟 cache 的区别是每个请求结束之后就会销毁 */
export const useRawMemory = <K extends keyof StoreSpace, T = StoreSpace[K]>(
  namespace: K,
  initializer?: T | (() => T),
): [T, Clear] => {
  const uuid = getIdByAlsStore() as string;
  const sid = `${namespace}:${uuid}`;
  const clear = () => {
    console.log('wtfffffffffffffffff');
    // return memoryStore?.destory?.(uuid);
  };
  let init: T = undefined as unknown as T;
  if (initializer) {
    if (typeof initializer === 'function') {
      init = (initializer as () => T)();
    } else {
      init = initializer;
    }
  }
  if (init) {
    memoryStore.set(sid, init);
  }
  const ret = memoryStore.get(sid);
  // console.log({ ret });
  return [ret, clear];
};

export const setCacheDB = (cachedb: Store) => {
  memorize.set(CACHEDBKEY, cachedb);
};

/** 根据 ttl 时长缓存 */
export const useRawCache = async <
  K extends keyof CacheSpace,
  CacheKey extends string,
  R = CacheSpace[K],
>(
  namespace: K,
  key: CacheKey,
  initializer?: R | (() => R) | (() => Promise<R>),
  ttl?: number,
): Promise<R> => {
  // const uuid = getIdByAlsStore() as string;
  const sid = `${namespace}:${key}`;

  const store = memorize.get(CACHEDBKEY) as Store;
  if (initializer) {
    await store.set(sid, JSON.stringify(initializer), ttl);
  }
  const raw = await store.get(sid);
  return JSON.parse(raw) as R;
};
