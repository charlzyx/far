#!/usr/bin/env node

import { Conf } from '@rlx/conf';
import commander from 'commander';
import prettier from 'prettier';
import { APPNAME, FarConfigDefaults } from '../config';
import { byPwd } from '../utils';
import { getFont } from './randomfont';
import fs from 'fs';
import figlet from 'figlet';
import debugCode from './debug';
// import { devServer } from '../server/devServer';

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
    const { devServer } = await import('@rlx/far');
    await devServer();
  });
program.parse(process.argv);
program.usage();
