import { Conf } from '@rlx/conf';
import commander from 'commander';
import prettier from 'prettier';
import { FarConfig } from '../config';
import { devServer } from '../commands/dev';

const program = new commander.Command();
program.version('0.0.1');
program
  .command('init')
  .description('生成 「far」 的默认配置文件')
  .action(async () => {
    const tpl = prettier.format(
      `
/**
 * @type {import('@rlx/far').FarConfig}
 **/
const conf = ${JSON.stringify(FarConfig, null, 2)};

module.exports = conf;
    `,
      { semi: false, singleQuote: true },
    );
    const genConf = Conf.make('taibai', FarConfig, {
      content: tpl,
      generateIfNoExist: true,
      suffix: 'js',
    });
    await genConf.load();
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
