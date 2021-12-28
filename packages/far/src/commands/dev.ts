import { server } from '../server';
import { loadConf } from '../config';

export const devServer = async () => {
  const conf = await loadConf();
  return server(conf);
};
