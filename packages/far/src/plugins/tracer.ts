import { koaMiddleware } from 'cls-rtracer';
import { FarConfig } from '../config';
import { FarPlugin } from './index';
import { v4 as uuidv4 } from 'uuid';

export type TracerPluginConfig = {
  tracer?: Parameters<typeof koaMiddleware>[0];
};

const tracerPluginConfigDefaults: TracerPluginConfig['tracer'] = {
  echoHeader: true,
  requestIdFactory: uuidv4,
  headerName: 'X-Request-Id',
};

export const tracerPlugin: FarPlugin = (conf: FarConfig, { app }) => {
  app.use(
    koaMiddleware({
      ...tracerPluginConfigDefaults,
      ...conf.tracer,
    }),
  );
};

tracerPlugin.priority = Number.MIN_SAFE_INTEGER;
