export default `#!/usr/bin/env ts-node

/**
// .vscode/launch.json
 {
 // 使用 IntelliSense 了解相关属性。
 // 悬停以查看现有属性的描述。
 // 欲了解更多信息，请访问: https://go.microsoft.com/fwlink/?linkid=830387
 "version": "0.2.0",
 "configurations": [
   {
     "name": "FAR DEBUG",
     "type": "node",
     "request": "launch",
     "args": [
       "debug.ts"
     ],
     "runtimeArgs": [
       "-r",
       "ts-node/register"
     ],
     "cwd": "\${workspaceRoot}",
     "protocol": "inspector",
     "internalConsoleOptions": "openOnSessionStart"
   }
 ]
}
*/

#!/usr/bin/env ts-node

import { devServer, loadConf } from '@rlx/far';

import './.farrc'; // 不能去掉这一行, 否则 farConfig 的类型就无法引入

import * as apis from './src/apis';

const runner = async () => {
  const conf = await loadConf();
  devServer({
    ...conf,
    apis,
  });
};

runner();

`;
