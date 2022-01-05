#!/usr/bin/env node

import { Conf } from '@rlx/conf';
import commander from 'commander';
import prettier from 'prettier';
import { APPNAME, FarConfigDefaults, loadConf } from '../config';
import { spawnSync } from 'child_process';
import { byPwd } from '../utils';
import { getFont } from './randomfont';
import fs from 'fs';
import figlet from 'figlet';
import debugCode from './debug';
import { build } from './build';

const program = new commander.Command();
program.version('0.0.1');
program
  .command('init')
  .description('生成 「far」 的默认配置文件和debug脚本')
  .action(async () => {
    const tpl = prettier.format(
      `import { defineConfig } from '@rlx/far'
       export default defineConfig(${JSON.stringify(
         FarConfigDefaults,
         null,
         2,
       )});`,
      { semi: false, singleQuote: true },
    );
    await Conf.make(APPNAME, FarConfigDefaults, {
      content: tpl,
      generateIfNoExist: true,
      suffix: 'ts',
    });
    fs.writeFileSync(byPwd('./debug.ts'), debugCode, 'utf-8');
  });

program
  .command('dev')
  .description('启动一个 「far」 开发服务...')
  .action(async () => {
    const banner = figlet.textSync('far「發」!', { font: getFont() });
    console.log(banner);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { devServer } = require('@rlx/far/dist/index.js');
    await devServer();
  });

program
  .command('build')
  .description('build 「far」app ...')
  .action(async () => {
    const banner = figlet.textSync('far「發」!', { font: getFont() });
    console.log(banner);
    try {
      await build();
    } catch (error) {
      console.log(error);
    }
  });

program
  .command('start')
  .description('start 「far」server ...')
  .action(async () => {
    process.env.NODE_ENV = 'production';
    const banner = figlet.textSync('far「發」!', { font: getFont() });
    const config = await loadConf(true);
    console.log(banner);
    const cli = `node ${config.outDir} index.js`;
    console.log(
      `run cli: ${cli}\n强制追加了 process.env.NODE_ENV==='production'\n
当然, 你也可以直接调用这个命令`.trim(),
    );
    spawnSync(cli, {
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
      stdio: 'inherit',
    });
  });

program.parse(process.argv);
program.usage();
