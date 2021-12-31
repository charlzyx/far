/**
 * 联动 plugins/tracer, 我也想不明白为什么起了这个神奇的名字
 * https://github.com/puzpuzpuz/cls-rtracer/blob/master/src/rtracer.js#L254
 */
import { id as getIdByAlsStore } from 'cls-rtracer';
import { Context } from 'koa';
import * as Cookies from 'cookies';

/**
 * 抄这个
 * https://github.com/koajs/generic-session
 * 加上
 * <!-- redis-modules-sdk -->
 */
const ONEDAY = 24 * 60 * 60 * 1000;

export type Store<T = any> = {
  get(sid: string | number): T;
  set(sid: string | number, data: T, ttl?: number): T;
  destory(sid: string | number): void;
};

export interface MemorizeStore {
  readonly ctx: Context;
}

const memorize = new Map();

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

export const useMemory = <K extends keyof MemorizeStore, T = MemorizeStore[K]>(
  namespace: K,
  initialState?: T | (() => T),
): [T, Clear] => {
  const uuid = getIdByAlsStore() as string;
  const sid = `${namespace}::${uuid}`;
  const clear = () => memoryStore.destory(uuid);
  let init: T = undefined as unknown as T;
  if (initialState) {
    if (typeof initialState === 'function') {
      init = (initialState as () => T)();
    } else {
      init = initialState;
    }
  }
  if (init) {
    memoryStore.set(sid, init);
  }
  return [memoryStore.get(sid), clear];
};

/**
 * the man who give answer godlike
 * https://stackoverflow.com/questions/51465182/how-to-remove-index-signature-using-mapped-types
 */
type RemoveIndex<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : K]: T[K];
};

type Ctx = RemoveIndex<Context>;
type CtxKey = keyof Ctx;

type KeyIn<T, K> = K extends keyof T ? true : false;

export const useCtx = <
  K extends CtxKey | undefined,
  /** 我比 ts 更懂 ts, 懂王.jpg */
  R = KeyIn<Ctx, K> extends true ? Ctx[Exclude<K, undefined>] : Ctx,
>(
  key?: K,
): R => {
  const [ctx] = useMemory('ctx');
  return key === undefined ? ctx : ctx[key as any];
};

export const useHeaders = () => {
  const ctx = useCtx();
  const headers = ctx.headers;
  const setHeaders = ctx.response.set;
  return [headers, setHeaders] as const;
};

export const useCookies = () => {
  return useCtx('cookies') as Cookies;
};
