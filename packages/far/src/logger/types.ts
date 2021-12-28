/**
 * 通过指定 JSON Schema 使用 fast-json-stringify 来获得更快的速度
 * https://github.com/fastify/fast-json-stringify
 * 这个在线工具用来将 ts 转换成 JSON Schema 描述
 * https://transform.tools/typescript-to-json-schema
 */
export type LogShape = {
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
  referer: string;
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
};
