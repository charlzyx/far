import { koaMiddleware } from 'cls-rtracer';
import { FarConfig } from '../config';
import { FarPlugin } from './index';
import { v4 as uuidv4 } from 'uuid';
import { useMemory } from '../hooks';

export type TracerPluginConfig = {
  tracer?: Parameters<typeof koaMiddleware>[0];
};

const tracerPluginConfigDefaults: TracerPluginConfig['tracer'] = {
  echoHeader: true,
  requestIdFactory: uuidv4,
  headerName: 'X-Request-Id',
};

export const tracerPlugin: FarPlugin = (conf: FarConfig, { app, logger }) => {
  const opts = {
    ...tracerPluginConfigDefaults,
    ...conf.tracer,
  };
  app.use(koaMiddleware(opts));
  logger.appendCtxLogField(opts.headerName!, `headers.${opts.headerName}`);
  return async (ctx, next) => {
    const [, clear] = useMemory('ctx', ctx);
    await next();
    clear();
  };
};

tracerPlugin.priority = Number.MIN_SAFE_INTEGER;
