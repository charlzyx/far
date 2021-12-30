import fastJson, { ObjectSchema, Schema } from 'fast-json-stringify';
import Koa, { Context } from 'koa';
import winston, { format } from 'winston';
import { MESSAGE } from 'triple-beam';
import jsonStringify from 'safe-stable-stringify';
import _ from 'lodash';

/**
 * 通过指定 JSON Schema 使用 fast-json-stringify 来获得更快的速度
 * https://github.com/fastify/fast-json-stringify
 */

const getSchema = (cache: typeof memo) => {
  const props = cache.fields.reduce((map, item) => {
    map = {
      ...map,
      ...item.schema,
    };
    return map;
  }, {});
  return {
    type: 'object',
    properties: props,
  } as Schema;
};

const memo = {
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
      key: 'duration',
      path: 'duration',
      schema: { duration: { type: 'string' } },
    },
    { key: 'level', path: 'level', schema: { level: { type: 'string' } } },
    { key: 'msg', path: 'msg', schema: { msg: { type: 'string' } } },
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

/** 添加 ctx 请求日志字段 */
export const appendCtxLogField = (
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
  memo.fields.push(desc);
  memo.schema = getSchema(memo);
};

const liteCtx = (ctx: Context, cache: typeof memo) => {
  const final = cache.fields.reduce((data, item) => {
    if (/\./.test(item.path)) {
      data[item.key] = _.get(ctx, item.path);
    } else {
      data[item.key] = ctx[item.path];
    }
    return data;
  }, {} as any);
  return final;
};

export const miniCtx = (ctx: Context) => liteCtx(ctx, memo);

/** 尽可能快的 stringify */
const logstashFastStringify = (data: any) => {
  return fastJson({
    type: 'object',
    properties: {
      '@message': { type: 'string' },
      '@timestamp': { type: 'string' },
      '@fields': memo.schema,
    },
  } as Schema)(data);
};

export const ctxFormat = format((info: any) => {
  const logstash = {} as any;

  if (info.timestamp) {
    logstash['@timestamp'] = info.timestamp;
    delete info.timestamp;
  }

  logstash['@fields'] = info.message;
  delete info.message;
  info[MESSAGE] = logstashFastStringify(logstash);
  return info;
});

export const inlineFormat = format((info: any) => {
  const stringifiedRest = jsonStringify(
    Object.assign({}, info, {
      level: undefined,
      message: undefined,
      splat: undefined,
      label: undefined,
      timestamp: undefined,
    }),
  );

  const padding = (info.padding && info.padding[info.level]) || '';
  if (stringifiedRest !== '{}') {
    info[
      MESSAGE
    ] = `${info.timestamp} [${info.label}] ${info.level}:${padding} ${info.message} ${stringifiedRest}`;
  } else {
    info[
      MESSAGE
    ] = `${info.timestamp} [${info.label}] ${info.level}:${padding} ${info.message}`;
  }

  return info;
});
