import { loadConf } from '../config';
import { byPwd } from '../utils';
import * as tsup from 'tsup';

import fs from 'fs';
import path from 'path';

const cacheDir = byPwd('./buildcache');

/** gen by @rlx/conf */
const farConfigJs = byPwd('./.farrc.js');

export const build = async () => {
  process.env.NODE_ENV = 'production';
  const config = await loadConf();
  fs.rmSync(cacheDir, { recursive: true, force: true });
  fs.rmSync(config.outDir, { recursive: true, force: true });
  const plugins = config?.plugins || [];
  for await (const plugin of plugins) {
    try {
      if (plugin.preBuilder) {
        await plugin.preBuilder(config);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  const entry = path.resolve(cacheDir, 'index.ts');
  const configFile = path.resolve(cacheDir, '.farrc.js');
  fs.copyFileSync(farConfigJs, configFile);
  fs.writeFileSync(
    entry,
    `
 import { server, loadConf } from '@rlx/far';
 const start = async () => {
  const config = await loadConf();
  server(config);
 };
 start();
  `,
    'utf-8',
  );
  await tsup.build({
    entry: [entry, configFile],
    target: 'node16',
    /** 不能 clean 应为输出目录会被其他使用 */
    clean: false,
    splitting: false,
    format: ['cjs'],
    outDir: config.outDir,
  });
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log(`far build success!, output ${config.outDir}`);
  // const { server } = await import('@rlx/far');
  // return server(config);
};
