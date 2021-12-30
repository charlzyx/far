import { server } from '../server';
import { FarConfig, loadConf } from '../config';
// import { isPROD } from '../utils';
// import { tsImport } from '@rlx/ts-import-sync';

export const devServer = async (conf?: FarConfig) => {
  const config = conf || (await loadConf());
  // const apis = tsImport.compile(conf.entry, !isPROD);

  return server(config);
};
