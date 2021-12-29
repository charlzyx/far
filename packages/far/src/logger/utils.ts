import fastJson, { ObjectSchema, Schema } from 'fast-json-stringify';
import Koa, { Context } from 'koa';
import _ from 'lodash';

/**
 * 通过指定 JSON Schema 使用 fast-json-stringify 来获得更快的速度
 * https://github.com/fastify/fast-json-stringify
 * 这个在线工具用来将 ts 转换成 JSON Schema 描述
 * https://transform.tools/typescript-to-json-schema
 */
export interface LogShape {
  /**
   * @description 下面这个类型的一部分
   * @type BaseContext
   **/
  /** BaseContext[req] */
  ip: string;
  url: string;
  origin: string;
  href: string;
  method: string;
  host: string;
  path: string;
  /** 手机号参数加密 */
  querystring: string;
  // referer: string;
  /** BaseContext[resp] */
  status: number;
  type: string;
  /** ----下面都是追加的--- */
  // 去掉中横线方便查询 'user-agent': string;
  user_agent: string;
  start_time: number;
  end_time: number;
  duration: number;
  level: string;
  msg: string;
}

const getSchema = (cache: typeof memo) => {
  const props = [...cache.fields, ...cache.computedFields].reduce(
    (map, item) => {
      map = {
        ...map,
        ...item.schema,
      };
      return map;
    },
    {},
  );
  return {
    type: 'object',
    properties: props,
  } as Schema;
};

const memo = {
  /** 一级字段直接扔个 ctx 就能取到, 不需要 loadash get  */
  fields: [
    { key: 'ip', path: 'ip', schema: { ip: { type: 'string' } } },
    { key: 'url', path: 'url', schema: { url: { type: 'string' } } },
    { key: 'origin', path: 'origin', schema: { origin: { type: 'string' } } },
    { key: 'href', path: 'href', schema: { href: { type: 'string' } } },
    { key: 'method', path: 'method', schema: { method: { type: 'string' } } },
    { key: 'host', path: 'host', schema: { host: { type: 'string' } } },
    { key: 'path', path: 'path', schema: { path: { type: 'string' } } },
    {
      key: 'querystring',
      path: 'querystring',
      schema: { querystring: { type: 'string' } },
    },
    /** BaseContext[resp] */
    { key: 'status', path: 'status', schema: { status: { type: 'string' } } },
    { key: 'type', path: 'type', schema: { type: { type: 'string' } } },
    /** ----下面都是追加的--- */
    // 去掉中横线方便查询 'user-agent': string;
    {
      key: 'start_time',
      path: 'start_time',
      schema: { start_time: { type: 'string' } },
    },
    {
      key: 'end_time',
      path: 'end_time',
      schema: { end_time: { type: 'string' } },
    },
    {
      key: 'duration',
      path: 'duration',
      schema: { duration: { type: 'string' } },
    },
    { key: 'level', path: 'level', schema: { level: { type: 'string' } } },
    { key: 'msg', path: 'msg', schema: { msg: { type: 'string' } } },
  ],
  /** 需要 loadash get  */
  computedFields: [
    {
      key: 'user_agent',
      path: 'headers.user-agent',
      schema: { user_agent: { type: 'string' } },
    },
  ],
  schema: {},
};

// init build-ins
memo.schema = getSchema(memo);

/** 添加日志字段 */
export const append = (
  /** 字段名称 */
  field: string,
  /** 在 ctx 中的路径, 默认去字段名 */
  path?: string,
  /** 数据类型, 字符串和数字应该够用了 */
  type?: 'string' | 'number',
) => {
  const desc = {
    key: field,
    path: path || field,
    schema: {
      [field]: { type },
    },
  } as any;
  if (/\./.test(path || field)) {
    memo.computedFields.push(desc);
  } else {
    memo.fields.push(desc);
  }
  memo.schema = getSchema(memo);
};

const getData = (ctx: Context, cache: typeof memo) => {
  const base = { ...ctx };
  const final = cache.computedFields.reduce((data, item) => {
    data[item.key] = _.get(data, item.path);
    return data;
  }, base);
  return final;
};

/** 尽可能快的 stringify */
export const stringify = (ctx: Context) => {
  return fastJson(memo.schema)(getData(ctx, memo));
};
