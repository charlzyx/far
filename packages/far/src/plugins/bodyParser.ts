import bodyParser from 'koa-bodyparser';
import { FarConfig } from '../config';
import { FarPlugin, PLUGIN_PRIORITY } from './index';

export type BodyParserPluginConfig = {
  bodyparser?: Parameters<typeof bodyParser>[0];
};

export const bodyParserPlugin: FarPlugin = (conf: FarConfig, { app }) => {
  app.use(bodyParser(conf.bodyparser));
};

bodyParserPlugin.priority = PLUGIN_PRIORITY.CORE - 1;
