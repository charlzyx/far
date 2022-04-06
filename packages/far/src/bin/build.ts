// import { loadConf } from '../config';
// import { byPwd } from '../utils';
// import { spawnSync } from 'child_process';

// import fs from 'fs';
// import path from 'path';

// const cacheDir = byPwd('./buildcache');

// /** gen by @rlx/conf */
// const farConfigJs = byPwd('./.farrc.js');

// export const build = async () => {
//   process.env.NODE_ENV = 'production';
//   fs.rmSync(cacheDir, { recursive: true, force: true });

//   const config = await loadConf();
//   if (!fs.existsSync(cacheDir)) {
//     fs.mkdirSync(cacheDir, { recursive: true });
//   }
//   const entry = path.resolve(cacheDir, 'index.ts');
//   const configFileOutput = path.resolve(config.outDir, '.farrc.js');
//   fs.copyFileSync(farConfigJs, configFileOutput);
//   fs.writeFileSync(
//     entry,
//     `
//  import { server, loadConf } from '@rlx/far';
//  const start = async () => {
//   const config = await loadConf(true);
//   server(config);
//  };
//  start();
//   `,
//     'utf-8',
//   );
//   spawnSync('tsc');
//   // const conf = justrequire(entry);
//   fs.rmSync(cacheDir, { recursive: true, force: true });
//   console.log(`far build success!, output ${config.outDir}`);

//   // const { server } = await import('@rlx/far');
//   // return server(config);
// };
