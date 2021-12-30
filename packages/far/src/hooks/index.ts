/**
 * 联动 plugins/tracer, 我也想不明白为什么起了这个神奇的名字
 * https://github.com/puzpuzpuz/cls-rtracer/blob/master/src/rtracer.js#L254
 */
import { id as getStore } from 'cls-rtracer';

/**
 * 抄这个
 * https://github.com/koajs/generic-session
 * 加上
 * <!-- redis-modules-sdk -->
 */
const ONEDAY = 24 * 60 * 60 * 1000;

export type SessionStore<T = any> = {
  get(sid: string | number): T;
  set(sid: string | number, data: T, ttl: number): T;
  destory(sid: string | number): void;
};

const memo = new Map();

const memoCtxStore: SessionStore = {
  get(sid) {
    return memo.get(sid);
  },
  set(sid, data, ttl) {
    return memo.set(sid, data);
  },
  destory(sid) {
    return memo.delete(sid);
  },
};

export const useContext = <T>() => {
  const cid = getStore() as string;
  if (!memoCtxStore.get(cid)) {
    memoCtxStore.set(cid, {}, ONEDAY);
  }
  return memoCtxStore.get(cid) as T;
};
