import bodyParser from 'koa-bodyparser';
import { FarConfig } from '../config';
import { FarPlugin } from './index';

export type BodyParserConfig = Parameters<typeof bodyParser>[0];

export const bodyParserPlugin: FarPlugin = (conf: FarConfig, { app }) => {
  app.use(bodyParser(conf.bodyparser));
};

bodyParserPlugin.priority = -1;
