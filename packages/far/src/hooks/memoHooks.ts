import { Context } from 'koa';
import { useMemory } from './core';
import Cookies from 'cookies';

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
