import { server } from '../server';
import { loadConf } from '../config';
// import { isPROD } from '../utils';
// import { tsImport } from '@rlx/ts-import-sync';

export const devServer = async () => {
  const conf = await loadConf();
  // const apis = tsImport.compile(conf.entry, !isPROD);

  return server(conf);
};
