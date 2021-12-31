import { server } from '../server';
import { FarConfig, loadConf } from '../config';

export const devServer = async (conf?: FarConfig) => {
  const config = conf || (await loadConf());
  return server(config);
};
