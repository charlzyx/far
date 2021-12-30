#!/usr/bin/env node

import { Conf } from '@rlx/conf';
import commander from 'commander';
import prettier from 'prettier';
import { APPNAME, FarConfigDefaults } from '../config';
import { byPwd } from '../utils';
import fs from 'fs';
import debugCode from './debug';
import { devServer } from '../commands/dev';

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
    const genConf = Conf.make(APPNAME, FarConfigDefaults, {
      content: tpl,
      generateIfNoExist: true,
      suffix: 'ts',
    });
    await genConf.load();
    fs.writeFileSync(byPwd('./debug.ts'), debugCode, 'utf-8');
  });
program
  .command('dev')
  .description('启动一个 「far」 开发服务...')
  .action(async () => {
    console.log(`dev server starting...`);
    await devServer();
  });
program.parse(process.argv);
program.usage();
