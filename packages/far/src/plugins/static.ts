import serve from 'koa-static';
import { FarConfig } from '../config';
import { byPwd } from '../utils';
import { FarPlugin } from './index';
import log from '../logger';
import { noop } from '../utils';

export const pluginStatics: FarPlugin = (conf: FarConfig) => {
  if (!conf.public) return noop;
  const www = byPwd(conf.public);
  log.info(`public dir::${www}`);
  return (ctx, next) => {
    serve(www, {})(ctx, next);
  };
};

pluginStatics.name = 'statics';
