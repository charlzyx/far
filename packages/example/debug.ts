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
